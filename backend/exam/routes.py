from flask import Blueprint, request, jsonify
from exam.utils import parse_questions, parse_student_excel
from database import init_db
from flask import current_app
from config import Config
from flask_cors import cross_origin
from code_eval.evaluation import evaluate_code_with_gemini
import datetime
from datetime import timezone
from database import init_db
from werkzeug.utils import secure_filename
from upload.utils import allowed_file
from dateutil import parser
from werkzeug.utils import secure_filename
import os, uuid, jwt
from flask_mail import Mail, Message
from bson.objectid import ObjectId
from exam.cheating_analysis import get_cheating_analysis

db_data = init_db()
db = db_data['db']
db_exams = db_data['db_exams']
db_collection = db_data['db_collection']
db_frames = db_data['frames']
exam_bp = Blueprint('exam', __name__)
#mail= Mail(current_app)

ALLOWED_EXCEL_EXTENSIONS = {'.xlsx', '.xls'}
def allowed_excel_file(filename):
    """Check if the uploaded file has an allowed extension for Excel student data."""
    ext = os.path.splitext(filename)[1].lower()
    return ext in ALLOWED_EXCEL_EXTENSIONS
@exam_bp.route('/active', methods=['GET'])
def exam_active():
    username = request.args.get("username")
    try:
        now = datetime.datetime.now(datetime.timezone.utc)
        active_exams = []
        exams_cursor = db_exams.find({"invited": username})
        for exam in exams_cursor:
            active_start = exam.get("active_start")
            active_end = exam.get("active_end")
            if active_start and active_end:
                try:
                    active_start_dt = datetime.datetime.fromisoformat(active_start)
                    if active_start_dt.tzinfo is None:
                        active_start_dt = active_start_dt.replace(tzinfo=datetime.timezone.utc)
                    active_end_dt = datetime.datetime.fromisoformat(active_end)
                    if active_end_dt.tzinfo is None:
                        active_end_dt = active_end_dt.replace(tzinfo=datetime.timezone.utc)
                except Exception as conv_err:
                    print("Conversion error:", conv_err)
                    continue
                if active_start_dt <= now <= active_end_dt:
                    exam["_id"] = str(exam["_id"])
                    active_exams.append(exam)
        return jsonify({"success": True, "exams": active_exams}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


def send_exam_notification(recipient_email, subject, template_data):
    try:
        msg = Message(
            subject=subject,
            sender=Config.MAIL_USERNAME,
            recipients=[recipient_email]
        )
        
        # Create HTML email template
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2c3e50;">{template_data.get('title', '')}</h2>
                    <p>{template_data.get('message', '')}</p>
                    {template_data.get('details', '')}
                    <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
                        <p style="margin: 0;">Best regards,<br>Exam System Team</p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        msg.html = html_content
        mail.send(msg)
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

@exam_bp.route('/create', methods=['POST'])
def createExam():
    uid = str(uuid.uuid4())

    # 1) Validate uploads
    if 'file' not in request.files:
        return jsonify(success=False, message="No exam file part in the request"), 400
    if 'studentData' not in request.files:
        return jsonify(success=False, message="No Excel file for student data provided."), 400

    exam_file   = request.files['file']
    excel_file  = request.files['studentData']

    # 2) Validate filenames & extensions
    if not exam_file.filename or not allowed_file(exam_file.filename):
        return jsonify(success=False, message="Valid exam file (.txt/.docx) required"), 400
    if not excel_file.filename or not allowed_excel_file(excel_file.filename):
        return jsonify(success=False, message="Valid student Excel (.xlsx/.xls) required"), 400

    # 3) Read form fields
    exam_name    = request.form.get('name')
    exam_duration= request.form.get('duration')
    exam_date    = request.form.get('date')
    active_start = request.form.get('active_start')
    active_end   = request.form.get('active_end')
    if not all([exam_name, exam_duration, exam_date, active_start, active_end]):
        return jsonify(success=False, message="Missing one of name/duration/date/active_start/active_end"), 400

    # 4) Authenticate instructor
    auth = request.headers.get("Authorization", "")
    try:
        token     = auth.split()[1]
        secret    = os.getenv("JWT_SECRET")
        instructor= jwt.decode(token, secret, algorithms=["HS256"])["username"]
    except Exception:
        return jsonify(success=False, message="Invalid or missing Authorization token"), 401

    # 5) Save uploads to disk
    updir = Config.UPLOAD_FOLDER
    if not os.path.exists(updir):
        os.makedirs(updir)
    exam_path   = os.path.join(updir, secure_filename(exam_file.filename))
    excel_path  = os.path.join(updir, secure_filename(excel_file.filename))
    exam_file.save(exam_path)
    excel_file.save(excel_path)

    # 6) Parse questions & students
    qres     = parse_questions(exam_path, exam_file.filename)
    questions = qres.get("questions")
    if not questions:
        return jsonify(success=False, message="No valid questions found"), 400

    students = parse_student_excel(excel_path)
    invited  = [ s.get("username") for s in students if s.get("username") ]

    # 7) Build & insert exam document (with invited list)
    exam_doc = {
        "instructor":  instructor,
        "id":          uid,
        "name":        exam_name,
        "duration":    exam_duration,
        "date":        exam_date,
        "active_start":active_start,
        "active_end":  active_end,
        "questions":   questions,
        "maxScore":    qres.get("maxScore"),
        "invited":     invited,            # ← so only these users can later fetch it
    }
    db_exams.insert_one(exam_doc)

    # 8) Send notification emails to invited students
    for student in students:
        if student.get("email"):
            template_data = {
                "title": f"New Exam: {exam_name}",
                "message": f"Hi {student['name']}, you have been invited to take an exam.",
                "details": f"""
                <ul style="list-style: none; padding: 0;">
                    <li><strong>Exam Name:</strong> {exam_name}</li>
                    <li><strong>Duration:</strong> {exam_duration} minutes</li>
                    <li><strong>Date:</strong> {exam_date}</li>
                    <li><strong>Start Time:</strong> {active_start}</li>
                    <li><strong>End Time:</strong> {active_end}</li>
                </ul>
                """
            }
            send_exam_notification(student["email"], f"Exam Invitation: {exam_name}", template_data)

    return jsonify(success=True, examId=uid), 200
@exam_bp.route('/created', methods=['GET'])
def exam_created():
    instructor = request.args.get("instructor")
    if not instructor:
        return jsonify({"success": False, "message": "Missing instructor"}), 400

    exams = list(db_exams.find({"instructor": instructor}))
    for exam in exams:
        exam["_id"] = str(exam["_id"])
    return jsonify({"success": True, "exams": exams}), 200

@exam_bp.route('/assigned', methods=['GET'])
def exam_assigned():
    username = request.args.get("username")
    if not username:
        return jsonify({"success": False, "message": "Missing username"}), 400
    try:
        # Get all exams from the exams collection where the student is invited
        exams_cursor = db_exams.find({"invited": username})
        exams = list(exams_cursor)
        
        # Convert ObjectId to string for each exam
        for exam in exams:
            exam["_id"] = str(exam["_id"])
                
        return jsonify({"success": True, "exams": exams}), 200
    except Exception as e:
        print("Error in /exam/assigned:", e)
        return jsonify({"success": False, "message": str(e)}), 500
@exam_bp.route('/attempts', methods=['GET'])
@cross_origin(origins=[""], supports_credentials=True)
def exam_attempts():
    # 1) grab the camelCase param
    exam_id = request.args.get("examId")
    if not exam_id:
        return jsonify({"success": False, "message": "Missing examId"}), 400

    # 2) load all attempt documents for this exam
    cursor = db_collection.find({ "examId": exam_id })
    attempts = []

    for a in cursor:
        # make IDs/datetimes JSON-safe
        a["_id"] = str(a["_id"])
        sub = a.get("submittedAt")
        if isinstance(sub, datetime.datetime):
            a["submittedAt"] = sub.isoformat()

        # 3) build cheatingActivities from suspiciousKeylogs
        suspicious = a.get("suspiciousKeylogs", {})
        cheating_list = []
        for action_hits in suspicious.values():
            for keystroke, count in action_hits.items():
                cheating_list.append(f"{keystroke} ({count})")
        a["cheatingActivities"] = cheating_list

        # 4) fetch flagged frames for this user+exam
        user = a.get("username")
        frames_cursor = db_frames.find({
            "exam_id":  exam_id,  # snake_case in your frames collection
            "username": user
        })
        frames = [{
            "timestamp": f["timestamp"],
            "objects":   f["objects"],
            "image":     f["image"]
        } for f in frames_cursor]
        a["cheatingFrames"] = frames

        attempts.append(a)

    return jsonify({"success": True, "attempts": attempts}), 200

@exam_bp.route('/submit', methods=['POST'])
def exam_submit():
    data = request.get_json()
    exam_id = data.get("examId")
    username = data.get("username")
    exam_start_time = data.get("examStartTime")
    user_answers = data.get("answers")
    abnormal_audios = data.get("abnormalAudios", [])
    code_submissions = data.get("codeSubmissions", {})
    cursor_warning_count = data.get("cursorWarningCount", 0)  # Get cursor warning count

    if not exam_id or not username or not exam_start_time or user_answers is None:
        return jsonify({"success": False, "message": "Missing examId, username, examStartTime, or answers"}), 400

    if exam_start_time.endswith("Z"):
        exam_start_time = exam_start_time.replace("Z", "+00:00")
    exam_start_time = parser.isoparse(exam_start_time).isoformat()

    exam_doc = db_exams.find_one({"id": exam_id})
    if not exam_doc: 
        return jsonify({"success": False, "message": "Exam not found"}), 404

    # Calculate cheating score
    cheating_score = 0
    cheating_factors = {
        "cursor_warnings": 0,
        "suspicious_frames": 0,
        "abnormal_audio": 0,
        "tab_switches": 0
    }

    # Get suspicious frames count
    frames_cursor = db_frames.find({
        "exam_id": exam_id,
        "username": username
    })
    suspicious_frames = [f for f in frames_cursor if f.get("objects", [])]
    cheating_factors["suspicious_frames"] = len(suspicious_frames)

    # Calculate cursor warning impact
    cheating_factors["cursor_warnings"] = cursor_warning_count
    if cursor_warning_count > 10:
        cheating_score += 20
    elif cursor_warning_count > 5:
        cheating_score += 10
    elif cursor_warning_count > 0:
        cheating_score += 5

    # Calculate suspicious frames impact
    if len(suspicious_frames) > 5:
        cheating_score += 30
    elif len(suspicious_frames) > 2:
        cheating_score += 15
    elif len(suspicious_frames) > 0:
        cheating_score += 5

    # Calculate abnormal audio impact
    cheating_factors["abnormal_audio"] = len(abnormal_audios)
    if len(abnormal_audios) > 3:
        cheating_score += 25
    elif len(abnormal_audios) > 1:
        cheating_score += 10
    elif len(abnormal_audios) > 0:
        cheating_score += 5

    # Get tab switch count from mobile logs
    mobile_logs = db["mobile_activity_logs"].find({
        "examId": exam_id,
        "username": username,
        "event": "visibilitychange"
    })
    tab_switches = len(list(mobile_logs))
    cheating_factors["tab_switches"] = tab_switches
    if tab_switches > 5:
        cheating_score += 25
    elif tab_switches > 2:
        cheating_score += 15
    elif tab_switches > 0:
        cheating_score += 5

    # Cap the cheating score at 100
    cheating_score = min(cheating_score, 100)

    exam_details = exam_doc
    questions = exam_details.get("questions", [])
    computed_score = 0
    detailed_scores = []

    for idx, question in enumerate(questions):
        question_score = 0
        ans = user_answers.get(str(idx))
        if question.get("type") == "mcq":
            correct = question.get("correctAnswer", "").lower().strip() if question.get("correctAnswer") else ""
            user_ans = (ans or "").lower().strip() if ans else ""
            if user_ans and user_ans[0] == correct and correct != "":
                question_score = question.get("score", 2)
                computed_score += question_score
        elif question.get("type") == "coding":
            if isinstance(ans, dict) and ans.get("type") == "coding":
                question_score = ans.get("score", 0) or 0
                computed_score += question_score

        detailed_scores.append({
            "questionId": idx,
            "type": question.get("type"),
            "score": question_score,
            "maxScore": question.get("score", 2 if question.get("type") == "mcq" else 5)
        })

    submitted_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
    update_data = {
        "examStartTime": exam_start_time,
        "answers": user_answers,
        "codeSubmissions": code_submissions,
        "score": computed_score,
        "detailedScores": detailed_scores,
        "abnormalAudios": abnormal_audios,
        "submittedAt": submitted_at,
        "examName": exam_details.get("name"),
        "examDuration": exam_details.get("duration"),
        "examDate": exam_details.get("date"),
        "maxScore": exam_details.get("maxScore"),
        "status": "submitted",
        "cursorWarningCount": cursor_warning_count,
        "cheatingScore": cheating_score,
        "cheatingFactors": cheating_factors
    }

    existing_attempt = db_collection.find_one({"examId": exam_id, "username": username})
    if existing_attempt:
        db_collection.update_one({"_id": existing_attempt["_id"]}, {"$set": update_data})
        updated_attempt = db_collection.find_one({"_id": existing_attempt["_id"]})
        updated_attempt["_id"] = str(updated_attempt["_id"])
        if "submittedAt" in updated_attempt and isinstance(updated_attempt["submittedAt"], datetime.datetime):
            updated_attempt["submittedAt"] = updated_attempt["submittedAt"].isoformat()
        if "startedAt" in updated_attempt and isinstance(updated_attempt["startedAt"], datetime.datetime):
            updated_attempt["startedAt"] = updated_attempt["startedAt"].isoformat()

        # Send submission confirmation email
        user_email = db["users"].find_one({"username": username}).get("email")
        if user_email:
            template_data = {
                "title": f"Exam Submission Confirmation: {exam_details.get('name')}",
                "message": f"Hi {username}, your exam submission has been received.",
                "details": f"""
                <ul style="list-style: none; padding: 0;">
                    <li><strong>Exam:</strong> {exam_details.get('name')}</li>
                    <li><strong>Score:</strong> {computed_score}/{exam_details.get('maxScore')}</li>
                    <li><strong>Submission Time:</strong> {submitted_at}</li>
                </ul>
                """
            }
            send_exam_notification(user_email, f"Exam Submission Confirmation: {exam_details.get('name')}", template_data)

        # Send notification to instructor
        instructor_email = db["users"].find_one({"username": exam_details.get("instructor")}).get("email")
        if instructor_email:
            template_data = {
                "title": f"New Exam Submission: {exam_details.get('name')}",
                "message": f"A student has submitted their exam.",
                "details": f"""
                <ul style="list-style: none; padding: 0;">
                    <li><strong>Student:</strong> {username}</li>
                    <li><strong>Exam:</strong> {exam_details.get('name')}</li>
                    <li><strong>Submission Time:</strong> {submitted_at}</li>
                </ul>
                """
            }
            send_exam_notification(instructor_email, f"New Exam Submission: {exam_details.get('name')}", template_data)

        return jsonify({"success": True, "attempt": updated_attempt}), 200
    else:
        new_attempt = {
            "examId": exam_id,
            "username": username,
            **update_data
        }
        insert_result = db_collection.insert_one(new_attempt)
        new_attempt["_id"] = str(insert_result.inserted_id)
        new_attempt["submittedAt"] = new_attempt["submittedAt"].isoformat()

        # Send submission confirmation email
        user_email = db["users"].find_one({"username": username}).get("email")
        if user_email:
            template_data = {
                "title": f"Exam Submission Confirmation: {exam_details.get('name')}",
                "message": f"Hi {username}, your exam submission has been received.",
                "details": f"""
                <ul style="list-style: none; padding: 0;">
                    <li><strong>Exam:</strong> {exam_details.get('name')}</li>
                    <li><strong>Score:</strong> {computed_score}/{exam_details.get('maxScore')}</li>
                    <li><strong>Submission Time:</strong> {submitted_at}</li>
                </ul>
                """
            }
            send_exam_notification(user_email, f"Exam Submission Confirmation: {exam_details.get('name')}", template_data)

        # Send notification to instructor
        instructor_email = db["users"].find_one({"username": exam_details.get("instructor")}).get("email")
        if instructor_email:
            template_data = {
                "title": f"New Exam Submission: {exam_details.get('name')}",
                "message": f"A student has submitted their exam.",
                "details": f"""
                <ul style="list-style: none; padding: 0;">
                    <li><strong>Student:</strong> {username}</li>
                    <li><strong>Exam:</strong> {exam_details.get('name')}</li>
                    <li><strong>Submission Time:</strong> {submitted_at}</li>
                </ul>
                """
            }
            send_exam_notification(instructor_email, f"New Exam Submission: {exam_details.get('name')}", template_data)

        return jsonify({"success": True, "attempt": new_attempt}), 200

@exam_bp.route('/submit-code', methods=['POST'])
def submit_code():
    try:
        data = request.get_json()
        print(data)
        submitted_code = data.get('code')                   # matches frontend 'code'
        question_id = data.get('question_number')           # matches frontend 'question_number'
        prompt = data.get('question')                       # matches frontend 'question'
        language = data.get('language')                     # optional, currently unused
        user_id = data.get('user_id', 'anonymous')          # fallback if not sent
        exam_id = data.get('exam_id')                       # exam ID for updating score
        print('prompt:',prompt[19:])
        if not all([question_id, submitted_code, prompt, language]):
            print({'error': 'Missing required fields'})
            return jsonify({'error': 'Missing required fields'}), 400

        evaluation_result = evaluate_code_with_gemini(prompt[19:], submitted_code)

        submission_doc = {
            "submission_id": str(uuid.uuid4()),
            "user_id": user_id,
            "question_id": question_id,
            "submitted_code": submitted_code,
            "evaluation": evaluation_result['status'],
            "score": evaluation_result['score'],
            "timestamp": datetime.datetime.now(timezone.utc)
        }

        # Update the exam attempt with the code score
        if exam_id and user_id:
            db_collection.update_one(
                {
                    "examId": exam_id,
                    "username": user_id
                },
                {
                    "$set": {
                        f"answers.{question_id}": {
                            "type": "coding",
                            "code": submitted_code,
                            "status": evaluation_result['status'],
                            "score": evaluation_result['score']
                        }
                    }
                }
            )

        print(submission_doc)
        # db_collection.insert_one(submission_doc)

        return jsonify({
            "message": "Code evaluated and saved successfully.",
            "submission": submission_doc
        }), 200

    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500


@exam_bp.route('/attempted', methods=['GET'])
def exam_attempted():
    try:
        username = request.args.get("username")
        if not username:
            return jsonify({"success": False, "message": "Missing username"}), 400

        # Get all attempts for this user
        attempts = list(db_collection.find({"username": username}))
        
        # Convert ObjectId to string and format dates
        for attempt in attempts:
            attempt["_id"] = str(attempt["_id"])
            if "submittedAt" in attempt and isinstance(attempt["submittedAt"], datetime.datetime):
                attempt["submittedAt"] = attempt["submittedAt"].isoformat()
            if "startedAt" in attempt and isinstance(attempt["startedAt"], datetime.datetime):
                attempt["startedAt"] = attempt["startedAt"].isoformat()
                
        return jsonify({"success": True, "attemptedExams": attempts}), 200
    except Exception as e:
        print("Error in /exam/attempted:", e)
        return jsonify({"success": False, "message": str(e)}), 500
    
@exam_bp.route('/details/<exam_id>', methods=['GET'])
def get_exam_details(exam_id):
    # Retrieve exam details from the exams collection
    exam_doc = db_exams.find_one({"id": exam_id}, {"_id": 0})
    if exam_doc:
        return jsonify({
            "success": True,
            "questions": exam_doc.get("questions", []),
            "duration": int(exam_doc.get("duration", 0))
        }), 200
    return jsonify({"success": False, "message": "Exam not found"}), 404

@exam_bp.route('/connect', methods=['POST'])
def exam_connect():
    """
    When a student connects with a valid login token and exam id,
    create a new attempt record in the attempted_exams collection if one doesn't already exist,
    and return a new token with the exam id.
    """
    data = request.get_json()
    login_token = data.get('token')
    exam_id = data.get('examId')
    if not login_token or not exam_id:
        return jsonify({"success": False, "message": "Missing token or exam id"}), 400
    JWT_SECRET = os.getenv("JWT_SECRET")
    try:
        decoded = jwt.decode(login_token, JWT_SECRET, algorithms=["HS256"])
    except Exception as e:
        return jsonify({"success": False, "message": "Invalid login token"}), 401
    username = decoded.get("username")
    existing_attempt = db_collection.find_one({"examId": exam_id, "username": username})
    if not existing_attempt:
        new_attempt = {
            "examId": exam_id,
            "username": username,
            "startedAt": datetime.datetime.now(datetime.timezone.utc),
            "submittedAt": None,
            "score": None,
            "answers": {},
            "abnormalAudios": []
        }
        db_collection.insert_one(new_attempt)
    new_payload = {
        "username": username,
        "email": decoded.get("email"),
        "role": decoded.get("role"),
        "examId": exam_id
    }
    exam_token = jwt.encode(new_payload, JWT_SECRET, algorithm="HS256")
    return jsonify({"success": True, "examToken": exam_token}), 200

@exam_bp.route('/attempted/latest', methods=['GET'])
def latest_attempt():
    username = request.args.get("username")
    if not username:
        return jsonify({"success": False, "message": "Missing username"}), 400
    latest_cursor = db_collection.find({"username": username}).sort("_id", -1).limit(1)
    latest_attempt = list(latest_cursor)
    if latest_attempt:
        attempt = latest_attempt[0]
        attempt["_id"] = str(attempt["_id"])
        if "submittedAt" in attempt:
            attempt["submittedAt"] = attempt["submittedAt"].isoformat()
        return jsonify({"success": True, "latestExam": attempt}), 200
    else:
        return jsonify({"success": True, "latestExam": None}), 200
    
@exam_bp.route('/result', methods=['GET'])
def exam_result():
    username = request.args.get("username")
    exam_id = request.args.get("examId")
    if not exam_id or not username:
        return jsonify({"success": False, "message": "Missing examId or username"}), 400

    # Query the attempted_exams collection for this student's attempt on the given exam
    attempt = db_collection.find_one({"examId": exam_id, "username": username})
    if attempt:
        attempt["_id"] = str(attempt["_id"])
        if "submittedAt" in attempt and isinstance(attempt["submittedAt"], datetime.datetime):
            attempt["submittedAt"] = attempt["submittedAt"].isoformat()
        return jsonify({"success": True, "result": attempt}), 200
    else:
        return jsonify({"success": False, "message": "Exam attempt not found"}), 404

@exam_bp.route('/upload-audio', methods=['POST'])
def upload_audio():
    try:
        if 'audio' not in request.files:
            return jsonify({"success": False, "message": "No audio file provided"}), 400
            
        audio_file = request.files['audio']
        exam_id = request.form.get('examId')
        username = request.form.get('username')
        timestamp = request.form.get('timestamp')
        
        if not all([audio_file, exam_id, username, timestamp]):
            return jsonify({"success": False, "message": "Missing required fields"}), 400
            
        # Create a unique filename
        filename = f"{exam_id}_{username}_{timestamp}.wav"
        filepath = os.path.join(Config.AUDIO_UPLOAD_FOLDER, filename)
        
        # Save the audio file
        audio_file.save(filepath)
        
        # Store the audio metadata in the database
        audio_doc = {
            "examId": exam_id,
            "username": username,
            "timestamp": datetime.datetime.fromisoformat(timestamp),
            "filepath": filepath,
            "status": "pending_analysis"
        }
        db["audio_logs"].insert_one(audio_doc)
        
        return jsonify({
            "success": True,
            "message": "Audio uploaded successfully",
            "audioId": str(audio_doc["_id"])
        }), 200
        
    except Exception as e:
        print("Error in /upload-audio:", e)
        return jsonify({"success": False, "message": str(e)}), 500

@exam_bp.route('/analyze-audio', methods=['POST'])
def analyze_audio():
    try:
        data = request.get_json()
        audio_id = data.get('audioId')
        
        if not audio_id:
            return jsonify({"success": False, "message": "Missing audioId"}), 400
            
        # Get the audio document
        audio_doc = db["audio_logs"].find_one({"_id": ObjectId(audio_id)})
        if not audio_doc:
            return jsonify({"success": False, "message": "Audio not found"}), 404
            
        # Perform audio analysis (implement your analysis logic here)
        # For now, we'll just mark it as analyzed
        analysis_result = {
            "status": "analyzed",
            "hasVoice": True,  # Replace with actual analysis
            "confidence": 0.95  # Replace with actual confidence score
        }
        
        # Update the audio document with analysis results
        db["audio_logs"].update_one(
            {"_id": ObjectId(audio_id)},
            {"$set": {
                "status": "analyzed",
                "analysis": analysis_result
            }}
        )
        
        return jsonify({
            "success": True,
            "message": "Audio analyzed successfully",
            "analysis": analysis_result
        }), 200
        
    except Exception as e:
        print("Error in /analyze-audio:", e)
        return jsonify({"success": False, "message": str(e)}), 500

@exam_bp.route('/cheating-analysis', methods=['GET'])
def get_exam_cheating_analysis():
    """
    Get cheating analysis for a specific exam attempt
    """
    exam_id = request.args.get('examId')
    username = request.args.get('username')
    
    if not exam_id or not username:
        return jsonify({
            'success': False,
            'message': 'Missing examId or username'
        }), 400
        
    analysis_result = get_cheating_analysis(exam_id, username, db)
    
    if not analysis_result['success']:
        return jsonify(analysis_result), 404
        
    return jsonify(analysis_result), 200

