import React from 'react';

const FullscreenPrompt = ({ onReenter }) => (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Fullscreen Required</h2>
            <p className="mb-6 text-gray-600">
                Please re-enter fullscreen mode to continue the exam.
            </p>
            <button
                onClick={onReenter}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
                Re-enter Fullscreen
            </button>
        </div>
    </div>
);

export default FullscreenPrompt;
