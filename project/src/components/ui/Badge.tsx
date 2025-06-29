import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  className?: string;
  children: React.ReactNode;
}

export function Badge({ variant = 'default', size = 'md', className, children }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full font-medium',
        {
          // Variants
          'bg-slate-700 text-slate-300': variant === 'default',
          'bg-green-900/50 text-green-400 border border-green-800': variant === 'success',
          'bg-yellow-900/50 text-yellow-400 border border-yellow-800': variant === 'warning',
          'bg-red-900/50 text-red-400 border border-red-800': variant === 'danger',
          'bg-blue-900/50 text-blue-400 border border-blue-800': variant === 'info',
          
          // Sizes
          'px-2 py-0.5 text-xs': size === 'sm',
          'px-2.5 py-1 text-sm': size === 'md',
        },
        className
      )}
    >
      {children}
    </span>
  );
}