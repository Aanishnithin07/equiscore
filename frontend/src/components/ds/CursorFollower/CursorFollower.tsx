// frontend/src/components/ds/CursorFollower/CursorFollower.tsx
import React, { useEffect } from 'react';
import { createSpring } from '../../../lib/spring';

export const CursorFollower: React.FC = () => {
  useEffect(() => {
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    // Ring target positions
    let ringX = mouseX;
    let ringY = mouseY;

    // Dot scale spring for clicks
    const dotSpring = createSpring({ stiffness: 400, damping: 25, mass: 1 });
    dotSpring.setPos(1);
    dotSpring.setTarget(1);

    let isMagnetic = false;
    let isText = false;
    let isLoading = false;
    let magneticScale = 1;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Check current hovered element for data attributes natively traversing upwards safely
      const target = e.target as HTMLElement;
      const magEl = target.closest('[data-magnetic]') as HTMLElement;
      const cursorEl = target.closest('[data-cursor]') as HTMLElement;

      isMagnetic = !!magEl;
      if (cursorEl) {
        const type = cursorEl.getAttribute('data-cursor');
        isText = type === 'text';
        isLoading = type === 'loading';
      } else {
        isText = false;
        isLoading = false;
      }
    };

    const onMouseDown = () => dotSpring.setTarget(0.5);
    const onMouseUp = () => dotSpring.setTarget(1);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown, { passive: true });
    window.addEventListener('mouseup', onMouseUp, { passive: true });

    let animationFrame: number;
    let lastTime = performance.now();

    const render = (time: DOMHighResTimeStamp) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05); // Cap dt
      lastTime = time;

      // Ring LERP (0.15 factor fixed)
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;

      // Update Dot Spring
      const currentDotScale = dotSpring.step(dt);

      // Dot is instantly following mouse
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) scale(${currentDotScale}) translate(-50%, -50%)`;

      // Visual state machines
      ring.style.borderColor = isMagnetic ? 'var(--text-primary)' : 'rgba(100, 28, 226, 0.6)'; // accent-400/0.6 fallback
      ring.style.mixBlendMode = isMagnetic ? 'difference' : 'normal';
      
      let transformStr = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      
      if (isMagnetic) {
        magneticScale += (2.5 - magneticScale) * 0.15;
        transformStr += ` scale(${magneticScale})`;
      } else if (isText) {
        magneticScale += (1 - magneticScale) * 0.15;
        transformStr += ` scaleX(${0.5 * magneticScale}) scaleY(${1.2 * magneticScale})`;
      } else if (isLoading) {
        magneticScale += (1 - magneticScale) * 0.15;
        const rotate = (time * 0.1) % 360;
        transformStr += ` scale(${magneticScale}) rotate(${rotate}deg)`;
        ring.style.borderStyle = 'dashed';
      } else {
        magneticScale += (1 - magneticScale) * 0.15;
        transformStr += ` scale(${magneticScale})`;
        ring.style.borderStyle = 'solid';
      }

      ring.style.transform = transformStr;
      animationFrame = requestAnimationFrame(render);
    };

    animationFrame = requestAnimationFrame(render);

    // Ensure hidden cursor overrides specifically
    document.body.style.cursor = 'none';

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      cancelAnimationFrame(animationFrame);
      document.body.style.cursor = 'auto'; // Reset on unmount
    };
  }, []);

  return (
    <>
      <div 
        id="cursor-dot" 
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '8px', height: '8px',
          backgroundColor: 'var(--accent-400)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9999,
          willChange: 'transform'
        }}
      />
      <div 
        id="cursor-ring" 
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '32px', height: '32px',
          border: '1px solid rgba(100, 28, 226, 0.6)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9998,
          willChange: 'transform',
          transition: 'border-color 0.2s ease, mix-blend-mode 0.2s ease'
        }}
      />
    </>
  );
};
