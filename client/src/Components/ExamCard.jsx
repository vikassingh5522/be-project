import React from "react";
import { Link } from "react-router-dom";
import DefaultExamImage from "../assets/exam.svg"
import { Clock, Calendar, User, FileText, AlertCircle } from "lucide-react";

const ExamCard = ({ data, role, attempted }) => {
  // Convert active period strings into Date objects.
  const now = new Date();
  const activeStart = new Date(data.active_start);
  const activeEnd = new Date(data.active_end);
  const isActive = now >= activeStart && now <= activeEnd;

  // Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Count question types
  const mcqCount = data.questions?.filter(q => q.type === 'mcq').length || 0;
  const codingCount = data.questions?.filter(q => q.type === 'coding').length || 0;

  return (
    <div className="flex flex-col w-full bg-white border border-gray-300 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            {data.title || data.name}
          </h3>
          <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
            ID: {data.id?.slice(0, 8)}...
          </span>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center text-gray-600">
            <User className="h-5 w-5 mr-2" />
            <span>Instructor: {data.instructor}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <Clock className="h-5 w-5 mr-2" />
            <span>Duration: {data.duration} minutes</span>
          </div>

          <div className="flex items-center text-gray-600">
            <Calendar className="h-5 w-5 mr-2" />
            <span>Date: {formatDate(data.date)}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <FileText className="h-5 w-5 mr-2" />
            <span>Questions: {mcqCount} MCQ, {codingCount} Coding</span>
          </div>

          <div className="flex items-center text-gray-600">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>Active: {formatDate(data.active_start)} - {formatDate(data.active_end)}</span>
          </div>
        </div>

        {role === "student" && (
          <div className="mt-4">
            {attempted ? (
              <div className="text-center py-2 px-4 bg-red-100 text-red-700 rounded-md">
                <p className="font-semibold">Already Attempted</p>
              </div>
            ) : isActive ? (
              <Link
                to={`/exam/join/${data.id}`}
                className="block text-center bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200"
              >
                Start Exam
              </Link>
            ) : (
              <div className="text-center py-2 px-4 bg-gray-100 text-gray-700 rounded-md">
                <p className="font-semibold">
                  {now < activeStart ? "Not Started Yet" : "Exam Ended"}
                </p>
                <p className="text-sm mt-1">
                  {now < activeStart 
                    ? `Starts in ${Math.ceil((activeStart - now) / (1000 * 60 * 60))} hours`
                    : `Ended ${Math.ceil((now - activeEnd) / (1000 * 60 * 60))} hours ago`
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamCard;
