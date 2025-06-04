import React from 'react';
import { LogOut } from 'lucide-react';

const LogoutButton = ({ collapsed }) => {
    const handleClick = () => {
        localStorage.removeItem('token');
        window.location.href = '/auth/login';
    }

    return (
        <button 
            onClick={handleClick} 
            className="group relative flex w-full items-center justify-center text-red-500 p-3 rounded hover:bg-red-50 transition-colors"
        >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span className="ml-3">Logout</span>}
            
            {/* Tooltip for collapsed mode */}
            {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                    Logout
                </div>
            )}
        </button>
    );
}

export default LogoutButton;