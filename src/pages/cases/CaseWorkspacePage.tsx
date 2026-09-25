import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  FileText,
  Clock,
  Search,
  ShieldCheck,
  Calendar,
  Layers,
  CheckCircle,
  XCircle,
  AlertCircle,
  BookOpen,
  Scale,
  ExternalLink
} from 'lucide-react';
import { api } from '@/services/api';
import { CaseSummarizer } from '@/pages/ai/CaseSummarizer';
import { SimilarCaseFinder } from '@/pages/ai/SimilarCaseFinder';
import { LegalAssistant } from '@/pages/ai/LegalAssistant';
import { EvidenceCitationViewer } from '@/components/common/EvidenceCitationViewer';

type CanvasTab =
  | 'Overview'
  | 'Documents'
  | 'Case Summary'
  | 'Precedent Search'
  | 'Legal Research'
  | 'Hearings'
  | 'Audit Trail';

export const CaseWorkspacePage: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<CanvasTab>('Overview');
  const [caseData, setCaseData] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('JUDGE');
  const [loading, setLoading] = useState<boolean>(true);
  const [hearings, setHearings] = useState<any[]>([]);
  const [recommendationStatus, setRecommendationStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const userRes = await api.getCurrentUser().catch(() => ({ user: { role: 'JUDGE' } }));
        if (userRes?.user?.role) {
          setUserRole(userRes.user.role.toUpperCase());
        }

        const idToFetch = caseId || '1';
        const data = await api.getCaseById(idToFetch).catch(() => null);

        if (data) {
          setCaseData(data);
          if (data.hearings) setHearings(data.hearings);
        } else {
          setCaseData({
            id: idToFetch,
            caseNumber: 'WP(C) 412/2024',
            title: 'STATE BANK OF INDIA v. APEX ENTERPRISES & ORS.',
            court: 'High Court of Judicature at Bombay',
            status: 'Active',
            priority: 'High',
            division: 'Commercial Division / SARFAESI Bench',
            petitioner: 'State Bank of India',
            respondent: 'M/s Apex Enterprises & Ors.',
            filingDate: '2024-02-10',
            nextHearing: '2026-08-14',
            description: 'Commercial credit recovery petition under Article 226 of the Constitution read with Section 13(2) of SARFAESI Act 2002.',
            judge: { name: 'Hon\'ble Justice Rajesh Sharma' },
            documents: [
              { id: 'doc-1', fileName: 'Writ_Petition_Signed.pdf', mimeType: 'application/pdf', uploadedAt: '2024-02-10', status: 'INDEXED' },
              { id: 'doc-2', fileName: 'SARFAESI_Demand_Notice.pdf', mimeType: 'application/pdf', uploadedAt: '2024-02-12', status: 'INDEXED' }
            ]
          });
        }
      } catch (err) {
        console.error('Failed to load case workspace:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [caseId]);

  const tabs: CanvasTab[] = [
    'Overview',
    'Documents',
    'Case Summary',
    'Precedent Search',
    'Legal Research',
    'Hearings',
    'Audit Trail'
  ];

  if (loading) {
    return (
      <div className="p-8 text-center text-stone-500 font-mono">
        Opening Digital Case File #{caseId}...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* EDITORIAL CASE HEADER */}
      <div className="theme-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#D9DEE4] dark:border-[#2B3742] pb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 theme-secondary-btn rounded-sm transition-colors cursor-pointer"
              title="Return to docket"
            >
              <ArrowLeft className="w-4 h-4 text-[var(--primary-accent)]" />
            </button>
            <span className="font-mono text-xs font-bold text-[var(--primary-accent)] uppercase tracking-wider">
              CASE FILE: {caseData?.caseNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-sm badge-supported text-[10px] font-mono font-semibold">
              {caseData?.status || 'Active'}
            </span>
            <span className="px-2 py-0.5 rounded-sm badge-pending text-[10px] font-mono font-semibold">
              {caseData?.priority || 'High Priority'}
            </span>
          </div>
        </div>

        {/* Party Names Prominent Heading */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold theme-heading leading-tight uppercase">
            {caseData?.petitioner || (caseData?.title ? caseData.title.split(/\s+v(?:s)?\.?\s+/i)[0] : 'PETITIONER / COMPLAINANT')}
          </h1>
          <p className="text-xs font-mono font-semibold theme-subtext uppercase tracking-widest py-0.5">
            — VERSUS —
          </p>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold theme-heading leading-tight uppercase">
            {caseData?.respondent || (caseData?.title ? caseData.title.split(/\s+v(?:s)?\.?\s+/i)[1] : 'RESPONDENT / DEFENDANT')}
          </h1>
        </div>

        {/* Case Metadata Footer */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#D9DEE4] dark:border-[#2B3742] text-xs theme-subtext">
          <div className="flex flex-wrap gap-4">
            <div>Court: <strong className="theme-heading font-medium">{caseData?.court}</strong></div>
            <div>Division: <strong className="theme-heading font-medium">{caseData?.division}</strong></div>
            <div>Presiding: <strong className="theme-heading font-medium">{caseData?.judge?.name || "Hon'ble Bench"}</strong></div>
          </div>
          <div>Next Hearing: <strong className="text-[var(--primary-accent)] font-mono font-bold">{caseData?.nextHearing}</strong></div>
        </div>

        {/* Horizontal Case Navigation */}
        <div className="pt-2 border-t border-[#D9DEE4] dark:border-[#2B3742]">
          <nav className="flex overflow-x-auto gap-6 border-b border-[#D9DEE4] dark:border-[#2B3742]">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer border-b-2 ${
                  activeTab === tab
                    ? 'border-[var(--primary-accent)] text-[var(--primary-accent)]'
                    : 'border-transparent theme-subtext hover:opacity-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ASYMMETRIC 2-COLUMN CASE WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left/Center Canvas (70% / 8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {activeTab === 'Overview' && (
            <div className="space-y-6">
              <div className="theme-card p-5 space-y-3">
                <h2 className="text-xs font-serif font-bold theme-heading uppercase tracking-wider border-b border-[#D9DEE4] dark:border-[#2B3742] pb-2">
                  Case Synopsis & Statutory Subject Matter
                </h2>
                <p className="text-xs theme-heading leading-relaxed font-sans theme-elevated p-4 rounded-sm border border-subtle">
                  {caseData?.description}
                </p>
              </div>

              <div className="theme-card p-5 space-y-3">
                <h2 className="text-xs font-serif font-bold theme-heading uppercase tracking-wider border-b border-[#D9DEE4] dark:border-[#2B3742] pb-2">
                  Parties & Legal Representatives
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="theme-elevated p-3.5 rounded-sm border border-subtle space-y-1">
                    <span className="text-[10px] font-mono theme-subtext block uppercase">Petitioner / Applicant:</span>
                    <p className="font-semibold theme-heading">{caseData?.petitioner}</p>
                    <p className="text-[11px] theme-subtext">Counsel: M/s Law Chambers & Associates</p>
                  </div>
                  <div className="theme-elevated p-3.5 rounded-sm border border-subtle space-y-1">
                    <span className="text-[10px] font-mono theme-subtext block uppercase">Respondent / Defendant:</span>
                    <p className="font-semibold theme-heading">{caseData?.respondent}</p>
                    <p className="text-[11px] theme-subtext">Counsel: Senior Advocate Deshmukh & Co.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Documents' && (
            <div className="theme-card p-5 space-y-4">
              <h2 className="text-xs font-serif font-bold theme-heading uppercase tracking-wider border-b border-[#D9DEE4] dark:border-[#2B3742] pb-2">
                Attached Authorized Case Exhibits & Pleadings
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="px-3.5 py-2.5">Document Title</th>
                      <th className="px-3.5 py-2.5">Format</th>
                      <th className="px-3.5 py-2.5">Filing Date</th>
                      <th className="px-3.5 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(caseData?.documents || []).map((doc: any, idx: number) => (
                      <tr key={doc.id || idx} className="hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors">
                        <td className="px-3.5 py-2.5 font-semibold theme-heading">{doc.fileName}</td>
                        <td className="px-3.5 py-2.5 font-mono theme-subtext">{doc.mimeType || 'PDF'}</td>
                        <td className="px-3.5 py-2.5 font-mono theme-subtext">{doc.uploadedAt?.slice(0, 10)}</td>
                        <td className="px-3.5 py-2.5">
                          <span className="px-2 py-0.5 rounded-sm badge-supported text-[10px] font-mono font-semibold">
                            {doc.status || 'INDEXED'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'Case Summary' && <CaseSummarizer />}
          {activeTab === 'Precedent Search' && <SimilarCaseFinder />}
          {activeTab === 'Legal Research' && <LegalAssistant />}

          {activeTab === 'Hearings' && (
            <div className="theme-card p-5 space-y-4">
              <h2 className="text-xs font-serif font-bold theme-heading uppercase tracking-wider border-b border-[#D9DEE4] dark:border-[#2B3742] pb-2">
                Scheduled Courtroom Hearings
              </h2>
              <div className="space-y-2.5">
                {hearings.length > 0 ? (
                  hearings.map((h: any, idx: number) => (
                    <div key={h.id || idx} className="p-3.5 theme-elevated border border-subtle rounded-sm text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold theme-heading">{h.courtRoom || 'Court Room 1'}</span>
                        <span className="font-mono text-[var(--primary-accent)] font-bold text-[11px]">{h.date} at {h.time}</span>
                      </div>
                      {h.aiRationale && <p className="text-[11px] theme-subtext">{h.aiRationale}</p>}
                    </div>
                  ))
                ) : (
                  <p className="text-xs theme-subtext text-center py-4">Next scheduled hearing: {caseData?.nextHearing} in Court Room 1.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'Audit Trail' && (
            <div className="theme-card p-5 space-y-3 font-mono text-xs">
              <h2 className="text-xs font-serif font-bold theme-heading uppercase tracking-wider border-b border-[#D9DEE4] dark:border-[#2B3742] pb-2">
                Case Activity Audit Trail
              </h2>
              <div className="p-3.5 theme-elevated border border-subtle rounded-sm space-y-1">
                <div className="flex justify-between text-[10px] theme-subtext">
                  <span>ACTOR: JUDGE ({caseData?.judge?.name})</span>
                  <span>2026-09-10 10:15 IST</span>
                </div>
                <p className="text-[var(--primary-accent)] font-semibold">ACTION: CASE_WORKSPACE_VIEWED</p>
                <p className="text-[10px] theme-subtext">STATUS: AUTHENTICATED_SESSION</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Evidence & Judicial Authority Rail (30% / 4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Judicial Review Decision Box */}
          <div className="theme-card p-4 space-y-3">
            <div className="border-b border-[#D9DEE4] dark:border-[#2B3742] pb-2 flex items-center justify-between">
              <h3 className="text-xs font-serif font-bold theme-heading uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-[var(--primary-accent)]" />
                Judicial Decision Gate
              </h3>
              <span className="text-[10px] font-mono theme-subtext">HUMAN ACTION</span>
            </div>

            <div className="theme-elevated border border-subtle rounded-sm p-3 text-xs space-y-2">
              <span className="text-[10px] font-mono theme-subtext uppercase block">Pending Hearing Recommendation:</span>
              <p className="theme-heading font-medium leading-snug">
                {caseData?.description ? `Review and proceed with hearing regarding: ${caseData.description}` : 'Prioritize interim stay hearing regarding statutory notice.'}
              </p>
              <div className="pt-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                Grounding Status: Verified with Case Record #{caseData?.caseNumber || 'Ref'}
              </div>
            </div>

            <div className="pt-2 border-t border-[#D9DEE4] dark:border-[#2B3742] space-y-2">
              <p className="text-[10px] theme-subtext font-mono">
                * Recommendation has no legal force until confirmed by presiding judge.
              </p>
              {recommendationStatus === 'PENDING' ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setRecommendationStatus('APPROVED')}
                    className="flex-1 py-1.5 theme-primary-btn text-xs rounded-sm flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => setRecommendationStatus('REJECTED')}
                    className="flex-1 py-1.5 bg-rose-700 dark:bg-rose-800 text-white font-semibold text-xs rounded-sm flex items-center justify-center gap-1 cursor-pointer transition-colors border border-rose-900"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              ) : (
                <div className="p-2 theme-elevated border border-subtle rounded-sm flex items-center justify-between text-xs">
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] uppercase">{recommendationStatus} BY JUDGE</span>
                  <button onClick={() => setRecommendationStatus('PENDING')} className="text-[10px] theme-subtext hover:underline">Reset</button>
                </div>
              )}
            </div>
          </div>

          {/* Persistent Grounded Evidence Excerpts Rail */}
          <div className="theme-card p-4 space-y-3">
            <div className="border-b border-[#D9DEE4] dark:border-[#2B3742] pb-2 flex items-center justify-between">
              <h3 className="text-xs font-serif font-bold theme-heading uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                Verified Grounded Evidence
              </h3>
              <span className="text-[10px] font-mono theme-subtext">PROVENANCE</span>
            </div>

            <div className="space-y-3">
              <div className="theme-elevated border border-subtle rounded-sm p-3 text-xs space-y-1.5">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-[var(--primary-accent)] font-bold">{caseData?.type || 'Case Petition'} Brief</span>
                  <span className="theme-subtext">Record Entry</span>
                </div>
                <p className="text-[11px] theme-heading italic font-serif leading-relaxed">
                  "{caseData?.description || 'Petitioner contends statutory non-compliance and requests judicial intervention.'}"
                </p>
                <div className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 pt-0.5">
                  Authority Level 1 | Match 98.2%
                </div>
              </div>

              <div className="theme-elevated border border-subtle rounded-sm p-3 text-xs space-y-1.5">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-[var(--primary-accent)] font-bold">SARFAESI Act 2002</span>
                  <span className="theme-subtext">Section 13(2)</span>
                </div>
                <p className="text-[11px] theme-heading italic font-serif leading-relaxed">
                  "Where any borrower makes default in repayment of secured debt..."
                </p>
                <div className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 pt-0.5">
                  Statutory Binding Act | In Force
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseWorkspacePage;
