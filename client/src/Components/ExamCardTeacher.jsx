// ExamCardTeacher.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Clock, 
  Users, 
  Calendar, 
  ChevronRight,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

const ExamCardTeacher = ({ exam, viewMode = "grid" }) => {
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [activeStudents, setActiveStudents] = useState(0);
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  
  useEffect(() => {
    async function fetchExamStats() {
      try {
        const res = await fetch(`${BASE_URL}/exam/attempts?examId=${exam.id}`);
        const data = await res.json();
        if (data.success) {
          setTotalAttempts(data.attempts.length);
          // Count active students (those who haven't submitted yet)
          const active = data.attempts.filter(attempt => !attempt.submittedAt).length;
          setActiveStudents(active);
        }
      } catch (error) {
        console.error("Error fetching exam stats:", error);
      }
    }

    fetchExamStats();
  }, [exam.id]);

  const getStatusColor = () => {
    const now = new Date();
    const activeStart = new Date(exam.active_start);
    const activeEnd = new Date(exam.active_end);
    
    if (now < activeStart) return "text-yellow-600 bg-yellow-100";
    if (now > activeEnd) return "text-red-600 bg-red-100";
    return "text-green-600 bg-green-100";
  };

  const getStatusText = () => {
    const now = new Date();
    const activeStart = new Date(exam.active_start);
    const activeEnd = new Date(exam.active_end);
    
    if (now < activeStart) return "Upcoming";
    if (now > activeEnd) return "Ended";
    return "Active";
  };

  if (viewMode === "list") {
    return (
      <div 
        onClick={() => navigate(`/dashboard/exams/attempts/${exam.id}`)}
        className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-gray-900">{exam.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </span>
            </div>
            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{exam.duration} min</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                <span>{activeStudents} active / {totalAttempts} total</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{new Date(exam.active_start).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => navigate(`/dashboard/exams/attempts/${exam.id}`)}
      className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{exam.name}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            <span>Duration</span>
          </div>
          <span className="font-medium text-gray-900">{exam.duration} minutes</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            <span>Active Students</span>
          </div>
          <span className="font-medium text-gray-900">{activeStudents}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            <span>Total Attempts</span>
          </div>
          <span className="font-medium text-gray-900">{totalAttempts}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Start Date</span>
          </div>
          <span className="font-medium text-gray-900">
            {new Date(exam.active_start).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Exam ID</span>
          <span className="font-mono text-gray-900">{exam.id}</span>
        </div>
      </div>
    </div>
  );
};

export default ExamCardTeacher;
