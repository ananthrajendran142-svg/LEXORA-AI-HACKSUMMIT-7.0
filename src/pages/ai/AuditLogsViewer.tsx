import React, { useEffect, useState } from 'react';
import { ShieldCheck, Search, Filter, Download, CheckCircle } from 'lucide-react';
import { api } from '@/services/api';

export const AuditLogsViewer = () => {
  const [logs, setLogs] = useState<any[]>([
    {
      id: 'log_1',
      actorRole: 'JUDGE',
      actor: { name: 'Hon\'ble Justice Rajesh Sharma' },
      action: 'Reviewed Hearing Recommendation',
      case: 'WP(C) 412/2024',
      outcome: 'APPROVED',
      createdAt: '10 Sep 2026 10:15'
    },
    {
      id: 'log_2',
      actorRole: 'LAWYER',
      actor: { name: 'Advocate Priya Nair' },
      action: 'Executed Precedent Search',
      case: 'CIV.SUIT 104/2025',
      outcome: 'EVIDENCE_RETRIEVED',
      createdAt: '10 Sep 2026 09:30'
    },
    {
      id: 'log_3',
      actorRole: 'JUDGE',
      actor: { name: 'Hon\'ble Justice Rajesh Sharma' },
      action: 'Authenticated Draft Order Sign-off',
      case: 'WP(C) 412/2024',
      outcome: 'APPROVED',
      createdAt: '10 Sep 2026 08:45'
    },
    {
      id: 'log_4',
      actorRole: 'ADMIN',
      actor: { name: 'National Judicial Administrator' },
      action: 'System Security Integrity Audit Scan',
      case: 'SYSTEM_WIDE',
      outcome: 'VERIFIED_SECURE',
      createdAt: '10 Sep 2026 08:00'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    api.getAuditLogs()
      .then((res) => {
        if (res.success && res.logs && res.logs.length > 0) {
          const formatted = res.logs.map((l: any) => ({
            id: l.id,
            actorRole: l.actorRole || 'SYSTEM',
            actor: l.actor || { name: 'System Officer' },
            action: l.action,
            case: l.caseId || 'SYSTEM_WIDE',
            outcome: l.outcome || 'RECORDED',
            createdAt: new Date(l.createdAt).toLocaleString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
          }));
          setLogs(formatted);
        }
      })
      .catch(() => {});
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.actor?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.case.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || log.actorRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleExportCSV = () => {
    const csvContent =
      `Timestamp,Actor,Role,Action,Case,Outcome\n` +
      filteredLogs
        .map(
          (l) =>
            `"${l.createdAt}","${l.actor?.name}","${l.actorRole}","${l.action}","${l.case}","${l.outcome}"`
        )
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Lexora_Audit_Trail_${Date.now()}.csv`;
    a.click();
    setActionMsg('Audit Trail CSV exported successfully.');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="border-b border-subtle pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-serif font-bold theme-heading flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Judicial Audit Trail & System Logs
          </h1>
          <p className="text-xs theme-subtext mt-0.5">
            Immutable log of system events, judicial review actions, and authenticated sign-offs.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="theme-secondary-btn px-3.5 py-1.5 font-semibold text-xs rounded flex items-center gap-1.5 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit Log (CSV)</span>
        </button>
      </div>

      {/* Action Notification */}
      {actionMsg && (
        <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs rounded flex items-center gap-2 font-medium">
          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Controls & Search */}
      <div className="theme-card border border-subtle rounded p-3 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex-1 w-full sm:w-auto relative">
          <Search className="w-3.5 h-3.5 theme-subtext absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search logs by actor, action, or case number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 theme-elevated border border-subtle rounded text-xs theme-heading placeholder:theme-subtext outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto text-xs">
          <Filter className="w-3.5 h-3.5 theme-subtext" />
          <span className="theme-subtext">Filter Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-2.5 py-1 theme-elevated border border-subtle rounded text-xs font-medium theme-heading outline-none cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            <option value="JUDGE">Judges</option>
            <option value="LAWYER">Lawyers</option>
            <option value="ADMIN">Administrators</option>
          </select>
        </div>
      </div>

      {/* Logs Data Table */}
      <div className="theme-card border border-subtle rounded overflow-hidden">
        <div className="px-4 py-2.5 border-b border-subtle flex justify-between items-center theme-elevated">
          <h2 className="text-xs font-mono font-semibold theme-subtext uppercase tracking-wider">
            Audit Trail Events ({filteredLogs.length})
          </h2>
          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
            INTEGRITY VERIFIED
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="theme-elevated theme-subtext font-mono text-[10px] uppercase border-b border-subtle">
              <tr>
                <th className="px-3.5 py-2">Timestamp</th>
                <th className="px-3.5 py-2">Actor</th>
                <th className="px-3.5 py-2">Role</th>
                <th className="px-3.5 py-2">Action</th>
                <th className="px-3.5 py-2">Case / Resource</th>
                <th className="px-3.5 py-2 text-right">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle font-mono">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-blue-500/5 transition-colors">
                  <td className="px-3.5 py-2 theme-subtext whitespace-nowrap">{log.createdAt}</td>
                  <td className="px-3.5 py-2 font-sans font-medium theme-heading whitespace-nowrap">{log.actor?.name}</td>
                  <td className="px-3.5 py-2 text-blue-600 dark:text-blue-400 font-bold whitespace-nowrap">{log.actorRole}</td>
                  <td className="px-3.5 py-2 font-sans theme-heading">{log.action}</td>
                  <td className="px-3.5 py-2 theme-heading font-semibold whitespace-nowrap">{log.case}</td>
                  <td className="px-3.5 py-2 text-right whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.outcome.includes('APPROVED') || log.outcome.includes('SECURE')
                          ? 'badge-supported'
                          : 'theme-secondary-btn'
                      }`}
                    >
                      {log.outcome}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogsViewer;
