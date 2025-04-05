import React, { useEffect, useState } from "react";

const ExamDashboard = ({ examId }) => {
  const [examResult, setExamResult] = useState(null);
  const [audioAlerts, setAudioAlerts] = useState([]);
  const username = localStorage.getItem("username"); // Ensure this is set at login

  useEffect(() => {
    async function fetchExamResult() {
      try {
        const res = await fetch(`http://localhost:5000/exam/result?examId=${examId}&username=${username}`);
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
    async function fetchAudioAlerts() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/exam/audio-alerts?examId=${examId}&token=${token}`);
        const data = await res.json();
        if (data.success) {
          setAudioAlerts(data.audioAlerts);
        }
      } catch (err) {
        console.error("Error fetching audio alerts:", err);
      }
    }
    if (examId && username) {
      fetchExamResult();
      fetchAudioAlerts();
    }
  }, [examId, username]);

  if (!examResult) {
    return <div>Loading exam result...</div>;
  }

  return (
    <div className="dashboard p-4">
      <h1 className="text-2xl font-bold mb-4">Exam Dashboard</h1>
      <div className="exam-result mb-6 border p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Exam Result</h2>
        <p><strong>Exam ID:</strong> {examResult.examId}</p>
        <p><strong>Exam Name:</strong> {examResult.examName}</p>
        <p><strong>Duration:</strong> {examResult.examDuration} minutes</p>
        <p><strong>Date:</strong> {examResult.examDate ? new Date(examResult.examDate).toLocaleDateString() : "N/A"}</p>
        <p><strong>Exam Start Time:</strong> {examResult.examStartTime ? new Date(examResult.examStartTime).toLocaleString() : "N/A"}</p>
        <p><strong>Submitted At:</strong> {examResult.submittedAt ? new Date(examResult.submittedAt).toLocaleString() : "N/A"}</p>
        <p><strong>Score:</strong> {examResult.score}</p>
        <p><strong>Max Score:</strong> {examResult.maxScore}</p>
        <div className="answers mt-4">
          <h3 className="text-lg font-semibold">Answers:</h3>
          {examResult.answers ? (
            <ul className="list-disc ml-6">
              {Object.entries(examResult.answers).map(([questionIdx, answer]) => (
                <li key={questionIdx}>
                  <strong>Question {questionIdx}:</strong> {answer}
                </li>
              ))}
            </ul>
          ) : (
            <p>No answers submitted.</p>
          )}
        </div>
      </div>

      <div className="audio-alerts border p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Abnormal Audio Fragments</h2>
        {audioAlerts && audioAlerts.length > 0 ? (
          <ul>
            {audioAlerts.map((alert, index) => (
              <li key={index} className="mb-4 p-2 border rounded">
                <p><strong>Timestamp:</strong> {new Date(alert.timestamp).toLocaleString()}</p>
                <p><strong>Speaker Count:</strong> {alert.speaker_count}</p>
                <audio controls src={`http://localhost/${alert.file_path}`}></audio>
              </li>
            ))}
          </ul>
        ) : (
          <p>No abnormal audio fragments detected.</p>
        )}
      </div>
    </div>
  );
};

export default ExamDashboard;
