
import React, { useState } from 'react';
import MonacoEditor from 'react-monaco-editor';
import axios from 'axios';

const CodeEditor = ({ onClose, goFullscreen }) => {
    const [code, setCode] = useState('// Start coding here...');
    const [isFullscreenPromptVisible, setIsFullscreenPromptVisible] = useState(false);
    const [notification, setNotification] = useState(null); // State for custom notifications

    const handleEditorChange = (newValue) => {
        setCode(newValue);
    };

    const handleSubmit = async () => {
        try {
            const response = await axios.post('http://localhost:5000/submit-code', {
                code,
            });
            if (response.status === 200) {
                setNotification({ type: 'success', message: 'Code submitted successfully!' });
            } else {
                setNotification({ type: 'error', message: 'Failed to submit code.' });
            }
        } catch (error) {
            console.error('Error submitting code:', error);
            setNotification({ type: 'error', message: 'An error occurred while submitting the code.' });
        }
    };

    React.useEffect(() => {
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                setIsFullscreenPromptVisible(true);
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    const handleReenterFullscreen = async () => {
        setIsFullscreenPromptVisible(false);
        await goFullscreen();
    };

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-90 flex flex-col items-center justify-center z-50">
            {isFullscreenPromptVisible && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">Fullscreen Required</h2>
                        <p className="mb-6 text-gray-600">
                            Please re-enter fullscreen mode to continue editing.
                        </p>
                        <button
                            onClick={handleReenterFullscreen}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            Re-enter Fullscreen
                        </button>
                    </div>
                </div>
            )}
            {notification && (
                <div className="fixed top-4 right-4 bg-gray-900 text-white px-6 py-4 rounded shadow-lg">
                    {notification.message}
                    <button
                        onClick={() => setNotification(null)}
                        className="ml-4 text-red-400 hover:underline"
                    >
                        Dismiss
                    </button>
                </div>
            )}
            <div className="w-3/4 bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="flex justify-between items-center p-4 bg-gray-200">
                    <h2 className="text-lg font-bold text-gray-700">Code Editor</h2>
                    <button
                        onClick={onClose}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                        Close
                    </button>
                </div>
                <div className="h-96">
                    <MonacoEditor
                        width="100%"
                        height="100%"
                        language="javascript"
                        value={code}
                        onChange={handleEditorChange}
                        options={{
                            minimap: { enabled: false },
                        }}
                    />
                </div>
                <div className="p-4 flex justify-end bg-gray-100">
                    <button
                        onClick={handleSubmit}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Submit Code
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CodeEditor;
