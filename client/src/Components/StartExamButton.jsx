// StartExamButton.js
import React from 'react';
import { Play } from 'lucide-react';

const StartExamButton = ({ onClick }) => (
    <button
        onClick={onClick}
        className="btn-primary flex items-center space-x-2 px-8 py-3 text-lg"
    >
        <Play className="h-5 w-5" />
        <span>Start Exam</span>
    </button>
);

export default StartExamButton;