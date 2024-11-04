// src/hooks/useTabFocusMonitor.js
import { useEffect } from 'react';

export const useTabFocusMonitor = () => {
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                alert("Please stay on this tab.");
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);
};
