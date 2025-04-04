// CreatedExams.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const CreatedExams = ({ instructor }) => {
  const [exams, setExams] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchExams() {
      try {
        const res = await fetch(`http://localhost:5000/exam/created?instructor=${instructor}`);
        const data = await res.json();
        if (data.success) {
          setExams(data.exams);
        }
      } catch (err) {
        console.error("Error fetching created exams:", err);
      }
    }
    if (instructor) {
      fetchExams();
    }
  }, [instructor]);

  return (
    <div className="created-exams p-4">
      <h2 className="text-xl font-semibold mb-4">Created Exams</h2>
      {exams.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="card p-4 bg-white shadow rounded cursor-pointer"
              onClick={() => navigate(`/dashboard/exams/attempts/${exam.id}`)}
            >
              <h3 className="font-bold">{exam.name}</h3>
              <p>Exam ID: {exam.id}</p>
              <p>Duration: {exam.duration} minutes</p>
              <p>Max Score: {exam.maxScore || "N/A"}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No created exams found.</p>
      )}
    </div>
  );
};

export default CreatedExams;
