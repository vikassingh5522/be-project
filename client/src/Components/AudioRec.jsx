// AudioRec.js (updated)
import React, { useImperativeHandle, useRef, useEffect, forwardRef } from "react";

const AudioRecorder = forwardRef(({ examId, token }, ref) => {
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]); // use a ref to store audio chunks
  const [recording, setRecording] = React.useState(false);

  useEffect(() => {
    async function setupRecorder() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        mediaRecorderRef.current = recorder;
        // Start recording automatically
        startRecording();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRecording = () => {
    if (mediaRecorderRef.current) {
      // Clear any previous chunks
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
      setRecording(true);
    }
  };

  const stopRecording = () => {
    return new Promise((resolve) => {
      if (mediaRecorderRef.current && recording) {
        mediaRecorderRef.current.onstop = () => {
          // Create a Blob from all collected audio chunks
          const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          resolve(blob);
        };
        mediaRecorderRef.current.stop();
        setRecording(false);
      } else {
        resolve(null);
      }
    });
  };

  // Expose uploadRecording via the ref
  const uploadRecording = async () => {
    const blob = await stopRecording();
    if (blob) {
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");
      formData.append("examId", examId);
      formData.append("token", token);
      try {
        const response = await fetch("http://localhost:5000/upload/audio", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();
        console.log("Audio recording uploaded:", result);
        return result;
      } catch (err) {
        console.error("Error uploading recording:", err);
      }
    }
  };

  useImperativeHandle(ref, () => ({
    uploadRecording,
  }));

  return (
    <div>
      <p>{recording ? "Recording in progress..." : "Recording stopped."}</p>
    </div>
  );
});

export default AudioRecorder;
