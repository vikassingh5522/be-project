import React from "react";
import { Link } from "react-router-dom";

const ExamCard = ({ data }) => {
  return (
    <div className="max-w-sm w-full bg-white border border-gray-300 rounded-lg shadow-md overflow-hidden">
      <img
        src={data.image}
        alt={data.title}
        className="w-full h-48 object-cover"
      />

      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {data.title}
        </h3>

        <p className="text-gray-500 text-sm mb-4">
          Duration: {data.duration} minutes
        </p>
          <Link
            to={"/exam/create"}
            className="block text-center bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-200"
          >
            Create Exam
          </Link>
      </div>
    </div>
  );
};

export default ExamCard;
