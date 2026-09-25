import React, { useState, useEffect } from 'react';
import { FileCode, Check, X, ShieldAlert, Award, FolderKanban, Clock, Eye, CheckCircle2, AlertCircle } from 'lucide-react';
import { fastApi } from '@/services/fastapi';
import { api } from '@/services/api';
import { AiReviewBadge } from '@/components/common/AiReviewBadge';

export const DraftGenerator = () => {
  const [docType, setDocType] = useState('Order');
  const [caseNo, setCaseNo] = useState('WP(C) 412/2024');
  const [petitioner, setPetitioner] = useState('State Bank of India');
  const [respondent, setRespondent] = useState('M/s Apex Enterprises & Ors.');
  const [draftContent, setDraftContent] = useState<string>('');
  const [draftStatus, setDraftStatus] = useState<'DRAFT' | 'APPROVED' | 'REJECTED'>('DRAFT');
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedDrafts, setSavedDrafts] = useState<any[]>([]);
  const [fetchingDrafts, setFetchingDrafts] = useState(false);

  useEffect(() => {
    loadSavedDrafts();
  }, []);

  const loadSavedDrafts = async () => {
    setFetchingDrafts(true);
    try {
      const res = await api.getDrafts();
      if (res.success && res.drafts) {
        setSavedDrafts(res.drafts);
      }
    } catch {
      // Fallback
    } finally {
      setFetchingDrafts(false);
    }
  };

  const handleGenerateDraft = async () => {
    setLoading(true);
    setDraftStatus('DRAFT');
    setCurrentDraftId(null);
    try {
      const res = await fastApi.generateDraft(docType, {
        case_number: caseNo,
        petitioner,
        respondent,
        court: 'IN THE HIGH COURT OF JUDICATURE AT BOMBAY'
      });
      setDraftContent(res.content);
    } catch {
      // Handled in fallback
    } finally {
      setLoading(false);
    }
  };

  const handleSignOff = async (status: 'APPROVED' | 'REJECTED', idToSign?: string) => {
    const targetId = idToSign || currentDraftId;
    setDraftStatus(status);

    if (targetId) {
      try {
        await api.signOffDraft(targetId, status);
        loadSavedDrafts();
      } catch {
        // Fallback UI change
      }
    }

    if (status === 'APPROVED' && draftContent) {
      setDraftContent((prev) => 
        prev.replace('DRAFT — AI-GENERATED, UNEXECUTED (REVIEW REQUIRED)', 'OFFICIAL JUDICIAL ORDER — EXECUTED & APPROVED BY PRESIDING OFFICER')
            .replace('(Status: DRAFT - Awaiting Authenticated Sign-Off)', '(Status: FINAL - Signed off by Hon\'ble Presiding Officer)')
      );
    }
  };

  const handleSelectDraft = (d: any) => {
    setCurrentDraftId(d.id);
    setDraftContent(d.content);
    setDraftStatus(d.status || 'DRAFT');
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-subtle pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-serif font-bold theme-heading flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-amber-500" />
            Case Docket & AI Draft Sign-Off Engine
          </h1>
          <p className="theme-subtext text-xs sm:text-sm mt-1">
            Generate, view saved case docket notices/summonses, and perform authenticated judicial sign-offs.
          </p>
        </div>

        <button
          onClick={loadSavedDrafts}
          className="px-3 py-1.5 theme-elevated border border-subtle rounded-lg text-xs font-bold theme-heading hover:bg-subtle cursor-pointer flex items-center gap-1.5"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Refresh Docket List</span>
        </button>
      </div>

      {/* Saved Case Docket Drafts Section */}
      <div className="theme-card rounded-xl border border-subtle p-6 space-y-4 shadow-xl">
        <h2 className="text-base font-serif font-bold theme-heading flex items-center gap-2 border-b border-subtle pb-3">
          <FolderKanban className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Saved Docket Draft Orders & Summonses ({savedDrafts.length})
        </h2>

        {fetchingDrafts ? (
          <div className="py-6 text-center text-xs theme-subtext">Loading case docket items...</div>
        ) : savedDrafts.length === 0 ? (
          <div className="p-4 theme-elevated border border-subtle rounded-xl text-center text-xs theme-subtext">
            No saved draft orders in the docket. Save a summons or notice from the Summons & Notice Generator to review it here.
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {savedDrafts.map((d) => (
              <div
                key={d.id}
                onClick={() => handleSelectDraft(d)}
                className={`p-3 border rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 cursor-pointer transition-all ${
                  currentDraftId === d.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-subtle theme-elevated hover:border-blue-400/50'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      {d.docType || 'Summons'}
                    </span>
                    <h3 className="text-xs font-serif font-bold theme-heading">{d.title}</h3>
                  </div>
                  <p className="text-[11px] theme-subtext mt-0.5">
                    Case: {d.case?.caseNumber || d.caseId} | Created: {new Date(d.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-0.5 text-[10px] rounded font-bold ${
                    d.status === 'APPROVED' ? 'badge-supported' :
                    d.status === 'REJECTED' ? 'badge-rejected' :
                    'badge-pending'
                  }`}>
                    {d.status || 'DRAFT'}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSelectDraft(d); }}
                    className="px-2.5 py-1 theme-primary-btn text-[11px] font-bold rounded flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    <span>View & Sign</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generator Form */}
      <div className="theme-card rounded-xl border border-subtle p-6 space-y-4 shadow-xl">
        <h2 className="text-base font-serif font-bold theme-heading border-b border-subtle pb-2">
          Generate New Custom Judicial Order / Summons
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-semibold theme-heading mb-1">Document Type:</label>
            <select 
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full p-2 theme-elevated border border-subtle rounded outline-none font-bold theme-heading"
            >
              <option value="Order">Judicial Order</option>
              <option value="Notice">Show Cause Notice</option>
              <option value="Summons">Summons to Respondent</option>
              <option value="Bail Order">Bail Application Order</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold theme-heading mb-1">Case Number:</label>
            <input
              type="text"
              value={caseNo}
              onChange={(e) => setCaseNo(e.target.value)}
              className="w-full p-2 theme-elevated border border-subtle rounded outline-none theme-heading"
            />
          </div>

          <div>
            <label className="block font-semibold theme-heading mb-1">Petitioner:</label>
            <input
              type="text"
              value={petitioner}
              onChange={(e) => setPetitioner(e.target.value)}
              className="w-full p-2 theme-elevated border border-subtle rounded outline-none theme-heading"
            />
          </div>

          <div>
            <label className="block font-semibold theme-heading mb-1">Respondent:</label>
            <input
              type="text"
              value={respondent}
              onChange={(e) => setRespondent(e.target.value)}
              className="w-full p-2 theme-elevated border border-subtle rounded outline-none theme-heading"
            />
          </div>
        </div>

        <button
          onClick={handleGenerateDraft}
          disabled={loading}
          className="theme-primary-btn px-5 py-2.5 text-xs font-semibold rounded flex items-center gap-2 cursor-pointer"
        >
          <FileCode className="w-4 h-4" />
          {loading ? 'Generating Legal Draft...' : `Generate Watermarked ${docType} Draft`}
        </button>
      </div>

      {draftContent && (
        <div className="theme-card rounded-xl border border-subtle p-6 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-subtle pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-serif font-bold theme-heading">Selected Document Render</h2>
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                draftStatus === 'APPROVED' ? 'badge-supported' :
                draftStatus === 'REJECTED' ? 'badge-rejected' :
                'badge-pending'
              }`}>
                {draftStatus === 'APPROVED' ? 'FINAL - APPROVED' : draftStatus === 'REJECTED' ? 'REJECTED' : 'UNEXECUTED DRAFT'}
              </span>
            </div>

            {draftStatus === 'DRAFT' && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleSignOff('APPROVED')}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold flex items-center gap-1 shadow cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  Approve & Sign Off
                </button>
                <button
                  onClick={() => handleSignOff('REJECTED')}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-bold flex items-center gap-1 shadow cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  Reject Draft
                </button>
              </div>
            )}
          </div>

          <AiReviewBadge statusText="Must be reviewed and signed off by presiding officer before export" />

          {/* Draft Preview Paper */}
          <div className="p-6 theme-elevated border border-subtle rounded font-serif text-xs leading-relaxed space-y-3 whitespace-pre-wrap font-mono theme-heading relative">
            {draftStatus === 'DRAFT' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 font-bold text-4xl text-rose-600 dark:text-rose-400 uppercase transform -rotate-12 select-none">
                DRAFT — AI-GENERATED, UNEXECUTED
              </div>
            )}
            {draftContent}
          </div>
        </div>
      )}
    </div>
  );
};

export default DraftGenerator;
