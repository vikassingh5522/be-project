// ExamAttempts.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ExamAttempts = () => {
  const { examId } = useParams();
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    async function fetchAttempts() {
      try {
        const res = await fetch(`http://localhost:5000/exam/attempts?examId=${examId}`);
        const data = await res.json();
        if (data.success) {
          setAttempts(data.attempts);
        }
      } catch (err) {
        console.error("Error fetching exam attempts:", err);
      }
    }
    if (examId) {
      fetchAttempts();
    }
  }, [examId]);

  return (
    <div className="exam-attempts p-4">
      <h2 className="text-xl font-semibold mb-4">Student Attempts for Exam: {examId}</h2>
      {attempts.length > 0 ? (
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="border p-2">Username</th>
              <th className="border p-2">Score</th>
              <th className="border p-2">Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {attempts.map((attempt) => (
              <tr key={attempt._id}>
                <td className="border p-2">{attempt.username}</td>
                <td className="border p-2">{attempt.score}</td>
                <td className="border p-2">{attempt.submittedAt || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No student attempts found for this exam.</p>
      )}
    </div>
  );
};

export default ExamAttempts;
