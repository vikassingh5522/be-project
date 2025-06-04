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

 return (
  <div className="min-h-screen bg-gradient-to-br from-white-100 px-4 to-white-300 flex flex-col items-center justify-start py-10">
    <h1 className="text-4xl font-bold text-gray-800 mb-6">Online Exam</h1>
    {examStarted && (
      <div className='flex gap-2 w-full px-4 '>
      <div className='card rounded-md flex-auto bg-violet-100 flex flex-col p-4'>
          <FaClock className=' animate-spin text-violet-600 ' />
          <p className='text-gray-800 font-semibold text-xl'>Exam Information</p>
        <Timer initialMinutes={examDuration} onTimeUp={handleTimeUp} />

      </div>
      <div className='card rounded-md flex-auto bg-violet-100 flex flex-col p-4'>
          <FaShieldAlt className=' text-violet-600 ' />
          <p className='text-gray-800 font-semibold text-lg'>Proctoring Status</p>
          <p className='text-gray-500 font-semibold text-sm'>All System Active</p>

      </div>
      <div className='card rounded-md flex-auto bg-violet-100 flex flex-col p-4'>
          <FaCheck className=' text-violet-600 ' />
          <p className='text-gray-800 font-semibold text-xl'>Progress</p>
          <p className='text-gray-500 font-semibold text-sm'>Question {currentQuestionIndex + 1} of {questions.length}</p>
      </div>

      <div className='card rounded-md flex-auto bg-violet-100 flex flex-col p-4'>
          <FaMicrophone className=' text-violet-600 animate-pulse ' />
          <p className='text-xl text-gray-800  font-semibold'>Audio Status</p>
          <AudioRecorder ref={audioRecorderRef} examId={examId} token={examToken} />
      </div>
</div>
    )
    }

    {error && <p className="text-red-500 mb-4">{error}</p>}

    {!examStarted ? (
      <div className="bg-white rounded-2xl p-8 w-full max-w-3xl flex flex-col items-center">
        <p className="text-lg text-gray-600 mb-2">Exam ID: <span className="font-medium text-gray-800">{examId}</span></p>
        <p className="text-lg text-gray-600 mb-6">Exam Duration: <span className="font-medium text-gray-800">{examDuration} minutes</span></p>
        <StartExamButton onClick={startExam} />
      </div>
    ) : (
      <div className="w-full rounded-2xl p-6 space-y-6">
        <Header exitCount={exitCount} />
        <div className="flex justify-end">
        </div>
        
        
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
          <p className="text-red-500 text-center">No questions loaded. Please contact the administrator.</p>
        )}
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
