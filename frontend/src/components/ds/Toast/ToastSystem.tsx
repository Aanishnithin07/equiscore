// frontend/src/components/ds/Toast/ToastSystem.tsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info, X, Loader2 } from 'lucide-react';
import { useToastStore, ToastConfig } from './useToast';
import { spring } from '../../../lib/motion-config';

// Constants encapsulating the spatial UI behaviors mandated in the specs
const TOAST_WIDTH = 340;
const Y_OFFSET_PER_INDEX = 12; // pixels

const typeConfig = {
  success: { color: 'var(--success)', icon: CheckCircle2 },
  error:   { color: 'var(--danger)',  icon: XCircle },
  warning: { color: 'var(--warning)', icon: AlertTriangle },
  info:    { color: 'var(--accent-400)',  icon: Info },
  loading: { color: 'var(--accent-400)',  icon: Loader2 }
};

const ToastItem: React.FC<{ toast: ToastConfig; index: number; removeToast: (id: string) => void }> = ({ toast, index, removeToast }) => {
  const config = typeConfig[toast.type];
  const Icon = config.icon;
  
  // Setup auto-dismiss cleanly
  useEffect(() => {
    if (toast.type !== 'loading' && toast.duration !== Infinity) {
      const timer = setTimeout(() => {
        removeToast(toast.id);
      }, toast.duration || 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, removeToast]);

  // Spatial Mathematical offsets ensuring stacking physics
  const isFront = index === 0;
  const scale = 1 - index * 0.04; 
  const translateY = index * -Y_OFFSET_PER_INDEX; 
  const opacity = 1 - index * 0.15;
  const blurVal = index * 0.5;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ 
        opacity, 
        y: translateY, 
        scale,
        filter: `blur(${blurVal}px)`
      }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      transition={spring.bouncy as any}
      style={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        zIndex: 100 - index,
        width: TOAST_WIDTH,
        transformOrigin: 'bottom right'
      }}
      className={`glass-2 glass-noise border border-gray-800 rounded-xl overflow-hidden shadow-xl
        flex items-start p-[14px] px-4 pointer-events-auto`}
    >
      {/* Accent Bar */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-[3px]" 
        style={{ backgroundColor: config.color }} 
      />
      
      <div className="flex-shrink-0 mr-3 mt-0.5">
        <Icon size={18} style={{ color: config.color }} className={toast.type === 'loading' ? 'animate-spin' : ''} />
      </div>
      
      <div className="flex-1 mr-2 mt-0.5">
        <p className="text-[14px] font-medium text-white leading-tight font-sans tracking-tight">
          {toast.title}
        </p>
        {toast.description && (
          <p className="text-[13px] text-gray-400 mt-[2px] leading-snug font-sans">
            {toast.description}
          </p>
        )}
      </div>
      
      <button 
        onClick={() => removeToast(toast.id)}
        className="flex-shrink-0 text-gray-500 hover:text-gray-300 transition-colors bg-white/5 rounded-full p-1"
      >
        <X size={14} />
      </button>

      {/* Progress Bar for finite timeouts */}
      {toast.duration && toast.duration < 100000 && (
        <motion.div 
          className="absolute bottom-0 left-0 h-[2px]"
          style={{ backgroundColor: config.color }}
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: toast.duration / 1000, ease: 'linear' }}
        />
      )}
    </motion.li>
  );
};

export const ToastSystem: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div 
      className="fixed bottom-4 right-4 z-[9999] pointer-events-none"
      style={{ width: TOAST_WIDTH, perspective: '1000px', transformStyle: 'preserve-3d' }}
    >
      <ul className="relative list-none m-0 p-0" style={{ height: 0 }}>
        <AnimatePresence mode="popLayout">
          {toasts.map((toast, idx) => (
            <ToastItem 
              key={toast.id} 
              toast={toast} 
              index={idx} 
              removeToast={removeToast} 
            />
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
};
