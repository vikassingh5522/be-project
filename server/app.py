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
from dotenv import load_dotenv

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
        questions = parse_questions(filepath, filename)
        if not questions:
            return jsonify({"success": False, "message": "No valid questions found in the file."}), 400

        return jsonify({"success": True, "questions": questions}), 200
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


def parse_questions(filepath, filename):
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
    question_type = 'mcq'  # Default to MCQ

    for line in lines:
        line = line.strip()
        if 'Problem Statement:' in line:
            # Save the previous question if it exists
            if current_question:
                questions.append({"type": question_type, "question": current_question, "options": current_options})
            # Start a new coding question
            current_question = line
            current_options = []
            question_type = 'coding'
        elif line.endswith('?'):
            # Save the previous question if it exists
            if current_question:
                questions.append({"type": question_type, "question": current_question, "options": current_options})
            # Start a new MCQ
            current_question = line
            current_options = []
            question_type = 'mcq'  # Reset to default type
        elif line.startswith(('a)', 'b)', 'c)', 'd)')) and question_type == 'mcq':
            # Add options to the current MCQ
            current_options.append(line)

    # Add the last question if it exists
    if current_question:
        questions.append({"type": question_type, "question": current_question, "options": current_options})

    return questions


     

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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
