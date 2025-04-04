from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
from io import BytesIO
from PIL import Image
import os
from image_processing.objDec import detect
from werkzeug.utils import secure_filename
import docx
import jwt
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import bcrypt
import uuid
from dotenv import load_dotenv
import datetime
from dateutil import parser
import re
import librosa
import numpy as np

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Connect to MongoDB using the URI from environment variables
URI = os.getenv('USER1')
try:
    client = MongoClient(URI, server_api=ServerApi('1'))
    client.admin.command('ping')
    db = client["beproject"]
    print("You successfully connected to MongoDB!")
except Exception as e:
    print(e)

# Collection for attempted exams (separate from the users collection)
db_collection = client["beproject"]["attempted_exams"]
db_exams = client["beproject"]["exams"]
# Ensure directories exist
UPLOAD_FOLDER = 'uploaded_files'
FRAME_DIR = "received_frames"
CODE_DIR = "received_codes"
AUDIO_UPLOAD_FOLDER = "uploaded_audio_fragments"

for directory in [UPLOAD_FOLDER, FRAME_DIR, CODE_DIR, AUDIO_UPLOAD_FOLDER]:
    os.makedirs(directory, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # Limit file size to 10 MB
ALLOWED_EXTENSIONS = {'.txt', '.docx'}

def allowed_file(filename):
    """Check if the uploaded file has an allowed extension."""
    ext = os.path.splitext(filename)[1].lower()
    return ext in ALLOWED_EXTENSIONS

@app.route('/upload', methods=['POST'])
def upload_frame():
    """Handles uploading and processing an image frame."""
    data = request.get_json()
    image_data = data.get('image')
    if not image_data:
        return jsonify({"success": False, "message": "No image provided"}), 400
    try:
        image_data = image_data.split(",")[1]
        image = base64.b64decode(image_data)
        img = Image.open(BytesIO(image))
        objects = detect(img)
        return jsonify({"success": True, "objects": objects}), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Error processing image: {str(e)}"}), 500

@app.route('/submit-code', methods=['POST'])
def submit_code():
    """Handles submitting code from the code editor."""
    data = request.get_json()
    code = data.get('code', '')
    language = data.get('language', 'python')
    question_number = data.get('question_number', 1)
    if not code:
        return jsonify({"success": False, "message": "No code provided"}), 400
    if not language:
        return jsonify({"success": False, "message": "No language specified"}), 400
    try:
        filename = f"{language}_question_{question_number}.txt"
        file_path = os.path.join(CODE_DIR, filename)
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(code)
        return jsonify({"success": True, "message": f"Code for question {question_number} saved successfully as {filename}"}), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Error saving code: {str(e)}"}), 500

@app.route('/upload-file', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"success": False, "message": "No file part in the request"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"success": False, "message": "No file selected"}), 400
    if not allowed_file(file.filename):
        return jsonify({"success": False, "message": "Unsupported file type. Only .txt and .docx are allowed."}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    try:
        exam_name = request.form.get('name')
        exam_duration = request.form.get('duration')
        exam_date = request.form.get('date')
        if exam_name and exam_duration and exam_date:
            result = parse_questions(filepath, filename)
            uid = result["examId"]
            questions = result["questions"]
            exam = {
                "id": uid,
                "name": exam_name,
                "duration": exam_duration,
                "date": exam_date,
                "questions": questions
            }
            # Store exam details in the exams collection
            db_exams.insert_one(exam)
            return jsonify({"success": True, "examId": uid}), 200
        else:
            result = parse_questions(filepath, filename)
            questions = result["questions"]
            return jsonify({"success": True, "questions": questions}), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Error processing file: {str(e)}"}), 500

@app.route('/exam/create', methods=['POST'])
def createExam():
    uid = str(uuid.uuid4())
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
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
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
        return jsonify({"success": False, "message": f"Error processing file: {str(e)}"}), 500


@app.route('/exam/created', methods=['GET'])
def exam_created():
    instructor = request.args.get("instructor")
    if not instructor:
        return jsonify({"success": False, "message": "Missing instructor"}), 400

    exams = list(db_exams.find({"instructor": instructor}))
    for exam in exams:
        exam["_id"] = str(exam["_id"])
    return jsonify({"success": True, "exams": exams}), 200

@app.route('/exam/attempts', methods=['GET'])
def exam_attempts():
    exam_id = request.args.get("examId")
    if not exam_id:
        return jsonify({"success": False, "message": "Missing examId"}), 400

    attempts = list(db_collection.find({"examId": exam_id}))
    for attempt in attempts:
        attempt["_id"] = str(attempt["_id"])
        if "submittedAt" in attempt and attempt["submittedAt"]:
            attempt["submittedAt"] = attempt["submittedAt"].isoformat()
    return jsonify({"success": True, "attempts": attempts}), 200


@app.route('/exam/submit', methods=['POST'])
def exam_submit():
    """
    When a student submits their exam, store the following in the attempted_exams collection:
      - examId, username
      - examStartTime (provided by the client)
      - answers (an object mapping question index to the user’s answer)
      - abnormalAudios (if any)
      - submittedAt (current server time)
    Also, compute the MCQ score by comparing the student's answers with the exam details stored in the users collection.
    (Coding question scoring will be added later.)
    """
    data = request.get_json()
    exam_id = data.get("examId")
    username = data.get("username")
    exam_start_time = data.get("examStartTime")
    user_answers = data.get("answers")  # Expected as a dict: { "0": "b", "1": "print('Hello')", ... }
    abnormal_audios = data.get("abnormalAudios", [])  # Array of abnormal audio alert objects

    if not exam_id or not username or not exam_start_time or user_answers is None:
        return jsonify({"success": False, "message": "Missing examId, username, examStartTime, or answers"}), 400

    # Retrieve exam details from the users collection
    user_collection = db["users"]
    exam_doc = user_collection.find_one({"exam.id": exam_id}, {"_id": 0, "exam": 1})
    if not exam_doc or "exam" not in exam_doc:
        return jsonify({"success": False, "message": "Exam not found"}), 404

    exam_details = exam_doc["exam"]
    questions = exam_details.get("questions", [])
    computed_score = 0
    # Compute score for MCQ questions only.
    for idx, question in enumerate(questions):
        if question.get("type") == "mcq":
            # Get correct answer (converted to lower-case for comparison)
            correct = question.get("correctAnswer", "").lower() if question.get("correctAnswer") else ""
            # Assume user_answers keys are strings representing the question index (starting at "0")
            user_ans = user_answers.get(str(idx), "").lower()
            if user_ans == correct and correct != "":
                computed_score += question.get("score", 2)
        # Coding question scoring will be added later.

    new_attempt = {
        "examId": exam_id,
        "username": username,
        "examStartTime": exam_start_time,  # stored as provided (e.g., ISO string)
        "answers": user_answers,
        "score": computed_score,
        "abnormalAudios": abnormal_audios,
        "submittedAt": datetime.datetime.utcnow()
    }
    insert_result = db_collection.insert_one(new_attempt)
    new_attempt["_id"] = str(insert_result.inserted_id)
    new_attempt["submittedAt"] = new_attempt["submittedAt"].isoformat()
    return jsonify({"success": True, "attempt": new_attempt}), 200


@app.route('/exam/attempted', methods=['GET'])
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


@app.route('/exam/attempted/latest', methods=['GET'])
def exam_attempted_latest():
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

@app.route('/store-keylogs', methods=['POST'])
def store_keylogs():
    data = request.get_json()
    key_logs = data.get('keyLogs', '')
    if not key_logs:
        return jsonify({"success": False, "message": "No key logs provided"}), 400
    try:
        file_path = os.path.join(UPLOAD_FOLDER, 'keylogs.txt')
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(key_logs)
        return jsonify({"success": True, "message": "Keylogs stored successfully"}), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Error storing keylogs: {str(e)}"}), 500

def parse_questions(filepath, filename, uid=None):
    if uid is None:
        uid = str(uuid.uuid4())
    questions = []
    total_score = 0
    content = ""
    if filename.endswith('.txt'):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    elif filename.endswith('.docx'):
        doc = docx.Document(filepath)
        content = "\n".join([p.text for p in doc.paragraphs])
    
    lines = content.split('\n')
    current_question = None
    current_options = []
    correct_answer = None
    question_type = None  # 'mcq' or 'coding'
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        if line.startswith("Problem Statement:"):
            if current_question:
                score = 2 if question_type == 'mcq' else 5
                total_score += score
                questions.append({
                    "type": question_type,
                    "question": current_question,
                    "options": current_options if question_type == 'mcq' else [],
                    "correctAnswer": correct_answer if question_type == 'mcq' else None,
                    "score": score
                })
                current_question, current_options, correct_answer = None, [], None
            question_type = 'coding'
            current_question = line
            continue

        if line.endswith('?'):
            if current_question:
                score = 2 if question_type == 'mcq' else 5
                total_score += score
                questions.append({
                    "type": question_type,
                    "question": current_question,
                    "options": current_options if question_type == 'mcq' else [],
                    "correctAnswer": correct_answer if question_type == 'mcq' else None,
                    "score": score
                })
                current_question, current_options, correct_answer = None, [], None
            question_type = 'mcq'
            current_question = line
            continue

        if question_type == 'mcq' and (line.startswith("a)") or line.startswith("b)") or 
            line.startswith("c)") or line.startswith("d)")):
            current_options.append(line)
            continue

        if line.lower().startswith("correct:"):
            match = re.search(r'\((.*?)\)', line)
            if match:
                correct_answer = match.group(1).strip()
            continue

        if current_question:
            current_question += " " + line
        else:
            current_question = line

    if current_question:
        score = 2 if question_type == 'mcq' else 5
        total_score += score
        questions.append({
            "type": question_type,
            "question": current_question,
            "options": current_options if question_type == 'mcq' else [],
            "correctAnswer": correct_answer if question_type == 'mcq' else None,
            "score": score
        })

    return {"examId": uid, "questions": questions, "maxScore": total_score}

@app.errorhandler(413)
def file_too_large(e):
    return jsonify({"success": False, "message": "File is too large. Maximum size allowed is 10MB."}), 413

@app.route('/auth/signup', methods=['POST'])
def register_user():
    try:
        data = request.get_json()
        required_fields = ["username", "password", "email", "role"]
        for field in required_fields:
            if field not in data:
                return jsonify({"success": False, "message": f"Missing {field} field"}), 400
        username = data["username"]
        password = data["password"]
        email = data["email"]
        role = data["role"]
        print(username, password, email, role)
        usersCollection = db["users"]
        existing_user = usersCollection.find_one({"username": username, "email": email})
        JWT_SECRET = os.getenv("JWT_SECRET")
        if existing_user:
            return jsonify({"success": False, "message": "Username already exists"}), 409
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        token = jwt.encode({"email": email, "role": role}, JWT_SECRET, algorithm="HS256")
        usersCollection.insert_one({"username": username, "password": hashed_password, "email": email, "role": role})
        return jsonify({"success": True, "message": "User registered successfully", "token": token}), 201
    except Exception as e:
        return jsonify({"success": False, "message": f"An error occurred: {str(e)}"}), 500

@app.route('/auth/login', methods=['POST'])
def authenticate_user():
    try:
        data = request.get_json()
        print(data['username'])
        if "username" not in data or "password" not in data:
            return jsonify({"success": False, "message": "Missing username or password"}), 400
        username = data["username"]
        user_password = data["password"]
        JWT_SECRET = os.getenv("JWT_SECRET")
        usersCollection = db["users"]
        user_data = usersCollection.find_one({"username": username})
        if user_data:
            if not bcrypt.checkpw(user_password.encode('utf-8'), user_data['password']):
                return jsonify({"success": False, "message": "Invalid credentials"}), 401
            token = jwt.encode({"username": user_data['username'], "email": user_data['email'], "role": user_data['role']}, JWT_SECRET)
            return jsonify({
                "success": True,
                "message": "Login successful",
                "token": token,
                "user_data": {"username": user_data['username'], "role": user_data['role']}
            }), 200
        else:
            return jsonify({"success": False, "message": "User not found"}), 404
    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": f"An error occurred: {str(e)}"}), 500

@app.route('/auth/verify', methods=['GET'])
def verify_token():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"success": False, "message": "Token is missing"}), 401
        token = auth_header.split(" ")[1]
        JWT_SECRET = os.getenv("JWT_SECRET")
        decoded_token = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return jsonify({
            "success": True,
            "message": "Token is valid",
            "user_data": {"username": decoded_token['username'], "role": decoded_token['role']}
        }), 200
    except jwt.ExpiredSignatureError:
        return jsonify({"success": False, "message": "Token has expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"success": False, "message": "Invalid token"}), 401
    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": f"An error occurred: {str(e)}"}), 500

@app.route('/exam/details/<exam_id>', methods=['GET'])
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


@app.route('/exam/connect', methods=['POST'])
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
            "startedAt": datetime.datetime.utcnow(),
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

@app.route('/mobile/heartbeat', methods=['POST'])
def mobile_heartbeat():
    data = request.get_json()
    token = data.get('token')
    if not token:
        return jsonify({"success": False, "message": "Token missing"}), 400
    JWT_SECRET = os.getenv("JWT_SECRET")
    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return jsonify({"success": False, "message": "Token expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"success": False, "message": "Invalid token"}), 401
    mobile_log = {
        "username": decoded.get("username"),
        "examId": decoded.get("examId", "unknown"),
        "timestamp": data.get("timestamp"),
        "event": data.get("event", "heartbeat"),
        "tabFocus": data.get("tabFocus"),
        "screenWidth": data.get("screenWidth"),
        "screenHeight": data.get("screenHeight")
    }
    print("Mobile activity log:", mobile_log)
    logs_collection = db["mobile_activity_logs"]
    result = logs_collection.insert_one(mobile_log)
    mobile_log["_id"] = str(result.inserted_id)
    return jsonify({"success": True, "message": "Mobile activity logged", "log": mobile_log})

@app.route('/mobile/confirm', methods=['POST'])
def mobile_confirm():
    data = request.get_json()
    token = data.get('token')
    if not token:
        return jsonify({"success": False, "message": "Token missing"}), 400
    JWT_SECRET = os.getenv("JWT_SECRET")
    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except Exception as e:
        return jsonify({"success": False, "message": "Invalid token"}), 401
    username = decoded.get("username")
    exam_id = decoded.get("examId")
    sessions_collection = db["exam_sessions"]
    sessions_collection.update_one(
        {"username": username, "examId": exam_id},
        {"$set": {"mobile_confirmed": True, "confirmed_at": datetime.datetime.utcnow()}},
        upsert=True
    )
    return jsonify({"success": True, "message": "Mobile confirmed successfully."}), 200

@app.route('/mobile/status', methods=['GET'])
def mobile_status():
    token = request.args.get('token')
    if not token:
        return jsonify({"success": False, "message": "Token missing"}), 400
    JWT_SECRET = os.getenv("JWT_SECRET")
    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except Exception as e:
        return jsonify({"success": False, "message": "Invalid token"}), 401
    username = decoded.get("username")
    exam_id = decoded.get("examId")
    sessions_collection = db["exam_sessions"]
    session = sessions_collection.find_one({"username": username, "examId": exam_id})
    mobile_confirmed = session.get("mobile_confirmed") if session else False
    return jsonify({"success": True, "mobile_confirmed": mobile_confirmed})

@app.route('/upload-audio', methods=['POST'])
def upload_audio():
    if "audio" not in request.files:
        return jsonify({"success": False, "message": "No audio file provided"}), 400
    audio_file = request.files["audio"]
    exam_id = request.form.get("examId")
    token = request.form.get("token")
    if not exam_id or not token:
        return jsonify({"success": False, "message": "Missing examId or token"}), 400
    JWT_SECRET = os.getenv("JWT_SECRET")
    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except Exception as e:
        return jsonify({"success": False, "message": "Invalid token"}), 401
    username = decoded.get("username")
    filename = secure_filename(audio_file.filename)
    file_path = os.path.join(AUDIO_UPLOAD_FOLDER, filename)
    audio_file.save(file_path)
    try:
        y, sr = librosa.load(file_path, sr=None)
        rms = np.mean(librosa.feature.rms(y=y))
        background_threshold = 0.01  
    except Exception as e:
        return jsonify({"success": False, "message": f"Error loading audio: {str(e)}"}), 500
    if rms < background_threshold:
        os.remove(file_path)
        return jsonify({"success": True, "message": "Audio is background noise. Not processed."}), 200
    abnormal_threshold = 0.05  
    abnormal = rms > abnormal_threshold
    speaker_count = 1 if abnormal else 0
    try:
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        mfcc_means = np.mean(mfccs, axis=1).tolist()
    except Exception as e:
        return jsonify({"success": False, "message": f"Error extracting MFCC: {str(e)}"}), 500
    if abnormal:
        alert_data = {
            "timestamp": datetime.datetime.utcnow(),
            "file_path": file_path,
            "rms": rms,
            "speaker_count": speaker_count,
            "mfcc_means": mfcc_means,
            "analysis": "Abnormal noise detected based on RMS threshold."
        }
        db_collection.update_one(
            {"examId": exam_id, "username": username},
            {"$push": {"audioAlerts": alert_data}}
        )
        message = "Abnormal audio fragment detected and stored."
    else:
        os.remove(file_path)
        message = "Audio fragment is normal. Not stored."
    return jsonify({
        "success": True,
        "message": message,
        "speaker_count": speaker_count,
        "mfcc_means": mfcc_means
    }), 200

@app.route('/exam/noise-alert', methods=['GET'])
def exam_noise_alert():
    exam_id = request.args.get("examId")
    token = request.args.get("token")
    if not exam_id or not token:
        return jsonify({"success": False, "message": "Missing examId or token"}), 400
    JWT_SECRET = os.getenv("JWT_SECRET")
    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except Exception as e:
        return jsonify({"success": False, "message": "Invalid token"}), 401
    username = decoded.get("username")
    attempt = db_collection.find_one({"examId": exam_id, "username": username})
    if attempt and "audioAlerts" in attempt:
        alerts = attempt.get("audioAlerts", [])
        time_threshold = datetime.datetime.utcnow() - datetime.timedelta(minutes=5)
        recent_alert = next((a for a in alerts if a["timestamp"] >= time_threshold), None)
        if recent_alert:
            return jsonify({"success": True, "abnormal": True, "speaker_count": recent_alert.get("speaker_count", 0)}), 200
    return jsonify({"success": True, "abnormal": False}), 200

@app.route('/exam/audio-alerts', methods=['GET'])
def exam_audio_alerts():
    exam_id = request.args.get("examId")
    token = request.args.get("token")
    if not exam_id or not token:
        return jsonify({"success": False, "message": "Missing examId or token"}), 400
    JWT_SECRET = os.getenv("JWT_SECRET")
    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except Exception as e:
        return jsonify({"success": False, "message": "Invalid token"}), 401
    username = decoded.get("username")
    attempt = db_collection.find_one({"examId": exam_id, "username": username})
    if attempt and "audioAlerts" in attempt:
        audio_alerts = attempt.get("audioAlerts", [])
        return jsonify({"success": True, "audioAlerts": audio_alerts}), 200
    else:
        return jsonify({"success": True, "audioAlerts": []}), 200

@app.route('/exam/attempted/latest', methods=['GET'])
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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
