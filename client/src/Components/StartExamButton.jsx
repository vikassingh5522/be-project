// StartExamButton.js
import React from 'react';

const StartExamButton = ({ onClick }) => (
    <button
        onClick={onClick}
        className="px-4 py-2 mb-4 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Attempt Exam
    </button>
);

export default StartExamButton;