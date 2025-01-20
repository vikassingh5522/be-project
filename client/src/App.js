import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Exam from './pages/Exam'
import ExamCreation from './pages/ExamCreation'

const App = () => {
    
  return (
    <div>
        <BrowserRouter>
            <Routes>
                <Route exact path="/" element={<Home />} />
                <Route exact path="/auth/login" element={<Login />}/>
                <Route exact path="/auth/signup" element={<Signup />} />
                <Route exact path="/dashboard" element={<Dashboard />} />
                <Route exact path="/exam/:id" element={<Exam />} />
                <Route exact path="/exam/create" element={<ExamCreation />} /> 
            </Routes>
        </BrowserRouter>
    </div>
  )
}

export default App