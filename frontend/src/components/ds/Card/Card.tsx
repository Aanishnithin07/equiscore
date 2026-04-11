// frontend/src/components/ds/Card/Card.tsx
import React, { CSSProperties } from 'react';
import styles from './Card.module.css';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: 'glass-0' | 'glass-1' | 'glass-2' | 'glass-3' | 'glass-4';
  radius?: 'lg' | 'xl';
  hoverable?: boolean;
  glowColor?: string; // OKLCH equivalent glow shadow
  accentBar?: 'top' | 'left' | 'none';
}

export const Card: React.FC<CardProps> = ({
  children,
  glass = 'glass-2',
  radius = 'lg',
  hoverable = false,
  glowColor,
  accentBar = 'none',
  className = '',
  style,
  ...props
}) => {
  const customStyles = {
    ...style,
    ...(glowColor ? { '--card-glow-color': glowColor } : {})
  } as CSSProperties;

  const baseClasses = [
    glass, // from surfaces.css
    'glass-noise', // inject Perlin
    styles.cardBase,
    styles[`radius-${radius}`],
    hoverable ? styles.hoverable : '',
    glowColor ? styles.glowActive : '',
    accentBar !== 'none' ? styles[`accent-${accentBar}`] : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={baseClasses} style={customStyles} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => (
  <div className={`${styles.cardHeader} ${className}`} {...props}>{children}</div>
);

export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => (
  <div className={`${styles.cardBody} ${className}`} {...props}>{children}</div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => (
  <div className={`${styles.cardFooter} ${className}`} {...props}>{children}</div>
);
