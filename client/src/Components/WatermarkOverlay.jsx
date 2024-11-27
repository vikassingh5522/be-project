import React from 'react';

const WatermarkOverlay = () => {
    const watermarkStyle = {
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: `
            url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='10' y='20' font-family='Arial' font-size='20' fill='%23000000' fill-opacity='0.1'%3EEXAM%3C/text%3E%3C/svg%3E")
            repeat`,
        pointerEvents: 'none', // Makes the overlay non-interactive
        zIndex: 10 // Ensure it's above all other content
    };

    return (
        <div style={watermarkStyle}></div>
    );
};

export default WatermarkOverlay;
