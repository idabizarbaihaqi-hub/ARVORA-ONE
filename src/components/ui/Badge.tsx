import React, { type ReactNode } from 'react';

export interface BadgeProps {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'outline' | 'trial';
  size?: 'sm' | 'md';
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  children,
  className = '',
  icon,
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 rounded-full font-medium',
    md: 'text-xs px-2.5 py-1 rounded-full font-semibold',
  };

  const variantClasses = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200/80',
    primary: 'bg-blue-50 text-blue-700 border border-blue-200/80',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200/80',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200/80',
    outline: 'bg-white text-slate-700 border border-slate-300',
    trial: 'bg-gradient-to-r from-sky-50 to-blue-50 text-blue-800 border border-sky-200',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap leading-none select-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
