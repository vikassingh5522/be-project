# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS 
import base64
from io import BytesIO
from PIL import Image
import os
from urllib.parse import quote as url_quote

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

@app.route('/upload', methods=['POST'])
def upload_frame():
    data = request.get_json()

    image_data = data.get('image')
    if image_data:
        image_data = image_data.split(",")[1]
        image = base64.b64decode(image_data)
        img = Image.open(BytesIO(image))
        img.save(os.path.join("received_frames", "frame.jpg"))
        return jsonify({"success": True, "message": "Frame received"}), 200
    else:
        return jsonify({"success": False, "message": "No image provided"}), 400

if __name__ == '__main__':
    if not os.path.exists("received_frames"):
        os.makedirs("received_frames")
    app.run(host='0.0.0.0', port=5000)
