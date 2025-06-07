import React, { useEffect, useState } from "react";
import ExamCard from "./ExamCard";
import { AlertCircle, RefreshCw } from "lucide-react";

const ExamList = ({ role }) => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  
  const username = localStorage.getItem("username");
  
  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${BASE_URL}/exam/assigned?username=${encodeURIComponent(username)}`);
        const data = await response.json();
        if (data.success) {
          setExams(data.exams);
        } else {
          setError(data.message || "Failed to fetch exams");
        }
      } catch (error) {
        console.error("Error fetching exams:", error);
        setError("Failed to load exams. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (username) fetchExams();
  }, [username]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-lg text-gray-600">Loading exams...</span>
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
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-6">Assigned Exams</h2>
      {exams.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {exams.map((exam) => (
            <ExamCard key={exam.id} data={exam} role={role} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">No exams assigned at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default ExamList;
