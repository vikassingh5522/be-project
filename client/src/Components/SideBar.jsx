// SideBar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { FaUser, FaUserFriends, FaBell, FaPen, FaListAlt } from "react-icons/fa";
import LogoutButton from "./LogoutButton";

const SideBar = ({ role }) => {
  return <>{role === "student" ? <StudentSideBar /> : <InstructorSidebar />}</>;
};

const StudentSideBar = () => {
  return (
    <div className="fixed top-0 left-0 bottom-0 p-3 w-1/5 bg-white min-h-full flex flex-col shadow">
      <h5 className="text-gray-800 font-semibold uppercase my-3">Home</h5>
      <ul className="flex flex-col gap-2">
        <li>
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              `flex gap-3 items-center p-3 rounded ${
                isActive ? "bg-violet-600 text-white" : "hover:bg-violet-400 hover:text-white"
              }`
            }
          >
            <FaUser />
            Profile
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/exam/join"
            className={({ isActive }) =>
              `flex gap-3 items-center p-3 rounded ${
                isActive ? "bg-violet-600 text-white" : "hover:bg-violet-400 hover:text-white"
              }`
            }
          >
            <FaPen />
            Join Exam
          </NavLink>
        </li>
      </ul>
      <h5 className="text-gray-800 font-semibold uppercase my-3">Exams</h5>
      <ul className="flex flex-col gap-2">
        {/* New link for assigned (active) exams */}
        <li>
          <NavLink
            to="/dashboard/exams/assigned"
            className={({ isActive }) =>
              `flex gap-3 items-center p-3 rounded ${
                isActive ? "bg-violet-600 text-white" : "hover:bg-violet-400 hover:text-white"
              }`
            }
          >
            <FaListAlt />
            Assigned Exams
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/dashboard/exams/practice"
            className={({ isActive }) =>
              `flex gap-3 items-center p-3 rounded ${
                isActive ? "bg-violet-600 text-white" : "hover:bg-violet-400 hover:text-white"
              }`
            }
          >
            <FaListAlt />
            Practice Exams
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/dashboard/exams/attempted"
            className={({ isActive }) =>
              `flex gap-3 items-center p-3 rounded ${
                isActive ? "bg-violet-600 text-white" : "hover:bg-violet-400 hover:text-white"
              }`
            }
          >
            <FaListAlt />
            Attempted Exams
          </NavLink>
        </li>
      </ul>
      <LogoutButton />
    </div>
  );
};

const InstructorSidebar = () => {
  return (
    <div className="sidebar p-3 w-1/5 bg-slate-100 min-h-full flex flex-col shadow">
      <h5 className="text-gray-800 font-semibold uppercase my-3">Home</h5>
      <ul className="flex flex-col gap-2">
        <li className="shadow-md">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex gap-3 items-center p-3 rounded ${isActive ? "bg-violet-600 text-white" : ""}`
            }
          >
            <FaUser />
            Profile
          </NavLink>
        </li>
      </ul>
      <h5 className="text-gray-800 font-semibold uppercase my-3">Teacher</h5>
      <ul className="flex flex-col gap-2">
        <li className="shadow-md">
          <NavLink
            to="/exam/create"
            className={({ isActive }) =>
              `flex gap-3 items-center p-3 rounded ${isActive ? "bg-violet-600 text-white" : ""}`
            }
          >
            <FaPen />
            Create Exam
          </NavLink>
        </li>
        <li className="shadow-md">
          <NavLink
            to="/dashboard/exams/active"
            className={({ isActive }) =>
              `flex gap-3 items-center p-3 rounded ${isActive ? "bg-violet-600 text-white" : "hover:bg-violet-400 hover:text-white"}`
            }
          >
            <FaListAlt />
            Active Exams
          </NavLink>
        </li>
        <li className="shadow-md">
          <NavLink
            to="/exam/result"
            className={({ isActive }) =>
              `flex gap-3 items-center mt-2 p-3 rounded ${isActive ? "bg-violet-600 text-white" : ""}`
            }
          >
            <FaListAlt />
            Result
          </NavLink>
        </li>
      </ul>
      <LogoutButton />
    </div>
  );
};

export default SideBar;
