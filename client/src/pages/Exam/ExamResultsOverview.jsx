import React, { useState } from "react";
import CreatedExams from "./CreatedExams";
import MobileMonitoringAnalysis from "./MobileMonitoringAnalysis";
import { useParams } from "react-router-dom";

const ExamResultsOverview = () => {
  const [selectedExam, setSelectedExam] = useState(null);
  const { examId } = useParams();
  const instructor = localStorage.getItem("username");

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Exam Results Overview</h2>
        <CreatedExams 
          instructor={instructor} 
          onExamSelect={setSelectedExam}
          showResults={true}
        />
      </div>

      {selectedExam && (
        <MobileMonitoringAnalysis examId={selectedExam} />
      )}

      {examId && !selectedExam && (
        <MobileMonitoringAnalysis examId={examId} />
      )}
    </div>
  );
};

export default ExamResultsOverview; 