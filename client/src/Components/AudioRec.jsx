import React, { useCallback, useEffect, useRef, useState } from "react";

const AudioRecorder = ({ examId, token }) => {
  const mediaRecorderRef = useRef(null);
  const [recording, setRecording] = useState(false);

  const sendAudioFragment = useCallback(async (blob) => {
    const formData = new FormData();
    formData.append("audio", blob, "fragment.wav");
    formData.append("examId", examId);
    formData.append("timestamp", Date.now());
    formData.append("token", token);

    try {
      const response = await fetch("http://localhost:5000/upload-audio", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      console.log("Audio fragment processed:", result);
    } catch (err) {
      console.error("Error sending audio fragment:", err);
    }
  }, [examId, token]);

  useEffect(() => {
    async function setupRecorder() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = async (event) => {
          if (event.data && event.data.size > 0) {
            sendAudioFragment(event.data);
          }
        };
        mediaRecorderRef.current.onstop = () => {
          // Restart recording automatically if still in exam
          if (recording) startRecording();
        };
      } catch (err) {
        console.error("Error setting up audio recorder:", err);
      }
    }
    setupRecorder();

    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    };
  }, [recording, sendAudioFragment]);

  const startRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.start();
      setRecording(true);
      // Stop recording after 15 seconds (or adjust as needed)
      setTimeout(() => {
        if (mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.stop();
        }
      }, 15000);
    }
  };

  // Start recording immediately on component mount
  useEffect(() => {
    startRecording();
  }, []);

  return <div>Audio Recorder Active</div>;
};

export default AudioRecorder;
