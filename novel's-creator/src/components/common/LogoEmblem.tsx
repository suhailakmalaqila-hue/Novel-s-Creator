import React from 'react';

interface LogoEmblemProps {
  className?: string;
  size?: number;
  showGlow?: boolean;
}

export const LogoEmblem: React.FC<LogoEmblemProps> = ({
  className = '',
  size = 56,
  showGlow = true,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {showGlow && (
        <div
          className="absolute inset-0 rounded-2xl blur-lg bg-gradient-to-tr from-[#D4AF37]/30 via-[#A83232]/20 to-[#D4AF37]/10"
          aria-hidden="true"
        />
      )}
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 transition-transform duration-300 hover:scale-105"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5D77F" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#997316" />
          </linearGradient>

          <linearGradient id="scarfGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E24A4A" />
            <stop offset="50%" stopColor="#9E1D2A" />
            <stop offset="100%" stopColor="#5E0F17" />
          </linearGradient>

          <linearGradient id="bookCoverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2C2C44" />
            <stop offset="100%" stopColor="#181826" />
          </linearGradient>

          <linearGradient id="pageGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FAF7EE" />
            <stop offset="100%" stopColor="#E2DCBF" />
          </linearGradient>

          <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#D4AF37" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* Outer Shield / Geometric Backing */}
        <rect
          x="12"
          y="12"
          width="96"
          height="96"
          rx="22"
          fill="#1E1E2E"
          stroke="url(#goldGrad)"
          strokeWidth="2"
        />

        {/* Outer Corner Filigree Accents */}
        <circle cx="20" cy="20" r="2.5" fill="url(#goldGrad)" />
        <circle cx="100" cy="20" r="2.5" fill="url(#goldGrad)" />
        <circle cx="20" cy="100" r="2.5" fill="url(#goldGrad)" />
        <circle cx="100" cy="100" r="2.5" fill="url(#goldGrad)" />

        {/* Open Book Base (Grimoire) */}
        {/* Left Page Shadow & Base */}
        <path
          d="M 28 42 C 42 42 55 46 60 52 L 60 84 C 55 78 42 75 28 75 Z"
          fill="url(#bookCoverGrad)"
          stroke="#383854"
          strokeWidth="1.5"
        />
        {/* Right Page Shadow & Base */}
        <path
          d="M 92 42 C 78 42 65 46 60 52 L 60 84 C 65 78 78 75 92 75 Z"
          fill="url(#bookCoverGrad)"
          stroke="#383854"
          strokeWidth="1.5"
        />

        {/* Left Book Pages Stack */}
        <path
          d="M 30 40 C 44 40 56 44 60 50 L 60 80 C 56 75 44 72 30 72 Z"
          fill="url(#pageGrad)"
        />
        {/* Right Book Pages Stack */}
        <path
          d="M 90 40 C 76 40 64 44 60 50 L 60 80 C 64 75 76 72 90 72 Z"
          fill="url(#pageGrad)"
        />

        {/* Book Spine Center Line */}
        <line x1="60" y1="48" x2="60" y2="82" stroke="url(#goldGrad)" strokeWidth="2.5" strokeLinecap="round" />

        {/* Page Script Lines (Left & Right) */}
        <line x1="36" y1="48" x2="52" y2="52" stroke="#8A826B" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
        <line x1="36" y1="54" x2="52" y2="58" stroke="#8A826B" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
        <line x1="36" y1="60" x2="48" y2="63" stroke="#8A826B" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />

        <line x1="84" y1="48" x2="68" y2="52" stroke="#8A826B" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
        <line x1="84" y1="54" x2="68" y2="58" stroke="#8A826B" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
        <line x1="84" y1="60" x2="72" y2="63" stroke="#8A826B" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />

        {/* Elegant Draped Scarf wrapping gracefully around the book */}
        {/* Top Scarf Ribbon Arch */}
        <path
          d="M 22 56 C 24 32 46 26 60 26 C 74 26 96 32 98 56 C 88 50 72 48 60 52 C 48 48 32 50 22 56 Z"
          fill="url(#scarfGrad)"
          stroke="url(#goldGrad)"
          strokeWidth="1.5"
        />

        {/* Golden Embroidered Nordic / Story Pattern on Scarf */}
        <path
          d="M 46 32 L 52 38 L 60 30 L 68 38 L 74 32"
          stroke="url(#goldGrad)"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Left Scarf Flowing Tail draping down with tassels */}
        <path
          d="M 24 58 C 22 68 20 78 26 92 C 30 94 36 90 34 82 C 32 72 32 64 36 56 Z"
          fill="url(#scarfGrad)"
          stroke="#E24A4A"
          strokeWidth="1"
        />
        {/* Gold Tassels Left */}
        <line x1="26" y1="92" x2="25" y2="97" stroke="url(#goldGrad)" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="29" y1="93" x2="29" y2="98" stroke="url(#goldGrad)" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="33" y1="91" x2="33" y2="96" stroke="url(#goldGrad)" strokeWidth="1.8" strokeLinecap="round" />

        {/* Right Scarf Flowing Tail draping gracefully across front */}
        <path
          d="M 94 58 C 96 70 88 84 76 94 C 72 90 76 82 82 76 C 88 70 90 62 86 54 Z"
          fill="url(#scarfGrad)"
          stroke="url(#goldGrad)"
          strokeWidth="1.2"
        />
        {/* Gold Tassels Right */}
        <line x1="76" y1="94" x2="74" y2="99" stroke="url(#goldGrad)" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="79" y1="92" x2="78" y2="97" stroke="url(#goldGrad)" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="82" y1="88" x2="82" y2="93" stroke="url(#goldGrad)" strokeWidth="1.8" strokeLinecap="round" />

        {/* Golden Quill Pen across the center with sparkle */}
        <path
          d="M 78 24 C 68 36 54 52 46 68 L 48 70 C 58 60 74 42 82 28 C 82 24 80 23 78 24 Z"
          fill="url(#goldGrad)"
          filter="url(#goldGlow)"
        />
        <circle cx="82" cy="24" r="2" fill="#FFFFFF" />

        {/* Sparkle Twinkle Stars */}
        <path
          d="M 96 28 L 98 33 L 103 35 L 98 37 L 96 42 L 94 37 L 89 35 L 94 33 Z"
          fill="url(#goldGrad)"
        />
        <path
          d="M 22 34 L 23 37 L 26 38 L 23 39 L 22 42 L 21 39 L 18 38 L 21 37 Z"
          fill="url(#goldGrad)"
          opacity="0.8"
        />
      </svg>
    </div>
  );
};
