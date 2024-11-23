import { useState, useEffect } from 'react';

const Timer = ({ initialMinutes, isExamActive, onTimeUp, setTimeLeft, onExamSubmit }) => {
    const [timeLeft, setLocalTimeLeft] = useState(initialMinutes * 60); // Convert minutes to seconds

    useEffect(() => {
        let timer;

        if (isExamActive && timeLeft > 0) {
            timer = setInterval(() => {
                setLocalTimeLeft((prev) => {
                    if (prev > 0) {
                        const newTime = prev - 1;
                        if (setTimeLeft) setTimeLeft(newTime); // Sync with parent state
                        return newTime;
                    }
                    clearInterval(timer); // Stop the timer
                    return 0;
                });
            }, 1000);
        }

        if (timeLeft === 0 && isExamActive) {
            onTimeUp(); // Trigger exam submission when time runs out
        }

        return () => clearInterval(timer); // Cleanup interval on component unmount or dependency change
    }, [isExamActive, timeLeft, onTimeUp, setTimeLeft]);

    useEffect(() => {
        if (!isExamActive) {
            setLocalTimeLeft(initialMinutes * 60); // Reset timer when exam is inactive
        }
    }, [isExamActive, initialMinutes]);

    useEffect(() => {
        if (onExamSubmit) {
            setLocalTimeLeft(0); // Stop the timer when the exam is submitted
        }
    }, [onExamSubmit]);

    return null; // Timer logic only; no UI
};

export default Timer;
