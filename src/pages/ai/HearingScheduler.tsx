import React, { useState } from 'react';
import { Calendar, Clock, Building2, Check, AlertTriangle } from 'lucide-react';
import { AiReviewBadge } from '@/components/common/AiReviewBadge';

export const HearingScheduler = () => {
  const [selectedCase, setSelectedCase] = useState('WP(C) 412/2024');
  const [suggestedSlot, setSuggestedSlot] = useState<any>({
    date: '2026-10-15',
    time: '10:30 AM',
    courtroom: 'Courtroom No. 4 (Bench II)',
    rationale: 'Optimized for low backlog on morning session. Presiding officer Justice Rajesh Sharma has scheduled commercial writ list.',
    workloadScore: 'Optimal (14% docket load)'
  });
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirmSchedule = () => {
    setConfirmed(true);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-subtle pb-4">
        <h1 className="text-2xl font-serif font-bold theme-heading">
          AI Hearing Scheduler & Courtroom Allocator
        </h1>
        <p className="theme-subtext text-sm mt-1">
          Intelligent listing date recommendation and courtroom allocation based on judicial backlog & bench availability.
        </p>
      </div>

      <div className="theme-card rounded-xl border border-subtle p-6 space-y-4 shadow-xl">
        <div className="max-w-md">
          <label className="block text-xs font-semibold theme-heading mb-1">Select Active Matter:</label>
          <select 
            value={selectedCase}
            onChange={(e) => setSelectedCase(e.target.value)}
            className="w-full p-2.5 text-xs theme-elevated border border-subtle rounded outline-none font-bold theme-heading"
          >
            <option value="WP(C) 412/2024">WP(C) 412/2024 — State Bank of India vs. Apex Enterprises</option>
            <option value="CRL.A. 9912/2023">CRL.A. 9912/2023 — State of Maharashtra vs. Deshmukh</option>
            <option value="CIV.SUIT 104/2025">CIV.SUIT 104/2025 — Ramesh Patel vs. Municipal Corporation</option>
          </select>
        </div>

        <div className="border-t border-subtle pt-4">
          <AiReviewBadge statusText="Hearing date suggestion requires Bench Officer sign-off" />

          <div className="theme-elevated border border-subtle p-5 rounded space-y-3">
            <div className="flex justify-between items-center border-b border-subtle pb-2">
              <span className="font-bold theme-heading text-sm">AI Suggested Listing Slot</span>
              <span className="px-2 py-0.5 badge-supported text-xs font-bold rounded">
                {suggestedSlot.workloadScore}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 theme-card border border-subtle rounded">
                <span className="theme-subtext block font-medium">Suggested Date:</span>
                <span className="font-bold theme-heading">{suggestedSlot.date}</span>
              </div>
              <div className="p-3 theme-card border border-subtle rounded">
                <span className="theme-subtext block font-medium">Session Time:</span>
                <span className="font-bold theme-heading">{suggestedSlot.time}</span>
              </div>
              <div className="p-3 theme-card border border-subtle rounded">
                <span className="theme-subtext block font-medium">Allocated Courtroom:</span>
                <span className="font-bold theme-heading">{suggestedSlot.courtroom}</span>
              </div>
            </div>

            <p className="text-xs theme-heading theme-card p-3 rounded border border-subtle">
              <strong>LLM Scheduling Rationale:</strong> {suggestedSlot.rationale}
            </p>

            <button
              onClick={handleConfirmSchedule}
              disabled={confirmed}
              className={`px-5 py-2.5 text-xs font-bold rounded flex items-center gap-1.5 cursor-pointer ${
                confirmed 
                  ? 'bg-emerald-600 text-white cursor-default' 
                  : 'theme-primary-btn'
              }`}
            >
              <Check className="w-4 h-4" />
              {confirmed ? 'Hearing Confirmed & List Updated' : 'Confirm & Schedule Hearing'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HearingScheduler;
