from flask import Blueprint, request, jsonify, send_file
import base64
from flask import current_app as app
from werkzeug.utils import secure_filename
from exam.utils import parse_questions
from io import BytesIO
from PIL import Image
from datetime import timezone
from dateutil import parser as date_parser
import jwt
from database import init_db
import datetime
from upload.utils import allowed_file, detect_objects
from config import Config
import os
from audio_analysis.speaker_diarization import run_speaker_analysis_and_store
import re

db_data = init_db()
db = db_data['db']
db_exams = db_data['db_exams']
db_collection = db_data['db_collection']
db_frames = db_data['frames']
upload_bp = Blueprint('upload', __name__)

@upload_bp.route('', methods=['POST', 'OPTIONS'])
def upload_frame():
    if request.method == 'OPTIONS':
        return '', 200

    data       = request.get_json(force=True)
    exam_id    = data.get('exam_id')
    image_blob = data.get('image')

    if not image_blob:
        return jsonify(success=False, message="No image provided"), 400

    # 1) extract token from either JSON or Bearer header safely
    token = data.get('token')
    auth_header = request.headers.get('Authorization', '')
    if not token and auth_header:
        parts = auth_header.split(" ", 1)
        if len(parts) == 2 and parts[0].lower() == "bearer":
            token = parts[1]

    # 2) decode JWT
    username = "anonymous"
    if token:
        try:
            payload = jwt.decode(token, os.getenv("JWT_SECRET"), algorithms=["HS256"])
            username = payload.get("username", username)
        except jwt.PyJWTError:
            pass

    try:
        # strip off the base64 metadata prefix
        b64data = image_blob.split(",", 1)[1]
        raw     = base64.b64decode(b64data)
        img     = Image.open(BytesIO(raw))

        objects      = detect_objects(img)
        person_count = objects.count("person")
        has_phone    = any(o in ("cell phone","laptop") for o in objects)

        if person_count > 1 or has_phone:
            db_frames.insert_one({
                "timestamp": datetime.datetime.now(datetime.timezone.utc),
                "exam_id":   exam_id,
                "username":  username,
                "objects":   objects,
                "image":     b64data
            })

        return jsonify(success=True, objects=objects), 200

    except Exception as e:
        return jsonify(success=False, message=f"Error: {e}"), 500

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
    print(f"[AUDIO UPLOAD] Saving audio file to: {file_path}")
    audio_file.save(file_path)

    # Save basic recording entry to MongoDB
    recording_entry = {
        "file": unique_filename,
        "timestamp": datetime.datetime.now(datetime.timezone.utc)
    }
    result = db_collection.update_one(
        {"examId": exam_id, "username": username},
        {"$set": {"recordings": [recording_entry]}}
    )
    if result.matched_count == 0:
        print(f"[AUDIO UPLOAD] No attempt found for examId={exam_id}, username={username}")
        return jsonify({"success": False, "message": "Attempt not found in DB"}), 404
    print(f"[AUDIO UPLOAD] Updated attempt with audio recording: {recording_entry}")

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
    # force JSON parsing even if header is missing
    data = request.get_json(force=True)
    print("🔍 store_keylogs received:", data)

    # accept either camelCase or lowercase
    key_logs = data.get('keyLogs') or data.get('keylogs')
    if not key_logs:
        return jsonify({"success": False, "message": "No key logs provided"}), 400

    # turn your upload folder into an absolute path to be 100% sure
    upload_dir = os.path.abspath(Config.UPLOAD_FOLDER)
    os.makedirs(upload_dir, exist_ok=True)   # just in case

    file_path = os.path.join(upload_dir, 'keylogs.txt')
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(key_logs)
        print(f"✅ Keylogs written to {file_path}")
        return jsonify({"success": True, "message": "Keylogs stored successfully"}), 200
    except Exception as e:
        print("❌ Error writing keylogs:", e)
        return jsonify({"success": False, "message": f"Error storing keylogs: {e}"}), 500


@upload_bp.route('/keylogs/analyze', methods=['POST'])
def analyze_keylogs():
    """
    POST JSON: { "examId": "...", "username": "..." }
    Reads keylogs.txt, parses events in order, detects:
      • ctrl+c (copy)
      • ctrl+v (paste)
      • Meta key
      • tab + unfocus (tab switch)
    Stores counts under `suspiciousKeylogs` in MongoDB.
    """
    data     = request.get_json(silent=True) or {}
    exam_id  = data.get("examId")
    username = data.get("username")
    if not exam_id or not username:
        return jsonify(success=False, message="Missing examId or username"), 400

    # locate keylogs.txt
    upload_dir = os.path.join(app.root_path, Config.UPLOAD_FOLDER)
    file_path  = os.path.join(upload_dir, 'keylogs.txt')
    if not os.path.exists(file_path):
        return jsonify(success=False, message="No keylogs file found"), 404

    # parse the file into a list of timestamped events
    events = []
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            # Key pressed lines
            m = re.match(r"Key pressed:\s*(\w+),\s*Timestamp:\s*([\d\-\:T\.]+Z)", line)
            if m:
                key = m.group(1)
                ts  = date_parser.isoparse(m.group(2))
                events.append({"type":"key", "key": key, "time": ts})
                continue

            # Unfocus / refocus lines
            if "unfocused" in line:
                ts = date_parser.isoparse(line.split("Timestamp:")[1].strip())
                events.append({"type":"unfocus", "time": ts})
            elif "refocused" in line:
                ts = date_parser.isoparse(line.split("Timestamp:")[1].strip())
                events.append({"type":"refocus", "time": ts})

    # now scan for patterns in sequence
    copy_count      = 0
    paste_count     = 0
    meta_count      = 0
    tab_switch_count= 0

    for i, ev in enumerate(events):
        # count Meta presses
        if ev["type"] == "key" and ev["key"].lower() == "meta":
            meta_count += 1

        # look for ctrl+c and ctrl+v
        if ev["type"]=="key" and ev["key"].lower()=="control" and i+1 < len(events):
            nxt = events[i+1]
            if nxt["type"]=="key":
                if nxt["key"].lower() == "c":
                    copy_count += 1
                elif nxt["key"].lower() == "v":
                    paste_count += 1

        # look for Tab + unfocus
        if ev["type"]=="key" and ev["key"].lower()=="tab" and i+1 < len(events):
            if events[i+1]["type"] == "unfocus":
                tab_switch_count += 1

    # build suspicious dict
    suspicious = {}
    if copy_count:       suspicious["copy"]       = {"ctrl+c": copy_count}
    if paste_count:      suspicious["paste"]      = {"ctrl+v": paste_count}
    if meta_count:       suspicious["meta"]       = {"meta": meta_count}
    if tab_switch_count: suspicious["tab_switch"] = {"tab+switch": tab_switch_count}

    # persist to MongoDB if any found
    if suspicious:
        db_collection.update_one(
            {"examId": exam_id, "username": username},
            {"$set": {
               "suspiciousKeylogs": suspicious,
               "suspicionCheckedAt": datetime.datetime.now(datetime.timezone.utc).isoformat()
            }}
        )

    return jsonify(success=True, suspicious=suspicious), 200