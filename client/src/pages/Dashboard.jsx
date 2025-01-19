import React, { useEffect } from 'react'
import { useVerifyToken } from '../hooks/useVerifyToken'
import StudentDashboard from './StudentDashboard'
import InstructorDashboard from './InstructorDashboard'

const Dashboard = () => {
    const user = useVerifyToken();

  return (
    <>
    {
        user?.role == "student" ? <StudentDashboard user={user} /> : <InstructorDashboard user={user} />
    }
    
    </>
  )
}

export default Dashboard