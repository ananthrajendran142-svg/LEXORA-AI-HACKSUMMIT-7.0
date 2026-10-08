import React, { useState, useEffect } from 'react';
import { Building, Plus, CheckCircle, X, Loader2, AlertTriangle, Trash2, Clock, History } from 'lucide-react';
import { api } from '../../services/api';

interface JudgeUser {
  id: string;
  name: string;
  email: string;
  designation: string;
  court: string;
}

interface AllocationRecord {
  id: string;
  judgeId: string;
  judge?: JudgeUser;
  courtroom: string;
  date: string;
  startTime: string;
  endTime: string;
  division: string;
  status: string;
  createdAt: string;
}

/**
 * Safely parse date (YYYY-MM-DD) and optional time string (e.g. "10:30 AM", "04:30 PM", "16:30")
 * into a local Date object for accurate chronological comparison.
 */
export function parseAllocationDateTime(dateStr: string, timeStr?: string): Date {
  if (!dateStr) return new Date();
  const cleanDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr.trim();
  const parts = cleanDate.split('-').map(Number);
  const y = parts[0] || new Date().getFullYear();
  const m = (parts[1] || 1) - 1;
  const d = parts[2] || 1;

  let hours = 23;
  let minutes = 59;
  let seconds = 59;

  if (timeStr && timeStr.trim()) {
    const cleanTime = timeStr.trim().toUpperCase();
    const isPM = cleanTime.includes('PM');
    const isAM = cleanTime.includes('AM');
    const timeParts = cleanTime.replace(/(AM|PM|\s)/g, '').split(':');
    if (timeParts.length >= 2) {
      let h = parseInt(timeParts[0], 10) || 0;
      const min = parseInt(timeParts[1], 10) || 0;
      const sec = timeParts[2] ? parseInt(timeParts[2], 10) || 0 : 0;
      if (isPM && h < 12) h += 12;
      if (isAM && h === 12) h = 0;
      hours = h;
      minutes = min;
      seconds = sec;
    }
  }

  return new Date(y, m, d, hours, minutes, seconds);
}

/**
 * Checks if an allocation's date and scheduled time slot has already passed
 * relative to the reference time.
 */
export function isAllocationPast(
  a: { date: string; endTime?: string; startTime?: string },
  refTime: Date = new Date()
): boolean {
  if (!a.date) return false;
  // If endTime is specified, check whether the session end timestamp has passed
  if (a.endTime && a.endTime.trim()) {
    const endDateTime = parseAllocationDateTime(a.date, a.endTime);
    return refTime.getTime() > endDateTime.getTime();
  }
  // If only startTime is specified, check whether start time has passed
  if (a.startTime && a.startTime.trim()) {
    const startDateTime = parseAllocationDateTime(a.date, a.startTime);
    return refTime.getTime() > startDateTime.getTime();
  }
  // Otherwise, expires at the end of that day (23:59:59)
  const dayEnd = parseAllocationDateTime(a.date, '11:59:59 PM');
  return refTime.getTime() > dayEnd.getTime();
}

/**
 * Checks if an allocation is currently active/in session right now
 */
export function isAllocationInSession(
  a: { date: string; startTime?: string; endTime?: string },
  refTime: Date = new Date()
): boolean {
  if (!a.date || !a.startTime) return false;
  const start = parseAllocationDateTime(a.date, a.startTime);
  const end = a.endTime ? parseAllocationDateTime(a.date, a.endTime) : parseAllocationDateTime(a.date, '11:59:59 PM');
  const ref = refTime.getTime();
  return ref >= start.getTime() && ref <= end.getTime();
}

export const BenchAllocationPage: React.FC = () => {
  const [allocations, setAllocations] = useState<AllocationRecord[]>([]);
  const [judges, setJudges] = useState<JudgeUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [actionMsg, setActionMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [viewTab, setViewTab] = useState<'upcoming' | 'past'>('upcoming');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Automatic ticker to re-evaluate past/upcoming transitions every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper to suggest next default session
  const getNextDefaultSlot = () => {
    const now = new Date();
    if (now.getHours() >= 16) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return {
        date: tomorrow.toISOString().split('T')[0],
        startTime: '10:00 AM',
        endTime: '04:30 PM',
      };
    }
    return {
      date: now.toISOString().split('T')[0],
      startTime: '10:30 AM',
      endTime: '04:30 PM',
    };
  };

  // Form inputs
  const [selectedJudgeId, setSelectedJudgeId] = useState<string>('');
  const [courtroom, setCourtroom] = useState<string>('Courtroom #1 (Main Hall)');
  const [date, setDate] = useState<string>(todayStr);
  const [startTime, setStartTime] = useState<string>('10:30 AM');
  const [endTime, setEndTime] = useState<string>('04:30 PM');
  const [division, setDivision] = useState<string>('Commercial Recovery & SARFAESI Act');

  // Load live allocations and judges list on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [allocRes, judgesRes] = await Promise.all([
        api.getBenchAllocations().catch(() => ({ success: false, allocations: [] })),
        api.getJudgesList().catch(() => ({ success: false, judges: [] })),
      ]);

      if (allocRes.allocations) {
        setAllocations(allocRes.allocations);
      }
      if (judgesRes.judges && judgesRes.judges.length > 0) {
        setJudges(judgesRes.judges);
        setSelectedJudgeId(judgesRes.judges[0].id);
      }
    } catch (err: any) {
      console.warn('Failed to load bench allocations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setErrorMsg('');
    const slot = getNextDefaultSlot();
    setDate(slot.date);
    setStartTime(slot.startTime);
    setEndTime(slot.endTime);
    setShowAddModal(true);
  };

  const handleCreateAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setActionMsg('');

    if (!selectedJudgeId) {
      setErrorMsg('Please select a Presiding Judicial Officer.');
      return;
    }

    if (date < todayStr) {
      setErrorMsg("Cannot create a bench allocation for a past date. Please select today's date or a future date.");
      return;
    }

    if (date === todayStr && endTime) {
      const endDateTime = parseAllocationDateTime(date, endTime);
      if (endDateTime.getTime() <= Date.now()) {
        setErrorMsg("The specified end time slot has already passed for today. Please schedule an upcoming time slot or select a future date.");
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await api.createBenchAllocation({
        judgeId: selectedJudgeId,
        courtroom,
        date,
        startTime,
        endTime,
        division
      });

      if (res.success && res.allocation) {
        setAllocations((prev) => [res.allocation, ...prev]);
        setShowAddModal(false);
        setActionMsg(`Bench allocation published successfully for ${courtroom}.`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Allocation conflict or processing error.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAllocation = async (id: string) => {
    try {
      await api.deleteBenchAllocation(id);
      setAllocations((prev) => prev.filter((a) => a.id !== id));
      setActionMsg('Allocation deleted successfully.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete allocation.');
    }
  };

  // Filter allocations into Active/Upcoming vs Past Archive by evaluating both date and time slot
  const upcomingAllocations = allocations.filter((a) => !isAllocationPast(a, currentTime));
  const pastAllocations = allocations.filter((a) => isAllocationPast(a, currentTime));
  const displayedAllocations = viewTab === 'upcoming' ? upcomingAllocations : pastAllocations;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-subtle pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold theme-heading flex items-center gap-2">
            <Building className="w-6 h-6 text-amber-500" />
            Judicial Bench & Courtroom Allocation Manager
          </h1>
          <p className="theme-subtext text-xs sm:text-sm mt-1">
            Assign Presiding Officers, Manage Courtroom Halls, Special Bench Divisions & Daily Hearing Rosters
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="theme-primary-btn px-4 py-2.5 text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Bench Allocation</span>
        </button>
      </div>

      {/* Notifications */}
      {actionMsg && (
        <div className="p-3 theme-elevated border border-subtle text-emerald-600 dark:text-emerald-400 text-xs rounded flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 theme-elevated border border-subtle text-red-600 dark:text-red-400 text-xs rounded flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="theme-card p-4 rounded space-y-1">
          <p className="text-[10px] theme-subtext font-bold uppercase">Active Benches Allocated</p>
          <h2 className="text-2xl font-bold font-mono text-amber-500">
            {loading ? '...' : `${upcomingAllocations.length} Courtrooms`}
          </h2>
        </div>
        <div className="theme-card p-4 rounded space-y-1">
          <p className="text-[10px] theme-subtext font-bold uppercase">Available Judicial Officers</p>
          <h2 className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {loading ? '...' : `${judges.length} Judges Registered`}
          </h2>
        </div>
        <div className="theme-card p-4 rounded space-y-1">
          <p className="text-[10px] theme-subtext font-bold uppercase">Conflict Validation</p>
          <h2 className="text-2xl font-bold font-mono text-cyan-600 dark:text-cyan-400">Server-Enforced (409)</h2>
        </div>
        <div className="theme-card p-4 rounded space-y-1">
          <p className="text-[10px] theme-subtext font-bold uppercase">Database Persistence</p>
          <h2 className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400">Prisma Persistent</h2>
        </div>
      </div>

      {/* Allocations Table */}
      <div className="theme-card rounded overflow-hidden">
        <div className="p-4 border-b border-subtle theme-elevated flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-base font-serif font-bold theme-heading flex items-center gap-2">
              <Building className="w-5 h-5 text-amber-500" />
              Official Bench Roster
            </h2>

            {/* Filter Tabs: Upcoming vs Past */}
            <div className="flex bg-slate-200 dark:bg-slate-800 p-0.5 rounded text-xs gap-1">
              <button
                onClick={() => setViewTab('upcoming')}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewTab === 'upcoming'
                    ? 'bg-amber-500 text-white font-bold shadow-xs'
                    : 'theme-subtext hover:theme-heading'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Active & Upcoming</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${viewTab === 'upcoming' ? 'bg-amber-600 text-white' : 'bg-slate-300 dark:bg-slate-700'}`}>
                  {upcomingAllocations.length}
                </span>
              </button>
              <button
                onClick={() => setViewTab('past')}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewTab === 'past'
                    ? 'bg-slate-700 text-white font-bold shadow-xs'
                    : 'theme-subtext hover:theme-heading'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Past Archive</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${viewTab === 'past' ? 'bg-slate-800 text-white' : 'bg-slate-300 dark:bg-slate-700'}`}>
                  {pastAllocations.length}
                </span>
              </button>
            </div>
          </div>

          <span className="text-xs theme-subtext font-mono">Live Database Sync</span>
        </div>

        {loading ? (
          <div className="p-8 text-center theme-subtext text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
            <span>Loading bench allocations from database...</span>
          </div>
        ) : displayedAllocations.length === 0 ? (
          <div className="p-8 text-center theme-subtext text-xs space-y-1">
            <p>
              {viewTab === 'upcoming'
                ? 'No active or upcoming bench allocations found. Click "Create New Bench Allocation" to schedule one.'
                : 'No past bench allocations found in archive.'}
            </p>
            {viewTab === 'upcoming' && pastAllocations.length > 0 && (
              <p>
                <button
                  type="button"
                  onClick={() => setViewTab('past')}
                  className="text-amber-500 hover:underline font-semibold cursor-pointer inline-flex items-center gap-1 mt-1"
                >
                  <History className="w-3.5 h-3.5" />
                  View {pastAllocations.length} concluded allocation{pastAllocations.length > 1 ? 's' : ''} in the Past Archive tab
                </button>
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr>
                  <th className="px-4 py-3">Courtroom & Hall</th>
                  <th className="px-4 py-3">Presiding Judicial Officer</th>
                  <th className="px-4 py-3">Division</th>
                  <th className="px-4 py-3">Date & Time Slot</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedAllocations.map((a) => {
                  const isPast = isAllocationPast(a, currentTime);
                  const inSession = isAllocationInSession(a, currentTime);

                  return (
                    <tr
                      key={a.id}
                      className={isPast ? 'opacity-70 bg-slate-500/5 hover:bg-slate-500/10 transition-colors' : 'hover:bg-slate-500/5 transition-colors'}
                    >
                      <td className="px-4 py-3 font-bold text-blue-500 whitespace-nowrap">{a.courtroom}</td>
                      <td className="px-4 py-3 font-semibold theme-heading whitespace-nowrap">
                        {a.judge?.name || 'Assigned Officer'}
                        <div className="text-[10px] theme-subtext">{a.judge?.designation || 'Judicial Officer'}</div>
                      </td>
                      <td className="px-4 py-3 theme-subtext">{a.division}</td>
                      <td className="px-4 py-3 font-mono theme-subtext whitespace-nowrap">
                        {a.date} ({a.startTime} - {a.endTime})
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                            isPast
                              ? 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                              : inSession
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse'
                              : 'badge-supported'
                          }`}
                        >
                          {isPast ? 'Concluded (Past Archive)' : inSession ? 'In Session (Live)' : a.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteAllocation(a.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ml-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Allocation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="theme-card rounded-lg w-full max-w-md shadow-2xl overflow-hidden border border-subtle">
            <div className="p-4 border-b border-subtle theme-elevated flex justify-between items-center">
              <h2 className="text-base font-serif font-bold theme-heading flex items-center gap-2">
                <Building className="w-5 h-5 text-amber-500" />
                Create New Judicial Bench Allocation
              </h2>
              <button onClick={() => setShowAddModal(false)} className="theme-subtext hover:theme-heading">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAllocation} className="p-5 space-y-3 text-xs">
              {errorMsg && (
                <div className="p-3 theme-elevated border border-subtle text-red-600 dark:text-red-400 text-xs rounded flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold theme-subtext mb-1">Presiding Judicial Officer:</label>
                {judges.length > 0 ? (
                  <select
                    value={selectedJudgeId}
                    onChange={(e) => setSelectedJudgeId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded"
                  >
                    {judges.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.name} ({j.designation})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    readOnly
                    value="Loading registered judges..."
                    className="w-full px-3 py-2 text-xs rounded theme-subtext"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold theme-subtext mb-1">Courtroom Location:</label>
                <input
                  type="text"
                  required
                  value={courtroom}
                  onChange={(e) => setCourtroom(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold theme-subtext mb-1">Date:</label>
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold theme-subtext mb-1">Division:</label>
                  <input
                    type="text"
                    required
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold theme-subtext mb-1">Start Time:</label>
                  <input
                    type="text"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="10:30 AM"
                    className="w-full px-3 py-2 text-xs rounded"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold theme-subtext mb-1">End Time:</label>
                  <input
                    type="text"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="04:30 PM"
                    className="w-full px-3 py-2 text-xs rounded"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded bg-amber-500/10 border border-amber-500/20 text-[11px] theme-subtext flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  Allocations automatically transition to the <strong>Past Archive</strong> once their scheduled date and time slot concludes.
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="theme-primary-btn w-full py-3 text-xs mt-2 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Publish Bench Allocation</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BenchAllocationPage;
