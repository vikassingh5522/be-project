import { useEffect, useRef } from 'react';

const useExamSecurity = (examStarted) => {
  const examContainerRef = useRef(null);

  useEffect(() => {
    if (!examStarted) return;

    // Prevent copy
    const handleCopy = (e) => {
      e.preventDefault();
      return false;
    };

    // Prevent right-click
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // Prevent keyboard shortcuts
    const handleKeyDown = (e) => {
      // Prevent common keyboard shortcuts
      if (
        (e.ctrlKey || e.metaKey) && (
          e.key === 'c' || // Copy
          e.key === 'v' || // Paste
          e.key === 'x' || // Cut
          e.key === 'a' || // Select all
          e.key === 'p' || // Print
          e.key === 's'    // Save
        )
      ) {
        e.preventDefault();
        return false;
      }
    };

    // Monitor cursor position
    const handleMouseMove = (e) => {
      // Get the viewport height (excluding browser UI)
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // Check if cursor is outside the viewport (below address bar)
      if (
        e.clientY < 0 || // Above viewport
        e.clientY > viewportHeight || // Below viewport
        e.clientX < 0 || // Left of viewport
        e.clientX > viewportWidth // Right of viewport
      ) {
        // You can implement your own warning system here
        console.warn('Cursor moved outside browser window');
      }
    };

    // Add event listeners
    document.addEventListener('copy', handleCopy);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousemove', handleMouseMove);

    // Cleanup
    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [examStarted]);

  return examContainerRef;
};

export default useExamSecurity; 