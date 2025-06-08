from flask import Blueprint, request, jsonify
from exam.routes import db
from config import Config
import jwt
import os
import datetime
from collections import defaultdict

mobile_bp = Blueprint('mobile', __name__)

def analyze_mobile_activity(username, exam_id):
    """Analyze mobile activity logs for suspicious behavior"""
    logs_collection = db["mobile_activity_logs"]
    logs = list(logs_collection.find({
        "username": username,
        "examId": exam_id
    }).sort("timestamp", 1))
    
    analysis = {
        "total_events": len(logs),
        "focus_violations": 0,
        "screen_changes": 0,
        "network_changes": 0,
        "battery_issues": 0,
        "suspicious_periods": []
    }
    
    if not logs:
        return analysis
        
    # Track focus violations
    focus_violations = []
    current_violation = None
    
    for i, log in enumerate(logs):
        # Check for focus violations
        if log.get("event") == "blur":
            if not current_violation:
                current_violation = {
                    "start": log["timestamp"],
                    "duration": 0
                }
        elif log.get("event") == "focus" and current_violation:
            current_violation["end"] = log["timestamp"]
            focus_violations.append(current_violation)
            current_violation = None
            
        # Check for screen size changes
        if log.get("event") == "resize":
            analysis["screen_changes"] += 1
            
        # Check for network changes
        if log.get("networkType"):
            if i > 0 and logs[i-1].get("networkType") != log.get("networkType"):
                analysis["network_changes"] += 1
                
        # Check for battery issues
        if log.get("batteryLevel") and float(log.get("batteryLevel", 1)) < 0.2:
            analysis["battery_issues"] += 1
    
    # Calculate violation durations
    for violation in focus_violations:
        start_time = datetime.datetime.fromisoformat(violation["start"].replace('Z', '+00:00'))
        end_time = datetime.datetime.fromisoformat(violation["end"].replace('Z', '+00:00'))
        duration = (end_time - start_time).total_seconds()
        violation["duration"] = duration
        if duration > 5:  # Consider violations longer than 5 seconds as suspicious
            analysis["focus_violations"] += 1
            analysis["suspicious_periods"].append(violation)
    
    return analysis

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
        "screenHeight": data.get("screenHeight"),
        "batteryLevel": data.get("batteryLevel"),
        "networkType": data.get("networkType")
    }
    
    logs_collection = db["mobile_activity_logs"]
    result = logs_collection.insert_one(mobile_log)
    mobile_log["_id"] = str(result.inserted_id)
    
    # Update exam session with latest activity
    sessions_collection = db["exam_sessions"]
    sessions_collection.update_one(
        {"username": decoded.get("username"), "examId": decoded.get("examId")},
        {
            "$set": {
                "last_activity": datetime.datetime.now(datetime.timezone.utc),
                "is_active": True
            }
        }
    )
    
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
        
    try:
        decoded = jwt.decode(token, Config.JWT_SECRET, algorithms=["HS256"])
    except Exception as e:
        return jsonify({"success": False, "message": "Invalid token"}), 401
        
    username = decoded.get("username")
    exam_id = decoded.get("examId")
    
    sessions_collection = db["exam_sessions"]
    sessions_collection.update_one(
        {"username": username, "examId": exam_id},
        {
            "$set": {
                "mobile_confirmed": True,
                "confirmed_at": datetime.datetime.now(datetime.timezone.utc),
                "device_info": {
                    "screen_width": data.get("screenWidth"),
                    "screen_height": data.get("screenHeight"),
                    "network_type": data.get("networkType"),
                    "battery_level": data.get("batteryLevel")
                }
            }
        },
        upsert=True
    )
    
    return jsonify({"success": True, "message": "Mobile confirmed successfully."}), 200

@mobile_bp.route('/status', methods=['GET'])
def mobile_status():
    token = request.args.get('token')
    if not token:
        return jsonify({"success": False, "message": "Token missing"}), 400
        
    try:
        decoded = jwt.decode(token, Config.JWT_SECRET, algorithms=["HS256"])
    except Exception as e:
        return jsonify({"success": False, "message": "Invalid token"}), 401
        
    username = decoded.get("username")
    exam_id = decoded.get("examId")
    
    sessions_collection = db["exam_sessions"]
    session = sessions_collection.find_one({"username": username, "examId": exam_id})
    
    if not session:
        return jsonify({
            "success": True,
            "mobile_confirmed": False,
            "analysis": None
        })
    
    # Get activity analysis
    analysis = analyze_mobile_activity(username, exam_id)
    
    return jsonify({
        "success": True,
        "mobile_confirmed": session.get("mobile_confirmed", False),
        "last_activity": session.get("last_activity"),
        "device_info": session.get("device_info"),
        "analysis": analysis
    })

@mobile_bp.route('/analysis/<exam_id>', methods=['GET'])
def get_exam_analysis(exam_id):
    """Get analysis of all mobile activities for an exam"""
    try:
        # Get all sessions for this exam
        sessions_collection = db["exam_sessions"]
        sessions = list(sessions_collection.find({"examId": exam_id}))
        
        if not sessions:
            return jsonify({"success": False, "message": "No sessions found for this exam"}), 404
            
        # Analyze each student's activity
        analysis_results = {}
        for session in sessions:
            username = session.get("username")
            analysis = analyze_mobile_activity(username, exam_id)
            analysis_results[username] = {
                "analysis": analysis,
                "device_info": session.get("device_info"),
                "mobile_confirmed": session.get("mobile_confirmed"),
                "confirmed_at": session.get("confirmed_at")
            }
            
        return jsonify({
            "success": True,
            "exam_id": exam_id,
            "total_students": len(sessions),
            "analysis": analysis_results
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
