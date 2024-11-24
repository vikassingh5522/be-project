from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
from io import BytesIO
from PIL import Image
import os
from image_processing.objDec import detect
from werkzeug.utils import secure_filename
import docx

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

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

    if not code:
        return jsonify({"success": False, "message": "No code provided"}), 400

    try:
        # Save the submitted code to code.txt in the server directory
        file_path = os.path.join(CODE_DIR, "code.txt")
        with open(file_path, 'w') as file:
            file.write(code)

        return jsonify({"success": True, "message": "Code saved successfully"}), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Error saving code: {str(e)}"}), 500


@app.route('/upload-file', methods=['POST'])
def upload_file():
    """Handles uploading and processing a Word or text file."""
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
        # Process the uploaded file
        if filename.endswith('.txt'):
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
        elif filename.endswith('.docx'):
            doc = docx.Document(filepath)
            content = "\n".join([p.text for p in doc.paragraphs])

        questions = parse_questions(content)
        if not questions:
            return jsonify({"success": False, "message": "No valid questions found in the file."}), 400

        return jsonify({"success": True, "questions": questions}), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Error processing file: {str(e)}"}), 500


def parse_questions(content):
    """Parse questions and options from the file content."""
    questions = []
    lines = content.split('\n')

    current_question = None
    current_options = []

    for line in lines:
        line = line.strip()
        if line.endswith('?'):
            # Save the previous question if it exists
            if current_question and current_options:
                questions.append({"question": current_question, "options": current_options})
            # Start a new question
            current_question = line
            current_options = []
        elif line.startswith(('a)', 'b)', 'c)', 'd)')):
            # Add options to the current question
            current_options.append(line)

    # Add the last question if it exists
    if current_question and current_options:
        questions.append({"question": current_question, "options": current_options})

    return questions


@app.errorhandler(413)
def file_too_large(e):
    """Handle file size limit exceeded."""
    return jsonify({"success": False, "message": "File is too large. Maximum size allowed is 10MB."}), 413


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
