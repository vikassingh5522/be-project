import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    USER1 = os.getenv('USER1')
    JWT_SECRET = os.getenv('JWT_SECRET')
    
    # File upload configurations
    UPLOAD_FOLDER = 'assets/uploaded_files'
    FRAME_DIR = "assets/received_frames"
    CODE_DIR = "assets/received_codes"
    AUDIO_UPLOAD_FOLDER = "assets/uploaded_audio_fragments"

    for directory in [UPLOAD_FOLDER, FRAME_DIR, CODE_DIR, AUDIO_UPLOAD_FOLDER]:
        os.makedirs(directory, exist_ok=True)
        
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10 MB
    ALLOWED_EXTENSIONS = {'.txt', '.docx'}