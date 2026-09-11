import React, { type ReactNode, type HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all duration-200 ${
        hoverEffect ? 'hover:border-slate-300 hover:shadow-sm' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
}> = ({ title, subtitle, action, children, className = '' }) => {
  return (
    <div
      className={`p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4 ${className}`}
    >
      {children ? (
        children
      ) : (
        <div className="flex flex-col gap-0.5">
          {title && (
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export const CardContent: React.FC<{
  children: ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return <div className={`p-5 sm:p-6 ${className}`}>{children}</div>;
};

export const CardFooter: React.FC<{
  children: ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div
      className={`p-4 sm:p-6 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-3 ${className}`}
    >
      {children}
    </div>
  );
};
