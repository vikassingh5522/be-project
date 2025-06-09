# backend/app.py
from flask import Flask, request, jsonify
from flask import Blueprint, render_template, request, jsonify
from flask_cors import CORS
from auth.routes import auth_bp
from exam.routes import exam_bp
from mobile.routes import mobile_bp
from upload.routes import upload_bp
from database import init_db
import config
import os
from flask_mail import Mail
from audio_analysis.routes import audio_analysis

def create_app(config_class=config):
    app = Flask(__name__)

    # Global CORS: uses FRONTEND_URL env var in production, defaults to "*" for local dev
    frontend = os.getenv("FRONTEND_URL", "*")
    CORS(app,
         supports_credentials=True,
         resources={r"/*": {"origins": frontend}})

    # Load configuration
    app.config.from_object(config_class)

    # Initialize Flask-Mail
    mail = Mail()
    mail.init_app(app)

    # Initialize database and inject into app.config
    try:
        db_objects = init_db()
        app.config.update(db_objects)
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")
        raise

    # Register blueprints
    app.register_blueprint(auth_bp,          url_prefix="/auth")
    app.register_blueprint(exam_bp,          url_prefix="/exam")
    app.register_blueprint(upload_bp,        url_prefix="/upload")
    app.register_blueprint(mobile_bp,        url_prefix="/mobile")
    app.register_blueprint(audio_analysis,   url_prefix="/api/audio-analysis")

    return app

if __name__ == "__main__":
    # Local development
    create_app().run(host="0.0.0.0", port=5000, debug=True)

# WSGI entrypoint for Gunicorn / Render
application = create_app()