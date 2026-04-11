// frontend/src/components/ds/PageTransition/PageTransition.tsx
import React from 'react';
import { motion } from 'framer-motion';

export const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ 
        opacity: { duration: 0.3, ease: 'easeOut' },
        y: { type: 'spring', stiffness: 200, damping: 24 }
      }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};
