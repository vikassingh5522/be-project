import React from 'react'
import SideBar from '../Components/SideBar'
import ExamList from '../Components/ExamList'
import DashboardHeader from '../Components/DashboardHeader'

const InstructorDashboard = ({user}) => {
  return (
    <>
    <section className='min-h-screen'>
        <div className="flex min-h-screen">
            <SideBar role={user?.role} />
            <div className="wrap w-full">
            <DashboardHeader username={user?.username} />
            <ExamList />
            </div>
        </div>

    </section>
    </>
  )
}

export default InstructorDashboard