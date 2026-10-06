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
  Scale,
  Briefcase,
  Gavel,
  Building,
  Users,
  FileText,
  Clock,
  Calendar,
  AlertTriangle,
  FolderOpen,
  Activity,
  ShieldAlert,
  BarChart3,
  Lock,
  Send,
  UserCheck,
  FileCode
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

// ─────────────────────────────────────────────────────────────────────────────
// 1. CITIZEN TOUR STEPS
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// 2. JUDGE TOUR STEPS
// ─────────────────────────────────────────────────────────────────────────────
export const JUDGE_TOUR_STEPS: TourStep[] = [
  {
    targetId: 'tour-judge-stats',
    badge: 'Step 1 of 7 • Bench Overview',
    title: 'Interactive Judicial Metrics & Docket Counters',
    description: "Real-time summary of Today's Hearings, Pending Judicial Reviews, Total Active Assigned Dockets, and High Priority Track Matters. Click on any metric number to instantly open the Interactive Case Dossier Modal with complete proceedings history.",
    tip: 'Clicking any number filters and opens interactive case details with hearing times, petitioner details, and quick actions.',
    preferredPlacement: 'bottom',
    icon: Gavel,
  },
  {
    targetId: 'tour-judge-cause-list',
    badge: 'Step 2 of 7 • Daily Courtroom Listings',
    title: "Today's Cause List & Hearing Schedule",
    description: "Live hearing roster for your courtroom bench. Displays listing order (Item #1, Item #2), presiding courtroom numbers, scheduled hearing times, party names, and stages of proceedings (Admission, Bail, Final Hearing).",
    tip: 'Click "View Dossier" on any item to open the full digital case file with uploaded pleadings and evidence.',
    preferredPlacement: 'top',
    icon: Calendar,
  },
  {
    targetId: 'tour-judge-urgent-matters',
    badge: 'Step 3 of 7 • Urgent Injunctions & Bail',
    title: 'Urgent Judicial Review & Priority Matters',
    description: 'High-priority petitions requiring immediate judicial direction, ex-parte ad-interim injunctions, anticipatory bail applications under Section 438/482, and delay-risk flagged matters.',
    tip: 'Quickly pass directions, grant adjournments, or reserve orders directly from this workbench.',
    preferredPlacement: 'bottom',
    icon: AlertTriangle,
  },
  {
    targetId: 'tour-judge-ai-precedents',
    badge: 'Step 4 of 7 • Precedent Intelligence',
    title: 'AI Precedent Vector Search & Ratio Decidendi',
    description: 'Perform instantaneous semantic search across Supreme Court of India and High Court landmark precedents. Analyzes key legal issues, petitioner vs. respondent contentions, and operative final judgments.',
    tip: 'Use keywords or natural language questions to find binding ratio decidendi and good law status.',
    preferredPlacement: 'top',
    icon: Scale,
  },
  {
    targetId: 'tour-judge-summarizer',
    badge: 'Step 5 of 7 • Rapid Briefing',
    title: 'Automated Case Summarizer & Issue Extraction',
    description: 'Synthesizes thousands of pages of bulky pleadings, FIRs, and witness depositions into structured judicial briefs highlighting statutory provisions, disputed facts, and framed legal questions.',
    tip: 'Saves substantial bench time before oral arguments begin in complex commercial or criminal appeals.',
    preferredPlacement: 'top',
    icon: Sparkles,
  },
  {
    targetId: 'tour-judge-case-dossier',
    badge: 'Step 6 of 7 • Deep Investigation',
    title: 'Comprehensive Digital Case Workspace',
    description: 'Access the complete case folder: chronological daily orders, tagged exhibits, Section 65B electronic certificates, forensic reports, and court fee receipts.',
    tip: 'Click on any case number in the table to open its full workspace.',
    preferredPlacement: 'top',
    icon: FolderOpen,
  },
  {
    targetId: 'tour-judge-sidebar',
    badge: 'Step 7 of 7 • Judicial Navigation',
    title: 'Judicial Suite Navigation Sidebar',
    description: 'Quickly switch between Cause Lists, Order Dictation & Publishing, Bench Allocation, National Judicial Statistics, and Precedent Research Engine.',
    tip: 'All judicial tools and courtroom operations are accessible in one click from the sidebar.',
    preferredPlacement: 'right',
    icon: Layers,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 3. LAWYER TOUR STEPS
// ─────────────────────────────────────────────────────────────────────────────
export const LAWYER_TOUR_STEPS: TourStep[] = [
  {
    targetId: 'tour-lawyer-header',
    badge: 'Step 1 of 7 • Advocate Command Center',
    title: 'Advocate & Legal Counsel Portal',
    description: 'Welcome to your unified legal practice workspace. Track all your High Court and District Court briefs, client matters, upcoming appearances, and draft pleadings in one place.',
    tip: 'Your active bar credentials and assigned matters are automatically synchronized with the court registry.',
    preferredPlacement: 'bottom',
    icon: Briefcase,
  },
  {
    targetId: 'tour-lawyer-draft-btn',
    badge: 'Step 2 of 7 • Automated Drafter',
    title: 'AI Legal Drafting & Pleading Generator',
    description: 'Generate court-ready legal documents in seconds: Special Leave Petitions, Bail Applications, Section 138 NI Act Demand Notices, Written Statements, and Writ Petitions.',
    tip: 'Click "Draft Pleading Motion" to generate compliant templates with statutory citations and verification clauses.',
    preferredPlacement: 'bottom',
    icon: FileText,
  },
  {
    targetId: 'tour-lawyer-stats',
    badge: 'Step 3 of 7 • Brief Portfolio',
    title: 'Active Matters & Status Filters',
    description: 'Interactive portfolio counters for Total Assigned Briefs, Active/Pending Matters, Closed Cases, and Scheduled Hearings. Click on any category to instantly filter your case list.',
    tip: 'Click "Filter Pending" or "Filter All" to quickly organize your daily caseload.',
    preferredPlacement: 'bottom',
    icon: Clock,
  },
  {
    targetId: 'tour-lawyer-search',
    badge: 'Step 4 of 7 • Case Lookup',
    title: 'Instant Docket Search & Category Filter',
    description: 'Search your active client briefs by Party Name, Case Number, CNR Number, or Act. Combine search terms with status filters (Pending, Active, Closed) for fast access.',
    tip: 'Type any client name or FIR number to filter the docket table instantly.',
    preferredPlacement: 'bottom',
    icon: Search,
  },
  {
    targetId: 'tour-lawyer-cases',
    badge: 'Step 5 of 7 • Client Dossiers',
    title: 'Client Matter Dossiers & Case Files',
    description: 'View full client case files including petitioner/respondent details, presiding court bench, CNR number, next hearing date, and filing status badges.',
    tip: 'Click "Open Case File" to inspect uploaded pleadings, evidence exhibits, and previous court orders.',
    preferredPlacement: 'top',
    icon: FolderOpen,
  },
  {
    targetId: 'tour-lawyer-hearings',
    badge: 'Step 6 of 7 • Court Appearances',
    title: 'Court Appearance Schedule & Hearing Dates',
    description: 'Real-time calendar tracking your next court appearances, item numbers on the daily cause list, courtroom locations, and stages of proceedings.',
    tip: 'Never miss a hearing listing or cause list call with real-time appearance alerts.',
    preferredPlacement: 'top',
    icon: Calendar,
  },
  {
    targetId: 'tour-lawyer-sidebar',
    badge: 'Step 7 of 7 • Practice Tools',
    title: 'e-Courts Advocate Services Suite',
    description: 'Access the complete legal practice toolkit: e-Filing Portal, Online Court Fee Payment, Legal Research Engine, Similar Case Finder, and Summons Notice Generator.',
    tip: 'File petitions directly with the registry and calculate exact statutory fee slabs from the sidebar.',
    preferredPlacement: 'right',
    icon: Layers,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 4. STAFF / REGISTRY TOUR STEPS
// ─────────────────────────────────────────────────────────────────────────────
export const STAFF_TOUR_STEPS: TourStep[] = [
  {
    targetId: 'tour-staff-header',
    badge: 'Step 1 of 7 • Registry Desk',
    title: 'Court Staff & Registry Officer Portal',
    description: 'Welcome to the High Court Registry Command Center. Oversee active e-filing verification, docket admission, daily cause list generation, and official summons dispatch.',
    tip: 'The registry portal connects directly to the e-Courts judicial database for live status synchronization.',
    preferredPlacement: 'bottom',
    icon: Building,
  },
  {
    targetId: 'tour-staff-stats',
    badge: 'Step 2 of 7 • Scrutiny Metrics',
    title: 'Registry Workload & Live Status Counters',
    description: 'Real-time monitoring of Pending e-Filings Queue, Total Active Registry Dockets, Scheduled Court Hearings, and Dispatched Summons & Warrants.',
    tip: 'Keep track of daily filing quotas and pending scrutiny backlogs across all courtrooms.',
    preferredPlacement: 'bottom',
    icon: Clock,
  },
  {
    targetId: 'tour-staff-quick-actions',
    badge: 'Step 3 of 7 • Registry Launchpad',
    title: 'High-Speed Registry Action Buttons',
    description: 'Instant launchpad for core registry functions: Cause List Generator & Scheduler, Summons & Notice Generator, Online Court Fee Reconciliation, and Bench Allocation.',
    tip: 'Quickly generate formatted cause lists and issue QR-coded summons notices with one click.',
    preferredPlacement: 'bottom',
    icon: Sparkles,
  },
  {
    targetId: 'tour-staff-filings-queue',
    badge: 'Step 4 of 7 • Scrutiny Desk',
    title: 'Pending e-Filing Verification Queue',
    description: 'Review incoming petitions submitted by advocates and litigants. Inspect filing numbers, petitioner details, filing type (Writ, Bail, Commercial Suit), and assigned courtroom.',
    tip: 'Click "Update Status" to approve compliant petitions or flag defects with registry objection notes.',
    preferredPlacement: 'top',
    icon: FileCode,
  },
  {
    targetId: 'tour-staff-cause-list-btn',
    badge: 'Step 5 of 7 • Cause List Publishing',
    title: 'Daily Cause List Scheduler & Publishing',
    description: 'Compile, reorder, and publish official daily cause lists for all presiding judges and division benches. Automatically assigns item numbers and courtroom hearing slots.',
    tip: 'Published cause lists update instantly on advocate and citizen portals in real time.',
    preferredPlacement: 'bottom',
    icon: Calendar,
  },
  {
    targetId: 'tour-staff-summons-btn',
    badge: 'Step 6 of 7 • Summons Service',
    title: 'Digital Summons & Notice Generator',
    description: 'Issue official judicial summons, witness warrants, and legal notices with automatic seal stamping, QR-code verification, and speed post dispatch tracking.',
    tip: 'Ensures strict compliance with Civil Procedure Code (CPC) and Criminal Procedure Code (CrPC/BNSS) notice rules.',
    preferredPlacement: 'bottom',
    icon: Send,
  },
  {
    targetId: 'tour-staff-sidebar',
    badge: 'Step 7 of 7 • Registry Suite',
    title: 'Full Court Administration Navigation',
    description: 'Navigate across all registry desks: E-Filing Scrutiny, Cause Lists, Case Management, Bench Allocation, Audit Logs, and User Verification.',
    tip: 'Use the sidebar to jump directly to any administrative tool or courtroom docket.',
    preferredPlacement: 'right',
    icon: Layers,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 5. ADMIN TOUR STEPS
// ─────────────────────────────────────────────────────────────────────────────
export const ADMIN_TOUR_STEPS: TourStep[] = [
  {
    targetId: 'tour-admin-header',
    badge: 'Step 1 of 7 • System Governance',
    title: 'Court Administrator & Super-Admin Console',
    description: 'Master governance console for Lexora AI e-Courts Infrastructure. Manage user credentials, KYC verifications, bench allocations, system security, and national judicial analytics.',
    tip: 'Super-admin authority allows complete oversight over database integrity and AI model pipelines.',
    preferredPlacement: 'bottom',
    icon: ShieldCheck,
  },
  {
    targetId: 'tour-admin-verification-queue',
    badge: 'Step 2 of 7 • KYC & Role Approvals',
    title: 'Pending User KYC & Bar Verification Queue',
    description: 'Scrutinize advocate bar council registrations, judicial officer credentials, and registry staff applications. Review official ID proofs and approve or reject access with audit trail logging.',
    tip: 'Click "Verify Applicant" to inspect submitted bar certificates, identity documents, and assign permissions.',
    preferredPlacement: 'top',
    icon: UserCheck,
  },
  {
    targetId: 'tour-admin-bench-allocation',
    badge: 'Step 3 of 7 • Courtroom Management',
    title: 'Active Courtroom & Bench Allocation Matrix',
    description: 'Assign presiding judicial officers to specialized court divisions (Commercial Division, Criminal Appellate, Arbitration, Constitutional Bench) and allocate physical/virtual courtrooms.',
    tip: 'Click "Manage Allocations" to reassign courtrooms or update judicial division rosters.',
    preferredPlacement: 'top',
    icon: Building,
  },
  {
    targetId: 'tour-admin-security-ops',
    badge: 'Step 4 of 7 • Security & Emergency Ops',
    title: 'Security Lockdown & Disaster Recovery',
    description: 'Execute instant security lockdown protocols, rotate cryptographic keys, trigger automated encrypted database backups, and inspect immutable security audit trails.',
    tip: 'In case of anomalous activity, the Emergency Lockdown protocol isolates sensitive dockets immediately.',
    preferredPlacement: 'top',
    icon: ShieldAlert,
  },
  {
    targetId: 'tour-admin-system-health',
    badge: 'Step 5 of 7 • Infrastructure Observability',
    title: 'AI Pipeline & Infrastructure Observability',
    description: 'Live telemetry and health monitoring for Node.js Express API Gateway, Python FastAPI ML Pipeline, ChromaDB Precedent Vector Store, and SQLite/PostgreSQL Database.',
    tip: 'Click "Re-index Vector Store" to synchronize newly uploaded landmark judgments with ChromaDB.',
    preferredPlacement: 'top',
    icon: Activity,
  },
  {
    targetId: 'tour-admin-analytics',
    badge: 'Step 6 of 7 • Judicial Intelligence',
    title: 'National Judicial Statistics & Disposal Analytics',
    description: 'Institutional performance analytics: Case Clearance Rate (CCR), average disposal time, bench productivity metrics, pendency trends, and case age profiling.',
    tip: 'Export high-resolution PDF and Excel statistical reports for high court administrative committees.',
    preferredPlacement: 'top',
    icon: BarChart3,
  },
  {
    targetId: 'tour-admin-sidebar',
    badge: 'Step 7 of 7 • Admin Navigation',
    title: 'Complete Administrative Control Suite',
    description: 'Direct access to User Management, Audit Logs Viewer, System Health Dashboard, Bench Allocations, and E-Filing Oversight desks from the navigation sidebar.',
    tip: 'Everything you need to govern the e-Courts platform is organized into intuitive administrative modules.',
    preferredPlacement: 'right',
    icon: Layers,
  },
];

export interface RoleGuidedTourProps {
  role?: 'CITIZEN' | 'JUDGE' | 'LAWYER' | 'STAFF' | 'ADMIN';
  customSteps?: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export const RoleGuidedTour: React.FC<RoleGuidedTourProps> = ({
  role = 'CITIZEN',
  customSteps,
  isOpen,
  onClose,
  onComplete,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const steps = customSteps || (
    role === 'JUDGE' ? JUDGE_TOUR_STEPS :
    role === 'LAWYER' ? LAWYER_TOUR_STEPS :
    role === 'STAFF' ? STAFF_TOUR_STEPS :
    role === 'ADMIN' ? ADMIN_TOUR_STEPS :
    CITIZEN_TOUR_STEPS
  );

  const step = steps[currentStepIndex];

  // Recalculate target position
  const updatePosition = () => {
    if (!isOpen || !step) return;
    const el = document.getElementById(step.targetId);
    if (el) {
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
    if (currentStepIndex < steps.length - 1) {
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
          maxWidth: '460px',
        },
        arrowStyle: { display: 'none' },
        arrowDirection: 'down',
      };
    }

    const margin = 18;
    const tooltipWidth = Math.min(440, window.innerWidth - 32);
    const placement = step.preferredPlacement || 'bottom';

    let top = 0;
    let left = 0;
    let arrowDir: 'up' | 'down' | 'left' | 'right' = 'up';
    let arrowStyle: React.CSSProperties = {};

    const targetCenterX = targetRect.left + targetRect.width / 2;
    left = targetCenterX - tooltipWidth / 2;

    if (left < 16) left = 16;
    if (left + tooltipWidth > window.innerWidth - 16) {
      left = window.innerWidth - tooltipWidth - 16;
    }

    if (placement === 'bottom') {
      top = targetRect.bottom + margin;
      arrowDir = 'up';
      if (top + 290 > window.innerHeight && targetRect.top > 290) {
        top = targetRect.top - 290 - margin;
        arrowDir = 'down';
      }
    } else if (placement === 'top') {
      top = targetRect.top - 290 - margin;
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
    } else if (placement === 'left') {
      left = targetRect.left - tooltipWidth - margin;
      top = Math.max(16, targetRect.top);
      arrowDir = 'right';
      if (left < 16) {
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
    } else if (arrowDir === 'right') {
      arrowStyle = {
        right: '-10px',
        top: '28px',
        transform: 'rotate(90deg)',
      };
    }

    return {
      style: {
        position: 'fixed',
        top: `${Math.max(16, Math.min(window.innerHeight - 360, top))}px`,
        left: `${left}px`,
        width: `${tooltipWidth}px`,
      },
      arrowStyle,
      arrowDirection: arrowDir,
    };
  };

  const { style, arrowStyle } = getTooltipStyle();
  const Icon = step.icon;
  const isLast = currentStepIndex === steps.length - 1;
  const progressPct = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none select-none overflow-hidden">
      {/* Dark Ambient Backdrop */}
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

          {/* Title & Description */}
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
              {steps.map((_, idx) => (
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

export default RoleGuidedTour;
