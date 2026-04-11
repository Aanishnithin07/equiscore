// frontend/src/components/ds/PageProgress/PageProgress.tsx
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export const PageProgress: React.FC = () => {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Navigation started, quick jump to 30%
    setIsVisible(true);
    setProgress(30);

    const crawlInterval = setInterval(() => {
      setProgress(p => (p < 85 ? p + 2 : p));
    }, 100);

    // Simulate completion after a brief layout calculation phase natively
    const finishTimeout = setTimeout(() => {
      setProgress(100);
      clearInterval(crawlInterval);
      
      // Keep it up for 200ms before dismissing
      setTimeout(() => {
        setIsVisible(false);
        // Reset after exit animation
        setTimeout(() => setProgress(0), 200);
      }, 200);
    }, 400);

    return () => {
      clearInterval(crawlInterval);
      clearTimeout(finishTimeout);
    };
  }, [location.pathname]); // Hook into router path changes implicitly

  if (!isVisible && progress === 0) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        height: '2px',
        zIndex: 9999,
        pointerEvents: 'none',
        opacity: isVisible ? 1 : 0,
        transform: `translateY(${isVisible ? '0px' : '-2px'})`,
        transition: 'opacity 200ms ease, transform 200ms ease',
      }}
    >
      <div 
        style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, var(--accent-400), var(--teal-400))',
          boxShadow: '0 0 8px var(--accent-glow)',
          transition: progress === 30 ? 'none' : 'width 200ms ease-out',
        }}
      />
    </div>
  );
};
