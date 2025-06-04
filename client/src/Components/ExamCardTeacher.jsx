// ExamCardTeacher.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ExamCardTeacher = ({ exam }) => {
  const [totalAttempts, setTotalAttempts] = useState(0);
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  
  useEffect(() => {
    async function fetchTotalAttempts() {
      try {
        const res = await fetch(`${BASE_URL}/exam/attempts?examId=${exam.id}`);
        const data = await res.json();
        if (data.success) {
          setTotalAttempts(data.attempts.length);
        }
      } catch (error) {
        console.error("Error fetching total attempts:", error);
      }
    }

    

    fetchTotalAttempts();

   
  }, [exam.id]);

  return (
    <div
      className="card p-4 bg-white shadow rounded cursor-pointer"
      onClick={() => navigate(`/dashboard/exams/attempts/${exam.id}`)}
    >
      <h3 className="font-bold text-lg">{exam.name}</h3>
      <p><strong>Exam ID:</strong> {exam.id}</p>
      <p><strong>Duration:</strong> {exam.duration} minutes</p>
      <p><strong>Max Score:</strong> {exam.maxScore || "N/A"}</p>
      <p><strong>Total Attempts:</strong> {totalAttempts}</p>
    </div>
  );
};

export default ExamCardTeacher;
