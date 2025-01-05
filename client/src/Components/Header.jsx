import React from 'react';

const Header = ({ exitCount }) => {
    

    return (
        <div className="absolute top-4 right-4 bg-gray-800 text-white p-2 rounded">
            <div>Fullscreen Exits: {exitCount}</div>
        </div>
    );
};

export default Header;
/*

const Header = ({ exitCount, timeLeft }) => {
    const formatTime = (seconds) => {
        if (seconds <= 0) {
            return '00:00'; // Display zero if the timer goes negative or reaches zero
        }
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
return (
        <div className="absolute top-4 right-4 bg-gray-800 text-white p-2 rounded">
            <div>Fullscreen Exits: {exitCount}</div>
            {timeLeft !== null && (
                <div className="mt-1">
                    Timer: {formatTime(timeLeft)}
                </div>
            )}
        </div>
    );

*/ 