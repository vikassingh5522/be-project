import React, { useState } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-monokai';

import axios from 'axios';

const CodeEditor = ({ onSubmitCode }) => {
    const [code, setCode] = useState('# Start coding here...');
    const [notification, setNotification] = useState(null);

    const handleEditorChange = (newValue) => {
        setCode(newValue);
    };

    const handleSubmit = async () => {
        try {
            const response = await axios.post('http://localhost:5000/submit-code', { code });
            if (response.status === 200) {
                setNotification({ type: 'success', message: 'Code submitted successfully!' });
                setTimeout(() => setNotification(null), 5000);
            } else {
                setNotification({ type: 'error', message: 'Failed to submit code.' });
                setTimeout(() => setNotification(null), 5000);
            }
        } catch (error) {
            console.error('Error submitting code:', error);
            setNotification({ type: 'error', message: 'An error occurred while submitting the code.' });
            setTimeout(() => setNotification(null), 5000);
        }
    };

    return (
        <div className="code-editor-container bg-white rounded-lg shadow-lg p-4"
             onContextMenu={(e) => e.preventDefault()}  // Prevent right-click menu
        >
            <h2 className="text-lg font-bold text-gray-700 mb-4">Code Editor</h2>
            <AceEditor
                mode="python"
                theme="monokai"
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
                    enableSnippets: false,
                    showLineNumbers: true,
                    tabSize: 2,
                    readOnly: false, // Set to true to make editor read-only
                    behavioursEnabled: false  // Disable certain editor behaviors like automatic bracket insertion
                }}
                commands={[ // Disable specific commands
                    {
                        name: 'unwantedHotKeys',
                        bindKey: { win: 'Ctrl-C|Ctrl-V|Ctrl-X|Ctrl-S', mac: 'Command-C|Command-V|Command-X|Command-S' },
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
