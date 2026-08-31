import React, { useState, useEffect } from 'react';
import { LogoEmblem } from '../common/LogoEmblem';
import { Sparkles, ArrowRight } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

const STATUS_MESSAGES = [
  'Menyiapkan file cerita...',
  'Memuat database karakter & relasi...',
  'Merapikan workspace kepenulisan...',
  'Menghubungkan draft darurat...',
  'Menginisialisasi Novel\'s Creator Studio...',
];

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    // Smooth progress timer from 0 to 100
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Increment between 2 to 5 percent per tick
        const next = prev + Math.floor(Math.random() * 4) + 2;
        return next > 100 ? 100 : next;
      });
    }, 45);

    return () => clearInterval(interval);
  }, []);

  // Cycle status message according to progress
  useEffect(() => {
    if (progress < 25) setStatusIndex(0);
    else if (progress < 50) setStatusIndex(1);
    else if (progress < 75) setStatusIndex(2);
    else if (progress < 95) setStatusIndex(3);
    else setStatusIndex(4);

    if (progress >= 100) {
      const timeout = setTimeout(() => {
        onFinish();
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [progress, onFinish]);

  return (
    <div
      id="splash-screen"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#121212] px-4 select-none overflow-hidden"
    >
      {/* Background Decorative Ambient Circles */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#8A1825]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 flex flex-col items-center max-w-md w-full text-center">
        {/* Pulsing Logo Emblem */}
        <div className="relative mb-6">
          <div className="animate-pulse">
            <LogoEmblem size={96} showGlow={true} />
          </div>
          <div className="absolute -top-1 -right-1 text-[#D4AF37] animate-bounce">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        {/* App Title with Serif Aesthetic */}
        <h1
          id="app-splash-title"
          className="font-editorial text-3xl sm:text-4xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#F7E298] via-[#D4AF37] to-[#FAF7EE] mb-2 drop-shadow-md"
        >
          Novel's Creator
        </h1>

        <p className="text-xs sm:text-sm text-[#9E9EB2] tracking-widest uppercase mb-8 font-medium">
          Story & Character Planner Wiki
        </p>

        {/* Loading Bar & Progress */}
        <div className="w-full bg-[#1E1E2E] border border-[#2A2A3C] rounded-full h-3 p-0.5 mb-3 shadow-inner relative overflow-hidden">
          <div
            id="splash-loading-bar"
            className="h-full rounded-full bg-gradient-to-r from-[#8A1825] via-[#D4AF37] to-[#F5D77F] transition-all duration-100 ease-out shadow-[0_0_12px_rgba(212,175,55,0.6)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Progress Percentage & Dynamic Status Label */}
        <div className="flex items-center justify-between w-full text-xs px-1 mb-6">
          <span
            id="splash-status-label"
            className="text-[#B5B5C9] transition-opacity duration-200 truncate pr-2 italic"
          >
            {STATUS_MESSAGES[statusIndex]}
          </span>
          <span className="text-[#D4AF37] font-mono font-semibold">
            {progress}%
          </span>
        </div>

        {/* Skip button if user wants immediate transition */}
        <button
          id="btn-skip-splash"
          onClick={onFinish}
          className="inline-flex items-center gap-1.5 text-xs text-[#7E7E94] hover:text-[#D4AF37] transition-colors py-1.5 px-3 rounded-lg border border-transparent hover:border-[#2A2A3C] hover:bg-[#1E1E2E]/60 cursor-pointer"
        >
          <span>Masuk Langsung</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom Version Tag */}
      <div className="absolute bottom-6 text-[11px] text-[#55556A] font-mono">
        Studio Edition v1.0 • Dark Mode Editorial
      </div>
    </div>
  );
};
