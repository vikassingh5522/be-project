#backend/database.py

import os
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv

load_dotenv()

def init_db():
    URI = os.getenv('USER1')
    try:
        client = MongoClient(URI, server_api=ServerApi('1'))
        client.admin.command('ping')
        db = client["beproject"]
        print("You successfully connected to MongoDB!")
        
        # Initialize collections
        db_collection = db["attempted_exams"]
        db_exams = db["exams"]
        users_collection = db["users"]
        mobile_activity_logs = db["mobile_activity_logs"]
        
        return {
            "client": client,
            "db": db,
            "db_collection": db_collection,
            "db_exams": db_exams,
            "users_collection": users_collection,
            "mobile_activity_logs": mobile_activity_logs
        }
    except Exception as e:
        print(e)
        raise e  # Re-raise the exception to fail fast during app startup