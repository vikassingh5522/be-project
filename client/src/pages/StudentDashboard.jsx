import React from 'react'
import SideBar from '../Components/SideBar'
import ExamList from '../Components/ExamList'
import { useVerifyToken } from '../hooks/useVerifyToken'
import DashboardHeader from '../Components/DashboardHeader'

const StudentDashboard = ({user}) => {
  return (
    <>
    <section className='min-h-screen bg-slate-50'>
        <div className="flex min-h-screen">
            <SideBar />
            <div className="wrap w-full">
            <DashboardHeader user={user?.username} />
            <ExamList />

            </div>
        </div>

    </section>
    </>
  )
}

export default StudentDashboard