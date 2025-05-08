from flask import Blueprint, request, jsonify, send_file
import base64
from werkzeug.utils import secure_filename
from exam.utils import parse_questions
from io import BytesIO
from PIL import Image
from datetime import timezone
import jwt
from database import init_db
import datetime
from upload.utils import allowed_file, detect_objects
from config import Config
import os
from audio_analysis.speaker_diarization import run_speaker_analysis_and_store


db_data = init_db()
db = db_data['db']
db_exams = db_data['db_exams']
db_collection = db_data['db_collection']
db_frames = db_data['frames']
upload_bp = Blueprint('upload', __name__)

@upload_bp.route('', methods=['POST', 'OPTIONS'])
def upload_frame():
    """Handles uploading and processing an image frame."""
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json()
    examId = data.get('exam_id')
    image_data = data.get('image')
    if not image_data:
        return jsonify({"success": False, "message": "No image provided"}), 400

    try:
        # Decode the base64 image
        image_data = image_data.split(",")[1]
        image = base64.b64decode(image_data)
        img = Image.open(BytesIO(image))

        # Detect objects (implement detect_objects to return list of detected labels)
        objects = detect_objects(img)

        # Check conditions
        person_count = objects.count('person')
        has_mobile_or_laptop = any(obj in objects for obj in ['cell phone', 'laptop'])
        if person_count > 1 or has_mobile_or_laptop:
            # Prepare image for MongoDB (store as base64 or binary)
            
            # Insert into MongoDB
            db_frames.insert_one({
                "timestamp": datetime.datetime.now(datetime.timezone.utc),
                "objects": objects,
                "image": image_data,
                "exam_id": examId
            })

        return jsonify({"success": True, "objects": objects}), 200

    except Exception as e:
        return jsonify({"success": False, "message": f"Error processing image: {str(e)}"}), 500

@upload_bp.route('/file', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"success": False, "message": "No file part in the request"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"success": False, "message": "No file selected"}), 400
    if not allowed_file(file.filename):
        return jsonify({"success": False, "message": "Unsupported file type. Only .txt and .docx are allowed."}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(Config['UPLOAD_FOLDER'], filename)
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
    

@upload_bp.route('/audio', methods=['POST'])
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
    except Exception:
        return jsonify({"success": False, "message": "Invalid token"}), 401

    username = decoded.get("username")
    original_filename = secure_filename(audio_file.filename)
    unique_filename = f"{exam_id}_{username}_{int(datetime.datetime.now().timestamp())}_{original_filename}"
    file_path = os.path.join(Config.AUDIO_UPLOAD_FOLDER, unique_filename)
    audio_file.save(file_path)

    # Save basic recording entry to MongoDB
    recording_entry = {
        "file": unique_filename,
        "timestamp": datetime.datetime.now(datetime.timezone.utc)
    }
    db_collection.update_one(
        {"examId": exam_id, "username": username},
        {"$push": {"recordings": recording_entry}}
    )

    # Run analysis in background
    from threading import Thread
    thread = Thread(target=run_speaker_analysis_and_store, args=(file_path, exam_id, username, unique_filename))
    thread.start()

    return jsonify({
        "success": True,
        "message": "Audio recording received",
        "recording": recording_entry
    }), 200

@upload_bp.route('/audio/<path:filename>', methods=['GET'])
def serve_audio(filename):
    file_path = os.path.join(Config.AUDIO_UPLOAD_FOLDER, filename)
    return send_file(file_path, mimetype="audio/webm")


@upload_bp.route('/keylogs', methods=['POST'])
def store_keylogs():
    data = request.get_json()
    key_logs = data.get('keyLogs', '')
    if not key_logs:
        return jsonify({"success": False, "message": "No key logs provided"}), 400
    try:
        file_path = os.path.join(Config.UPLOAD_FOLDER, 'keylogs.txt')
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(key_logs)
        return jsonify({"success": True, "message": "Keylogs stored successfully"}), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Error storing keylogs: {str(e)}"}), 500
