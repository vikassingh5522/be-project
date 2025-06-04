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
      if (!examContainerRef.current) return;

      const container = examContainerRef.current;
      const rect = container.getBoundingClientRect();
      
      // Check if cursor is outside the exam container
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      ) {
        // You can implement your own warning system here
        console.warn('Cursor moved outside exam window');
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