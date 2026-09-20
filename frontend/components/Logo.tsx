import React from 'react';
import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true }) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const textMap = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-4xl',
  };

  return (
    <div className="flex items-center gap-3 select-none">
      <div className={`relative ${sizeMap[size]} rounded-2xl overflow-hidden p-0.5 bg-gradient-to-br from-pink-500 via-rose-600 to-purple-800 shadow-lg shadow-rose-500/30 flex items-center justify-center shrink-0`}>
        <img
          src="/logo.png"
          alt="Roxstar Logo"
          className="w-full h-full object-contain rounded-xl"
          onError={(e) => {
            // Fallback SVG if logo image load fails
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-black tracking-tight ${textMap[size]} bg-gradient-to-r from-white via-pink-200 to-pink-500 bg-clip-text text-transparent drop-shadow`}>
            ROXSTAR <span className="text-roxstar-pink">AI</span>
          </span>
          {size !== 'sm' && (
            <span className="text-[10px] tracking-widest uppercase font-semibold text-pink-400/80 -mt-1 font-mono">
              Voice Room Assistant
            </span>
          )}
        </div>
      )}
    </div>
  );
};
