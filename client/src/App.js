import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Signup from './pages/Signup'
import Login from './pages/Login'

const App = () => {
    
  return (
    <div>
        <BrowserRouter>
            <Routes>
                <Route exact path="/" element={<Home />} />
                <Route exact path="/auth/login" element={<Login />}/>
                <Route exact path="/auth/signup" element={<Signup />} />
            </Routes>
        </BrowserRouter>
    </div>
  )
}

export default App