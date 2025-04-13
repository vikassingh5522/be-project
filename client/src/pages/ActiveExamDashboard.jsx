import React, { useEffect, useState } from "react";

const ActiveExamDashboard = ({ examId }) => {
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const response = await fetch(`http://localhost:5000/exam/active/attempts?examId=${examId}`);
        const data = await response.json();
        if (data.success) {
          setAttempts(data.attempts);
        }
      } catch (err) {
        console.error("Error fetching active exam attempts:", err);
      }
    };
    // Poll every 5 seconds (adjust as needed)
    const interval = setInterval(fetchAttempts, 5000);
    fetchAttempts();
    return () => clearInterval(interval);
  }, [examId]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Active Exam Attempts</h2>
      {attempts.length > 0 ? (
        <ul>
          {attempts.map((attempt) => (
            <li key={attempt._id}>
              <p>
                <strong>{attempt.username}</strong> started at {attempt.startedAt}
              </p>
              {/* Additional stats can be added here */}
            </li>
          ))}
        </ul>
      ) : (
        <p>No active attempts at the moment.</p>
      )}
    </div>
  );
};

export default ActiveExamDashboard;
