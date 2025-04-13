from flask import Blueprint, request, jsonify
import database
from config import Config
import jwt
import os
import datetime

mobile_bp = Blueprint('mobile', __name__)

@mobile_bp.route('/heartbeat', methods=['POST'])
def mobile_heartbeat():
    data = request.get_json()
    token = data.get('token')
    if not token:
        return jsonify({"success": False, "message": "Token missing"}), 400
        
    try:
        decoded = jwt.decode(token, Config.JWT_SECRET, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return jsonify({"success": False, "message": "Token expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"success": False, "message": "Invalid token"}), 401
        
    mobile_log = {
        "username": decoded.get("username"),
        "examId": decoded.get("examId", "unknown"),
        "timestamp": data.get("timestamp"),
        "event": data.get("event", "heartbeat"),
        "tabFocus": data.get("tabFocus"),
        "screenWidth": data.get("screenWidth"),
        "screenHeight": data.get("screenHeight")
    }
    
    logs_collection = db["mobile_activity_logs"]
    result = logs_collection.insert_one(mobile_log)
    mobile_log["_id"] = str(result.inserted_id)
    
    return jsonify({
        "success": True,
        "message": "Mobile activity logged",
        "log": mobile_log
    })

@mobile_bp.route('/confirm', methods=['POST'])
def mobile_confirm():
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
    sessions_collection = db["exam_sessions"]
    sessions_collection.update_one(
        {"username": username, "examId": exam_id},
        {"$set": {"mobile_confirmed": True, "confirmed_at": datetime.datetime.now(datetime.timezone.utc)}},
        upsert=True
    )
    return jsonify({"success": True, "message": "Mobile confirmed successfully."}), 200

@mobile_bp.route('/status', methods=['GET'])
def mobile_status():
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
