import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
}

export function Card({ className, children, hover = false }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-slate-800 border border-slate-700 rounded-xl shadow-lg',
        {
          'hover:bg-slate-750 hover:border-slate-600 transition-all duration-200 cursor-pointer': hover,
        },
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={clsx('px-6 py-4 border-b border-slate-700', className)}>
      {children}
    </div>
  );
}

export function CardContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={clsx('px-6 py-4', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <h3 className={clsx('text-lg font-semibold text-slate-100', className)}>
      {children}
    </h3>
  );
}