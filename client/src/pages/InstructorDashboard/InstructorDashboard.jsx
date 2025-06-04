// InstructorDashboard.jsx
import React from "react";
import SideBar from "../../Components/SideBar";
import DashboardHeader from "../../Components/DashboardHeader";
import CreatedExams from "../Exam/CreatedExams";
import { Outlet } from "react-router-dom";

const InstructorDashboard = ({ user }) => {
  return (
    <section className="min-h-screen">
      <div className="flex min-h-screen">
        <SideBar role={user?.role} />
        <div className="wrap w-full">
          <DashboardHeader username={user?.username} />
          <CreatedExams instructor={user?.username} />
          <Outlet />
        </div>
      </div>
    </section>
  );
};

export default InstructorDashboard;
