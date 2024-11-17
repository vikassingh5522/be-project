/*// src/hooks/useFullscreen.js
import { useEffect } from 'react';
export const useFullscreen = () => {
    const openFullscreen = () => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
        return () => {
            return new Promise((resolve, reject) => {
                if (document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen()
                        .then(resolve)
                        .catch(reject);
                } else {
                    reject(new Error('Fullscreen API not supported'));
                }
            });
        };
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                alert("Please return to full-screen mode to continue.");
                openFullscreen();
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    return openFullscreen;
};
*/
// src/hooks/useFullscreen.js
// src/hooks/useFullscreen.js
import { useEffect } from 'react';

export const useFullscreen = () => {
    const openFullscreen = () => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            return elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) { // For Firefox
            return elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) { // For Chrome, Safari, and Opera
            return elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { // For IE/Edge
            return elem.msRequestFullscreen();
        } else {
            return Promise.reject(new Error('Fullscreen API not supported'));
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                alert("You have exited full-screen mode. Please return to full-screen mode to continue.");
                // Optionally, try to re-enter fullscreen after exiting
                openFullscreen().catch((err) => {
                    console.error("Error trying to enter fullscreen", err);
                });
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange); // For webkit-based browsers
        document.addEventListener('mozfullscreenchange', handleFullscreenChange); // For Firefox
        document.addEventListener('MSFullscreenChange', handleFullscreenChange); // For IE/Edge

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, []);

    return openFullscreen;
};
