import { useState, useEffect } from 'react';

const useFullscreenManager = () => {
    const [isFullscreen, setIsFullscreen] = useState(false); // Track fullscreen state
    const [exitCount, setExitCount] = useState(0); // Initialize counter to 0

    const goFullscreen = async () => {
        const elem = document.documentElement;
        try {
            if (elem.requestFullscreen) {
                await elem.requestFullscreen();
            } else if (elem.mozRequestFullScreen) { // For Firefox
                await elem.mozRequestFullScreen();
            } else if (elem.webkitRequestFullscreen) { // For Chrome, Safari, and Opera
                await elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) { // For IE/Edge
                await elem.msRequestFullscreen();
            } else {
                throw new Error('Fullscreen API not supported in this browser');
            }
        } catch (error) {
            console.error("Failed to enter fullscreen: ", error);
        }
    };

    useEffect(() => {
        const isNativeFullscreen = () => {
            return (
                window.innerHeight === window.screen.height &&
                window.innerWidth === window.screen.width
            );
        };

        const handleFullscreenChange = () => {
            const isFull = !!document.fullscreenElement || isNativeFullscreen();
            if (!isFull && isFullscreen) {
                // Increment counter when exiting fullscreen
                setExitCount((prevCount) => prevCount + 1);
            }
            setIsFullscreen(isFull); // Update fullscreen state
        };

        // Initialize fullscreen state
        const initializeFullscreenState = () => {
            const isFull = !!document.fullscreenElement || isNativeFullscreen();
            setIsFullscreen(isFull);
        };

        initializeFullscreenState();

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        window.addEventListener('resize', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            window.removeEventListener('resize', handleFullscreenChange);
        };
    }, [isFullscreen]);

    return { isFullscreen, goFullscreen, exitCount };
};

export default useFullscreenManager;
