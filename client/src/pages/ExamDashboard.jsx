import React, { useEffect, useState } from "react";

const ExamDashboard = ({ examId }) => {
  const [examResult, setExamResult] = useState(null);
  const [audioAlerts, setAudioAlerts] = useState([]);

  useEffect(() => {
    async function fetchExamResult() {
      try {
        const res = await fetch(`http://localhost:5000/exam/result?examId=${examId}`);
        const data = await res.json();
        if (data.success) {
          setExamResult(data.result);
        }
      } catch (err) {
        console.error("Error fetching exam result:", err);
      }
    }
    async function fetchAudioAlerts() {
      try {
        const res = await fetch(`http://localhost:5000/exam/audio-alerts?examId=${examId}`);
        const data = await res.json();
        if (data.success) {
          setAudioAlerts(data.audioAlerts);
        }
      } catch (err) {
        console.error("Error fetching audio alerts:", err);
      }
    }

    fetchExamResult();
    fetchAudioAlerts();
  }, [examId]);

  return (
    <div className="dashboard p-4">
      <h1 className="text-2xl font-bold mb-4">Exam Dashboard</h1>
      {examResult ? (
        <div className="exam-result mb-6">
          <h2 className="text-xl font-semibold">Exam Result</h2>
          <p>Score: {examResult.score}</p>
          <p>Time Taken: {examResult.timeTaken}</p>
          {/* Add more exam details as needed */}
        </div>
      ) : (
        <p>Loading exam result...</p>
      )}
      <div className="audio-alerts">
        <h2 className="text-xl font-semibold mb-4">Abnormal Audio Fragments</h2>
        {audioAlerts.length > 0 ? (
          <ul>
            {audioAlerts.map((alert, index) => (
              <li key={index} className="mb-4 p-2 border rounded">
                <p>Timestamp: {new Date(alert.timestamp).toLocaleString()}</p>
                <p>Speaker Count: {alert.speaker_count}</p>
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
