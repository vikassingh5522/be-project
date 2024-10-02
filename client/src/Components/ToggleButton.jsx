// src/Components/ToggleButton.js
import React from 'react';

const ToggleButton = ({ showWebcam, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
    >
      {showWebcam ? 'Hide Webcam' : 'Show Webcam'}
    </button>
  );
};

export default ToggleButton;
