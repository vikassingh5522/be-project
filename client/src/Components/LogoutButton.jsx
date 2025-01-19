import React from 'react'
import { FaSignOutAlt } from 'react-icons/fa';

const LogoutButton = () => {
    const handleClick = () => {
        localStorage.removeItem('token');
        window.location.href = '/auth/login';
    }

  return (
    <button onClick={handleClick} className="flex w-full mt-auto  gap-3 mt-auto items-center text-red-500 p-3 rounded hover:bg-red-400 hover:text-white">
                <FaSignOutAlt />
                Logout
            </button>
  )
}

export default LogoutButton