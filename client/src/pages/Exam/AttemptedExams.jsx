import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AttemptedExams = () => {
  const [attemptedExams, setAttemptedExams] = useState([]);
  const navigate = useNavigate();
  const username = localStorage.getItem("username");
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  
  useEffect(() => {
    async function fetchAttemptedExams() {
      try {
        const res = await fetch(`${BASE_URL}/exam/attempted?username=${username}`);
        const data = await res.json();
        if (data.success) {
          setAttemptedExams(data.attemptedExams);
        }
      } catch (err) {
        console.error("Error fetching attempted exams:", err);
      }
    }
    if (username) {
      fetchAttemptedExams();
    }
  }, [username]);

  return (
    <div className="attempted-exams bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <h2 className="text-2xl font-semibold mb-6">Attempted Exams</h2>

      {attemptedExams.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 bg-white shadow rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Exam Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Exam ID</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Duration</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {attemptedExams.filter(elem => elem.examName).map((exam, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{exam.examName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{exam.examId}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{exam.examDuration} min</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(exam.examDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => navigate(`/exam/dashboard/${exam.examId}`)}
                      className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600">No attempted exams found.</p>
      )}
    </div>
  );
};

export default AttemptedExams;
