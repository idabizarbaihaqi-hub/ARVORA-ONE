import React, { type ReactNode } from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  className?: string;
  action?: ReactNode;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  onClose,
  className = '',
  action,
}) => {
  const configs = {
    info: {
      bg: 'bg-blue-50/90 border-blue-200 text-blue-900',
      icon: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
    },
    success: {
      bg: 'bg-emerald-50/90 border-emerald-200 text-emerald-900',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    },
    warning: {
      bg: 'bg-amber-50/90 border-amber-200 text-amber-900',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    },
    error: {
      bg: 'bg-rose-50/90 border-rose-200 text-rose-900',
      icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    },
  };

  const { bg, icon } = configs[variant];

  return (
    <div
      className={`w-full p-4 rounded-xl border text-sm flex items-start gap-3 transition-all ${bg} ${className}`}
      role="alert"
    >
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1 text-left min-w-0">
        {title && <h4 className="font-semibold text-slate-900 mb-0.5 leading-snug">{title}</h4>}
        <div className="text-slate-700 leading-relaxed text-xs sm:text-sm">{children}</div>
        {action && <div className="mt-2.5">{action}</div>}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-black/5 transition-colors cursor-pointer shrink-0"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
