import React, { useState } from 'react';
import SideBar from '../../Components/SideBar';
import DashboardHeader from '../../Components/DashboardHeader';
import { Outlet } from 'react-router-dom';

const StudentDashboard = ({ user }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideBar 
        role={user?.role} 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <DashboardHeader username={user?.username} />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
