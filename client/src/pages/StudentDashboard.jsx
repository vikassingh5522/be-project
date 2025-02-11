import React from 'react'
import SideBar from '../Components/SideBar'
import ExamList from '../Components/ExamList'
import DashboardHeader from '../Components/DashboardHeader'

const StudentDashboard = ({user}) => {
  return (
    <>
    <section className='min-h-screen bg-slate-50'>
        <div className="flex min-h-screen">
            <SideBar role={user?.role} />
            <div className="wrap w-full">
            <DashboardHeader username={user?.username} />
            <ExamList role={user?.role}/>

            </div>
        </div>

    </section>
    </>
  )
}

export default StudentDashboard