// exam.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import useFullscreenManager from '../../hooks/useFullscreenManager';
import { useTabFocusMonitor } from '../../hooks/useTabFocusMonitor';
import { useKeyLogger } from '../../hooks/useKeyLogger';
import Header from '../../Components/Header';
import StartExamButton from '../../Components/StartExamButton';
import ExamContainer from '../../Components/ExamContainer';
import KeyLogs from '../../Components/KeyLogs';
import FullscreenPrompt from '../../Components/FullscreenPrompt';
import ToggleableWebcam from '../../Components/ToggleableWebcam';
import Timer from '../../Components/Timer';
import AudioRecorder from "../../Components/AudioRec";
import { FaAudible, FaCheck, FaClock, FaMicrophone, FaShieldAlt } from 'react-icons/fa';
import useExamSecurity from '../../hooks/useExamSecurity';
  
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
  const examStartTime = useRef(null);
  const navigate = useNavigate();
  const audioRecorderRef = useRef(null); // Ref to access AudioRecorder methods
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [cursorWarning, setCursorWarning] = useState(false);
  const examContainerRef = useExamSecurity(examStarted);
  
  // useTabFocusMonitor();
  useKeyLogger(isLoggingActive, setKeyLogs);

  // Fetch exam details based on the examId from the URL
  useEffect(() => {
    if (examId) {
      fetch(`${BASE_URL}/exam/details/${examId}`)
        .then((res) => res.json())
        .then((data) => {
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

  // Generate exam token for mobile monitoring when exam starts
  useEffect(() => {
    if (examStarted) {
      const loginToken = localStorage.getItem("token"); // Assumes login token is in localStorage
      fetch(`${BASE_URL}/exam/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: loginToken, examId })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
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

  // Build complete answers object
  const buildCompleteAnswers = () => {
    const completeAnswers = {};
    questions.forEach((q, index) => {
      if (q.type === 'mcq') {
        completeAnswers[index] = selectedAnswers[index] || null;
      } else if (q.type === 'coding') {
        const codeAnswer = localStorage.getItem(`code_question_${index + 1}`);
        completeAnswers[index] = codeAnswer ? codeAnswer : null;
      } else {
        completeAnswers[index] = null;
      }
    });
    return completeAnswers;
  };

  const handleSubmit = async () => {
    // Optionally trigger audio upload before submitting exam results.
    if (audioRecorderRef.current) {
      await audioRecorderRef.current.uploadRecording();
    }

    const timeTaken = calculateTimeTaken();
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
        const codeAnswer = localStorage.getItem(`code_question_${index + 1}`);
        if (codeAnswer && codeAnswer.trim() !== "") {
          score += 5;
        }
      }
    });

    alert(`Exam submitted successfully! You completed the exam in ${timeTaken}. Your score is ${score}.`);
    console.log('Selected Answers:', selectedAnswers);

    const payload = {
      examId,
      username: localStorage.getItem("username"),
      examStartTime: examStartTime.current.toISOString(),
      answers: buildCompleteAnswers(),
      abnormalAudios: [] // Not processing any abnormal audio in this simplified flow
    };

    try {
      const response = await fetch(`${BASE_URL}/exam/submit`, {
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

    try {
      // send your keyLogs to the backend
      await fetch(`${BASE_URL}/upload/keylogs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyLogs })
      });
    } catch (err) {
      console.error("Failed to upload key logs:", err);
    }

    await fetch(`${BASE_URL}/upload/keylogs/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        examId,
        username: localStorage.getItem("username")
      })
    });

    navigate('/dashboard');
  };

  useEffect(() => {
    setIsFullscreenPromptVisible(!isFullscreen && examStarted);
  }, [isFullscreen, examStarted]);

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

  // Mobile monitor URL code remains commented out if not used.
  const mobileMonitorURL = examToken 
    ? `${BASE_URL}/static/mobile_monitor.html?token=${examToken}` 
    : "";

  // Add cursor warning effect
  useEffect(() => {
    if (!examStarted) return;

    let warningTimeout;
    const handleMouseMove = (e) => {
      if (!examContainerRef.current) return;

      const container = examContainerRef.current;
      const rect = container.getBoundingClientRect();
      
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      ) {
        setCursorWarning(true);
        clearTimeout(warningTimeout);
        warningTimeout = setTimeout(() => {
          setCursorWarning(false);
        }, 3000);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(warningTimeout);
    };
  }, [examStarted]);

 return (
  <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 p-6">
    {!examStarted ? (
      <div className="card p-8 w-full max-w-3xl mx-auto flex flex-col items-center">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-gray-900 mb-4">Exam Ready</h1>
          <p className="text-lg text-gray-600">Please review the exam details before starting</p>
        </div>
        
        <div className="w-full space-y-4 mb-8">
          <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
            <span className="text-gray-600">Exam ID:</span>
            <span className="font-medium text-gray-900">{examId}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
            <span className="text-gray-600">Duration:</span>
            <span className="font-medium text-gray-900">{examDuration} minutes</span>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 w-full">
          <h3 className="text-yellow-800 font-medium mb-2">Important Instructions</h3>
          <ul className="text-yellow-700 space-y-2">
            <li className="flex items-center">
              <FaShieldAlt className="mr-2" />
              <span>Ensure your webcam is working properly</span>
            </li>
            <li className="flex items-center">
              <FaClock className="mr-2" />
              <span>Keep track of the time remaining</span>
            </li>
            <li className="flex items-center">
              <FaCheck className="mr-2" />
              <span>Review your answers before submission</span>
            </li>
          </ul>
        </div>

        <StartExamButton onClick={startExam} />
      </div>
    ) : (
      <div className="w-full max-w-6xl mx-auto space-y-6">
        <Header exitCount={exitCount} />
        
        {/* Cursor Warning */}
        {cursorWarning && (
          <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>Please keep your cursor within the exam window</span>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2" ref={examContainerRef}>
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
              <div className="card p-6 text-center">
                <p className="text-error-600">No questions loaded. Please contact the administrator.</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="card p-4">
              <Timer duration={examDuration} onTimeUp={handleTimeUp} />
            </div>

            <div className="card p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Question Navigation</h3>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                      currentQuestionIndex === index
                        ? 'bg-primary-600 text-white'
                        : selectedAnswers[index]
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

    {examStarted && (
      <>
        <ToggleableWebcam showWebcam={showWebcam} exam_id={examId} onToggle={() => setShowWebcam(prev => !prev)} />
        <KeyLogs keyLogs={keyLogs} />
      </>
    )}
    {isFullscreenPromptVisible && <FullscreenPrompt onReenter={handleReenterFullscreen} />}
  </div>
);

}

export default Exam;
