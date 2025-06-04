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


    # # 8) Send notification emails
    # for s in students:
    #     try:
    #         msg = Message(
    #             subject = f"Exam Invitation: {exam_name}",
    #             sender  = Config.MAIL_USERNAME,
    #             recipients=[s["email"]]
    #         )
    #         msg.body = (
    #             f"Hi {s['name']},\n\n"
    #             f"You’re invited to the exam “{exam_name}”.\n"
    #             f"ID: {uid}\n"
    #             f"Duration: {exam_duration} mins\n"
    #             f"Opens: {active_start}\n"
    #             f"Closes: {active_end}\n\n"
    #             "Good luck!"
    #         )
    #         mail.send(msg)
    #     except Exception as err:
    #         current_app.logger.error(f"Email to {s['email']} failed: {err}")

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
        # Get all exams from the exams collection
        exams_cursor = db_exams.find({"invited": username})
        exams = list(exams_cursor)
        # Get the list of exams the student has attempted.
        attempts_cursor = db_collection.find({"username": username})
        attempted_ids = {attempt.get("examId") for attempt in attempts_cursor}
        # Filter out exams that have been attempted.
        unattempted_exams = [exam for exam in exams if exam.get("id") not in attempted_ids]
        # Convert ObjectId to string
        for exam in unattempted_exams:
            exam["_id"] = str(exam["_id"])
        return jsonify({"success": True, "exams": unattempted_exams}), 200
    except Exception as e:
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

    if not exam_id or not username or not exam_start_time or user_answers is None:
        return jsonify({"success": False, "message": "Missing examId, username, examStartTime, or answers"}), 400

    if exam_start_time.endswith("Z"):
        exam_start_time = exam_start_time.replace("Z", "+00:00")
    exam_start_time = parser.isoparse(exam_start_time).isoformat()

    exam_doc = db_exams.find_one({"id": exam_id})
    if not exam_doc: 
        return jsonify({"success": False, "message": "Exam not found"}), 404

    exam_details = exam_doc
    questions = exam_details.get("questions", [])
    computed_score = 0
    for idx, question in enumerate(questions):
        if question.get("type") == "mcq":
            correct = question.get("correctAnswer", "").lower().strip() if question.get("correctAnswer") else ""
            user_ans = (user_answers.get(str(idx)) or "").lower().strip()
            if user_ans and user_ans[0] == correct and correct != "":
                computed_score += question.get("score", 2)

    submitted_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
    update_data = {
        "examStartTime": exam_start_time,
        "answers": user_answers,
        "score": computed_score,
        "abnormalAudios": abnormal_audios,
        "submittedAt": submitted_at,
        "examName": exam_details.get("name"),
        "examDuration": exam_details.get("duration"),
        "examDate": exam_details.get("date"),
        "maxScore": exam_details.get("maxScore")
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
            "evaluation": evaluation_result,
            "timestamp": datetime.datetime.now(timezone.utc)
        }

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

        attempts = list(db_collection.find({"username": username}))
        for attempt in attempts:
            attempt["_id"] = str(attempt["_id"])
            if "submittedAt" in attempt and isinstance(attempt["submittedAt"], datetime.datetime):
                attempt["submittedAt"] = attempt["submittedAt"].isoformat()
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

