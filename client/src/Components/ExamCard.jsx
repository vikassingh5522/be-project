import React from "react";
import { Link } from "react-router-dom";
import DefaultExamImage from "../assets/exam.svg"

const ExamCard = ({ data, role, attempted }) => {
  // Convert active period strings into Date objects.
  const now = new Date();
  const activeStart = new Date(data.active_start);
  const activeEnd = new Date(data.active_end);
  const isActive = now >= activeStart && now <= activeEnd;

  return (
    <div className="flex-x w-full bg-white border border-gray-300 rounded-lg shadow-md overflow-hidden">
      <img
        src={data.image || DefaultExamImage}
        alt={data.title || data.name}
        className="w-full h-48 object-contain"
      />
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {data.title || data.name}
        </h3>
        <p className="text-gray-500 text-sm mb-4">
          Duration: {data.duration} minutes
        </p>
        {role === "student" && (
          <>
            {attempted ? (
              <p className="text-red-500 font-bold">
                You have already given this exam
              </p>
            ) : isActive ? (
              <Link
                to={`/exam/join/${data.id}`}
                className="block text-center bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-200"
              >
               Start Exam
              </Link>
            ) : (
              <button disabled className="w-full bg-gray-400 text-white py-2 rounded-md">
                Exam Not Active
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ExamCard;
