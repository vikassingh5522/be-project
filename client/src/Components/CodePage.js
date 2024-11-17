// src/Components/CodePage.js
import React, { useState } from 'react';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/javascript/javascript';

function CodePage() {
    const [code, setCode] = useState('// Write your code here\nconsole.log(\'Hello, world!\');');
    const [output, setOutput] = useState('');

    const handleRunCode = () => {
        try {
            // Redirect console.log for capturing output
            const capturedLogs = [];
            const originalConsoleLog = console.log;
            console.log = (...args) => {
                capturedLogs.push(args.join(' '));
                originalConsoleLog(...args);
            };
            
            // Evaluate the code (use with caution - sandboxing recommended for real apps)
            // eslint-disable-next-line no-eval
            eval(code);
            
            // Restore console.log
            console.log = originalConsoleLog;

            // Display captured logs
            setOutput(capturedLogs.join('\n'));
        } catch (error) {
            setOutput(`Error: ${error.message}`);
        }
    };

    return (
        <div className="min-h-screen p-6 bg-gray-100 flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-4">Code Editor</h1>
            <div className="editor-container w-full max-w-3xl mb-4">
                <CodeMirror
                    value={code}
                    options={{
                        mode: 'javascript',
                        theme: 'material',
                        lineNumbers: true,
                    }}
                    onBeforeChange={(editor, data, value) => setCode(value)}
                />
            </div>
            <button
                onClick={handleRunCode}
                className="px-4 py-2 mb-4 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                Run Code
            </button>
            <div className="output-container w-full max-w-3xl p-4 bg-white border border-gray-300 rounded">
                <h2 className="text-lg font-medium mb-2">Output:</h2>
                <pre className="bg-gray-100 p-2 rounded overflow-auto">{output}</pre>
            </div>
        </div>
    );
}

export default CodePage;
