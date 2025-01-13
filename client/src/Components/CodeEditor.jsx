import React, { useState, useEffect } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/theme-github';
import axios from 'axios';
import { FaSun, FaMoon } from 'react-icons/fa';

const CodeEditor = ({ questionNumber }) => {
    const [code, setCode] = useState('# Start coding here...');
    const [language, setLanguage] = useState('python');
    const [theme, setTheme] = useState('monokai');
    const [notification, setNotification] = useState(null);

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
            const response = await axios.post('http://localhost:5000/submit-code', { code, language, question_number: questionNumber });
            if (response.status === 200) {
                setNotification({ type: 'success', message: 'Code submitted successfully!' });
            } else {
                setNotification({ type: 'error', message: 'Failed to submit code.' });
            }
        } catch (error) {
            setNotification({ type: 'error', message: 'An error occurred while submitting the code.' });
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
