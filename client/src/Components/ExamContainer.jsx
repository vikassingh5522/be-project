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
            setShowCodeEditor(false); // Optionally hide editor on successful submission
        }
    };

    if (!questions || questions.length === 0) {
        return <p>No questions available. Please upload a valid file.</p>;
    }

    return (
        <div className="exam-container  bg-white rounded w-full">
            
            

            <h2 className="text-xl font-semibold mb-4 bg-violet-100 p-4 rounded-md text-gray-800">
                <h4 className='text-base'>General Knowledge</h4>
                Question {currentQuestionIndex + 1}
            </h2>
            <p className="mb-4 font-bold">{currentQuestion.question}</p>
            {currentQuestion.type === 'mcq' && (
                <div className="options mb-6">
                    {currentQuestion.options.map((option, index) => (
                        <label key={index} className="block mb-2">
                            <input
                                className='accent-violet-500 bg-violet-400 p-2'
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
            )}
            {currentQuestion.type === 'coding' && (
                <>
                    <button
                        className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:shadow-outline my-4"
                        onClick={() => setShowCodeEditor(!showCodeEditor)}
                    >
                        Toggle Code Editor
                    </button>
                    {showCodeEditor && (
                        <CodeEditor
                            onSubmitCode={handleCodeSubmissionFeedback}
                            questionNumber={currentQuestionIndex + 1} // Pass the correct question number
                            question={questions[currentQuestionIndex].question}
                        />
                    )}
                </>
            )}
            <div className="flex justify-between mt-4">
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
