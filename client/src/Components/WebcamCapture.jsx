// src/WebcamCapture.js
import React, { useRef, useCallback, useEffect, useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import toast from "react-hot-toast";

const WebcamCapture = () => {
  const webcamRef = useRef(null);
  const [lastToastTime, setLastToastTime] = useState(0);
const toastCooldown = 5000; // 5 seconds


  const [detectedObjects, setDetectedObjects] = useState([]);

  const sendFrameToBackend = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      axios
        .post("http://localhost:5000/upload", {
          image: imageSrc,
        }, {withCredentials: true})
        .then((response) => {
          setDetectedObjects(response.data.objects || []);
          // console.log('Frame sent successfully', response.data);
        })
        .catch((error) => {
          console.error("Error sending frame:", error);
        });
    }
  }, [webcamRef]);

  useEffect(() => {
    if (!detectedObjects) return;
  
    const personCount = detectedObjects.filter(obj => obj === 'person').length;
    const phoneDetected = detectedObjects.includes('cell phone');
  
    if (personCount === 0) {
      showToastWithCooldown("No person detected on screen!", "🚫");
    } else if (personCount > 1 && phoneDetected) {
      showToastWithCooldown("Multiple persons and a cell phone detected!", "📱👥");
    } else if (personCount > 1) {
      showToastWithCooldown("Multiple persons detected!", "👥");
    } else if (phoneDetected) {
      showToastWithCooldown("Cell phone detected!", "📱");
    }
  }, [detectedObjects]);
  

  useEffect(() => {
    const interval = setInterval(sendFrameToBackend, 1000);
    return () => clearInterval(interval);
  }, [sendFrameToBackend]);

  const showToastWithCooldown = (message, icon) => {
    const now = Date.now();
    if (now - lastToastTime > toastCooldown) {
      toast.custom((t) => (
        <CustomToast t={t} message={message} icon={icon} />
      ));
      setLastToastTime(now);
    }
  };

  const CustomToast = ({ t, message, icon }) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5 text-2xl">
            {icon}
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">
              Alert
            </p>
            <p className="mt-1 text-sm text-gray-500">{message}</p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-200">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Close
        </button>
      </div>
    </div>
  );
  

  return (
    <div>
      <div className="flex items-center bg-violet-50 w-full px-20 py-6 rounded flex-col">
        <h1 className="animate-pulse text-xl text-violet-600">Recording...</h1>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width={416}
          height={416}
        />
      </div>

      <div>
        <h2>Detected Objects</h2>
        {detectedObjects.length > 0 ? (
          <ul>
            {detectedObjects.map((object, index) => (
              <li key={index}>{object}</li>
            ))}
          </ul>
        ) : (<>
          <p>No objects detected yet.</p>
        </>
        )}
      </div>
    </div>
  );
};

export default WebcamCapture;
