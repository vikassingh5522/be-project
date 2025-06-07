import React, { useState, useEffect } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/theme-github';
import axios from 'axios';
import { FaSun, FaMoon } from 'react-icons/fa';

const CodeEditor = ({ questionNumber, question }) => {
    const [code, setCode] = useState('# Start coding here...');
    const [language, setLanguage] = useState('python');
    const [theme, setTheme] = useState('monokai');
    const [notification, setNotification] = useState(null);
    const BASE_URL = process.env.REACT_APP_BASE_URL;

    // Language-to-theme mapping
    /*const languageThemes = {
        python: 'monokai',
        java: 'github',
        c_cpp: 'github',
    };*/

    const handleLanguageChange = (e) => {
        const selectedLanguage = e.target.value;
        setLanguage(selectedLanguage);
    };

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'monokai' ? 'github' : 'monokai'));
    };

    const handleEditorChange = (newValue) => {
        setCode(newValue);
        localStorage.setItem(`code_question_${questionNumber}`, newValue);
    };
    useEffect(() => {
        const savedCode = localStorage.getItem(`code_question_${questionNumber}`);
        if (savedCode) {
            setCode(savedCode);
        }
    }, [questionNumber]);

    const handleSubmit = async () => {
        try {
            // Clean the code before submission
            const cleanedCode = code.trim();
            if (!cleanedCode || cleanedCode === '# Start coding here...') {
                setNotification({ 
                    type: 'error', 
                    message: 'Please write some code before submitting.' 
                });
                return;
            }

            // Validate question prop
            if (!question || typeof question !== 'object' || !question.question) {
                setNotification({ 
                    type: 'error', 
                    message: 'Invalid question format. Please refresh the page and try again.' 
                });
                return;
            }

            const response = await axios.post(`${BASE_URL}/exam/submit-code`, {
                code: cleanedCode,
                language,
                question_number: questionNumber,
                question: question.question.trim()
            });

            if (response.status === 200) {
                const evaluationResult = response.data.submission.evaluation;
                let message = '';
                let type = '';

                if (evaluationResult === 'correct') {
                    message = 'Great job! Your code is correct.';
                    type = 'success';
                } else if (evaluationResult === 'incorrect') {
                    message = 'Your code needs some adjustments. Please review the requirements and try again.';
                    type = 'warning';
                } else {
                    message = `Evaluation result: ${evaluationResult}`;
                    type = 'error';
                }

                setNotification({
                    type,
                    message
                });
            } else {
                setNotification({ 
                    type: 'error', 
                    message: 'Failed to submit code. Please try again.' 
                });
            }
        } catch (error) {
            console.error('Code submission error:', error);
            setNotification({ 
                type: 'error', 
                message: error.response?.data?.error || 'An error occurred while submitting the code.' 
            });
        } finally {
            setTimeout(() => setNotification(null), 5000);
        }
    };

    return (
        <div className="code-editor-container bg-white rounded-lg shadow-lg p-4 relative">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-700">Code Editor</h2>
                
            </div>
            <div className="flex justify-between items-center mb-4">
                <select
                    value={language}
                    onChange={handleLanguageChange}
                    className="p-2 border rounded"
                >
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="c_cpp">C/C++</option>
                </select>
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full bg-gray-100 shadow hover:shadow-md focus:outline-none"
                    title={theme === 'monokai' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                >
                    {theme === 'monokai' ? (
                        <FaSun className="text-yellow-500" size={20} />
                    ) : (
                        <FaMoon className="text-gray-800" size={20} />
                    )}
                </button>
            </div>
            <AceEditor
                mode={language}
                theme={theme}
                onChange={handleEditorChange}
                name="UNIQUE_ID_OF_DIV"
                value={code}
                fontSize={14}
                showPrintMargin={true}
                showGutter={true}
                highlightActiveLine={true}
                setOptions={{
                    enableBasicAutocompletion: false,
                    enableLiveAutocompletion: false,
                    showLineNumbers: true,
                    tabSize: 2,
                    readOnly: false, // Set to true to make editor read-only
                    behavioursEnabled: false

                }}
                commands={[
                    {
                        name: 'unwantedHotKeys',
                        bindKey: { win: 'Ctrl-C|Ctrl-V|Ctrl-X|Ctrl-S',mac: 'Command-C|Command-V|Command-X|Command-S' },
                        exec: () => {}  // Do nothing on these keypresses
                    }

                ]}
                width="100%"
                height="300px"
            />
            <button
                onClick={handleSubmit}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
                Submit Code
            </button>
            {notification && (
                <div className={`notification ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white px-5 py-2 rounded shadow-lg mt-4`}>
                    {notification.message}
                </div>
            )}
        </div>
    );
};

export default CodeEditor;
