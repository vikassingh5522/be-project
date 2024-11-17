import { useState, useEffect } from 'react';

// Custom hook to count how many times the user exits fullscreen
function useFullscreenExitCounter() {
  const [exitCount, setExitCount] = useState(0); // State to track the number of exits

  useEffect(() => {
    // Function to handle fullscreen change
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        // If the user exits fullscreen, increment the counter
        setExitCount(prevCount => prevCount + 1);
      }
    };

    // Add event listeners for fullscreen changes
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // Cleanup event listeners on component unmount
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  return exitCount;
}

export default useFullscreenExitCounter;
