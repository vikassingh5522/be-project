import React, { useState } from 'react';
import CodeEditor from './CodeEditor';

const ExamContainer = ({
    questions,
    currentQuestionIndex,
    handleOptionChange,
    selectedAnswers,
    onNext,
    onPrevious,
    onSubmit,
}) => {
    const [showCodeEditor, setShowCodeEditor] = useState(false);
    const currentQuestion = questions[currentQuestionIndex];

    const handleCodeSubmissionFeedback = (status, message) => {
        alert(`${status === 'success' ? 'Success: ' : 'Error: '}${message}`);
        if (status === 'success') {
            setShowCodeEditor(false);
        }
    };

    if (!questions || questions.length === 0) {
        return <p>No questions available. Please upload a valid file.</p>;
    }

    return (
        <div className="card p-6">
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-heading font-semibold text-gray-900">
                        Question {currentQuestionIndex + 1} of {questions.length}
                    </h2>
                    <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                        {currentQuestion.type || 'Multiple Choice'}
                    </span>
                </div>
                <div className="prose max-w-none">
                    <p className="text-gray-700 text-lg">{currentQuestion.question}</p>
                </div>
            </div>

            {currentQuestion.type === 'coding' ? (
                <div className="space-y-4">
                    <CodeEditor
                        questionNumber={currentQuestionIndex}
                        question={currentQuestion}
                    />
                </div>
            ) : (
                <div className="space-y-4">
                    {currentQuestion.options.map((option, index) => (
                        <label
                            key={index}
                            className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                                selectedAnswers[currentQuestionIndex] === option
                                    ? 'border-primary-500 bg-primary-50'
                                    : 'border-gray-200 hover:border-primary-200'
                            }`}
                        >
                            <input
                                type="radio"
                                name={`question-${currentQuestionIndex}`}
                                value={option}
                                checked={selectedAnswers[currentQuestionIndex] === option}
                                onChange={handleOptionChange}
                                className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                            />
                            <span className="ml-3 text-gray-700">{option}</span>
                        </label>
                    ))}
                </div>
            )}

            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                <button
                    onClick={onPrevious}
                    disabled={currentQuestionIndex === 0}
                    className={`btn-secondary ${
                        currentQuestionIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                    Previous
                </button>

                <div className="flex items-center space-x-4">
                    {currentQuestionIndex === questions.length - 1 ? (
                        <button
                            onClick={onSubmit}
                            className="btn-primary bg-success-600 hover:bg-success-700"
                        >
                            Submit Exam
                        </button>
                    ) : (
                        <button
                            onClick={onNext}
                            className="btn-primary"
                        >
                            Next
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExamContainer;
