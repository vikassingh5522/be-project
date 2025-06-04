import React, { useEffect, useState } from "react";
import ExamCard from "./ExamCard";

const ExamList = ({ role }) => {
  const [exams, setExams] = useState([]);
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  
  useEffect(() => {
    const fetchExams = async () => {
      try {
        // This fetches active (assigned) exams
        const response = await fetch(`${BASE_URL}/exam/active`);
        const data = await response.json();
        if (data.success) {
          setExams(data.exams);
        } else {
          console.error("Error:", data.message);
        }
      } catch (error) {
        console.error("Error fetching exams:", error);
      }
    };

    fetchExams();
  }, []);

  return (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {exams.map((exam) => (
        <ExamCard key={exam.id} data={exam} role={role} />
      ))}
    </div>
  );
};

export default ExamList;
