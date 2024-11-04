// src/App.js
import React, { useEffect, useState } from 'react';
import WebcamCapture from './Components/WebcamCapture'; // Webcam component
import { useDisableActions } from './hooks/useDisableActions';
import { useFullscreen } from './hooks/useFullscreen';
import { useTabFocusMonitor } from './hooks/useTabFocusMonitor';
import ToggleButton from './Components/ToggleButton';

function App() {
    const [isFullscreen, setIsFullscreen] = useState(false); // Track fullscreen status
    const [showWebcam, setShowWebcam] = useState(true); // Keep webcam on by default
    const [examStarted, setExamStarted] = useState(false); // Track if exam is in progress

    // Activate browser-locking hooks
    useDisableActions();
    useTabFocusMonitor();

    const goFullscreen = useFullscreen();

    // Handle fullscreen status changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement); // Update fullscreen status
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    // Start the exam in fullscreen
    const startExam = () => {
        goFullscreen(); // Activate fullscreen
        setIsFullscreen(true);
        setExamStarted(true); // Start exam
    };

    return (
        <div className="App min-h-screen bg-gray-100 flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold mb-6 text-gray-800">Online Exam</h1>

            {!isFullscreen && !examStarted && (
                <button
                    onClick={startExam}
                    className="px-4 py-2 mb-4 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Start Exam (Fullscreen)
                </button>
            )}

            {examStarted && (
                <div className="exam-container p-6 bg-white rounded shadow-md w-3/4">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">Exam Question</h2>

                    <p className="mb-4">What is the capital of France?</p>

                    <div className="options mb-6">
                        <label className="block mb-2">
                            <input type="radio" name="answer" value="A" /> A) Berlin
                        </label>
                        <label className="block mb-2">
                            <input type="radio" name="answer" value="B" /> B) Madrid
                        </label>
                        <label className="block mb-2">
                            <input type="radio" name="answer" value="C" /> C) Paris
                        </label>
                        <label className="block mb-2">
                            <input type="radio" name="answer" value="D" /> D) Rome
                        </label>
                    </div>

                    <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                        Submit Answer
                    </button>
                </div>
            )}
              <ToggleButton
                showWebcam={showWebcam}
                onClick={() => setShowWebcam((prev) => !prev)}
              />
            {showWebcam && (
                <div className="webcam-container mt-6">
                    <WebcamCapture />
                </div>
            )}
        </div>
    );
}

export default App;
