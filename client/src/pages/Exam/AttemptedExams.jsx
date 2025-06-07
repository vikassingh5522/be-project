import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, RefreshCw } from "lucide-react";

const AttemptedExams = () => {
  const [attemptedExams, setAttemptedExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const username = localStorage.getItem("username");
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  
  useEffect(() => {
    async function fetchAttemptedExams() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${BASE_URL}/exam/attempted?username=${username}`);
        const data = await res.json();
        if (data.success) {
          setAttemptedExams(data.attemptedExams);
        } else {
          setError(data.message || "Failed to fetch attempted exams");
        }
      } catch (err) {
        console.error("Error fetching attempted exams:", err);
        setError("Failed to load attempted exams. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    if (username) {
      fetchAttemptedExams();
    }
  }, [username]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-lg text-gray-600">Loading attempted exams...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Exams</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

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
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Score</th>
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
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {exam.score !== null ? `${exam.score}/${exam.maxScore}` : 'Not graded'}
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
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600">No attempted exams found.</p>
        </div>
      )}
    </div>
  );
};

export default AttemptedExams;
