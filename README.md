# Online Proctoring System

A real-time proctoring system with AI-powered monitoring capabilities, built using React and Python.

## Overview

This project implements an online examination proctoring system that uses computer vision and machine learning to ensure exam integrity. It consists of a React-based frontend and a Python backend with YOLOv8 for real-time monitoring.

## Features

- **Real-time Video Monitoring**: Webcam-based student activity tracking
- **AI-Powered Detection**: Using YOLOv8 for object and behavior detection
- **Secure Session Management**: Unique candidate identification system
- **Responsive Web Interface**: Modern UI built with React and Tailwind CSS

## Project Structure

```
├── client/              # React frontend
│   ├── src/            
│   │   ├── Components/ # React components
│   │   ├── pages/      # Page components
│   │   └── hooks/      # Custom React hooks
│   └── public/         # Static assets
└── server/             # Python backend
    ├── image_processing/   # Image analysis modules
    └── uploaded_files/     # Temporary storage for uploads
```

## Technology Stack

- **Frontend**:
  - React.js
  - Tailwind CSS
  - WebSocket for real-time communication

- **Backend**:
  - Python
  - YOLOv8 for computer vision
  - Flask/WebSocket server

## Getting Started

1. **Setup Frontend**:
```sh
cd client
npm install
npm start
```

2. **Setup Backend**:
```sh
cd server
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

## Current Development Status

- ✅ Basic webcam integration
- ✅ AI-powered monitoring
- 🚧 Session management
- 🚧 QR code feature
- 🚧 Network interruption handling
- 🚧 WebSocket implementation

