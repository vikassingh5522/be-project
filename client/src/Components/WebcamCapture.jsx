// src/WebcamCapture.js
import React, { useRef, useCallback, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

const WebcamCapture = () => {
  const webcamRef = useRef(null);
  
  const [detectedObjects, setDetectedObjects] = useState([]);

  const sendFrameToBackend = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      axios.post('http://localhost:5000/upload', {
        image: imageSrc,
      })
      .then((response) => {
        setDetectedObjects(response.data.objects || []);
        console.log('Frame sent successfully', response.data);
      })
      .catch((error) => {
        console.error('Error sending frame:', error);
      });
    }
  }, [webcamRef]);

  useEffect(() => {
    const interval = setInterval(sendFrameToBackend, 1000);
    return () => clearInterval(interval);
  }, [sendFrameToBackend]);

  return (
    <div>
<<<<<<< HEAD
      <h1 align="center">Webcam Capture</h1>
=======
      <h1>Webcam Capture</h1>
      
>>>>>>> 48a98862db46911ffa709037f2f7e87e62c42bf6
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={416}
        height={416}
      />
      
      <div>
        <h2>Detected Objects</h2>
        {detectedObjects.length > 0 ? (
          <ul>
            {detectedObjects.map((object, index) => (
              <li key={index}>{object}</li>
            ))}
          </ul>
        ) : (
          <p>No objects detected yet.</p>
        )}
      </div>
    </div>
  );
};

export default WebcamCapture;
