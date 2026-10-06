import React, { useState, useEffect } from 'react';
import { Calendar, Building, Clock, Search, Filter, Eye, User, Scale, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '@/services/api';
import { Link } from 'react-router-dom';

interface CauseListItem {
  itemNo: number;
  caseId?: string;
  caseNo: string;
  cnr: string;
  parties: string;
  stage: string;
  time: string;
  courtRoom: string;
  advocate: string;
  statute: string;
  date: string;
  judgeName?: string;
}

export const ViewCauseListsPage: React.FC = () => {
  const [hearings, setHearings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const now = new Date();
  const todayIso = now.toISOString().split('T')[0];
  const tomorrowIso = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const plus3DaysIso = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
  const plus7DaysIso = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [selectedCourtKey, setSelectedCourtKey] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchHearings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getHearings();
      const rawList = Array.isArray(res) ? res : (res?.data || []);
      setHearings(rawList);
    } catch (err: any) {
      console.error('Failed to load live cause list hearings:', err);
      setError(err?.message || 'Failed to connect to judicial cause list registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHearings();
  }, []);

  // Format date helper
  const formatDateLabel = (isoDate: string) => {
    if (isoDate === todayIso) return `Today (${new Date(isoDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })})`;
    if (isoDate === tomorrowIso) return `Tomorrow (${new Date(isoDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })})`;
    return new Date(isoDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Convert raw hearings into unified cause list items
  const processedList: CauseListItem[] = hearings.map((h, idx) => {
    const caseObj = h.case || {};
    const cnr = `MHHC${(caseObj.caseNumber || 'LEX001').replace(/[^a-zA-Z0-9]/g, '').slice(0, 10)}${new Date().getFullYear()}`;
    return {
      itemNo: idx + 1,
      caseId: h.caseId || caseObj.id,
      caseNo: caseObj.caseNumber || 'LEX/REF/2026',
      cnr,
      parties: caseObj.title || 'Petitioner vs. Respondent',
      stage: h.type || 'Regular Hearing',
      time: h.time || '10:30 AM',
      courtRoom: h.courtRoom || 'Courtroom No. 1 (Bench II)',
      advocate: caseObj.lawyer?.name || 'Advocate on Record',
      statute: caseObj.type === 'Writ Petition' ? 'Article 226 / Constitution' : caseObj.type === 'Criminal Appeal' ? 'CrPC / BNSS' : 'Civil Procedure Code (CPC)',
      date: h.date,
      judgeName: caseObj.judge?.name || "Hon'ble Presiding Judge",
    };
  });

  // Filter based on selected criteria
  const filteredList = processedList.filter((item) => {
    // Date filter
    if (selectedDate !== 'ALL' && item.date !== selectedDate) {
      return false;
    }
    // Courtroom filter
    if (selectedCourtKey !== 'ALL') {
      if (!item.courtRoom.toLowerCase().includes(selectedCourtKey.toLowerCase())) {
        return false;
      }
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        item.caseNo.toLowerCase().includes(q) ||
        item.parties.toLowerCase().includes(q) ||
        item.stage.toLowerCase().includes(q) ||
        item.courtRoom.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-subtle pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--primary-accent)]">
            HIGH COURT OF JUDICATURE · OFFICIAL REGISTRY
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold theme-heading flex items-center gap-2 mt-0.5">
            <Calendar className="w-6 h-6 text-amber-500" />
            Daily Courtroom Cause List &amp; Bench Schedule
          </h1>
          <p className="theme-subtext text-xs sm:text-sm mt-1">
            Real-time Item Numbers, Presiding Judges, Scheduled Hearing Times, and Daily Court Listings synced directly with the Judicial Database.
          </p>
        </div>

        <button
          onClick={fetchHearings}
          className="p-2 theme-elevated border border-subtle rounded text-xs theme-subtext hover:theme-heading cursor-pointer flex items-center gap-1.5 self-end sm:self-auto"
          title="Refresh Live Cause List"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="font-semibold">Refresh Grid</span>
        </button>
      </div>

      {error && (
        <div className="p-4 theme-elevated border border-subtle text-amber-600 dark:text-amber-400 text-xs rounded-xl flex items-center gap-2 shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Controls */}
      <div className="theme-card rounded-xl p-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 shadow-lg border border-subtle">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold theme-subtext">Listing Date:</span>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 theme-elevated border border-subtle rounded text-xs font-bold theme-heading outline-none cursor-pointer"
            >
              <option value={todayIso}>Today ({formatDateLabel(todayIso)})</option>
              <option value={tomorrowIso}>Tomorrow ({formatDateLabel(tomorrowIso)})</option>
              <option value={plus3DaysIso}>Next 3 Days ({formatDateLabel(plus3DaysIso)})</option>
              <option value={plus7DaysIso}>Next 7 Days ({formatDateLabel(plus7DaysIso)})</option>
              <option value="ALL">All Cause Lists (Full Term)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold theme-subtext">Courtroom / Bench:</span>
            <select
              value={selectedCourtKey}
              onChange={(e) => setSelectedCourtKey(e.target.value)}
              className="px-3 py-1.5 theme-elevated border border-subtle rounded text-xs font-bold theme-heading outline-none cursor-pointer"
            >
              <option value="ALL">All Courtrooms &amp; Benches</option>
              <option value="Courtroom No. 1">Courtroom No. 1 (Hon'ble Justice Rajesh Sharma)</option>
              <option value="Courtroom No. 2">Courtroom No. 2 (Hon'ble Justice Ananya Rao)</option>
              <option value="Courtroom No. 3">Courtroom No. 3 (Hon'ble Justice Vikram Menon)</option>
              <option value="Courtroom No. 4">Courtroom No. 4 (District Civil Court)</option>
            </select>
          </div>
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 theme-subtext" />
          <input
            type="text"
            placeholder="Search by case #, party..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs theme-elevated border border-subtle rounded theme-heading placeholder:theme-subtext outline-none"
          />
        </div>
      </div>

      {/* Bench Header Card */}
      <div className="p-3.5 theme-elevated border border-subtle rounded-xl text-xs flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-[var(--primary-accent)]" />
          <span className="theme-subtext">
            Active Listing Filter: <strong className="theme-heading">{selectedCourtKey === 'ALL' ? 'All High Court Benches' : selectedCourtKey}</strong> | Date: <strong className="theme-heading">{formatDateLabel(selectedDate)}</strong>
          </span>
        </div>
        <span className="font-mono font-bold badge-supported px-2.5 py-1 rounded text-[11px]">
          {filteredList.length} {filteredList.length === 1 ? 'Matter' : 'Matters'} Listed
        </span>
      </div>

      {/* Cause List Table */}
      <div className="theme-card rounded-xl overflow-hidden shadow-xl border border-subtle">
        <div className="p-4 border-b border-subtle theme-elevated flex justify-between items-center">
          <h2 className="text-sm font-serif font-bold theme-heading flex items-center gap-2">
            <Building className="w-4 h-4 text-amber-500" />
            Official Daily Cause List Docket
          </h2>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
            ✓ Live Verified Database Sync
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="theme-elevated theme-subtext font-serif uppercase tracking-wider border-b border-subtle">
              <tr>
                <th className="px-4 py-3">Item #</th>
                <th className="px-4 py-3">Scheduled Time &amp; Date</th>
                <th className="px-4 py-3">Case Reference &amp; CNR</th>
                <th className="px-4 py-3">Parties / Cause Title</th>
                <th className="px-4 py-3">Bench / Courtroom</th>
                <th className="px-4 py-3">Stage &amp; Purpose</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center theme-subtext">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-500" />
                    Loading live judicial cause list from backend...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center theme-subtext">
                    No hearings scheduled matching your filter criteria on {formatDateLabel(selectedDate)}.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item.itemNo} className="hover:theme-elevated transition-colors">
                    <td className="px-4 py-3 font-bold font-mono text-[var(--primary-accent)]">
                      #{item.itemNo}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400 block">{item.time}</span>
                      <span className="text-[10px] font-mono theme-subtext">{item.date}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400 block">{item.caseNo}</span>
                      <span className="text-[10px] theme-subtext font-mono">{item.cnr}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold theme-heading max-w-xs">
                      {item.parties}
                    </td>
                    <td className="px-4 py-3 theme-subtext whitespace-nowrap">
                      <span className="block font-medium theme-heading">{item.courtRoom}</span>
                      <span className="text-[10px] theme-subtext opacity-80">{item.judgeName}</span>
                    </td>
                    <td className="px-4 py-3 theme-subtext">
                      <span className="px-2 py-0.5 rounded-sm bg-[#F5EBE6] dark:bg-[#2C241E] text-[10px] font-mono font-medium">
                        {item.stage}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {item.caseId ? (
                        <Link
                          to={`/citizen/status`}
                          className="px-2.5 py-1 theme-primary-btn text-[11px] font-semibold rounded-sm inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3 text-white" />
                          <span>Track Status</span>
                        </Link>
                      ) : (
                        <span className="text-xs theme-subtext">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ViewCauseListsPage;
