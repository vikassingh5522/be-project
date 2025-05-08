from flask import Blueprint, request, jsonify
from exam.utils import parse_questions
from database import init_db
from config import Config
import uuid
from flask_cors import cross_origin
import os
from code_eval.evaluation import evaluate_code_with_gemini
import datetime
from datetime import timezone
from database import init_db
from werkzeug.utils import secure_filename
from upload.utils import allowed_file
from dateutil import parser
import jwt

db_data = init_db()
db = db_data['db']
db_exams = db_data['db_exams']
db_collection = db_data['db_collection']

exam_bp = Blueprint('exam', __name__)

@exam_bp.route('/active', methods=['GET'])
def exam_active():
    import datetime
    try:
        now = datetime.datetime.now(datetime.timezone.utc)
        active_exams = []
        exams_cursor = db_exams.find({})
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
    print(uid)
    try:
        # Check if file is provided
        if 'file' not in request.files:
            return jsonify({"success": False, "message": "No file part in the request"}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"success": False, "message": "No file selected"}), 400

        if not allowed_file(file.filename):
            return jsonify({"success": False, "message": "Unsupported file type. Only .txt and .docx are allowed."}), 400

        # Retrieve exam details from form data
        exam_name = request.form.get('name')
        exam_duration = request.form.get('duration')
        exam_date = request.form.get('date')
        if not exam_name or not exam_duration or not exam_date:
            return jsonify({"success": False, "message": "Missing exam details (name, duration, date)."}), 400

        # Get the instructor name from the Authorization header token
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({"success": False, "message": "Authorization header missing"}), 401

        token = auth_header.split(" ")[1]
        JWT_SECRET = os.getenv("JWT_SECRET")
        decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        instructor = decoded.get("username")
        if not instructor:
            return jsonify({"success": False, "message": "Instructor information missing in token"}), 401

        # Save the uploaded file
        filename = secure_filename(file.filename)
        filepath = os.path.join(Config.UPLOAD_FOLDER, filename)
        file.save(filepath)

        # Parse questions from the file
        questions_result = parse_questions(filepath, filename)
        questions = questions_result.get("questions")
        if not questions:
            return jsonify({"success": False, "message": "No valid questions found in the file."}), 400

        exam_doc = {
            "instructor": instructor,   # <--- Instructor's username stored here.
            "id": uid,
            "name": exam_name,
            "duration": exam_duration,
            "date": exam_date,
            "questions": questions,
            "maxScore": questions_result.get("maxScore")
        }
        db_exams.insert_one(exam_doc)
        return jsonify({"success": True, "examId": uid}), 200
    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": f"Error processing file: {str(e)}"}), 500

@exam_bp.route('/created', methods=['GET'])
def exam_created():
    instructor = request.args.get("instructor")
    if not instructor:
        return jsonify({"success": False, "message": "Missing instructor"}), 400

    exams = list(db_exams.find({"instructor": instructor}))
    for exam in exams:
        exam["_id"] = str(exam["_id"])
    return jsonify({"success": True, "exams": exams}), 200


@exam_bp.route('/attempts', methods=['GET'])
@cross_origin(origins=["http://localhost:3000"], supports_credentials=True)
def exam_attempts():
    exam_id = request.args.get("examId")
    if not exam_id:
        return jsonify({"success": False, "message": "Missing examId"}), 400

    attempts = list(db_collection.find({"examId": exam_id}))
    for attempt in attempts:
        # always stringify the Mongo ObjectId
        attempt["_id"] = str(attempt["_id"])

        # only call .isoformat() on real datetime objects
        sub = attempt.get("submittedAt")
        if isinstance(sub, datetime.datetime):
            attempt["submittedAt"] = sub.isoformat()

        st = attempt.get("startedAt")
        if isinstance(st, datetime.datetime):
            attempt["startedAt"] = st.isoformat()
        
        # --- NEW: build cheatingActivities from suspiciousKeylogs ---
        suspicious = attempt.get("suspiciousKeylogs", {})
        cheating_list = []
        for action, hits in suspicious.items():
            # hits is a dict like { "ctrl+c": 3, ... }
            for keystroke, count in hits.items():
                cheating_list.append(f"{keystroke} ({count})")
        attempt["cheatingActivities"] = cheating_list
        # (optional) delete the raw field if you don’t want to expose it:
        # attempt.pop("suspiciousKeylogs", None)

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

