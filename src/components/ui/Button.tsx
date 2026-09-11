import React, { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    // 2x horizontal padding vs vertical padding (e.g. py-2 px-4, py-2.5 px-5, py-3 px-6)
    // Minimum 44px touch height on mobile for accessible targets
    const sizeClasses = {
      sm: 'text-xs py-1.5 px-3 min-h-[36px] rounded-lg gap-1.5',
      md: 'text-sm py-2.5 px-5 min-h-[44px] rounded-xl gap-2 font-medium',
      lg: 'text-base py-3 px-6 min-h-[48px] rounded-xl gap-2.5 font-semibold',
    };

    const variantClasses = {
      primary:
        'bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white shadow-xs border border-blue-800 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
      secondary:
        'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 border border-slate-200/80 transition-colors focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2',
      outline:
        'bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-300 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
      ghost:
        'bg-transparent hover:bg-slate-100 active:bg-slate-200 text-slate-600 hover:text-slate-900 border border-transparent transition-colors focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2',
      danger:
        'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-xs border border-rose-700 transition-colors focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center whitespace-nowrap cursor-pointer select-none transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed outline-hidden ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span className="leading-none">{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
