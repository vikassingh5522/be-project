#backend/auth/routes.py
from flask import Blueprint, request, jsonify
import bcrypt
import jwt
import os
from auth.utils import validate_user_input
from database import init_db
from config import Config

db_data = init_db()
db = db_data['db']
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def register_user():
    try:
        data = request.get_json()
        validation = validate_user_input(data)
        if not validation['valid']:
            return jsonify({"success": False, "message": validation['message']}), 400
            
        usersCollection = db["users"]
        existing_user = usersCollection.find_one({"username": data["username"]})
        
        if existing_user:
            return jsonify({"success": False, "message": "Username already exists"}), 409
            
        hashed_password = bcrypt.hashpw(data["password"].encode('utf-8'), bcrypt.gensalt())
        token = jwt.encode(
            {"email": data["email"], "role": data["role"]}, 
            Config.JWT_SECRET, 
            algorithm="HS256"
        )
        
        usersCollection.insert_one({
            "username": data["username"],
            "password": hashed_password,
            "email": data["email"],
            "role": data["role"]
        })
        
        return jsonify({
            "success": True,
            "message": "User registered successfully",
            "token": token
        }), 201
        
    except Exception as e:
        return jsonify({"success": False, "message": f"An error occurred: {str(e)}"}), 500

@auth_bp.route('/login', methods=['POST'])
def authenticate_user():
    print("here")
    try:
        data = request.get_json()
        print(data['username'])
        if "username" not in data or "password" not in data:
            return jsonify({"success": False, "message": "Missing username or password"}), 400
        username = data["username"]
        user_password = data["password"]
        JWT_SECRET = os.getenv("JWT_SECRET")
        usersCollection = db["users"]
        user_data = usersCollection.find_one({"username": username})
        if user_data:
            if not bcrypt.checkpw(user_password.encode('utf-8'), user_data['password']):
                return jsonify({"success": False, "message": "Invalid credentials"}), 401
            token = jwt.encode({"username": user_data['username'], "email": user_data['email'], "role": user_data['role']}, JWT_SECRET)
            return jsonify({
                "success": True,
                "message": "Login successful",
                "token": token,
                "user_data": {"username": user_data['username'], "role": user_data['role']}
            }), 200
        else:
            return jsonify({"success": False, "message": "User not found"}), 404
    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": f"An error occurred: {str(e)}"}), 500

@auth_bp.route('/verify', methods=['GET'])
def verify_token():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"success": False, "message": "Token is missing"}), 401
        token = auth_header.split(" ")[1]
        JWT_SECRET = os.getenv("JWT_SECRET")
        decoded_token = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return jsonify({
            "success": True,
            "message": "Token is valid",
            "user_data": {"username": decoded_token['username'], "role": decoded_token['role']}
        }), 200
    except jwt.ExpiredSignatureError:
        return jsonify({"success": False, "message": "Token has expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"success": False, "message": "Invalid token"}), 401
    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": f"An error occurred: {str(e)}"}), 500
    
