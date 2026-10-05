import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  CheckCircle2,
  Globe,
  ShieldCheck,
  Calculator,
  Search,
  Bot,
  Layers,
  Lightbulb,
  Maximize2
} from 'lucide-react';

export interface TourStep {
  targetId: string;
  title: string;
  badge: string;
  description: string;
  tip: string;
  preferredPlacement?: 'bottom' | 'top' | 'left' | 'right';
  icon: React.ComponentType<{ className?: string }>;
}

export const CITIZEN_TOUR_STEPS: TourStep[] = [
  {
    targetId: 'tour-language-selector',
    badge: 'Step 1 of 7 • Accessibility',
    title: 'Choose Your Preferred Language',
    description: 'Switch the entire portal into your native language at any time. Supports English, Hindi (हिंदी), Marathi (मराठी), Tamil (தமிழ்), Bengali (বাংলা), Gujarati (ગુજરાતી), and Telugu (తెలుగు).',
    tip: 'Click this dropdown to instantly translate procedural guides, checklists, and labels.',
    preferredPlacement: 'bottom',
    icon: Globe,
  },
  {
    targetId: 'tour-legal-aid',
    badge: 'Step 2 of 7 • Free Counsel',
    title: 'Apply for Free Legal Aid (DLSA)',
    description: 'Under Section 12 of the Legal Services Authorities Act, eligible citizens (women, children, SC/ST, custody undertrials, or annual income < ₹3L) receive 100% free legal representation.',
    tip: 'Generate a ready-to-submit official formal application for the District Legal Services Authority.',
    preferredPlacement: 'bottom',
    icon: ShieldCheck,
  },
  {
    targetId: 'tour-notice-decipherer',
    badge: 'Step 3 of 7 • Plain Language',
    title: 'Notice & Summons Decipherer',
    description: 'Received a court notice or police summons? Paste the text or select a demo notice to convert confusing legalese into plain English or regional languages.',
    tip: 'Identifies critical deadlines, mandatory personal appearances, and step-by-step remedies.',
    preferredPlacement: 'bottom',
    icon: Sparkles,
  },
  {
    targetId: 'tour-fee-calculator',
    badge: 'Step 4 of 7 • Finance & Filing',
    title: 'Court Fee & Stamp Duty Calculator',
    description: 'Calculate ad-valorem court fees, vakalatnama stamps, and legal aid welfare charges for District and High Court suits before filing.',
    tip: 'Avoid court registry objections by checking your exact statutory fee slab.',
    preferredPlacement: 'bottom',
    icon: Calculator,
  },
  {
    targetId: 'tour-case-lookup',
    badge: 'Step 5 of 7 • Case Tracking',
    title: 'Live Case Status & History',
    description: 'Track any pending or disposed case in seconds. Enter your Case Number (e.g. WP(C) 412/2024 or CIV.SUIT 104/2025) or 16-digit CNR Number.',
    tip: 'View the presiding judge, next scheduled hearing date, courtroom, and full proceedings history.',
    preferredPlacement: 'bottom',
    icon: Search,
  },
  {
    targetId: 'tour-voice-ai',
    badge: 'Step 6 of 7 • Voice & AI Assistance',
    title: 'Voice-Enabled AI Legal Assistant',
    description: 'Have questions about your legal rights or court etiquette? Click the microphone icon to speak naturally or type your question.',
    tip: 'The AI assistant answers in simple language with citations to Indian statutes and verified precedents.',
    preferredPlacement: 'top',
    icon: Bot,
  },
  {
    targetId: 'tour-sidebar-services',
    badge: 'Step 7 of 7 • Full Services',
    title: 'All e-Courts Citizen Services',
    description: 'Access the complete suite of digital judicial services from the navigation sidebar: Cause Lists, Order Downloads, Online Fee Payments, and direct e-Filing of petitions.',
    tip: 'Everything you need to interact with the court system is organized in one unified workstation.',
    preferredPlacement: 'right',
    icon: Layers,
  },
];

interface CitizenGuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export const CitizenGuidedTour: React.FC<CitizenGuidedTourProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const step = CITIZEN_TOUR_STEPS[currentStepIndex];

  // Recalculate target position
  const updatePosition = () => {
    if (!isOpen || !step) return;
    const el = document.getElementById(step.targetId);
    if (el) {
      // Smooth scroll target into view if needed
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      setTargetRect(null);
      return;
    }

    // Small delay to allow layout/render
    const timer = setTimeout(() => {
      updatePosition();
    }, 150);

    const handleResize = () => updatePosition();
    const handleScroll = () => {
      const el = document.getElementById(step.targetId);
      if (el) setTargetRect(el.getBoundingClientRect());
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen, currentStepIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStepIndex < CITIZEN_TOUR_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      if (onComplete) onComplete();
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  // Determine tooltip placement and arrow position
  const getTooltipStyle = (): {
    style: React.CSSProperties;
    arrowStyle: React.CSSProperties;
    arrowDirection: 'up' | 'down' | 'left' | 'right';
  } => {
    if (!targetRect) {
      return {
        style: {
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '440px',
        },
        arrowStyle: { display: 'none' },
        arrowDirection: 'down',
      };
    }

    const margin = 18;
    const tooltipWidth = Math.min(420, window.innerWidth - 32);
    const placement = step.preferredPlacement || 'bottom';

    let top = 0;
    let left = 0;
    let arrowDir: 'up' | 'down' | 'left' | 'right' = 'up';
    let arrowStyle: React.CSSProperties = {};

    // Center horizontally relative to target by default
    const targetCenterX = targetRect.left + targetRect.width / 2;
    left = targetCenterX - tooltipWidth / 2;

    // Clamp horizontally to screen bounds
    if (left < 16) left = 16;
    if (left + tooltipWidth > window.innerWidth - 16) {
      left = window.innerWidth - tooltipWidth - 16;
    }

    if (placement === 'bottom') {
      top = targetRect.bottom + margin;
      arrowDir = 'up';
      // If bottom overflows window, flip to top
      if (top + 280 > window.innerHeight && targetRect.top > 280) {
        top = targetRect.top - 280 - margin;
        arrowDir = 'down';
      }
    } else if (placement === 'top') {
      top = targetRect.top - 280 - margin;
      arrowDir = 'down';
      if (top < 16) {
        top = targetRect.bottom + margin;
        arrowDir = 'up';
      }
    } else if (placement === 'right') {
      left = targetRect.right + margin;
      top = Math.max(16, targetRect.top);
      arrowDir = 'left';
      if (left + tooltipWidth > window.innerWidth - 16) {
        left = 16;
        top = targetRect.bottom + margin;
        arrowDir = 'up';
      }
    }

    const arrowOffsetLeft = Math.max(
      24,
      Math.min(tooltipWidth - 24, targetCenterX - left)
    );

    if (arrowDir === 'up') {
      arrowStyle = {
        top: '-10px',
        left: `${arrowOffsetLeft}px`,
        transform: 'translateX(-50%)',
      };
    } else if (arrowDir === 'down') {
      arrowStyle = {
        bottom: '-10px',
        left: `${arrowOffsetLeft}px`,
        transform: 'translateX(-50%) rotate(180deg)',
      };
    } else if (arrowDir === 'left') {
      arrowStyle = {
        left: '-10px',
        top: '28px',
        transform: 'rotate(-90deg)',
      };
    }

    return {
      style: {
        position: 'fixed',
        top: `${Math.max(16, Math.min(window.innerHeight - 340, top))}px`,
        left: `${left}px`,
        width: `${tooltipWidth}px`,
      },
      arrowStyle,
      arrowDirection: arrowDir,
    };
  };

  const { style, arrowStyle, arrowDirection } = getTooltipStyle();
  const Icon = step.icon;
  const isLast = currentStepIndex === CITIZEN_TOUR_STEPS.length - 1;
  const progressPct = ((currentStepIndex + 1) / CITIZEN_TOUR_STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none select-none overflow-hidden">
      {/* Dark Ambient Backdrop with Cutout Highlight Effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.65 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/80 pointer-events-auto"
        onClick={onClose}
      />

      {/* Target Element Spotlight / Bounding Box Ring */}
      {targetRect && (
        <motion.div
          key={step.targetId}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed pointer-events-none rounded-xl transition-all duration-300 z-50"
          style={{
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
            boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.75), 0 0 25px rgba(201, 162, 75, 0.9)',
            border: '2px solid #C9A24B',
          }}
        >
          {/* Animated Pulsing Pointer Ping */}
          <span className="absolute -top-2 -right-2 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C9A24B] opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-[#C9A24B]" />
          </span>
        </motion.div>
      )}

      {/* Step Callout Tooltip Card with Arrow Pointer */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStepIndex}
          ref={tooltipRef}
          initial={{ opacity: 0, y: 15, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.96 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          style={style}
          className="pointer-events-auto z-50 bg-white dark:bg-slate-900 border-2 border-[#C9A24B] text-slate-800 dark:text-slate-100 rounded-2xl shadow-2xl p-5 flex flex-col gap-3.5 backdrop-blur-md"
        >
          {/* Animated Arrow Mark pointing directly to the target */}
          <div
            style={arrowStyle}
            className="absolute z-10 w-0 h-0 border-x-8 border-x-transparent border-b-8 border-b-[#C9A24B]"
          />

          {/* Header Row: Badge & Close Button */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#C9A24B]/15 text-[#C9A24B] font-bold">
                <Icon className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-[#C9A24B]">
                {step.badge}
              </span>
            </div>
            <button
              onClick={onClose}
              title="Close Tutorial"
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Title & Arrow Pointer Callout */}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-serif font-bold text-slate-900 dark:text-white leading-tight">
                {step.title}
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Actionable Tip Box */}
          <div className="flex items-start gap-2 bg-[#C9A24B]/10 dark:bg-[#C9A24B]/15 border border-[#C9A24B]/30 rounded-xl p-2.5 text-[11px] text-slate-700 dark:text-slate-200">
            <Lightbulb className="w-4 h-4 text-[#C9A24B] shrink-0 mt-0.5" />
            <span className="leading-snug">{step.tip}</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <motion.div
              className="bg-[#C9A24B] h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Navigation Controls: Back, Next, Dots */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              {CITIZEN_TOUR_STEPS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentStepIndex
                      ? 'w-5 bg-[#C9A24B]'
                      : 'w-1.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                  }`}
                  aria-label={`Jump to step ${idx + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {currentStepIndex > 0 && (
                <button
                  onClick={handlePrev}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>
              )}

              <button
                onClick={handleNext}
                className="px-4 py-1.5 text-xs font-bold bg-[#C9A24B] hover:bg-[#b59140] text-slate-950 rounded-lg shadow transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                {isLast ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Finish Tour
                  </>
                ) : (
                  <>
                    Next Step
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
