import React, { useEffect, useState } from "react";
import LoadingScreen from "../../Components/Loading";

const ExamDashboard = ({ examId }) => {
  const [examResult, setExamResult] = useState(null);
  const username = localStorage.getItem("username");
  const BASE_URL = process.env.REACT_APP_BASE_URL;
 
  useEffect(() => {
    async function fetchExamResult() {
      try {
        const res = await fetch(`${BASE_URL}/exam/result?examId=${examId}&username=${username}`);
        const data = await res.json();
        if (data.success) {
          setExamResult(data.result);
        } else {
          console.error("Error fetching exam result:", data.message);
        }
      } catch (err) {
        console.error("Error fetching exam result:", err);
      }
    }
    if (examId && username) {
      fetchExamResult();
    }
  }, [examId, username]);

  if (!examResult) {
    return <LoadingScreen />;
  }

  const getScoreColor = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return "bg-green-100 text-green-800";
    if (percentage >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">Exam Results</h1>
          <p className="text-gray-600 text-center">Detailed results for {examResult.examName}</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Exam Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Exam Overview Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Exam Overview</h2>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Exam Name</label>
                    <p className="text-gray-900">{examResult.examName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Exam ID</label>
                    <p className="text-gray-600 font-mono text-sm">{examResult.examId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Duration</label>
                    <p className="text-gray-900">{examResult.examDuration} minutes</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Date</label>
                    <p className="text-gray-900">
                      {examResult.examDate ? new Date(examResult.examDate).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Start Time</label>
                    <p className="text-gray-900">
                      {examResult.examStartTime ? new Date(examResult.examStartTime).toLocaleString() : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Submitted At</label>
                    <p className="text-gray-900">
                      {examResult.submittedAt ? new Date(examResult.submittedAt).toLocaleString() : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Answers Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Your Answers</h2>
              </div>
              <div className="p-6">
                {examResult.answers ? (
                  <div className="space-y-4">
                    {Object.entries(examResult.answers).map(([questionIdx, answer]) => (
                      <div key={questionIdx} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm font-medium">
                            Question {questionIdx}
                          </span>
                          <p className="text-gray-900 flex-1">{answer}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No answers submitted</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Score & Audio */}
          <div className="space-y-6">
            {/* Score Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Your Score</h2>
              </div>
              <div className="p-6">
                {/* Main Score Display */}
                <div className="text-center mb-6">
                  <div className="mb-3">
                    <span className={`text-5xl font-bold ${getScoreColor(examResult.score, examResult.maxScore)}`}>
                      {examResult.score}
                    </span>
                    <span className="text-3xl text-gray-400 ml-2">/ {examResult.maxScore}</span>
                  </div>
                  <div className={`inline-flex px-4 py-2 rounded-full text-lg font-semibold ${getScoreBadge(examResult.score, examResult.maxScore)}`}>
                    {Math.round((examResult.score / examResult.maxScore) * 100)}%
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{examResult.score} out of {examResult.maxScore} points</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${
                        (examResult.score / examResult.maxScore) * 100 >= 80 ? 'bg-green-500' :
                        (examResult.score / examResult.maxScore) * 100 >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{
                        width: `${Math.min((examResult.score / examResult.maxScore) * 100, 100)}%`
                      }}
                    ></div>
                  </div>
                </div>
                </div>
                </div>

            {/* Audio Recordings Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Audio Recordings</h2>
              </div>
              <div className="p-6">
                {examResult.recordings && examResult.recordings.length > 0 ? (
                  <div className="space-y-4">
                    {examResult.recordings.map((recording, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="mb-3">
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm font-medium">
                            Recording #{index + 1}
                          </span>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(recording.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <audio 
                          controls 
                          className="w-full"
                          style={{ height: '32px' }}
                        >
                          <source src={`${BASE_URL}/audio/${recording.file}`} type="audio/webm" />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No audio recordings available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamDashboard;