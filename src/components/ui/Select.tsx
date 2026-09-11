import React, { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, helperText, error, options, id, className = '', required, disabled, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-semibold text-slate-700 select-none flex items-center gap-1"
          >
            {label}
            {required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            required={required}
            disabled={disabled}
            className={`w-full min-h-[44px] text-sm bg-white text-slate-900 border rounded-xl py-2.5 pl-3.5 pr-10 appearance-none transition-all duration-150 outline-hidden disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed cursor-pointer ${
              error
                ? 'border-rose-500 focus:border-rose-600 focus:ring-3 focus:ring-rose-500/15'
                : 'border-slate-300 hover:border-slate-400 focus:border-blue-600 focus:ring-3 focus:ring-blue-600/15'
            } ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 pointer-events-none" />
        </div>
        {error ? (
          <p className="text-xs text-rose-600 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
