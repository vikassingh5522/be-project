import React, { useEffect } from 'react'
import {useNavigate} from 'react-router-dom';

const ProtectedRoute = ({childrens}) => {
    const navigate =  useNavigate();
    useEffect(()=>{
        const isAuthenticated = localStorage.getItem('token');
    if (!isAuthenticated) {
        navigate('/login', {replace: true});
    }

    }, []);
  return (
    <>
    {childrens}
    </>
  )
}

export default ProtectedRoute