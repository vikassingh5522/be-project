// src/hooks/useKeyLogger.js
/*import { useEffect } from 'react';

export function useKeyLogger(isLoggingActive, setKeyLogs) {
    useEffect(() => {
        if (!isLoggingActive) return;

        const logKeyStroke = (e) => {
            const logEntry = `Key pressed: ${e.key}, Timestamp: ${new Date().toISOString()}\n`;
            setKeyLogs((prevLogs) => prevLogs + logEntry);
        };

        window.addEventListener('keydown', logKeyStroke);

        return () => {
            window.removeEventListener('keydown', logKeyStroke);
        };
    }, [isLoggingActive, setKeyLogs]);
}*/
import { useEffect } from 'react';

export function useKeyLogger(isLoggingActive, setKeyLogs) {
    useEffect(() => {
        if (!isLoggingActive) return;

        const logKeyStroke = (e) => {
            const logEntry = `Key pressed: ${e.key}, Timestamp: ${new Date().toISOString()}\n`;
            setKeyLogs((prevLogs) => prevLogs + logEntry);
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                const logEntry = `Tab or window unfocused, Timestamp: ${new Date().toISOString()}\n`;
                setKeyLogs((prevLogs) => prevLogs + logEntry);
            } else if (document.visibilityState === 'visible') {
                const logEntry = `Tab or window refocused, Timestamp: ${new Date().toISOString()}\n`;
                setKeyLogs((prevLogs) => prevLogs + logEntry);
            }
        };

        // Add event listeners for key logging and visibility change
        window.addEventListener('keydown', logKeyStroke);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('keydown', logKeyStroke);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isLoggingActive, setKeyLogs]);
}

