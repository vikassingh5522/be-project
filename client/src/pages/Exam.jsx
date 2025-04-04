// exam.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {QRCodeCanvas} from 'qrcode.react';
import useFullscreenManager from '../hooks/useFullscreenManager';
import { useTabFocusMonitor } from '../hooks/useTabFocusMonitor';
import { useKeyLogger } from '../hooks/useKeyLogger';
import Header from '../Components/Header';
import StartExamButton from '../Components/StartExamButton';
import ExamContainer from '../Components/ExamContainer';
import KeyLogs from '../Components/KeyLogs';
import FullscreenPrompt from '../Components/FullscreenPrompt';
import ToggleableWebcam from '../Components/ToggleableWebcam';
import Timer from '../Components/Timer';
import AudioRecorder from "../Components/AudioRec";


function Exam() {
  const { examId } = useParams();
  const { isFullscreen, goFullscreen, exitCount } = useFullscreenManager();
  const [examStarted, setExamStarted] = useState(false);
  const [isLoggingActive, setIsLoggingActive] = useState(false);
  const [keyLogs, setKeyLogs] = useState("");
  const [showWebcam, setShowWebcam] = useState(true);
  const [isFullscreenPromptVisible, setIsFullscreenPromptVisible] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [error, setError] = useState('');
  const [examDuration, setExamDuration] = useState(0);
  const [examToken, setExamToken] = useState(null); // Holds token for mobile monitoring
  const [noiseAlert, setNoiseAlert] = useState(false);
  const examStartTime = useRef(null); // Track exam start time

  useTabFocusMonitor();
  useKeyLogger(isLoggingActive, setKeyLogs);

  // Fetch exam details based on the examId from the URL
  useEffect(() => {
    if (examId) {
      fetch(`http://localhost:5000/exam/details/${examId}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Fetched exam details:", data);
          if (data.success) {
            setQuestions(data.questions);
            setExamDuration(data.duration);
          } else {
            setError(data.message);
          }
        })
        .catch((err) => {
          console.error("Error fetching exam details:", err);
          setError("Error fetching exam details");
        });
    }
  }, [examId]);

  // When exam starts, generate an exam token for mobile monitoring via /exam/connect
  useEffect(() => {
    if (examStarted) {
      const loginToken = localStorage.getItem("token"); // Assumes login token is stored in localStorage
      fetch("http://localhost:5000/exam/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: loginToken, examId })
      })
      .then(res => res.json())
      .then(data => {
        if(data.success) {
          setExamToken(data.examToken);
        } else {
          console.error("Failed to generate exam token:", data.message);
        }
      })
      .catch(err => console.error("Error generating exam token:", err));
    }
  }, [examStarted, examId]);

  const startExam = async () => {
    if (questions.length === 0) {
      setError("No questions available for this exam.");
      return;
    }
    localStorage.setItem("exitCount", 0);
    setExamStarted(true);
    examStartTime.current = new Date();
    await goFullscreen();
    setIsLoggingActive(true);
  };

  const handleReenterFullscreen = async () => {
    await goFullscreen();
  };

  const handleTimeUp = () => {
    alert('Time is up! The exam will now be submitted.');
    handleSubmit();
  };

  const calculateTimeTaken = () => {
    const timeTakenInSeconds = Math.floor((Date.now() - examStartTime.current) / 1000);
    const minutes = Math.floor(timeTakenInSeconds / 60);
    const seconds = timeTakenInSeconds % 60;
    return `${minutes} minutes and ${seconds} seconds`;
  };

  const handleSubmit = async () => {
    const timeTaken = calculateTimeTaken();
    
    // Calculate score based on selected answers and correct answers (assumes questions array contains correctAnswer for MCQs)
    let score = 0;
  questions.forEach((q, index) => {
    if (q.type === 'mcq') {
      if (
        selectedAnswers[index] &&
        q.correctAnswer &&
        selectedAnswers[index].toLowerCase().includes(q.correctAnswer.toLowerCase())
      ) {
        score += 2; // MCQ score
      }
    } else if (q.type === 'coding') {
      // For now, award full points if an answer is provided.
      if (selectedAnswers[index]) {
        score += 5;
      }
    }
  });
  
    alert(`Exam submitted successfully! You completed the exam in ${timeTaken}. Your score is ${score}.`);
    console.log('Selected Answers:', selectedAnswers);

    const payload = {
      examId,
      username: localStorage.getItem("username"), // Ensure username is stored on login
      examStartTime: examStartTime.current.toISOString(), // Convert to ISO string
      answers: selectedAnswers, // e.g., { "0": "b", "1": "print('Hello')" }
      abnormalAudios: [] // Add any abnormal audio alerts if available
      // score will be computed on the server for MCQs
    };
    
    // Post the exam result to the backend for attempted exams storage.
    try {
      const response = await fetch("http://localhost:5000/exam/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      console.log("Exam submission result:", result);
    } catch (err) {
      console.error("Error submitting exam:", err);
    }
    
    // Clear exam state after submission
    setExamStarted(false);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setExamDuration(0);
    setError("");
    setExamToken(null);
  };

  useEffect(() => {
    setIsFullscreenPromptVisible(!isFullscreen && examStarted);
  }, [isFullscreen, examStarted]);

  useEffect(() => {
    let noiseInterval;
    if (examStarted) {
      noiseInterval = setInterval(async () => {
        try {
          const res = await fetch(`http://localhost:5000/exam/noise-alert?examId=${examId}&token=${examToken}`);
          const data = await res.json();
          if (data.abnormal && data.speaker_count >= 2) {
            setNoiseAlert(true);
            // Clear polling if an alert is found and show a prompt after a delay
            clearInterval(noiseInterval);
            setTimeout(() => {
              alert("Alert: Abnormal noise detected in your exam environment!");
            }, 3000);
          } else {
            setNoiseAlert(false);
          }
        } catch (err) {
          console.error("Error checking noise alert:", err);
        }
      }, 15000); // Poll every 15 seconds
    }
    return () => {
      if (noiseInterval) clearInterval(noiseInterval);
    };
  }, [examStarted, examId, examToken]);

  const handleOptionChange = (e) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: e.target.value,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Build the mobile monitor URL using the exam token.
  // This URL points to your mobile monitor page (for example, at /static/mobile_monitor.html).
  const mobileMonitorURL = examToken 
    ? `http://localhost:5000/static/mobile_monitor.html?token=${examToken}` 
    : "";

  return (
    <div className="App min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">Online Exam</h1>
      {error && <p className="text-red-500">{error}</p>}
      {/* Before the exam starts */}
      {!examStarted && (
        <div>
          <p className="mb-4">Exam ID: {examId}</p>
          <p className="mb-4">Exam Duration: {examDuration} minutes</p>
          <StartExamButton onClick={startExam} />
        </div>
      )}
      {/* When the exam is active */}
      {examStarted && (
        <>
          <Header exitCount={exitCount}/>
          <Timer initialMinutes={examDuration} onTimeUp={handleTimeUp} />
          <AudioRecorder examId={examId} token={examToken} />
          {noiseAlert && <div className="alert">Abnormal noise detected in your exam environment!</div>}
        
          {questions.length > 0 ? (
            <ExamContainer
              questions={questions}
              currentQuestionIndex={currentQuestionIndex}
              handleOptionChange={handleOptionChange}
              selectedAnswers={selectedAnswers}
              onNext={handleNext}
              onPrevious={handlePrevious}
              onSubmit={handleSubmit}
            />
          ) : (
            <p className="text-red-500">No questions loaded. Please contact the administrator.</p>
          )}
         { /*
          {examToken && (
            <div className="mt-4 p-4 bg-white shadow rounded">
              <p className="mb-2">Scan this QR code with your mobile device for exam monitoring:</p>
              <QRCodeCanvas value={mobileMonitorURL} size={200} />
              <p className="text-sm mt-2">
                Mobile URL:{" "}
                <a href={mobileMonitorURL} target="_blank" rel="noreferrer">
                  {mobileMonitorURL}
                </a>
              </p>
            </div>
          )}*/}
        </>
      )}
      <ToggleableWebcam showWebcam={showWebcam} onToggle={() => setShowWebcam(prev => !prev)} />
      {examStarted && <KeyLogs keyLogs={keyLogs} />}
      {isFullscreenPromptVisible && (
        <FullscreenPrompt onReenter={handleReenterFullscreen} />
      )}
    </div>
  );
}

export default Exam;
