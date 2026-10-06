import React, { useState, useEffect } from 'react';
import { 
  Building2, CalendarPlus, FileCode, FolderKanban, CheckCircle, 
  ShieldCheck, Building, Send, UserCheck, Plus, X, FolderOpen, 
  Scale, Loader2, Compass, Sparkles, FileText, Calculator
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { RoleGuidedTour } from '@/components/common/RoleGuidedTour';

interface FilingRecord {
  id: string;
  filingNumber: string;
  title: string;
  description: string;
  petitioner: string;
  respondent: string;
  filingType: string;
  court: string;
  status: string;
  createdAt: string;
}

export const StaffDashboard = () => {
  const [filings, setFilings] = useState<FilingRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showTour, setShowTour] = useState<boolean>(false);

  // Live stat metrics from DB
  const [stats, setStats] = useState({
    totalCases: 0,
    pendingCases: 0,
    upcomingHearings: 0,
    draftNotices: 0,
  });

  const [selectedFiling, setSelectedFiling] = useState<FilingRecord | null>(null);
  const [targetStatus, setTargetStatus] = useState<string>('UNDER_REVIEW');
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [filingsRes, casesRes, hearingsRes, draftsRes] = await Promise.all([
        api.getFilings().catch(() => ({ success: false, filings: [] })),
        api.getCases().catch(() => []),
        api.getHearings().catch(() => []),
        api.getDrafts().catch(() => ({ success: false, drafts: [] })),
      ]);

      if (filingsRes.filings) {
        setFilings(filingsRes.filings);
      }

      const caseList = Array.isArray(casesRes) ? casesRes : (casesRes?.data || []);
      const hearingList = Array.isArray(hearingsRes) ? hearingsRes : (hearingsRes?.data || []);
      const draftList = draftsRes.drafts || [];

      const pendingCount = caseList.filter((c: any) => c.status === 'Pending' || c.status === 'Active').length;

      setStats({
        totalCases: caseList.length,
        pendingCases: pendingCount,
        upcomingHearings: hearingList.length,
        draftNotices: draftList.length,
      });
    } catch (err: any) {
      console.warn('Failed to load staff dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFiling) return;

    try {
      const res = await api.updateFilingStatus(selectedFiling.id, targetStatus);

      if (res.success && res.filing) {
        setFilings((prev) => prev.map((f) => (f.id === selectedFiling.id ? res.filing : f)));
        setActionMsg(`✓ Filing ${selectedFiling.filingNumber} status updated to ${targetStatus}!`);
        setSelectedFiling(null);
        setTimeout(() => setActionMsg(''), 5000);
      }
    } catch (err: any) {
      setActionMsg(`Failed to update status: ${err.message}`);
    }
  };

  const pendingQueueCount = filings.filter((f) => f.status === 'SUBMITTED' || f.status === 'UNDER_REVIEW').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div id="tour-staff-header" className="border-b border-subtle pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold theme-heading flex items-center gap-2">
            <Building className="w-6 h-6 text-amber-500" />
            Court Staff &amp; Registry Officer Portal
          </h1>
          <p className="theme-subtext text-xs sm:text-sm mt-1">
            Bench Registrar &amp; Registry Desk — Active Filing Verification, Docket Management &amp; Summons Dispatch
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Interactive Tutorial Launcher Button */}
          <button
            onClick={() => setShowTour(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#C9A24B]/15 hover:bg-[#C9A24B]/25 border border-[#C9A24B]/50 text-[#C9A24B] text-xs font-bold transition-all shadow-xs cursor-pointer group"
            title="Launch step-by-step registry interactive tutorial"
          >
            <Compass className="w-4 h-4 group-hover:rotate-45 transition-transform" />
            <span>Interactive Tutorial &amp; Tour</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-[#C9A24B] text-slate-950 font-black rounded-full uppercase tracking-wider">
              Guide
            </span>
          </button>
        </div>
      </div>

      {/* Action Notification */}
      {actionMsg && (
        <div className="p-3.5 theme-elevated border border-subtle text-emerald-600 dark:text-emerald-400 text-xs rounded flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Top Stat Cards (Connected Live to Database) */}
      <div id="tour-staff-stats" className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="theme-card p-5 rounded space-y-1">
          <p className="text-xs theme-subtext font-semibold uppercase">Pending e-Filings Queue</p>
          <h3 className="text-2xl font-bold font-serif text-amber-500 mt-1">
            {loading ? '...' : `${pendingQueueCount} Incoming Petitions`}
          </h3>
          <p className="text-[10px] text-amber-500 font-bold">Requires Registry Review</p>
        </div>

        <div className="theme-card p-5 rounded space-y-1">
          <p className="text-xs theme-subtext font-semibold uppercase">Active Court Cases</p>
          <h3 className="text-2xl font-bold font-serif text-cyan-600 dark:text-cyan-400 mt-1">
            {loading ? '...' : `${stats.totalCases} Database Records`}
          </h3>
          <p className="text-[10px] theme-subtext">{stats.pendingCases} Pending / Active</p>
        </div>

        <div className="theme-card p-5 rounded space-y-1">
          <p className="text-xs theme-subtext font-semibold uppercase">Upcoming Hearings</p>
          <h3 className="text-2xl font-bold font-serif text-emerald-600 dark:text-emerald-400 mt-1">
            {loading ? '...' : `${stats.upcomingHearings} Scheduled Slots`}
          </h3>
          <p className="text-[10px] theme-subtext">Live Hearing Roster</p>
        </div>

        <div className="theme-card p-5 rounded space-y-1">
          <p className="text-xs theme-subtext font-semibold uppercase">Draft Notices &amp; Orders</p>
          <h3 className="text-2xl font-bold font-serif text-purple-600 dark:text-purple-400 mt-1">
            {loading ? '...' : `${stats.draftNotices} Saved Drafts`}
          </h3>
          <p className="text-[10px] theme-subtext">Awaiting Human Approval</p>
        </div>
      </div>

      {/* Incoming e-Filing Verification Queue Table */}
      <div id="tour-staff-filings-queue" className="theme-card rounded overflow-hidden">
        <div className="p-4 border-b border-subtle theme-elevated flex justify-between items-center">
          <div>
            <h2 className="text-base font-serif font-bold theme-heading flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-amber-500" />
              Incoming Electronic Case Filing Queue (Citizen &amp; Advocate e-Filings)
            </h2>
            <p className="text-xs theme-subtext">Verify petitioner documents and update registry status</p>
          </div>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold">{filings.length} Total Registered Petitions</span>
        </div>

        {loading ? (
          <div className="p-8 text-center theme-subtext text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
            <span>Loading e-filing queue from database...</span>
          </div>
        ) : filings.length === 0 ? (
          <div className="p-8 text-center theme-subtext text-xs">
            No incoming electronic filings found in the database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr>
                  <th className="px-4 py-3">Filing Reference</th>
                  <th className="px-4 py-3">Petitioner vs Respondent</th>
                  <th className="px-4 py-3">Suit Category &amp; Court</th>
                  <th className="px-4 py-3">Filing Status</th>
                  <th className="px-4 py-3">Date Submitted</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {filings.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-3 font-mono font-bold text-blue-500 whitespace-nowrap">
                      <div>{c.filingNumber}</div>
                      <div className="text-[10px] theme-subtext font-normal">{c.title}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold theme-heading block">{c.petitioner}</span>
                      <span className="theme-subtext">vs. {c.respondent}</span>
                    </td>
                    <td className="px-4 py-3 theme-subtext font-medium">
                      <div>{c.filingType}</div>
                      <div className="text-[10px] theme-subtext">{c.court}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded ${
                        c.status === 'ACCEPTED'
                          ? 'badge-supported'
                          : c.status === 'REJECTED'
                          ? 'badge-rejected'
                          : 'badge-pending'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono theme-subtext whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedFiling(c)}
                        className="theme-primary-btn px-3.5 py-1.5 text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Update Registry Status</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Feature Action Cards */}
      <div id="tour-staff-quick-actions" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div id="tour-staff-cause-list-btn" className="theme-card rounded p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-subtle pb-3">
            <CalendarPlus className="w-5 h-5 text-amber-500" />
            <h2 className="font-serif font-bold theme-heading text-base">Judicial Bench &amp; Courtroom Allocations</h2>
          </div>
          <p className="text-xs theme-subtext leading-relaxed">
            Allocate courtrooms, listing queues, and sync hearing dates with presiding bench schedules.
          </p>
          <Link
            to="/admin/allocations"
            className="theme-primary-btn inline-flex items-center gap-2 px-5 py-2.5 text-xs cursor-pointer"
          >
            <Building className="w-4 h-4" />
            <span>Manage Courtroom Allocations</span>
          </Link>
        </div>

        <div id="tour-staff-summons-btn" className="theme-card rounded p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-subtle pb-3">
            <FileCode className="w-5 h-5 text-amber-500" />
            <h2 className="font-serif font-bold theme-heading text-base">Official Summons &amp; Real Legal Notices</h2>
          </div>
          <p className="text-xs theme-subtext leading-relaxed">
            Generate authentic High Court &amp; District Court Summons under Order V CPC, Section 41A CrPC, and Section 138 NI Act with Process Server coupons.
          </p>
          <Link
            to="/staff/notices"
            className="theme-primary-btn inline-flex items-center gap-2 px-5 py-2.5 text-xs cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Open Real Summons &amp; Notice Generator</span>
          </Link>
        </div>
      </div>

      {/* Status Update Modal */}
      {selectedFiling && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="theme-card rounded-lg w-full max-w-lg shadow-2xl overflow-hidden border border-subtle">
            <div className="p-4 border-b border-subtle theme-elevated flex justify-between items-center">
              <h2 className="text-base font-serif font-bold theme-heading flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-500" />
                Update Filing Registry Status
              </h2>
              <button onClick={() => setSelectedFiling(null)} className="theme-subtext hover:theme-heading">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="p-5 space-y-4 text-xs">
              <div className="p-3 theme-elevated border border-subtle rounded space-y-1">
                <div className="font-bold text-blue-500">{selectedFiling.filingNumber}</div>
                <div className="theme-heading font-semibold">{selectedFiling.petitioner} vs. {selectedFiling.respondent}</div>
                <div className="theme-subtext">Title: {selectedFiling.title}</div>
              </div>

              <div>
                <label className="block text-xs font-semibold theme-subtext mb-1">Select Registry Review Status:</label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 font-bold cursor-pointer rounded"
                >
                  <option value="UNDER_REVIEW">UNDER_REVIEW — Scrutiny in Progress</option>
                  <option value="ACCEPTED">ACCEPTED — Validated &amp; Docketed</option>
                  <option value="REJECTED">REJECTED — Defects Identified</option>
                </select>
              </div>

              <button
                type="submit"
                className="theme-primary-btn w-full py-3 text-xs mt-2 cursor-pointer"
              >
                Confirm Registry Status Change
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Role Guided Tour */}
      <RoleGuidedTour
        role="STAFF"
        isOpen={showTour}
        onClose={() => setShowTour(false)}
      />
    </div>
  );
};

export default StaffDashboard;
