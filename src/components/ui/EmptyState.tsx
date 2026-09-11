import React, { type ReactNode } from 'react';
import { FolderOpen } from 'lucide-react';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center text-slate-400 mb-3.5">
        {icon || <FolderOpen className="w-6 h-6 stroke-[1.5]" />}
      </div>
      <h4 className="text-base font-bold text-slate-800 mb-1">{title}</h4>
      {description && (
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm leading-relaxed mb-4">
          {description}
        </p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
};
