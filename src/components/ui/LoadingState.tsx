import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Memuat data...',
  fullScreen = false,
  className = '',
}) => {
  const content = (
    <div className={`flex flex-col items-center justify-center gap-3 p-8 text-center ${className}`}>
      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
      <p className="text-xs sm:text-sm font-medium text-slate-600">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-xs">
        {content}
      </div>
    );
  }

  return content;
};
