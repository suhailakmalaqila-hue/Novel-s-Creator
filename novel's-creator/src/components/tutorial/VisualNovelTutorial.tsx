import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AppView } from '../../types';
import { TUTORIAL_STEPS } from '@/src/config/tutorial_step';
import {
  ChevronRight,
  ChevronLeft,
  X,
  RotateCcw,
  Glasses,
} from 'lucide-react';

interface VisualNovelTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  currentView?: AppView;
  onNavigate?: (view: AppView) => void;
}

export const VisualNovelTutorial: React.FC<VisualNovelTutorialProps> = ({
  isOpen,
  onClose,
  onComplete,
  onNavigate,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [doNotShowAgain, setDoNotShowAgain] = useState(false);

  const step = TUTORIAL_STEPS[currentStepIndex];
  const isFinalStep = currentStepIndex === TUTORIAL_STEPS.length - 1;
  const isFirstStep = currentStepIndex === 0;

  // Update target bounding rect dynamically
  const updateTargetRect = useCallback(() => {
    if (!isOpen || !step.targetSelector) {
      setTargetRect(null);
      return;
    }

    const el = document.querySelector(step.targetSelector);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  }, [isOpen, step.targetSelector]);

  // Navigate view and scroll to target when step changes
  useEffect(() => {
    if (!isOpen) return;

    if (step.requiredView && onNavigate) {
      onNavigate(step.requiredView);
    }

    // Allow DOM to settle before measuring
    const timeout = setTimeout(() => {
      if (step.targetSelector) {
        const el = document.querySelector(step.targetSelector);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      updateTargetRect();
    }, 150);

    return () => clearTimeout(timeout);
  }, [currentStepIndex, isOpen, step, onNavigate, updateTargetRect]);

  // Continuously monitor target position on scroll or resize
  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      updateTargetRect();
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    const interval = setInterval(updateTargetRect, 500);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      clearInterval(interval);
    };
  }, [isOpen, updateTargetRect]);

  // Typewriter effect
  useEffect(() => {
    if (!isOpen) return;

    setDisplayedText('');
    setIsTypingComplete(false);

    let charIdx = 0;
    const fullText = step.message;

    const timer = setInterval(() => {
      if (charIdx <= fullText.length) {
        setDisplayedText(fullText.slice(0, charIdx));
        charIdx++;
      } else {
        setIsTypingComplete(true);
        clearInterval(timer);
      }
    }, 14);

    return () => clearInterval(timer);
  }, [currentStepIndex, isOpen, step.message]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (!isTypingComplete) {
      setDisplayedText(step.message);
      setIsTypingComplete(true);
      return;
    }

    if (currentStepIndex < TUTORIAL_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
    onClose();
  };

  const handleReplay = () => {
    setCurrentStepIndex(0);
  };

  const handleFinish = () => {
    onComplete();
    onClose();
  };

  return (
    <div
      id="visual-novel-tutorial-container"
      className="fixed inset-0 z-50 overflow-hidden select-none"
    >
      {/* 1. SEMI-TRANSPARENT DARK OVERLAY WITH SPOTLIGHT PUNCH-OUT */}
      {targetRect ? (
        <svg
          className="fixed inset-0 w-full h-full pointer-events-none z-40 transition-all duration-300"
          style={{ width: '100vw', height: '100vh' }}
        >
          <defs>
            <mask id="spotlight-mask">
              {/* White background reveals the dark overlay */}
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {/* Black rounded rectangle punches out the spotlight hole */}
              <rect
                x={Math.max(0, targetRect.left - 10)}
                y={Math.max(0, targetRect.top - 10)}
                width={targetRect.width + 20}
                height={targetRect.height + 20}
                rx="16"
                ry="16"
                fill="black"
              />
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(10, 10, 18, 0.78)"
            mask="url(#spotlight-mask)"
          />
        </svg>
      ) : (
        <div className="fixed inset-0 bg-[#0A0A12]/80 backdrop-blur-[2px] pointer-events-none z-40 transition-opacity duration-300" />
      )}

      {/* 2. SPOTLIGHT HIGHLIGHT BORDER & DIRECTIONAL ARROW */}
      {targetRect && (
        <div
          className="fixed pointer-events-none z-40 transition-all duration-300"
          style={{
            top: Math.max(0, targetRect.top - 10),
            left: Math.max(0, targetRect.left - 10),
            width: targetRect.width + 20,
            height: targetRect.height + 20,
          }}
        >
          {/* Animated Gold Ring */}
          <div className="w-full h-full rounded-2xl border-2 border-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,0.45)] animate-pulse" />

          {/* Directional Indicator Badge */}
          <div className="absolute -top-7 left-3 bg-[#D4AF37] text-[#121212] font-black text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-lg flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#121212] animate-ping" />
            <span>Target Aktif</span>
          </div>
        </div>
      )}

      {/* 3. WIDE VISUAL NOVEL BOTTOM DIALOGUE BAR */}
      <div
        className="fixed inset-x-3 sm:inset-x-6 md:inset-x-12 lg:inset-x-16 bottom-3 sm:bottom-6 z-50 flex flex-col max-w-6xl mx-auto pointer-events-auto transition-all duration-300"
      >
        {/* WIDE DIALOGUE BOX SPANNING ACROSS THE BOTTOM */}
        <div
          id="tutorial-dialogue-box"
          className="w-full bg-[#141422]/95 backdrop-blur-2xl border-2 border-[#D4AF37]/70 rounded-3xl p-5 sm:p-7 md:px-8 shadow-[0_15px_60px_rgba(0,0,0,0.85),0_0_35px_rgba(212,175,55,0.2)] flex flex-col justify-between relative overflow-hidden group"
        >
          {/* Gold Decorative Corner Lines */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#D4AF37]/20 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#D4AF37]/10 to-transparent pointer-events-none" />

          {/* Top Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/5">
            <div
              className="h-full bg-gradient-to-r from-[#D4AF37] to-[#FAF7EE] transition-all duration-300"
              style={{
                width: `${((currentStepIndex + 1) / TUTORIAL_STEPS.length) * 100}%`,
              }}
            />
          </div>

          {/* Top Header Row: Speaker Label & Step Progress */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 relative z-10">
            {/* Mascot Speaker Name Tag Badge */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-[#D4AF37] to-[#B89225] text-[#121212] px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] rounded-full shadow-[0_2px_12px_rgba(212,175,55,0.4)] flex items-center gap-1.5">
                <Glasses className="w-3.5 h-3.5" />
                <span>Suhail • Pemandu Studio</span>
              </div>
              <span className="text-xs text-[#A0A0B8] hidden sm:inline font-mono">
                {step.subtitle}
              </span>
            </div>

            {/* Step Counter Indicator */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#D4AF37] px-3 py-1 bg-[#1E1E30] rounded-lg border border-[#D4AF37]/30">
                {currentStepIndex + 1} / {TUTORIAL_STEPS.length}
              </span>
              <button
                id="btn-tutorial-skip-x"
                onClick={handleSkip}
                className="text-[#8E8EA4] hover:text-[#FAF7EE] p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                title="Lewati Tutorial"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Dialogue Text Content with Typewriter Effect */}
          <div
            onClick={() => {
              if (!isTypingComplete) {
                setDisplayedText(step.message);
                setIsTypingComplete(true);
              }
            }}
            className="cursor-pointer min-h-[85px] sm:min-h-[95px] flex flex-col justify-center py-1 relative z-10"
          >
            <div className="flex items-center gap-2 mb-2">
              {step.icon}
              <h4 className="font-serif text-lg sm:text-2xl font-bold text-[#FAF7EE] tracking-tight">
                {step.title}
              </h4>
            </div>

            <p className="font-sans text-sm sm:text-base md:text-lg text-[#FAF7EE]/95 leading-relaxed antialiased font-normal">
              "{displayedText}"
              {!isTypingComplete && (
                <span className="inline-block w-2 h-4 bg-[#D4AF37] ml-1.5 animate-pulse" />
              )}
            </p>

            {!isTypingComplete && (
              <span className="text-[9px] font-mono text-[#D4AF37]/70 uppercase tracking-widest mt-2 self-end">
                Klik untuk menampilkan semua ↵
              </span>
            )}
          </div>

          {/* Bottom Action Controls: Back | Next | Skip */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 mt-2 border-t border-white/10 relative z-10">
            {/* Left: Back Button or Replay on completion */}
            <div className="flex items-center gap-3">
              {!isFirstStep && (
                <button
                  id="btn-tutorial-back"
                  type="button"
                  onClick={handlePrev}
                  className="py-2.5 px-5 rounded-xl bg-white/5 hover:bg-white/10 text-[#C8C8DC] hover:text-white border border-white/10 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Kembali</span>
                </button>
              )}

              {isFinalStep && (
                <button
                  id="btn-tutorial-replay"
                  type="button"
                  onClick={handleReplay}
                  className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Ulangi Panduan</span>
                </button>
              )}

              {/* Skip Tutorial Button */}
              {!isFinalStep && (
                <button
                  id="btn-tutorial-skip"
                  type="button"
                  onClick={handleSkip}
                  className="py-2 px-3 text-[#8E8EA4] hover:text-[#FAF7EE] text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer"
                >
                  Lewati Tutorial
                </button>
              )}
            </div>

            {/* Right: Primary Action Button (Next / Start Writing) */}
            <div className="flex items-center gap-3 justify-end">
              {isFinalStep && (
                <label className="flex items-center gap-1.5 text-xs text-[#A6A6BC] mr-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={doNotShowAgain}
                    onChange={(e) => setDoNotShowAgain(e.target.checked)}
                    className="rounded border-[#2A2A3C] text-[#D4AF37] focus:ring-[#D4AF37]"
                  />
                  <span>Jangan Tampilkan Lagi</span>
                </label>
              )}

              <button
                id="btn-tutorial-next"
                type="button"
                onClick={handleNext}
                className="py-3 px-8 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89225] hover:from-[#E4BF47] hover:to-[#CA9F2A] text-[#121212] font-black text-xs sm:text-sm uppercase tracking-[0.15em] flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(212,175,55,0.35)] transition-all cursor-pointer whitespace-nowrap"
              >
                <span>
                  {isFirstStep
                    ? 'Mulai Tutorial'
                    : isFinalStep
                    ? 'Mulai Menulis'
                    : isTypingComplete
                    ? 'Lanjut'
                    : 'Tampilkan Lengkap'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
