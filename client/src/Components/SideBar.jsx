import React from "react";
import { FaUser, FaUserFriends, FaBell } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import LogoutButton from "./LogoutButton";

const SideBar = ({ role }) => {
  return <>{role === "student" ? <StudentSideBar /> : <InstructorSidebar />}</>;
};

const StudentSideBar = () => {
  return (
    <>
      <div className="sidebar p-3 w-1/5 bg-slate-100 min-h-full flex flex-col shadow">
        <h5 className="text-gray-800 font-semibold uppercase my-3">Home</h5>
        <ul className="flex flex-col gap-2">
          <li className="shadow-md">
            <NavLink
              to={"/dashboard"}
              className={(isActive) =>
                `flex gap-3 items-center p-3 rounded ${
                  isActive ? "bg-blue-600 text-white" : ""
                }`
              }
            >
              <FaUser />
              Profile
            </NavLink>
          </li>
          <li>
            <NavLink
              to={"/friend"}
              className={({ isActive }) =>
                `flex gap-3 items-center p-3  rounded ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "hover:bg-blue-400 hover:text-white"
                }`
              }
            >
              <FaUserFriends />
              Friends
            </NavLink>
          </li>
          <li>
            <NavLink
              to={"/notification"}
              className={({ isActive }) =>
                `flex gap-3 items-center p-3 rounded ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "hover:bg-blue-400 hover:text-white"
                }`
              }
            >
              <FaBell />
              Notifications
            </NavLink>
          </li>
          <li></li>
        </ul>
        <LogoutButton />
      </div>
    </>
  );
};

const InstructorSidebar = () => {
  return (
    <>
      <div className="sidebar p-3 w-1/5 bg-slate-100 min-h-full flex flex-col shadow">
        <h5 className="text-gray-800 font-semibold uppercase my-3">Home</h5>
        <ul className="flex flex-col gap-2">
          <li className="shadow-md">
            <NavLink
              to={"/dashboard"}
              className={(isActive) =>
                `flex gap-3 items-center p-3 rounded ${
                  isActive ? "bg-blue-600 text-white" : ""
                }`
              }
            >
              <FaUser />
              Profile
            </NavLink>
          </li>
        </ul>
        <h5 className="text-gray-800 font-semibold uppercase my-3">
          Teacher
        </h5>
        <ul className="flex flex-col gap-2">
          <li className="shadow-md">
            <NavLink
              to={"/dashboard"}
              className={(isActive) =>
                `flex gap-3 items-center p-3 rounded ${
                  isActive ? "bg-blue-600 text-white" : ""
                }`
              }
            >
              <FaUser />
              Create Exam
            </NavLink>
            <NavLink
              to={"/dashboard"}
              className={(isActive) =>
                `flex gap-3 items-center mt-2 p-3 rounded ${
                  isActive ? "bg-blue-600 text-white" : ""
                }`
              }
            >
              <FaUser />
              Result
            </NavLink>
          </li>
        </ul>
        <LogoutButton />
      </div>
    </>
  );
};

export default SideBar;
