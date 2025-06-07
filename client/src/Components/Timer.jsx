import { useState, useEffect } from 'react';

const Timer = ({ duration, onTimeUp }) => {
    const [timeLeft, setTimeLeft] = useState(duration * 60); // Convert minutes to seconds

    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeUp(); // Notify parent when the timer runs out
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1); // Decrement time
        }, 1000);

        return () => clearInterval(timer); // Cleanup on unmount or timeLeft change
    }, [timeLeft, onTimeUp]);

    // Format time for display (mm:ss)
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="timer text-base font-bold text-gray-500">
            Time Left: {formatTime(timeLeft)}
        </div>
    );
};

export default Timer;
