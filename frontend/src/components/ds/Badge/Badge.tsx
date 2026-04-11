// frontend/src/components/ds/Badge/Badge.tsx
import React from 'react';
import styles from './Badge.module.css';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'success' | 'warning' | 'danger' | 'accent';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'neutral',
  size = 'md',
  className = '',
  ...props 
}) => {
  const baseClasses = [
    styles.badgeBase,
    styles[variant],
    styles[`size-${size}`],
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={baseClasses} {...props}>
      {children}
    </span>
  );
};
