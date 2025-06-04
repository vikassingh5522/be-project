import React, { useEffect, useState } from "react";
import ExamCard from "./ExamCard";

const ExamList = ({ role }) => {
  const [exams, setExams] = useState([]);
<<<<<<< HEAD
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  
=======
  const username = localStorage.getItem("username");
  const fetchUrl = `http://localhost:5000/exam/assigned?username=${encodeURIComponent(username)}`;
>>>>>>> 38bb7b8de545ffa5e837891b02cdaf21f9d5bc1d
  useEffect(() => {
    const fetchExams = async () => {
      try {
        // This fetches active (assigned) exams
<<<<<<< HEAD
        const response = await fetch(`${BASE_URL}/exam/active`);
=======
        const response = await fetch(fetchUrl);
>>>>>>> 38bb7b8de545ffa5e837891b02cdaf21f9d5bc1d
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

    if (username) fetchExams();
  }, [fetchUrl, username]);

  return (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {exams.map((exam) => (
        <ExamCard key={exam.id} data={exam} role={role} />
      ))}
    </div>
  );
};

export default ExamList;
