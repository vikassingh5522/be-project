# backend/app.py
from flask import Flask
from flask import Blueprint, render_template, request, jsonify
from flask_cors import CORS
from auth.routes import auth_bp
from exam.routes import exam_bp
from mobile.routes import mobile_bp
from upload.routes import upload_bp
from database import init_db
import config
import os

def create_app(config_class=config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    CORS(app,supports_credentials=True, resources={r"/*": {"origins": "*"}, })
    
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
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)