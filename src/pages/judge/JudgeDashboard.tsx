import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Clock, Calendar, AlertTriangle, FileText, CheckCircle, XCircle, Scale, 
  ChevronRight, Eye, RefreshCw, X, Search, ChevronDown, ChevronUp, Sparkles, 
  FolderOpen, ArrowRight, ShieldCheck, User, Building
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { api } from '@/services/api';

type CategoryType = 'today_hearings' | 'pending_reviews' | 'active_dockets' | 'high_priority';

export const JudgeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<any[]>([]);
  const [hearings, setHearings] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [chromaOnline, setChromaOnline] = useState<boolean>(true);

  // Category Detail Modal State
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [modalSearchQuery, setModalSearchQuery] = useState<string>('');
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [casesRes, hearingsRes, analyticsRes, healthRes] = await Promise.allSettled([
        api.getCases(),
        api.getHearings(),
        api.getAnalytics(),
        api.getAiHealth(),
      ]);

      if (casesRes.status === 'fulfilled') {
        const rawCases = casesRes.value;
        setCases(Array.isArray(rawCases) ? rawCases : rawCases?.data || []);
      }

      if (hearingsRes.status === 'fulfilled') {
        const rawHearings = hearingsRes.value;
        setHearings(Array.isArray(rawHearings) ? rawHearings : rawHearings?.data || []);
      }

      if (analyticsRes.status === 'fulfilled') {
        setAnalytics(analyticsRes.value);
      }

      if (healthRes.status === 'fulfilled') {
        setChromaOnline(Boolean(healthRes.value?.ok));
      }
    } catch (err) {
      console.error('Failed to load live judge dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const todayIso = new Date().toISOString().split('T')[0];
  const localTodayIso = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
  const isDateToday = (d: string) => d === todayIso || d === localTodayIso;

  const todaysHearings = hearings.filter((h) => isDateToday(h.date));
  const upcomingHearings = hearings.filter((h) => (h.date >= todayIso || h.date >= localTodayIso) && h.status !== 'Completed');
  const displayHearings = todaysHearings.length > 0 ? todaysHearings : (upcomingHearings.length > 0 ? upcomingHearings : hearings.slice(0, 5));

  const todayFormatted = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const realHearingsCount = analytics?.judgeStats?.todaysHearings ?? (todaysHearings.length > 0 ? todaysHearings.length : upcomingHearings.length);
  const hearingsCount = String(realHearingsCount).padStart(2, '0');

  const pendingCasesList = cases.filter((c) => c.status === 'Pending');
  const pendingReviewsCount = String(
    analytics?.judgeStats?.pendingCases ?? pendingCasesList.length
  ).padStart(2, '0');

  const activeMattersCount = String(
    analytics?.judgeStats?.totalCases ?? cases.length
  ).padStart(2, '0');

  const highPriorityCasesList = cases.filter((c) => c.priority === 'High');
  const highPriorityCount = String(highPriorityCasesList.length).padStart(2, '0');

  // Filter matters requiring judicial attention
  const mattersRequiringAttention = cases.filter(
    (c) => c.status === 'Pending' || c.priority === 'High'
  ).length > 0
    ? cases.filter((c) => c.status === 'Pending' || c.priority === 'High')
    : cases.slice(0, 3);

  // Derived Cases for the Selected Category Modal
  const categoryData = useMemo(() => {
    if (!selectedCategory) return { title: '', description: '', items: [] };

    let items: any[] = [];
    let title = '';
    let description = '';

    switch (selectedCategory) {
      case 'today_hearings':
        title = "Today's Cause List & Scheduled Hearings";
        description = `Active Courtroom listings and bench docket for ${todayFormatted}`;
        // Gather cases that have a hearing scheduled today (or upcoming)
        items = displayHearings.map((h) => {
          const matchedCase = cases.find((c) => c.id === h.caseId || c.caseNumber === h.case?.caseNumber) || h.case || {};
          return {
            ...matchedCase,
            id: matchedCase.id || h.caseId,
            caseNumber: matchedCase.caseNumber || h.case?.caseNumber || 'CASE-REF',
            title: matchedCase.title || h.case?.title || 'Matter Listed on Cause List',
            hearingInfo: h,
          };
        });
        break;

      case 'pending_reviews':
        title = 'Matters Awaiting Judicial Direction & Review';
        description = 'Active pleadings, injunctions, and petitions pending interim orders or issue framing';
        items = pendingCasesList;
        break;

      case 'active_dockets':
        title = 'Assigned High Court Judicial Dockets';
        description = 'Complete portfolio of active and pending cases allocated to this judicial bench';
        items = cases;
        break;

      case 'high_priority':
        title = 'High Priority & Expedited Decision Track Matters';
        description = 'Urgent cases with critical statutory timelines, delay risk flags, or stay motions';
        items = highPriorityCasesList;
        break;
    }

    if (modalSearchQuery.trim()) {
      const q = modalSearchQuery.toLowerCase();
      items = items.filter((c) => 
        (c.caseNumber || '').toLowerCase().includes(q) ||
        (c.title || '').toLowerCase().includes(q) ||
        (c.petitioner || '').toLowerCase().includes(q) ||
        (c.respondent || '').toLowerCase().includes(q) ||
        (c.division || '').toLowerCase().includes(q)
      );
    }

    return { title, description, items };
  }, [selectedCategory, displayHearings, cases, pendingCasesList, highPriorityCasesList, modalSearchQuery, todayFormatted]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Editorial Header */}
      <div className="border-b border-[#D9DEE4] dark:border-[#2B3742] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--primary-accent)]">
            HIGH COURT OF JUDICATURE · BENCH II
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold theme-heading tracking-tight mt-0.5">
            Judge's Workspace
          </h1>
          <p className="theme-subtext text-xs mt-1">
            Presiding Officer: <strong className="theme-heading">{user?.name || "Hon'ble Presiding Officer"}</strong> | <span className="font-mono opacity-80">{todayFormatted}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            title="Refresh Live Data"
            className="p-1.5 theme-elevated border border-subtle rounded-sm text-xs theme-subtext hover:theme-heading cursor-pointer flex items-center gap-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link to="/ai/research" className="px-3.5 py-1.5 theme-primary-btn text-xs rounded-sm font-semibold flex items-center gap-1.5 cursor-pointer">
            <Scale className="w-3.5 h-3.5" />
            <span>Open Legal Research Workstation</span>
          </Link>
        </div>
      </div>

      {/* Today's Operational Summary - Prominent Clickable Stats Cards */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-0.5">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--primary-accent)]">
            TODAY'S OPERATIONAL SUMMARY — CLICK ANY NUMBER TO VIEW CASE DETAILS
          </span>
          <div className="flex items-center gap-2 text-[11px] font-mono theme-subtext theme-elevated px-2.5 py-1 rounded border border-subtle">
            <span className={`w-2 h-2 rounded-full ${chromaOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
            <span>CHROMA VECTOR INDEX: <strong className={chromaOnline ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>{chromaOnline ? 'ONLINE' : 'OFFLINE'}</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Today's Hearings */}
          <div 
            onClick={() => {
              setSelectedCategory('today_hearings');
              setModalSearchQuery('');
            }}
            className={`theme-card p-5 rounded-xl border shadow-sm flex items-center justify-between transition-all cursor-pointer group hover:scale-[1.02] hover:shadow-md ${
              selectedCategory === 'today_hearings' 
                ? 'border-[var(--primary-accent)] ring-2 ring-[var(--primary-accent)]/20' 
                : 'border-subtle hover:border-[var(--primary-accent)]'
            }`}
          >
            <div className="space-y-1">
              <p className="text-[11px] theme-subtext font-semibold uppercase tracking-wider group-hover:text-amber-500 transition-colors">
                Today's Hearings
              </p>
              <h2 className="text-3xl font-serif font-bold font-mono theme-heading group-hover:text-amber-500 transition-colors">
                {hearingsCount}
              </h2>
              <p className="text-[11px] text-amber-500 font-medium flex items-center gap-1">
                <span>Scheduled on Cause List</span>
                <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity font-mono font-bold">→ View</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:bg-amber-500/20 group-hover:scale-110 transition-all">
              <Calendar className="w-6 h-6 text-amber-500" />
            </div>
          </div>

          {/* Card 2: Pending Reviews */}
          <div 
            onClick={() => {
              setSelectedCategory('pending_reviews');
              setModalSearchQuery('');
            }}
            className={`theme-card p-5 rounded-xl border shadow-sm flex items-center justify-between transition-all cursor-pointer group hover:scale-[1.02] hover:shadow-md ${
              selectedCategory === 'pending_reviews' 
                ? 'border-[var(--primary-accent)] ring-2 ring-[var(--primary-accent)]/20' 
                : 'border-subtle hover:border-[var(--primary-accent)]'
            }`}
          >
            <div className="space-y-1">
              <p className="text-[11px] theme-subtext font-semibold uppercase tracking-wider group-hover:text-[var(--primary-accent)] transition-colors">
                Pending Reviews
              </p>
              <h2 className="text-3xl font-serif font-bold font-mono text-[var(--primary-accent)] group-hover:scale-105 transition-transform origin-left">
                {pendingReviewsCount}
              </h2>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                <span>Awaiting Judicial Direction</span>
                <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity font-mono font-bold">→ View</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-600/10 border border-amber-600/20 flex items-center justify-center shrink-0 group-hover:bg-amber-600/20 group-hover:scale-110 transition-all">
              <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>

          {/* Card 3: Active Docket Matters */}
          <div 
            onClick={() => {
              setSelectedCategory('active_dockets');
              setModalSearchQuery('');
            }}
            className={`theme-card p-5 rounded-xl border shadow-sm flex items-center justify-between transition-all cursor-pointer group hover:scale-[1.02] hover:shadow-md ${
              selectedCategory === 'active_dockets' 
                ? 'border-[var(--primary-accent)] ring-2 ring-[var(--primary-accent)]/20' 
                : 'border-subtle hover:border-[var(--primary-accent)]'
            }`}
          >
            <div className="space-y-1">
              <p className="text-[11px] theme-subtext font-semibold uppercase tracking-wider group-hover:text-blue-500 transition-colors">
                Active Docket Matters
              </p>
              <h2 className="text-3xl font-serif font-bold font-mono theme-heading group-hover:text-blue-500 transition-colors">
                {activeMattersCount}
              </h2>
              <p className="text-[11px] text-blue-500 font-medium flex items-center gap-1">
                <span>Assigned High Court Dockets</span>
                <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity font-mono font-bold">→ View</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 group-hover:scale-110 transition-all">
              <FileText className="w-6 h-6 text-blue-500" />
            </div>
          </div>

          {/* Card 4: High Priority Matters */}
          <div 
            onClick={() => {
              setSelectedCategory('high_priority');
              setModalSearchQuery('');
            }}
            className={`theme-card p-5 rounded-xl border shadow-sm flex items-center justify-between transition-all cursor-pointer group hover:scale-[1.02] hover:shadow-md ${
              selectedCategory === 'high_priority' 
                ? 'border-rose-500 ring-2 ring-rose-500/20' 
                : 'border-subtle hover:border-rose-500'
            }`}
          >
            <div className="space-y-1">
              <p className="text-[11px] theme-subtext font-semibold uppercase tracking-wider group-hover:text-rose-500 transition-colors">
                High Priority Matters
              </p>
              <h2 className="text-3xl font-serif font-bold font-mono text-rose-500 group-hover:scale-105 transition-transform origin-left">
                {highPriorityCount}
              </h2>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <span>⚡ Expedited Decision Track</span>
                <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity font-mono font-bold">→ View</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0 group-hover:bg-rose-500/20 group-hover:scale-110 transition-all">
              <AlertTriangle className="w-6 h-6 text-rose-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Case Details Drawer / Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="theme-card w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl border border-subtle flex flex-col overflow-hidden animate-scaleUp">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-subtle theme-elevated flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--primary-accent)]">
                    JUDICIAL CASE DIRECTORY &amp; DOCKET DETAILS
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    {categoryData.items.length} {categoryData.items.length === 1 ? 'Matter' : 'Matters'}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-serif font-bold theme-heading mt-0.5">
                  {categoryData.title}
                </h2>
                <p className="theme-subtext text-xs">
                  {categoryData.description}
                </p>
              </div>

              <button
                onClick={() => setSelectedCategory(null)}
                className="self-end sm:self-center p-2 rounded-lg theme-elevated border border-subtle theme-subtext hover:theme-heading hover:bg-rose-500/10 hover:text-rose-500 transition-colors cursor-pointer"
                title="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Quick Tabs & Search Bar */}
            <div className="px-6 py-3 border-b border-subtle flex flex-col sm:flex-row justify-between items-center gap-3 theme-card">
              <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedCategory('today_hearings')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                    selectedCategory === 'today_hearings'
                      ? 'theme-primary-btn shadow-sm'
                      : 'theme-elevated theme-subtext hover:theme-heading border border-subtle'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Today's Hearings ({hearingsCount})</span>
                </button>

                <button
                  onClick={() => setSelectedCategory('pending_reviews')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                    selectedCategory === 'pending_reviews'
                      ? 'theme-primary-btn shadow-sm'
                      : 'theme-elevated theme-subtext hover:theme-heading border border-subtle'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Pending Reviews ({pendingReviewsCount})</span>
                </button>

                <button
                  onClick={() => setSelectedCategory('active_dockets')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                    selectedCategory === 'active_dockets'
                      ? 'theme-primary-btn shadow-sm'
                      : 'theme-elevated theme-subtext hover:theme-heading border border-subtle'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Active Docket ({activeMattersCount})</span>
                </button>

                <button
                  onClick={() => setSelectedCategory('high_priority')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                    selectedCategory === 'high_priority'
                      ? 'theme-primary-btn shadow-sm'
                      : 'theme-elevated theme-subtext hover:theme-heading border border-subtle'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>High Priority ({highPriorityCount})</span>
                </button>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 theme-subtext" />
                <input
                  type="text"
                  placeholder="Filter case #, party, title..."
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs theme-elevated border border-subtle rounded-lg theme-heading placeholder:theme-subtext outline-none focus:ring-1 focus:ring-[var(--primary-accent)]"
                />
              </div>
            </div>

            {/* Modal Body: Case Cards List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 divide-y divide-subtle/40">
              {categoryData.items.length === 0 ? (
                <div className="py-12 text-center text-xs theme-subtext space-y-2">
                  <FolderOpen className="w-8 h-8 mx-auto opacity-40 text-amber-500" />
                  <p className="font-semibold text-sm theme-heading">No matching cases found</p>
                  <p>There are no cases in this category matching your search criteria.</p>
                </div>
              ) : (
                categoryData.items.map((c, idx) => {
                  const targetCaseId = c.id || c.caseNumber;
                  const isExpanded = expandedCaseId === targetCaseId;
                  const hearing = c.hearingInfo || c.hearings?.[0];

                  return (
                    <div 
                      key={c.id || idx} 
                      className="pt-3 first:pt-0 group transition-all"
                    >
                      <div className="theme-card p-4 rounded-xl border border-subtle hover:border-[var(--primary-accent)] transition-all space-y-3 shadow-sm hover:shadow-md">
                        {/* Top row: Case Identifiers & Badges */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              onClick={() => {
                                setSelectedCategory(null);
                                navigate(`/judge/cases/${encodeURIComponent(targetCaseId)}`);
                              }}
                              className="font-mono font-bold text-sm text-[var(--primary-accent)] hover:underline cursor-pointer"
                            >
                              {c.caseNumber}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                              {c.division || 'Commercial'}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              c.priority === 'High' 
                                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' 
                                : 'bg-slate-500/10 theme-subtext'
                            }`}>
                              {c.priority || 'Normal'} Priority
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              c.status === 'Active' 
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                                : c.status === 'Pending' 
                                ? 'badge-pending' 
                                : 'theme-elevated theme-subtext'
                            }`}>
                              {c.status?.toUpperCase() || 'ACTIVE'}
                            </span>
                          </div>

                          {c.delayProbability && (
                            <span className="text-[11px] font-mono font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1 self-start sm:self-auto">
                              <Sparkles className="w-3 h-3 text-amber-500" />
                              Delay Risk: <strong>{c.delayProbability}%</strong>
                            </span>
                          )}
                        </div>

                        {/* Middle row: Case Title & Parties */}
                        <div>
                          <h3 
                            onClick={() => {
                              setSelectedCategory(null);
                              navigate(`/judge/cases/${encodeURIComponent(targetCaseId)}`);
                            }}
                            className="font-serif font-bold text-sm theme-heading hover:text-[var(--primary-accent)] cursor-pointer transition-colors"
                          >
                            {c.title || `${c.petitioner} vs. ${c.respondent}`}
                          </h3>
                          <p className="theme-subtext text-xs mt-0.5 line-clamp-2">
                            {c.description || 'Pleadings and evidence filed with High Court Registry awaiting judicial resolution.'}
                          </p>
                        </div>

                        {/* Hearing Info Badge (if scheduled) */}
                        {hearing && (
                          <div className="p-2.5 theme-elevated border border-subtle rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              <span className="theme-subtext">Scheduled Hearing:</span>
                              <strong className="theme-heading font-mono text-amber-600 dark:text-amber-400">
                                {hearing.time || '10:30 AM'} ({hearing.date})
                              </strong>
                              <span className="theme-subtext">·</span>
                              <span className="theme-subtext">{hearing.courtRoom || 'Courtroom No. 1 (Bench II)'}</span>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400">
                              {hearing.type || 'Court Hearing'}
                            </span>
                          </div>
                        )}

                        {/* Expandable Case Metadata Accordion */}
                        {isExpanded && (
                          <div className="p-3.5 theme-elevated border border-subtle rounded-lg text-xs space-y-2.5 animate-fadeIn">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <span className="theme-subtext block text-[10px] uppercase font-semibold">Petitioner</span>
                                <span className="font-bold theme-heading">{c.petitioner || 'Petitioner Party'}</span>
                              </div>
                              <div>
                                <span className="theme-subtext block text-[10px] uppercase font-semibold">Respondent</span>
                                <span className="font-bold theme-heading">{c.respondent || 'Respondent Party'}</span>
                              </div>
                              <div>
                                <span className="theme-subtext block text-[10px] uppercase font-semibold">Filing Date</span>
                                <span className="font-mono font-semibold theme-heading">{c.filingDate || '2026-01-15'}</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-subtle/50">
                              <div>
                                <span className="theme-subtext block text-[10px] uppercase font-semibold">Jurisdiction / Court</span>
                                <span className="theme-heading">{c.court || 'High Court of Judicature'}</span>
                              </div>
                              <div>
                                <span className="theme-subtext block text-[10px] uppercase font-semibold">Action Required</span>
                                <span className="theme-heading font-medium text-amber-600 dark:text-amber-400">
                                  {c.status === 'Pending' ? 'Review pleadings & issue directions' : 'Arguments on record & final decree'}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons Row */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-subtle/40">
                          <button
                            onClick={() => setExpandedCaseId(isExpanded ? null : targetCaseId)}
                            className="text-xs font-semibold theme-subtext hover:theme-heading flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="w-3.5 h-3.5" />
                                <span>Hide Details</span>
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3.5 h-3.5" />
                                <span>Quick Preview Details</span>
                              </>
                            )}
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedCategory(null);
                                navigate(`/ai/research`);
                              }}
                              className="px-3 py-1.5 theme-secondary-btn text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                            >
                              <Scale className="w-3.5 h-3.5 text-blue-500" />
                              <span>Precedent Search</span>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedCategory(null);
                                navigate(`/judge/cases/${encodeURIComponent(targetCaseId)}`);
                              }}
                              className="px-3.5 py-1.5 theme-primary-btn text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
                            >
                              <Eye className="w-3.5 h-3.5 text-white" />
                              <span>Open Case File</span>
                              <ArrowRight className="w-3 h-3 text-white" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-subtle theme-elevated flex justify-between items-center text-xs">
              <span className="theme-subtext font-mono">
                Presiding Bench: <strong>{user?.name || "Hon'ble Presiding Judge"}</strong>
              </span>
              <button
                onClick={() => setSelectedCategory(null)}
                className="px-4 py-1.5 theme-secondary-btn font-semibold rounded-lg cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Matters Requiring Attention Table */}
      <div className="theme-card overflow-hidden space-y-0">
        <div className="px-4 py-3 border-b border-subtle theme-elevated flex justify-between items-center">
          <h2 className="text-sm font-serif font-bold theme-heading flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Matters Requiring Judicial Attention
          </h2>
          <span className="text-[10px] font-mono theme-subtext uppercase">
            {mattersRequiringAttention.length} {mattersRequiringAttention.length === 1 ? 'MATTER' : 'MATTERS'} PENDING DECISION
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr>
                <th className="px-4 py-3">Case Identifier</th>
                <th className="px-4 py-3">Parties / Matter</th>
                <th className="px-4 py-3">Next Required Action</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody>
              {mattersRequiringAttention.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center theme-subtext">
                    No urgent matters requiring judicial attention at this moment.
                  </td>
                </tr>
              ) : (
                mattersRequiringAttention.map((m, idx) => (
                  <tr key={m.id || idx} className="hover:theme-elevated transition-colors">
                    <td
                      onClick={() => navigate(`/judge/cases/${encodeURIComponent(m.id || m.caseNumber)}`)}
                      className="px-4 py-3 font-mono font-bold text-[var(--primary-accent)] whitespace-nowrap cursor-pointer hover:underline"
                    >
                      {m.caseNumber}
                    </td>
                    <td
                      onClick={() => navigate(`/judge/cases/${encodeURIComponent(m.id || m.caseNumber)}`)}
                      className="px-4 py-3 font-medium theme-heading cursor-pointer hover:text-blue-500"
                    >
                      {m.title || `${m.petitioner} v. ${m.respondent}`}
                    </td>
                    <td className="px-4 py-3 theme-subtext">
                      {m.hearings?.[0]
                        ? `${m.hearings[0].type || 'Hearing'} on ${m.hearings[0].date}`
                        : m.description
                        ? (m.description.slice(0, 70) + (m.description.length > 70 ? '...' : ''))
                        : 'Review pleadings & interim relief'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-sm badge-pending text-[10px] font-mono font-semibold">
                        {m.status?.toUpperCase() || 'REQUIRES REVIEW'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Link
                        to={`/judge/cases/${encodeURIComponent(m.id || m.caseNumber)}`}
                        className="px-2.5 py-1 theme-primary-btn text-[11px] font-semibold rounded-sm inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3 text-white" />
                        <span>Review File</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Today's Cause List (Upcoming Hearings) - Full Width Section */}
      <div className="theme-card overflow-hidden">
        <div className="px-4 py-3 border-b border-subtle theme-elevated flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h2 className="text-sm font-serif font-bold theme-heading">
              {todaysHearings.length > 0 ? "Today's Cause List (Active Bench Session)" : "Upcoming Judicial Cause List & Hearings"}
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              {todaysHearings.length > 0 ? `${todaysHearings.length} Today` : `${displayHearings.length} Scheduled`}
            </span>
          </div>
          <Link to="/judge/cases" className="text-xs font-medium text-[var(--primary-accent)] hover:underline flex items-center gap-0.5">
            Full Docket <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr>
                <th className="px-4 py-3">Schedule &amp; Date</th>
                <th className="px-4 py-3">Case Number</th>
                <th className="px-4 py-3">Parties</th>
                <th className="px-4 py-3">Courtroom / Division</th>
                <th className="px-4 py-3">Stage &amp; Purpose</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayHearings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center theme-subtext">
                    No hearings scheduled on today's cause list ({todayFormatted}).
                  </td>
                </tr>
              ) : (
                displayHearings.map((h, i) => {
                  const targetCaseId = h.caseId || h.case?.id || h.case?.caseNumber || '';
                  const isToday = isDateToday(h.date);
                  return (
                    <tr key={h.id || i} className="hover:theme-elevated transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-mono font-bold text-amber-600 dark:text-amber-400 block">{h.time || '10:30 AM'}</span>
                        <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded ${isToday ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'theme-subtext'}`}>
                          {isToday ? 'TODAY' : h.date}
                        </span>
                      </td>
                      <td
                        onClick={() => targetCaseId && navigate(`/judge/cases/${encodeURIComponent(targetCaseId)}`)}
                        className="px-4 py-3 font-mono font-semibold text-[var(--primary-accent)] whitespace-nowrap cursor-pointer hover:underline"
                      >
                        {h.case?.caseNumber || 'CASE-REF'}
                      </td>
                      <td
                        onClick={() => targetCaseId && navigate(`/judge/cases/${encodeURIComponent(targetCaseId)}`)}
                        className="px-4 py-3 font-medium theme-heading cursor-pointer hover:text-blue-500"
                      >
                        {h.case?.title || 'State vs. Accused'}
                      </td>
                      <td className="px-4 py-3 theme-subtext whitespace-nowrap">
                        {h.courtRoom || h.case?.court || 'Bench II'}
                      </td>
                      <td className="px-4 py-3 theme-subtext whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-sm bg-[#F5EBE6] dark:bg-[#2C241E] text-[10px] font-mono font-medium">
                          {h.type || h.status || 'Hearing'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <Link
                          to={targetCaseId ? `/judge/cases/${encodeURIComponent(targetCaseId)}` : '/judge/cases'}
                          className="px-2.5 py-1 theme-secondary-btn text-[11px] font-semibold rounded inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3 text-[var(--primary-accent)]" />
                          <span>Open Docket</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default JudgeDashboard;
