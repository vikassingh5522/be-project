import React from 'react'
import SideBar from '../Components/SideBar'
import ExamList from '../Components/ExamList'

const Dashboard = () => {
  return (
    <>
    <section className='min-h-screen'>
        <div className="flex min-h-screen">
            <SideBar />
            <ExamList />
        </div>

    </section>
    
    </>
  )
}

export default Dashboard