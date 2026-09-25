import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Clock, Calendar, AlertTriangle, FileText, CheckCircle, XCircle, Scale, ChevronRight, Eye, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { api } from '@/services/api';

export const JudgeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<any[]>([]);
  const [hearings, setHearings] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [chromaOnline, setChromaOnline] = useState<boolean>(true);

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

  // Filter matters requiring judicial attention
  const mattersRequiringAttention = cases.filter(
    (c) => c.status === 'Pending' || c.priority === 'High'
  ).length > 0
    ? cases.filter((c) => c.status === 'Pending' || c.priority === 'High')
    : cases.slice(0, 3);

  const todayIso = new Date().toISOString().split('T')[0];
  const todaysHearings = hearings.filter((h) => h.date === todayIso);

  const todayFormatted = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const hearingsCount = String(
    analytics?.judgeStats?.todaysHearings ?? todaysHearings.length
  ).padStart(2, '0');

  const pendingReviewsCount = String(
    analytics?.judgeStats?.pendingCases ?? cases.filter((c) => c.status === 'Pending').length
  ).padStart(2, '0');

  const activeMattersCount = String(
    analytics?.judgeStats?.totalCases ?? cases.length
  ).padStart(2, '0');

  return (
    <div className="space-y-6">
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

      {/* Today's Operational Summary - Prominent Stats Cards */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-0.5">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--primary-accent)]">
            TODAY'S OPERATIONAL SUMMARY
          </span>
          <div className="flex items-center gap-2 text-[11px] font-mono theme-subtext theme-elevated px-2.5 py-1 rounded border border-subtle">
            <span className={`w-2 h-2 rounded-full ${chromaOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
            <span>CHROMA VECTOR INDEX: <strong className={chromaOnline ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>{chromaOnline ? 'ONLINE' : 'OFFLINE'}</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="theme-card p-5 rounded-xl border border-subtle shadow-sm flex items-center justify-between transition-all hover:border-[var(--primary-accent)]">
            <div className="space-y-1">
              <p className="text-[11px] theme-subtext font-semibold uppercase tracking-wider">Today's Hearings</p>
              <h2 className="text-3xl font-serif font-bold font-mono theme-heading">{hearingsCount}</h2>
              <p className="text-[11px] text-amber-500 font-medium">Scheduled on Cause List</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6 text-amber-500" />
            </div>
          </div>

          <div className="theme-card p-5 rounded-xl border border-subtle shadow-sm flex items-center justify-between transition-all hover:border-[var(--primary-accent)]">
            <div className="space-y-1">
              <p className="text-[11px] theme-subtext font-semibold uppercase tracking-wider">Pending Reviews</p>
              <h2 className="text-3xl font-serif font-bold font-mono text-[var(--primary-accent)]">{pendingReviewsCount}</h2>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">Awaiting Judicial Direction</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-600/10 border border-amber-600/20 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>

          <div className="theme-card p-5 rounded-xl border border-subtle shadow-sm flex items-center justify-between transition-all hover:border-[var(--primary-accent)]">
            <div className="space-y-1">
              <p className="text-[11px] theme-subtext font-semibold uppercase tracking-wider">Active Docket Matters</p>
              <h2 className="text-3xl font-serif font-bold font-mono theme-heading">{activeMattersCount}</h2>
              <p className="text-[11px] text-blue-500 font-medium">Assigned High Court Dockets</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-blue-500" />
            </div>
          </div>

          <div className="theme-card p-5 rounded-xl border border-subtle shadow-sm flex items-center justify-between transition-all hover:border-[var(--primary-accent)]">
            <div className="space-y-1">
              <p className="text-[11px] theme-subtext font-semibold uppercase tracking-wider">High Priority Matters</p>
              <h2 className="text-3xl font-serif font-bold font-mono text-rose-500">
                {String(cases.filter((c) => c.priority === 'High').length).padStart(2, '0')}
              </h2>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">⚡ Expedited Decision Track</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-rose-500" />
            </div>
          </div>
        </div>
      </div>

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
          <h2 className="text-sm font-serif font-bold theme-heading flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Today's Cause List (Upcoming Hearings)
          </h2>
          <Link to="/judge/cases" className="text-xs font-medium text-[var(--primary-accent)] hover:underline flex items-center gap-0.5">
            Full Docket <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Case Number</th>
                <th className="px-4 py-3">Parties</th>
                <th className="px-4 py-3">Division</th>
                <th className="px-4 py-3">Stage & Purpose</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {todaysHearings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center theme-subtext">
                    No hearings scheduled on today's cause list ({todayFormatted}).
                  </td>
                </tr>
              ) : (
                todaysHearings.map((h, i) => {
                  const targetCaseId = h.caseId || h.case?.id || h.case?.caseNumber || '';
                  return (
                    <tr key={h.id || i} className="hover:theme-elevated transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap">{h.time || '10:30 AM'}</td>
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
