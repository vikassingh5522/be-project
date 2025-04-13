// ActiveExamsList.jsx
import React, { useEffect, useState } from "react";
import ExamCardTeacher from "../Components/ExamCardTeacher";

const ActiveExamsList = ({ instructor }) => {
  const [activeExams, setActiveExams] = useState([]);

  useEffect(() => {
    async function fetchExams() {
      try {
        const res = await fetch(`http://localhost:5000/exam/created?instructor=${instructor}`);
        const data = await res.json();
        if (data.success) {
          const now = new Date();
          // Filter exams where the current time is within the active period.
          const filtered = data.exams.filter(exam => {
            const activeStart = new Date(exam.active_start);
            const activeEnd = new Date(exam.active_end);
            return now >= activeStart && now <= activeEnd;
          });
          setActiveExams(filtered);
        }
      } catch (err) {
        console.error("Error fetching active exams:", err);
      }
    }
    if (instructor) {
      fetchExams();
    }
  }, [instructor]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Active Exams</h2>
      {activeExams.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {activeExams.map((exam) => (
            <ExamCardTeacher key={exam.id} exam={exam} />
          ))}
        </div>
      ) : (
        <p>No active exams currently.</p>
      )}
    </div>
  );
};

export default ActiveExamsList;
