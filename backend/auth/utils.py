def validate_user_input(data):
    """Validate user input for registration"""
    required_fields = ["username", "password", "email", "role"]
    for field in required_fields:
        if field not in data:
            return {"valid": False, "message": f"Missing {field} field"}
    
    if len(data["password"]) < 8:
        return {"valid": False, "message": "Password must be at least 8 characters"}
    
    if data["role"] not in ["student", "instructor"]:
        return {"valid": False, "message": "Invalid role"}
    
    return {"valid": True, "message": "Valid input"}