// frontend/src/components/ds/Tooltip/Tooltip.tsx
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { spring } from '../../../lib/motion-config';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delayMS?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  position = 'top',
  delayMS = 200
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => setIsVisible(true), delayMS);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  const getPositionStyles = () => {
    switch (position) {
      case 'top': return { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '8px' };
      case 'bottom': return { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '8px' };
      case 'left': return { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '8px' };
      case 'right': return { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: '8px' };
      default: return {};
    }
  };

  const getAnimationVariants = () => {
    const base = { opacity: 0, scale: 0.95 };
    switch (position) {
      case 'top': return { hidden: { ...base, y: 5 }, visible: { opacity: 1, scale: 1, y: 0 } };
      case 'bottom': return { hidden: { ...base, y: -5 }, visible: { opacity: 1, scale: 1, y: 0 } };
      case 'left': return { hidden: { ...base, x: 5 }, visible: { opacity: 1, scale: 1, x: 0 } };
      case 'right': return { hidden: { ...base, x: -5 }, visible: { opacity: 1, scale: 1, x: 0 } };
      default: return { hidden: base, visible: { opacity: 1, scale: 1 } };
    }
  };

  const variants = getAnimationVariants();

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants}
            transition={spring.snappy}
            style={getPositionStyles()}
            className="absolute z-50 glass-3 glass-noise px-3 py-1.5 rounded-md border border-gray-700 whitespace-nowrap shadow-xl"
            pointerEvents="none"
          >
            <span className="text-[12px] font-sans font-medium text-gray-200 tracking-wide">
                {content}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
