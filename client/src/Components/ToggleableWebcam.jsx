import React from 'react';
import WebcamCapture from './WebcamCapture';

const ToggleableWebcam = ({ showWebcam, onToggle, exam_id }) => (
    <div className="flex flex-col items-center">
        <button
            onClick={onToggle}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
        >
            {showWebcam ? 'Hide Webcam' : 'Show Webcam'}
        </button>
        <div
            className="webcam-container mt-6"
            style={{ visibility: showWebcam ? 'visible' : 'hidden' }}
        >
            <WebcamCapture exam_id={exam_id} />
        </div>
    </div>
);

export default ToggleableWebcam;
