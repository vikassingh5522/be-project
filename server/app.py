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
load_dotenv()


app = Flask(__name__)
CORS(app)



URI = os.getenv('USER1')
# Create a new client and connect to the server
client = MongoClient(URI, server_api=ServerApi('1'))
global db
# Send a ping to confirm a successful connection
try:
    client.admin.command('ping')
    db = client["beproject"]
    print("You successfully connected to MongoDB!")
except Exception as e:
    print(e)

# Ensure directories exist
UPLOAD_FOLDER = 'uploaded_files'
FRAME_DIR = "received_frames"
CODE_DIR = "received_codes"

for directory in [UPLOAD_FOLDER, FRAME_DIR, CODE_DIR]:
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

        # Detect objects using the object detection module
        objects = detect(img)
        return jsonify({"success": True, "objects": objects}), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Error processing image: {str(e)}"}), 500


@app.route('/submit-code', methods=['POST'])
def submit_code():
    """Handles submitting code from the code editor."""
    data = request.get_json()
    code = data.get('code', '')
    language = data.get('language', 'python')  # Default to Python if no language is provided
    question_number = data.get('question_number', 1)  # Default to question 1 if not provided

    if not code:
        return jsonify({"success": False, "message": "No code provided"}), 400

    if not language:
        return jsonify({"success": False, "message": "No language specified"}), 400

    try:
        # Construct the filename and save path
        filename = f"{language}_question_{question_number}.txt"
        file_path = os.path.join(CODE_DIR, filename)

        # Save the code to the file
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
            result = parse_questions(filepath, filename)  # parse_questions now returns a dict with examId and questions
            uid = result["examId"]
            questions = result["questions"]
            exam = {
                "id": uid,
                "name": exam_name,
                "duration": exam_duration,
                "date": exam_date,
                "questions": questions
            }
            userCollection = db["users"]
            userCollection.insert_one({"exam": exam})
            return jsonify({"success": True, "examId": uid}), 200
        else:
            result = parse_questions(filepath, filename)
            questions = result["questions"]
            return jsonify({"success": True, "questions": questions}), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Error processing file: {str(e)}"}), 500

    

@app.route('/exam/create', methods=['POST'])
def createExam():
    uid = uuid.uuid4()
    try:
        # Check if a file was sent in the request
        if 'file' not in request.files:
            return jsonify({"success": False, "message": "No file part in the request"}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"success": False, "message": "No file selected"}), 400

        if not allowed_file(file.filename):
            return jsonify({"success": False, "message": "Unsupported file type. Only .txt and .docx are allowed."}), 400

        # Get other form fields (name, duration, date)
        exam_name = request.form.get('name')
        exam_duration = request.form.get('duration')
        exam_date = request.form.get('date')

        if not exam_name or not exam_duration or not exam_date:
            return jsonify({"success": False, "message": "Missing exam details (name, duration, date)."}), 400

        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        # Parse the file and get the questions
        questions = parse_questions(filepath, filename)
        if not questions:
            return jsonify({"success": False, "message": "No valid questions found in the file."}), 400

        # Save exam details into the users collection
        userCollection = db["users"]
        userCollection.insert_one({
            "exam": {
                "id": str(uid),
                "name": exam_name,
                "duration": exam_duration,
                "date": exam_date,
                "questions": questions
            }
        })

        return jsonify({"success": True, "examId": str(uid)}), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Error processing file: {str(e)}"}), 500



@app.route('/store-keylogs', methods=['POST'])
def store_keylogs():
    """Handles storing keylogs to a text file."""
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
    question_type = 'mcq'
    for line in lines:
        line = line.strip()
        if 'Problem Statement:' in line:
            if current_question:
                questions.append({"type": question_type, "question": current_question, "options": current_options})
            current_question = line
            current_options = []
            question_type = 'coding'
        elif line.endswith('?'):
            if current_question:
                questions.append({"type": question_type, "question": current_question, "options": current_options})
            current_question = line
            current_options = []
            question_type = 'mcq'
        elif line.startswith(('a)', 'b)', 'c)', 'd)')) and question_type == 'mcq':
            current_options.append(line)
    if current_question:
        questions.append({"type": question_type, "question": current_question, "options": current_options})
    return {"examId": uid, "questions": questions}

     

@app.errorhandler(413)
def file_too_large(e):
    """Handle file size limit exceeded."""
    return jsonify({"success": False, "message": "File is too large. Maximum size allowed is 10MB."}), 413

@app.route('/auth/signup', methods=['POST'])
def register_user():
    try:
        data = request.get_json()
        
        # Check if all necessary fields are present
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
        
        # Hash the password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        # Generate JWT token
        token = jwt.encode({"email": email, "role": role}, JWT_SECRET, algorithm="HS256")

        # Store user in database
        usersCollection.insert_one({"username": username, "password": hashed_password, "email": email, "role": role})

        return jsonify({"success": True, "message": "User registered successfully", "token": token}), 201
    except Exception as e:
        return jsonify({"success": False, "message": f"An error occurred: {str(e)}"}), 500
    

@app.route('/auth/login', methods=['POST'])
def authenticate_user():
    try:
        data = request.get_json()
        print(data['username'])
        
        # Check if necessary fields are present
        if "username" not in data or "password" not in data:
            return jsonify({"success": False, "message": "Missing username or password"}), 400

        username = data["username"]
        user_password = data["password"]
        JWT_SECRET = os.getenv("JWT_SECRET")
        
        # Check if the user exists
        usersCollection = db["users"]
        user_data = usersCollection.find_one({"username": username})
        if user_data:
            # Check if the password matches
            if not bcrypt.checkpw(user_password.encode('utf-8'), user_data['password']):
                return jsonify({"success": False, "message": "Invalid credentials"}), 401
            token = jwt.encode({"username": user_data['username'], "email": user_data['email'], "role": user_data['role']}, JWT_SECRET)
            return jsonify({"success": True, "message": "Login successful", "token": token}), 200
        else:
            return jsonify({"success": False, "message": "User not found"}), 404

    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": f"An error occurred: {str(e)}"}), 500

@app.route('/auth/verify', methods=['GET'])
def verify_token():
    try:
        # Get the token from the Authorization header
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({"success": False, "message": "Token is missing"}), 401
        
        token = auth_header.split(" ")[1]  # Extract token part from "Bearer <token>"

        # Decode the token
        JWT_SECRET = os.getenv("JWT_SECRET")
        decoded_token = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        
        # Token is valid, return the user data (or just a success message)
        return jsonify({"success": True, "message": "Token is valid", "user_data": {"username": decoded_token['username'], "role": decoded_token['role']}}), 200

    except jwt.ExpiredSignatureError:
        return jsonify({"success": False, "message": "Token has expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"success": False, "message": "Invalid token"}), 401
    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": f"An error occurred: {str(e)}"}), 500    

@app.route('/exam/details/<exam_id>', methods=['GET'])
def get_exam_details(exam_id):
    userCollection = db["users"]
    exam_doc = userCollection.find_one({"exam.id": exam_id}, {"_id": 0, "exam": 1})
    if exam_doc and "exam" in exam_doc:
        # Return the questions and duration (ensure the duration is numeric if needed)
        return jsonify({
            "success": True,
            "questions": exam_doc["exam"]["questions"],
            "duration": int(exam_doc["exam"]["duration"])
        }), 200
    return jsonify({"success": False, "message": "Exam not found"}), 404

@app.route('/exam/connect', methods=['POST'])
def exam_connect():
    """
    Given a valid login token and an exam id (from the desktop session),
    generate a new token that includes the exam id. This token is used by the mobile device.
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
    
    # Create a new token that includes the exam id
    new_payload = {
        "username": decoded.get("username"),
        "email": decoded.get("email"),
        "role": decoded.get("role"),
        "examId": exam_id
    }
    exam_token = jwt.encode(new_payload, JWT_SECRET, algorithm="HS256")
    return jsonify({"success": True, "examToken": exam_token}), 200


@app.route('/mobile/heartbeat', methods=['POST'])
def mobile_heartbeat():
    """
    Receives heartbeat and event logs (e.g., focus, blur, resize) from the mobile monitor page.
    Stores each log in the MongoDB collection and prints the log to the console.
    """
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

    # Build the mobile activity log
    mobile_log = {
        "username": decoded.get("username"),
        "examId": decoded.get("examId", "unknown"),
        "timestamp": data.get("timestamp"),
        "event": data.get("event", "heartbeat"),
        "tabFocus": data.get("tabFocus"),      # True or False
        "screenWidth": data.get("screenWidth"),
        "screenHeight": data.get("screenHeight")
    }

    # Print the log to the console for debugging
    print("Mobile activity log:", mobile_log)

    # Store the log in MongoDB and capture the inserted ID
    logs_collection = db["mobile_activity_logs"]
    result = logs_collection.insert_one(mobile_log)
    # Convert the ObjectId to string so it can be serialized
    mobile_log["_id"] = str(result.inserted_id)

    # Return the log back in the response for confirmation
    return jsonify({"success": True, "message": "Mobile activity logged", "log": mobile_log})


@app.route('/mobile/confirm', methods=['POST'])
def mobile_confirm():
    """
    Receives a mobile confirmation event and updates the exam session
    to mark mobile as confirmed.
    """
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
    
    # Upsert a record in a dedicated collection (exam_sessions)
    sessions_collection = db["exam_sessions"]
    sessions_collection.update_one(
        {"username": username, "examId": exam_id},
        {"$set": {"mobile_confirmed": True, "confirmed_at": datetime.datetime.utcnow()}},
        upsert=True
    )
    return jsonify({"success": True, "message": "Mobile confirmed successfully."}), 200

@app.route('/mobile/status', methods=['GET'])
def mobile_status():
    """
    Checks if the mobile confirmation flag has been set for the given exam token.
    Expects the token as a query parameter.
    """
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


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
