import React, { forwardRef, type InputHTMLAttributes } from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  sublabel?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, sublabel, error, id, className = '', checked, disabled, ...props }, ref) => {
    const checkId = id || `check_${Math.random().toString(36).substring(2, 7)}`;

    return (
      <div className="flex flex-col gap-1 text-left">
        <label
          htmlFor={checkId}
          className={`flex items-start gap-2.5 cursor-pointer select-none ${
            disabled ? 'opacity-60 cursor-not-allowed' : ''
          }`}
        >
          <div className="relative flex items-center justify-center mt-0.5">
            <input
              ref={ref}
              type="checkbox"
              id={checkId}
              checked={checked}
              disabled={disabled}
              className="peer sr-only"
              {...props}
            />
            <div className="w-4.5 h-4.5 rounded-md border border-slate-300 bg-white peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500/20 transition-all duration-150 flex items-center justify-center" />
            <Check className="w-3 h-3 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-medium text-slate-800">{label}</span>
            {sublabel && <span className="text-xs text-slate-500 mt-0.5">{sublabel}</span>}
          </div>
        </label>
        {error && <p className="text-xs text-rose-600 pl-7">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  sublabel?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, sublabel, id, checked, disabled, ...props }, ref) => {
    const radioId = id || `radio_${Math.random().toString(36).substring(2, 7)}`;

    return (
      <label
        htmlFor={radioId}
        className={`flex items-start gap-2.5 cursor-pointer select-none ${
          disabled ? 'opacity-60 cursor-not-allowed' : ''
        }`}
      >
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            ref={ref}
            type="radio"
            id={radioId}
            checked={checked}
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />
          <div className="w-4.5 h-4.5 rounded-full border border-slate-300 bg-white peer-checked:border-blue-600 peer-checked:border-[5px] transition-all duration-150" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-medium text-slate-800">{label}</span>
          {sublabel && <span className="text-xs text-slate-500 mt-0.5">{sublabel}</span>}
        </div>
      </label>
    );
  }
);

Radio.displayName = 'Radio';
