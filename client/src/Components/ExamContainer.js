import React from 'react';

const ExamContainer = ({
    questions,
    currentQuestionIndex,
    handleOptionChange,
    selectedAnswers,
    onNext,
    onPrevious,
    onSubmit
}) => {
    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="exam-container p-6 bg-white rounded shadow-md w-3/4">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                Question {currentQuestionIndex + 1} of {questions.length}
            </h2>
            <p className="mb-4">{currentQuestion.question}</p>
            <div className="options mb-6">
                {currentQuestion.options.map((option, index) => (
                    <label key={index} className="block mb-2">
                        <input
                            type="radio"
                            name={`question-${currentQuestionIndex}`}
                            value={option}
                            checked={selectedAnswers[currentQuestionIndex] === option}
                            onChange={handleOptionChange}
                        />{' '}
                        {option}
                    </label>
                ))}
            </div>
            <div className="flex justify-between">
                {currentQuestionIndex > 0 && (
                    <button
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                        onClick={onPrevious}
                    >
                        Previous
                    </button>
                )}
                {currentQuestionIndex < questions.length - 1 && (
                    <button
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        onClick={onNext}
                    >
                        Next
                    </button>
                )}
                {currentQuestionIndex === questions.length - 1 && (
                    <button
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        onClick={onSubmit}
                    >
                        Submit Exam
                    </button>
                )}
            </div>
        </div>
    );
};

export default ExamContainer;
