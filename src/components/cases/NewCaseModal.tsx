import React, { useState } from 'react';
import { FolderPlus, X } from 'lucide-react';
import type { CaseItem } from '@/data/mockData';

interface NewCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCase: (newCase: CaseItem) => void;
}

export const NewCaseModal: React.FC<NewCaseModalProps> = ({ isOpen, onClose, onAddCase }) => {
  const todayIso = new Date().toISOString().split('T')[0];

  const [caseNumber, setCaseNumber] = useState(`WP(C) ${Math.floor(100 + Math.random() * 900)}/2026`);
  const [title, setTitle] = useState('');
  const [petitioner, setPetitioner] = useState('State Bank of India');
  const [respondent, setRespondent] = useState('Apex Enterprises Ltd.');
  const [division, setDivision] = useState('Commercial Division');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [nextHearing, setNextHearing] = useState(todayIso);
  const [dateError, setDateError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (nextHearing < todayIso) {
      setDateError('Scheduled hearing date cannot be in the past. Please select today or a future date.');
      return;
    }

    const item: CaseItem = {
      id: `case_${Date.now()}`,
      caseNumber,
      title: title || `${petitioner} vs. ${respondent}`,
      petitioner,
      respondent,
      status: 'Pending',
      priority,
      division,
      filingDate: todayIso,
      nextHearing,
      judge: 'Hon\'ble Justice Rajesh Sharma',
      court: 'High Court of Judicature',
      type: 'Civil Writ Petition',
      description: 'New judicial petition filed in Master Case Registry.'
    };

    onAddCase(item);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="theme-card border border-subtle rounded-xl w-full max-w-md theme-heading shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 theme-header border-b border-subtle flex justify-between items-center">
          <h2 className="text-base font-serif font-bold theme-heading flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-[var(--primary-accent)]" />
            File New Judicial Case Entry
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-500/10 theme-subtext hover:theme-heading">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3 text-xs">
          <div>
            <label className="block text-xs font-semibold theme-subtext mb-1">Case Number (CNR / Registration):</label>
            <input
              type="text"
              required
              value={caseNumber}
              onChange={(e) => setCaseNumber(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#151E27] border border-subtle rounded-md theme-heading font-mono font-bold outline-none focus:border-[var(--primary-accent)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold theme-subtext mb-1">Petitioner:</label>
              <input
                type="text"
                required
                value={petitioner}
                onChange={(e) => setPetitioner(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#151E27] border border-subtle rounded-md theme-heading outline-none focus:border-[var(--primary-accent)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold theme-subtext mb-1">Respondent:</label>
              <input
                type="text"
                required
                value={respondent}
                onChange={(e) => setRespondent(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#151E27] border border-subtle rounded-md theme-heading outline-none focus:border-[var(--primary-accent)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold theme-subtext mb-1">Case Title Summary:</label>
            <input
              type="text"
              required
              placeholder="e.g. Petition under Article 226 for Statutory Compliance"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#151E27] border border-subtle rounded-md theme-heading outline-none focus:border-[var(--primary-accent)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold theme-subtext mb-1">Bench Division:</label>
              <select
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#151E27] border border-subtle rounded-md theme-heading outline-none focus:border-[var(--primary-accent)]"
              >
                <option value="Commercial Division">Commercial Division</option>
                <option value="Constitutional Bench">Constitutional Bench</option>
                <option value="Criminal Appeals">Criminal Appeals</option>
                <option value="Civil & Property">Civil & Property</option>
                <option value="Family Court">Family Court</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold theme-subtext mb-1">Priority Classification:</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#151E27] border border-subtle rounded-md theme-heading outline-none focus:border-[var(--primary-accent)]"
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold theme-subtext mb-1">Scheduled Hearing Date:</label>
            <input
              type="date"
              required
              min={todayIso}
              value={nextHearing}
              onChange={(e) => {
                setNextHearing(e.target.value);
                if (e.target.value >= todayIso) setDateError('');
              }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#151E27] border border-subtle rounded-md theme-heading outline-none focus:border-[var(--primary-accent)]"
            />
            {dateError && (
              <p className="text-[11px] text-rose-500 font-semibold mt-1 font-mono">
                ⚠ {dateError}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 theme-primary-btn font-semibold text-xs rounded-md shadow-xs mt-2 cursor-pointer"
          >
            Submit Formal Case Filing
          </button>
        </form>
      </div>
    </div>
  );
};
