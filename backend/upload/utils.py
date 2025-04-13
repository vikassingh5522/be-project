from ultralytics import YOLO
import cv2
import numpy as np
from PIL import Image
import os
from config import Config
model = YOLO('yolov8n.pt')

def allowed_file(filename):
    """Check if the uploaded file has an allowed extension."""
    ext = os.path.splitext(filename)[1].lower()
    return ext in Config.ALLOWED_EXTENSIONS

def detect_objects(image: Image.Image):
    open_cv_image = np.array(image)
    open_cv_image = cv2.cvtColor(open_cv_image, cv2.COLOR_RGB2BGR)

    results = model.predict(source=open_cv_image, conf=0.5)

    object_names = []
    for result in results:
        object_names.extend([model.names[int(cls)] for cls in result.boxes.cls])

    return object_names

