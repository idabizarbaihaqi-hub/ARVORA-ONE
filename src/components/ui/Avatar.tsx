import React from 'react';

export interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ name, size = 'md', className = '' }) => {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'A';

  const sizeClasses = {
    sm: 'w-7 h-7 text-[11px]',
    md: 'w-9 h-9 text-xs',
    lg: 'w-11 h-11 text-sm font-bold',
  };

  return (
    <div
      className={`rounded-xl bg-gradient-to-tr from-slate-900 to-blue-900 text-white font-semibold flex items-center justify-center select-none shadow-2xs shrink-0 ${sizeClasses[size]} ${className}`}
      aria-label={name}
    >
      {initials}
    </div>
  );
};
