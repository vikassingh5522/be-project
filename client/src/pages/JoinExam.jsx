import React from "react";
import { useNavigate } from "react-router-dom";

const JoinExam = () => {
  const [examId, setExamId] = React.useState("");
  const [isValidExamId, setIsValidExamId] = React.useState(false);
  const navigate = useNavigate();

  const handleInput = (e) => {
    const id = e.target.value;
    setExamId(id);
    // Regex: 8-4-4-4-12 alphanumeric characters (lowercase)
    const regex = /^[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$/;
    setIsValidExamId(regex.test(id));
  };

  const handleProceed = () => {
    // Navigate to the exam page using the exam id.
    navigate("/exam/" + examId);
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="wrapper mx-auto w-[900px]">
        <form>
          <label htmlFor="examId" className="block text-sm text-gray-500">
            Enter Exam ID
          </label>
          <input
            type="text"
            id="examId"
            placeholder="eg. xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            value={examId}
            onChange={handleInput}
            className="mt-2 block w-full placeholder-gray-400/70 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-gray-700 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40"
          />
          {examId !== "" && !isValidExamId && (
            <p className="text-red-400">Enter valid ID!</p>
          )}
          {isValidExamId && (
            <button
              type="button"
              onClick={handleProceed}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Proceed to Exam
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default JoinExam;
