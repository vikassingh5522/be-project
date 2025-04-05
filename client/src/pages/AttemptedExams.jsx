import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AttemptedExams = () => {
  const [attemptedExams, setAttemptedExams] = useState([]);
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  useEffect(() => {
    async function fetchAttemptedExams() {
      try {
        const res = await fetch(`http://localhost:5000/exam/attempted?username=${username}`);
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
    <div className="attempted-exams p-4">
      <h2 className="text-xl font-semibold mb-4">Attempted Exams</h2>
      {attemptedExams.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {attemptedExams.map((exam, index) => (
            <div 
              key={index} 
              className="card p-4 bg-white shadow rounded cursor-pointer"
              onClick={() => navigate(`/exam/dashboard/${exam.examId}`)}
            >
              <h3 className="font-bold">Exam: {exam.examId}</h3>
              <p>Name: {exam.examName}</p>
              <p>Duration: {exam.examDuration} minutes</p>
              <p>Date: {new Date(exam.examDate).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No attempted exams found.</p>
      )}
    </div>
  );
};

export default AttemptedExams;
