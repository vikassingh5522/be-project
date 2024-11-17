
import React, { useState, useEffect } from 'react';
import WebcamCapture from './Components/WebcamCapture'; // Webcam component
import { useTabFocusMonitor } from './hooks/useTabFocusMonitor';
import { useKeyLogger } from './hooks/useKeyLogger';
import ToggleButton from './Components/ToggleButton';
import useFullscreenExitCounter from './hooks/useFullscreenExitCounter'; // Custom hook for counting fullscreen exits

function App() {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showWebcam, setShowWebcam] = useState(true); // Controls UI visibility only
    const [examStarted, setExamStarted] = useState(false);
    const [isLoggingActive, setIsLoggingActive] = useState(false);
    const [keyLogs, setKeyLogs] = useState('');
    const [isFullscreenPromptVisible, setIsFullscreenPromptVisible] = useState(false);

    useTabFocusMonitor();
    useKeyLogger(isLoggingActive, setKeyLogs);

    const exitCount = useFullscreenExitCounter();

    const goFullscreen = async () => {
        try {
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) {
                await document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                await document.documentElement.webkitRequestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) {
                await document.documentElement.msRequestFullscreen();
            }
        } catch (error) {
            console.error("Fullscreen request failed: ", error);
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            const isFullScreen = !!document.fullscreenElement;
            setIsFullscreen(isFullScreen);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, []);

    const startExam = async () => {
        await goFullscreen();
        setIsFullscreen(true);
        setExamStarted(true);
        setIsLoggingActive(true);
    };

    const handleReenterFullscreen = async () => {
        await goFullscreen();
        setIsFullscreen(true);
        setIsFullscreenPromptVisible(false);
    };

    useEffect(() => {
        if (!isFullscreen && examStarted) {
            setIsFullscreenPromptVisible(true);
        } else {
            setIsFullscreenPromptVisible(false);
        }
    }, [isFullscreen, examStarted]);

    return (
        <div className="App min-h-screen bg-gray-100 flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold mb-6 text-gray-800">Online Exam</h1>

            <div className="absolute top-4 right-4 bg-gray-800 text-white p-2 rounded">
                Fullscreen Exits: {exitCount}
            </div>

            {!examStarted && !isFullscreen && (
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
            <div className="webcam-container mt-6" style={{ visibility: showWebcam ? 'visible' : 'hidden' }}>
                <WebcamCapture />
            </div>

            {examStarted && (
                <div className="keylog-container mt-4 w-full">
                    <h3 className="text-lg font-medium mb-2">Key Logs</h3>
                    <textarea
                        className="w-full h-48 p-2 border border-gray-300 rounded"
                        value={keyLogs}
                        readOnly
                    />
                </div>
            )}

            {isFullscreenPromptVisible && (
                <div className="mt-4 text-center">
                    <button
                        onClick={handleReenterFullscreen}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Please re-enter Fullscreen
                    </button>
                </div>
            )}
        </div>
    );
}

export default App;
