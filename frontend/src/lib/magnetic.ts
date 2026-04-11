// frontend/src/lib/magnetic.ts
import { useEffect, useRef } from 'react';

/**
 * React Hook translating physical cursor proximity mathematically onto 
 * DOM translations wrapping linear algebra explicitly isolating boundaries.
 * 
 * @param strength Interpolation weight applying cursor drag seamlessly
 * @returns Ref element hook bridging logic dynamically
 */
export function useMagnetic(strength: number = 0.4) {
  const ref = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    
    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const maxDist = Math.max(rect.width, rect.height) * 1.5;
      
      if (dist < maxDist) {
        const factor = (1 - dist / maxDist) * strength;
        el.style.transform = `translate(${dx * factor}px, ${dy * factor}px)`;
      }
    };
    
    const handleLeave = () => {
      el.style.transform = 'translate(0, 0)';
      el.style.transition = 'transform 600ms cubic-bezier(0.34, 1.56, 0.64, 1)';
    };
    
    const handleEnter = () => {
      el.style.transition = 'transform 100ms ease';
    };
    
    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);
    el.addEventListener('mouseenter', handleEnter);
    
    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
      el.removeEventListener('mouseenter', handleEnter);
    };
  }, [strength]);
  
  return ref;
}
