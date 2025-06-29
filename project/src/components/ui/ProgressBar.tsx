import React from 'react';
import { clsx } from 'clsx';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export function ProgressBar({ 
  value, 
  max = 100, 
  className, 
  showLabel = true,
  variant = 'default'
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={clsx('w-full', className)}>
      <div className="flex justify-between items-center mb-1">
        {showLabel && (
          <span className="text-sm text-slate-400">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-300 ease-out',
            {
              'bg-gradient-to-r from-blue-500 to-purple-500': variant === 'default',
              'bg-gradient-to-r from-green-500 to-emerald-500': variant === 'success',
              'bg-gradient-to-r from-yellow-500 to-orange-500': variant === 'warning',
              'bg-gradient-to-r from-red-500 to-pink-500': variant === 'danger',
            }
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}