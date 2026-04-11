// frontend/src/components/ds/Button/Button.tsx
import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { useMagnetic } from '../../../lib/magnetic';
import styles from './Button.module.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  isIconOnly?: boolean;
  magneticStrength?: number;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isIconOnly = false,
  magneticStrength = 0.4,
  className = '',
  disabled,
  ...props
}, forwardedRef) => {
  // Use custom magnetic spring hook internally
  const magneticRef = useMagnetic(magneticStrength);
  
  // Merge refs conceptually (simplification: we map directly to magneticRef if no forwardedRef requires overriding bounds actively)
  const setRefs = (node: HTMLButtonElement) => {
    (magneticRef as React.MutableRefObject<HTMLButtonElement>).current = node;
    if (typeof forwardedRef === 'function') {
      forwardedRef(node);
    } else if (forwardedRef) {
      forwardedRef.current = node;
    }
  };

  const baseClasses = [
    styles.buttonBase,
    styles[variant],
    styles[`size-${size}`],
    isIconOnly ? styles.iconOnly : '',
    isLoading ? styles.loading : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      ref={setRefs}
      className={baseClasses}
      disabled={disabled || isLoading}
      data-magnetic="true"
      {...props}
    >
      {isLoading ? (
        <svg className={styles.spinner} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
        </svg>
      ) : children}
    </button>
  );
});

Button.displayName = 'Button';
