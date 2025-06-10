import boto3
import uuid
import os
from config import Config

# Initialize the S3 client
s3 = boto3.client('s3')

def upload_to_s3(file_path, key_prefix):
    """Uploads a file to AWS S3 and returns the URL."""
    # Specify your bucket name
    bucket = Config.AWS_BUCKET_NAME
    
    # Create a unique key for the file in the bucket
    key = f"{key_prefix}/{uuid.uuid4().hex}_{os.path.basename(file_path)}"
    
    # Upload the file to S3
    s3.upload_file(file_path, bucket, key)
    
    # Return the public URL of the uploaded file
    return f"https://{bucket}.s3.amazonaws.com/{key}" 