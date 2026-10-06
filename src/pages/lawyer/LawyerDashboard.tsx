import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { api } from '@/services/api';
import { 
  Briefcase, Clock, Calendar, FileText, Search, FolderOpen, 
  ArrowRight, AlertTriangle, RefreshCw, Filter, Compass, Sparkles, Scale
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { RoleGuidedTour } from '@/components/common/RoleGuidedTour';

export const LawyerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [cases, setCases] = useState<any[]>([]);
  const [hearings, setHearings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showTour, setShowTour] = useState<boolean>(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const fetchLawyerData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const fetchedCases = await api.getCases(params);
      setCases(Array.isArray(fetchedCases) ? fetchedCases : []);

      const fetchedHearings = await api.getHearings().catch(() => []);
      setHearings(Array.isArray(fetchedHearings) ? fetchedHearings : []);
    } catch (err: any) {
      console.error('Lawyer dashboard fetch error:', err);
      setError(err.message || 'Failed to retrieve active client cases from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLawyerData();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLawyerData();
  };

  // Dynamic Statistics Calculations from Database Results
  const totalCasesCount = cases.length;
  const pendingCasesCount = cases.filter(c => c.status === 'Pending' || c.status === 'Active').length;
  const closedCasesCount = cases.filter(c => c.status === 'Closed' || c.status === 'Disposed').length;
  const activeHearingsCount = hearings.length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div id="tour-lawyer-header" className="border-b border-subtle pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold theme-heading flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-amber-500" />
            Advocate &amp; Legal Counsel Portal
          </h1>
          <p className="theme-subtext text-xs sm:text-sm mt-1">
            Welcome back, <span className="font-bold theme-heading">{user?.name || 'Authorized Legal Counsel'}</span> | High Court Bar Association
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Interactive Tutorial Launcher Button */}
          <button
            onClick={() => setShowTour(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#C9A24B]/15 hover:bg-[#C9A24B]/25 border border-[#C9A24B]/50 text-[#C9A24B] text-xs font-bold transition-all shadow-xs cursor-pointer group"
            title="Launch step-by-step advocate interactive tutorial"
          >
            <Compass className="w-4 h-4 group-hover:rotate-45 transition-transform" />
            <span>Interactive Tutorial &amp; Tour</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-[#C9A24B] text-slate-950 font-black rounded-full uppercase tracking-wider">
              Guide
            </span>
          </button>

          <Link
            id="tour-lawyer-draft-btn"
            to="/ai/drafts"
            className="theme-primary-btn px-4 py-2 font-bold text-xs rounded shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Draft Pleading Motion</span>
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 theme-elevated border border-subtle text-red-600 dark:text-red-400 text-xs rounded flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
          <button
            onClick={fetchLawyerData}
            className="theme-primary-btn px-3 py-1 text-xs flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Dynamic Statistics Cards */}
      <div id="tour-lawyer-stats" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setStatusFilter('All')}
          className={`theme-card p-5 rounded space-y-1 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md ${statusFilter === 'All' ? 'border-[var(--primary-accent)] ring-2 ring-[var(--primary-accent)]/20' : 'hover:border-blue-500'}`}
        >
          <p className="text-[10px] theme-subtext font-bold uppercase tracking-wider">Total Assigned Briefs</p>
          <h2 className="text-2xl font-bold font-mono text-blue-500">{totalCasesCount} Cases</h2>
          <p className="text-[11px] theme-subtext">Live Database Records · <span className="font-semibold text-blue-500">Filter All →</span></p>
        </div>

        <div 
          onClick={() => setStatusFilter('Pending')}
          className={`theme-card p-5 rounded space-y-1 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md ${statusFilter === 'Pending' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'hover:border-amber-500'}`}
        >
          <p className="text-[10px] theme-subtext font-bold uppercase tracking-wider">Active / Pending Matters</p>
          <h2 className="text-2xl font-bold font-mono text-amber-500">{pendingCasesCount} Matters</h2>
          <p className="text-[11px] theme-subtext">Awaiting Hearing · <span className="font-semibold text-amber-500">Filter Pending →</span></p>
        </div>

        <div 
          onClick={() => setStatusFilter('Closed')}
          className={`theme-card p-5 rounded space-y-1 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md ${statusFilter === 'Closed' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'hover:border-emerald-500'}`}
        >
          <p className="text-[10px] theme-subtext font-bold uppercase tracking-wider">Disposed Decrees</p>
          <h2 className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{closedCasesCount} Decrees</h2>
          <p className="text-[11px] theme-subtext">✓ Resolved · <span className="font-semibold text-emerald-600 dark:text-emerald-400">Filter Disposed →</span></p>
        </div>

        <div 
          onClick={() => navigate('/citizen/causelists')}
          className="theme-card p-5 rounded space-y-1 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md hover:border-cyan-500"
        >
          <p className="text-[10px] theme-subtext font-bold uppercase tracking-wider">Cause List Hearings</p>
          <h2 className="text-2xl font-bold font-mono text-cyan-600 dark:text-cyan-400">{activeHearingsCount} Hearings</h2>
          <p className="text-[11px] theme-subtext">Scheduled Calendar · <span className="font-semibold text-cyan-600 dark:text-cyan-400">View Schedule →</span></p>
        </div>
      </div>

      {/* Quick Tools Row */}
      <div id="tour-lawyer-ai-tools" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/ai/drafts')}
          className="p-5 theme-card hover:bg-slate-100 dark:hover:bg-slate-800 rounded flex items-center gap-3 transition-all cursor-pointer group"
        >
          <div className="p-3 theme-elevated text-blue-500 rounded group-hover:scale-105 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h3 className="font-serif font-bold theme-heading text-xs">File Pleading Motion</h3>
            <p className="text-[10px] theme-subtext">AI Draft Generator &amp; Petitions</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/ai/similar-cases')}
          className="p-5 theme-card hover:bg-slate-100 dark:hover:bg-slate-800 rounded flex items-center gap-3 transition-all cursor-pointer group"
        >
          <div className="p-3 theme-elevated text-amber-500 rounded group-hover:scale-105 transition-transform">
            <Scale className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h3 className="font-serif font-bold theme-heading text-xs">Similar Case &amp; Precedent Finder</h3>
            <p className="text-[10px] theme-subtext">Landmark Judgments, Facts &amp; Ratios</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/workspace')}
          className="p-5 theme-card hover:bg-slate-100 dark:hover:bg-slate-800 rounded flex items-center gap-3 transition-all cursor-pointer group"
        >
          <div className="p-3 theme-elevated text-emerald-500 rounded group-hover:scale-105 transition-transform">
            <FolderOpen className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h3 className="font-serif font-bold theme-heading text-xs">Unified Case Workspace</h3>
            <p className="text-[10px] theme-subtext">Inspect Docket Briefs &amp; Evidence</p>
          </div>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cases Table */}
        <div id="tour-lawyer-cases" className="lg:col-span-8 theme-card rounded overflow-hidden space-y-3">
          <div className="p-4 border-b border-subtle theme-elevated flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-base font-serif font-bold theme-heading">My Authorized Client Briefs</h2>
              <p className="text-[11px] theme-subtext">Server-authorized case records assigned to your legal counsel ID</p>
            </div>

            {/* Filter & Search Bar */}
            <form id="tour-lawyer-search" onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="w-3.5 h-3.5 theme-subtext absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search case # or party..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-bold rounded cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Closed">Closed</option>
              </select>
            </form>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-xs font-mono theme-subtext animate-pulse">
                Fetching authorized case dockets from server...
              </div>
            ) : cases.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <FolderOpen className="w-8 h-8 theme-subtext mx-auto" />
                <p className="text-xs font-bold theme-heading">No cases assigned yet.</p>
                <p className="text-[11px] theme-subtext">Zero matching case records were returned by the backend server for your account.</p>
              </div>
            ) : (
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr>
                    <th className="px-4 py-3">Case Number</th>
                    <th className="px-4 py-3">Title / Parties</th>
                    <th className="px-4 py-3">Petitioner</th>
                    <th className="px-4 py-3">Next Hearing</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map((c) => (
                    <tr key={c.id}>
                      <td className="px-4 py-3 font-mono font-bold text-blue-500 whitespace-nowrap">{c.caseNumber}</td>
                      <td className="px-4 py-3 font-semibold theme-heading max-w-xs truncate">{c.title}</td>
                      <td className="px-4 py-3 theme-subtext max-w-xs truncate">{c.petitioner}</td>
                      <td className="px-4 py-3 font-mono text-amber-500 whitespace-nowrap">{c.nextHearing || 'TBD'}</td>
                      <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={c.status} /></td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Link
                          to={`/workspace/${c.id}`}
                          className="theme-secondary-btn px-2.5 py-1 text-[10px] flex items-center gap-1"
                        >
                          Open Brief <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Upcoming Hearings Sidebar Card */}
        <div id="tour-lawyer-hearings" className="lg:col-span-4 theme-card rounded p-5 space-y-4">
          <h2 className="text-base font-serif font-bold theme-heading flex items-center gap-2 border-b border-subtle pb-3">
            <Clock className="w-4 h-4 text-amber-500" />
            Upcoming Cause List Hearings
          </h2>

          <div className="space-y-3">
            {hearings.length === 0 ? (
              <div className="p-4 theme-elevated rounded text-xs theme-subtext text-center">
                No upcoming scheduled hearings for your cases.
              </div>
            ) : (
              hearings.slice(0, 5).map((h, idx) => (
                <div key={h.id || idx} className="p-3.5 theme-elevated rounded space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs font-bold text-amber-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      {h.date} at {h.time}
                    </span>
                    <StatusBadge status={h.status || 'Scheduled'} />
                  </div>
                  <div className="text-xs font-mono font-bold text-blue-500">
                    {h.case?.caseNumber || h.caseNumber || 'Hearing Slot'}
                  </div>
                  <div className="text-xs theme-heading truncate font-semibold">
                    {h.case?.title || h.title || 'Case Hearing'}
                  </div>
                  <div className="text-[11px] theme-subtext font-mono">
                    {h.courtRoom || 'Court Room 1'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Interactive Role Guided Tour */}
      <RoleGuidedTour
        role="LAWYER"
        isOpen={showTour}
        onClose={() => setShowTour(false)}
      />
    </div>
  );
};

export default LawyerDashboard;
