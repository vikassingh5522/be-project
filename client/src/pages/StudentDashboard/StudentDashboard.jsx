import React from 'react';
import SideBar from '../../Components/SideBar';
import DashboardHeader from '../../Components/DashboardHeader';
import { Outlet } from 'react-router-dom';

const StudentDashboard = ({ user }) => {
  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex min-h-screen">
        <SideBar role={user?.role} />
        <div className="wrap w-full lg:ml-[20%] md:ml-36  *:w-full">
          <DashboardHeader username={user?.username} />
          {/* The Outlet renders the nested route components (e.g., ExamList or AttemptedExams) */}
          <Outlet />
        </div>
      </div>
    </section>
  );
};

export default StudentDashboard;
