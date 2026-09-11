import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  invert?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showTagline = false,
  invert = false,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
  };

  const titleSizes = {
    sm: 'text-base font-bold',
    md: 'text-xl font-bold tracking-tight',
    lg: 'text-2xl font-extrabold tracking-tight',
    xl: 'text-3xl font-extrabold tracking-tight',
  };

  const badgeSizes = {
    sm: 'text-[9px] px-1.5 py-0.2',
    md: 'text-[10px] px-2 py-0.5',
    lg: 'text-xs px-2.5 py-0.5',
    xl: 'text-sm px-3 py-1',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Geometric Monogram Symbol */}
      <div
        className={`${iconSizes[size]} relative flex items-center justify-center rounded-xl transition-transform duration-200 hover:scale-105 shadow-xs`}
        style={{
          background: invert
            ? 'linear-gradient(135deg, #1e3a8a 0%, #0284c7 100%)'
            : 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 70%, #0284c7 100%)',
        }}
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/5 h-3/5 text-white"
        >
          {/* Stylized interconnected Enterprise 'A' and '1' structure */}
          <path
            d="M20 6L32 30H25L20 18L15 30H8L20 6Z"
            fill="currentColor"
            fillOpacity="0.95"
          />
          <circle cx="20" cy="27" r="3" fill="#38bdf8" />
          <path
            d="M13.5 23H26.5"
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span
            className={`${titleSizes[size]} ${
              invert ? 'text-white' : 'text-slate-900'
            } font-sans leading-none`}
          >
            ARVORA
          </span>
          <span
            className={`font-semibold rounded-md uppercase tracking-wider font-sans leading-none ${badgeSizes[size]} ${
              invert
                ? 'bg-sky-400/20 text-sky-300 border border-sky-400/30'
                : 'bg-blue-50 text-blue-700 border border-blue-200/80'
            }`}
          >
            ONE
          </span>
        </div>
        {showTagline && (
          <span
            className={`text-[10px] tracking-wide uppercase mt-1 font-medium ${
              invert ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            All-in-One Business Management Platform
          </span>
        )}
      </div>
    </div>
  );
};
