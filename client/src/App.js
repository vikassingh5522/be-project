
import React, { useState, useRef } from 'react';
import './App.css';
import Button from './Components/Button'; // Import Button from the Button.jsx file

function App() {
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);

  const startCamera = async () => {
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(videoStream);
      if (videoRef.current) {
        videoRef.current.srcObject = videoStream;
      }
    } catch (error) {
      console.error("Error accessing webcam:", error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  return (
    <div className="container">
      <h1>Cheat Detection System</h1>

      {!stream ? (
        <Button label="Load Camera" onClick={startCamera} />
      ) : (
        <Button label="Turn Off Camera" onClick={stopCamera} />
      )}

      <video width="640" height="480" autoPlay ref={videoRef}></video>
    </div>
  );
}

export default App;
