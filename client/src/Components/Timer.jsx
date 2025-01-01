import { useState, useEffect } from 'react';

const Timer = ({ initialMinutes, isExamActive, onTimeUp, setTimeLeft, onExamSubmit }) => {
    const [timeLeft, setLocalTimeLeft] = useState(initialMinutes * 60); // Convert minutes to seconds
    const [examStartTime, setExamStartTime] = useState(null); // Store the start time

    // Sync with parent when timeLeft changes
    useEffect(() => {
        if (setTimeLeft) {
            setTimeLeft(timeLeft);
        }
    }, [timeLeft, setTimeLeft]);

    // Handle the timer logic
    useEffect(() => {
        let timer;

        if (isExamActive && timeLeft > 0) {
            if (!examStartTime) {
                setExamStartTime(Date.now()); // Record the start time
            }

            timer = setInterval(() => {
                setLocalTimeLeft((prev) => {
                    if (prev > 1) {
                        return prev - 1;
                    } else {
                        clearInterval(timer); // Stop the timer
                        return 0;
                    }
                });
            }, 1000);
        }

        if (timeLeft === 0 && isExamActive) {
            onTimeUp(); // Trigger exam submission when time runs out
        }

        return () => clearInterval(timer); // Cleanup interval on component unmount or dependency change
    }, [isExamActive, timeLeft, onTimeUp, examStartTime]);

    // Stop the timer when the exam is submitted
    useEffect(() => {
        if (onExamSubmit) {
            const endTime = Date.now(); // Record the end time
            clearInterval();

            // Calculate exam duration in seconds
            if (examStartTime) {
                const duration = Math.round((endTime - examStartTime) / 1000);
                console.log(`Exam duration: ${duration} seconds`);
            }
        }
    }, [onExamSubmit, examStartTime]);

    return null; // Timer logic only; no UI
};

export default Timer;
