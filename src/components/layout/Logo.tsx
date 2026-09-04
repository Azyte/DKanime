import React from 'react';
import { Link } from 'react-router-dom';

interface LogoIconProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const LogoIcon: React.FC<LogoIconProps> = ({ size = 'md', className = '' }) => {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const dimMap = {
    sm: 28,
    md: 36,
    lg: 48,
    xl: 64
  };

  const dim = dimMap[size] || 36;

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 via-indigo-500 to-fuchsia-500 p-[1.5px] shadow-lg shadow-cyan-500/25 group-hover:shadow-cyan-400/50 transition-all duration-300 ${sizeMap[size]} ${className}`}
    >
      <div className="w-full h-full bg-[#07090e] rounded-[10px] flex items-center justify-center overflow-hidden relative">
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/15 via-transparent to-fuchsia-500/15" />

        <svg
          width={dim * 0.75}
          height={dim * 0.75}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 drop-shadow-[0_2px_8px_rgba(6,182,212,0.6)] transform group-hover:scale-110 transition-transform duration-300"
        >
          <defs>
            <linearGradient id="dk-grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f2fe" />
              <stop offset="50%" stopColor="#4facfe" />
              <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>
            <linearGradient id="dk-grad-accent" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="50%" stopColor="#d946ef" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Stylized 'D' - Left Shield Arc with forward speed cut */}
          <path
            d="M 22 20 
               C 22 17, 25 15, 29 15 
               L 42 15 
               C 58 15, 68 25, 68 40 
               C 68 47, 65 53, 60 57 
               L 46 57 
               C 51 51, 53 45, 53 40 
               C 53 29, 46 25, 38 25 
               L 34 25 
               L 34 75 
               C 34 81, 22 81, 22 75 
               Z"
            fill="url(#dk-grad-primary)"
          />

          {/* Stylized 'K' & Play Chevron (>): dynamic blade driving forward */}
          <path
            d="M 44 48 
               L 66 22 
               C 68 20, 74 22, 75 25 
               C 76 28, 74 31, 71 34 
               L 55 52 
               L 75 75 
               C 78 78, 75 83, 70 83 
               C 67 83, 64 81, 62 78 
               L 44 56 
               Z"
            fill="url(#dk-grad-accent)"
          />

          {/* Kinetic Play Spark / Shuriken Core */}
          <polygon
            points="58,50 68,45 80,50 68,55"
            fill="#ffffff"
            className="animate-pulse"
          />

          {/* Neon energy point */}
          <circle cx="82" cy="50" r="3" fill="#00f2fe" filter="url(#glow)" />
        </svg>
      </div>
    </div>
  );
};

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  showBadge?: boolean;
  className?: string;
  asLink?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = true,
  showBadge = true,
  className = '',
  asLink = true
}) => {
  const content = (
    <div className={`flex items-center gap-2.5 group focus:outline-none select-none ${className}`}>
      <LogoIcon size={size} />
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans flex items-center">
            DK
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-fuchsia-400 font-extrabold ml-0.5">
              anime
            </span>
          </span>
          {showBadge && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 hidden sm:inline-block shadow-[0_0_8px_rgba(6,182,212,0.2)]">
              PRO
            </span>
          )}
        </div>
        {showTagline && (
          <span className="text-[9.5px] sm:text-[10px] tracking-[0.18em] text-slate-400 font-semibold uppercase mt-0.5 flex items-center gap-1">
            <span>STREAMING</span>
            <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-cyan-400 font-medium">ULTRA HD</span>
          </span>
        )}
      </div>
    </div>
  );

  if (asLink) {
    return (
      <Link to="/" aria-label="DKanime - Next-Gen Anime Streaming">
        {content}
      </Link>
    );
  }

  return content;
};
