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
    CORS(app, resources={r"/exam/*": {"origins": "http://localhost:3000" or "http://127.0.0.1:3000" or "http://192.168.1.35:3000" }})
    @app.after_request
    def add_cors(response):
        # Allow your dev origin (you can use "*" for everything, but it's safer to lock it down):
        response.headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response
    app.config.from_object(config_class)
    
    Mmail = Mail()
    Mmail.init_app(app)
    
    # Enable CORS for the app (allow all origins for debugging)
    CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})
    # Also apply CORS to all blueprints
    CORS(auth_bp, supports_credentials=True, resources={r"/*": {"origins": "*"}})
    CORS(exam_bp, supports_credentials=True, resources={r"/*": {"origins": "*"}})
    CORS(mobile_bp, supports_credentials=True, resources={r"/*": {"origins": "*"}})
    CORS(upload_bp, supports_credentials=True, resources={r"/*": {"origins": "*"}})
    
    # Initialize database
    try:
        db_objects = init_db()
        # Make database objects available to the app context
        app.config.update(db_objects)
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")
        raise
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(exam_bp, url_prefix='/exam')
    app.register_blueprint(upload_bp, url_prefix='/upload')
    app.register_blueprint(mobile_bp, url_prefix='/mobile')
    app.register_blueprint(audio_analysis, url_prefix='/api/audio-analysis')
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)