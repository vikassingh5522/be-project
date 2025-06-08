import React from "react";
import CreatedExams from "./CreatedExams";

const ExamResultsOverview = () => {
  // Get instructor username from localStorage (or use context/auth if available)
  const instructor = localStorage.getItem("username");
  return (
    <div className="exam-results-overview">
      <CreatedExams instructor={instructor} />
    </div>
  );
};

export default ExamResultsOverview; 