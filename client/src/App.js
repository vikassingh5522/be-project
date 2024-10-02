// src/App.js
import React, { useState } from 'react';
import WebcamCapture from './Components/WebcamCapture';
import ToggleButton from './Components/ToggleButton';

function App() {
  const [showWebcam, setShowWebcam] = useState(false);

  return (
    <div className="App min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">Webcam App</h1>
      <ToggleButton
        showWebcam={showWebcam}
        onClick={() => setShowWebcam(prev => !prev)}
      />
      {showWebcam && (
        <div className="mt-6">
          <WebcamCapture />
        </div>
      )}
    </div>
  );
}

export default App;
