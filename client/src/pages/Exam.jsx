import React, { useState, useEffect, useRef } from 'react';
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

function Exam() {
    const { isFullscreen, goFullscreen, exitCount } = useFullscreenManager();
    const [examStarted, setExamStarted] = useState(false);
    const [isLoggingActive, setIsLoggingActive] = useState(false);
    const [keyLogs, setKeyLogs] = useState("");
    const [showWebcam, setShowWebcam] = useState(true);
    const [isFullscreenPromptVisible, setIsFullscreenPromptVisible] = useState(false);
    const [file, setFile] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [error, setError] = useState('');
    const [examDuration, setExamDuration] = useState(0);
    const [isDurationInputVisible, setIsDurationInputVisible] = useState(false);

    const examStartTime = useRef(null); // Ref to track the exam start time

    useTabFocusMonitor();
    useKeyLogger(isLoggingActive, setKeyLogs);

    const startExam = async () => {
        if (questions.length === 0) {
            setError("No questions available. Please upload a valid file.");
            return;
        }
        localStorage.setItem("exitCount", 0);
        setExamStarted(true);
        examStartTime.current = Date.now(); // Store the exam start time
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

    const handleSubmit = () => {
        const timeTaken = calculateTimeTaken();
        alert(`Exam submitted successfully! You completed the exam in ${timeTaken}.`);
        console.log('Selected Answers:', selectedAnswers);
        setExamStarted(false);
        setQuestions([]);
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setExamDuration(0);
        setIsDurationInputVisible(false);
        setError('');
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
            setCurrentQuestionIndex((prev) => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev - 1);
        }
    };

    return (
        <div className="App min-h-screen bg-gray-100 flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold mb-6 text-gray-800">Online Exam</h1>
            {examStarted && <Header exitCount={exitCount} />}

            {examStarted && 
                <>
                <Timer initialMinutes={examDuration} onTimeUp={handleTimeUp} />
                    {questions.length > 0 && (
                        <ExamContainer
                            questions={questions}
                            currentQuestionIndex={currentQuestionIndex}
                            handleOptionChange={handleOptionChange}
                            selectedAnswers={selectedAnswers}
                            onNext={handleNext}
                            onPrevious={handlePrevious}
                            onSubmit={handleSubmit}
                        />
                    )}
                    {questions.length === 0 && <p className="text-red-500">No questions loaded. Please restart the exam.</p>}
                    
               </>
            }
            <ToggleableWebcam showWebcam={showWebcam} onToggle={() => setShowWebcam((prev) => !prev)} />
            {examStarted && <KeyLogs keyLogs={keyLogs} />}
            {isFullscreenPromptVisible && (
                <FullscreenPrompt onReenter={handleReenterFullscreen} />
            )}
        </div>
    );
}

export default Exam;
