import React, { useState } from "react";
import SideBar from "../../Components/SideBar";
import DashboardHeader from "../../Components/DashboardHeader";
import CreatedExams from "../Exam/CreatedExams";
import { Outlet, useLocation } from "react-router-dom";

const InstructorDashboard = ({ user }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  
  // Check if we're on a nested route
  const isNestedRoute = location.pathname !== "/dashboard" && location.pathname !== "/dashboard/";
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideBar role={user?.role} collapsed={sidebarCollapsed} />
      <div className="flex-1 flex flex-col">
        <DashboardHeader username={user?.username} />
        <main className="flex-1 p-6">
          {!isNestedRoute ? (
            <CreatedExams instructor={user?.username} />
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
};

export default InstructorDashboard;