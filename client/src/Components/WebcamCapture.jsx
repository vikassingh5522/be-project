// src/WebcamCapture.js
import React, { useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

const WebcamCapture = () => {
  
  const webcamRef = useRef(null);

  const sendFrameToBackend = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      axios.post('http://localhost:5000/upload', {
        image: imageSrc,
      })
      .then((response) => {
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
      <h1 align="center">Webcam Capture</h1>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={416}
        height={416}
      />
    </div>
  );
};

export default WebcamCapture;
