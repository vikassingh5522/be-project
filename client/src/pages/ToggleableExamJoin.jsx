import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ToggleableExamJoin = () => {
  const [examId, setExamId] = useState("");
  const [testMode, setTestMode] = useState(true); // Default to test mode enabled
  const navigate = useNavigate();

  const handleExamIdChange = (e) => {
    setExamId(e.target.value);
  };

  const handleToggleTestMode = () => {
    setTestMode(prev => !prev);
  };

  const handleProceed = () => {
    if (!examId) {
      alert("Please enter an exam ID.");
      return;
    }
    // In test mode, skip mobile monitoring and proceed directly.
    if (testMode) {
      navigate(`/exam/${examId}`);
    } else {
      // Here you could add your normal mobile pairing logic or route.
      // For now, we simply navigate directly regardless.
      navigate(`/exam/${examId}`);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="wrapper mx-auto w-[400px] p-6 border rounded shadow bg-white">
        <h2 className="text-2xl font-bold mb-4">Join Exam</h2>
        <label htmlFor="examId" className="block mb-2 text-gray-700">
          Exam ID:
        </label>
        <input
          type="text"
          id="examId"
          placeholder="Enter Exam ID"
          value={examId}
          onChange={handleExamIdChange}
          className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="testMode"
            checked={testMode}
            onChange={handleToggleTestMode}
            className="mr-2"
          />
          <label htmlFor="testMode" className="text-gray-700">
            Test Mode (Bypass Mobile Monitoring)
          </label>
        </div>
        <button
          onClick={handleProceed}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Proceed to Exam
        </button>
      </div>
    </div>
  );
};

export default ToggleableExamJoin;
