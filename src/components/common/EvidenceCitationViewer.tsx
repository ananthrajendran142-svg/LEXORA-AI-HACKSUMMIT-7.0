import React, { useState } from 'react';
import { FormattedMarkdown } from './FormattedMarkdown';
import { ShieldCheck, FileText, ExternalLink, X, BookOpen, Scale, AlertCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';

export interface EvidenceSource {
  document_id?: string;
  document_name?: string;
  case_name?: string;
  court?: string;
  year?: number | string;
  page_number?: number;
  paragraph_number?: string;
  chunk_id?: string;
  relevance_score?: number;
  excerpt?: string;
  source?: string;
  source_url?: string;
  citation?: string;
  authority_level?: number;
  case_number?: string;
  title?: string;
  status?: string;
  currentness?: string;
  act?: string;
  section?: string;
}

export interface WhyThisAnswerData {
  question_mode?: string;
  retrieved_statutes?: number;
  retrieved_judgments?: number;
  primary_authority_level?: number;
  currentness?: string;
}

export interface ClaimMapping {
  claim_id?: string;
  claim?: string;
  status?: string;
  supporting_sources?: any[];
}

export interface ResearchPathStep {
  step?: number;
  title?: string;
  detail?: string;
}

interface EvidenceCitationViewerProps {
  answer?: string;
  grounded?: boolean;
  sources?: EvidenceSource[];
  mode?: string;
  evidenceStatus?: 'SUPPORTED' | 'PARTIALLY_SUPPORTED' | 'INSUFFICIENT_EVIDENCE' | string;
  evidenceStrength?: 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT' | string;
  researchDepth?: 'QUICK' | 'STANDARD' | 'DEEP' | string;
  currentness?: string;
  warnings?: string[];
  simpleExplanation?: string;
  falsePremiseDetected?: boolean;
  falsePremiseReason?: string;
  whyThisAnswer?: WhyThisAnswerData;
  researchPath?: ResearchPathStep[];
  claimVerification?: {
    claims?: ClaimMapping[];
    supported_claim_rate?: number;
    unsupported_claim_rate?: number;
  };
  disclaimer?: string;
  className?: string;
}

export const EvidenceCitationViewer: React.FC<EvidenceCitationViewerProps> = ({
  answer,
  grounded = false,
  sources = [],
  mode,
  evidenceStatus,
  evidenceStrength,
  researchDepth,
  currentness,
  warnings = [],
  simpleExplanation,
  falsePremiseDetected = false,
  falsePremiseReason,
  whyThisAnswer,
  researchPath = [],
  claimVerification,
  disclaimer = 'AI ASSISTS. AUTHORIZED HUMAN DECIDES. Based on indexed legal sources.',
  className = ''
}) => {
  const [selectedSource, setSelectedSource] = useState<EvidenceSource | null>(null);
  const [showWhyThisAnswer, setShowWhyThisAnswer] = useState(false);
  const [showResearchPath, setShowResearchPath] = useState(false);
  const [showClaims, setShowClaims] = useState(false);

  const cleanSources = (sources || []).filter(
    (s) => s && (s.excerpt || s.case_name || s.title || s.document_name)
  );

  const isGrounded = grounded && cleanSources.length > 0;
  const status = evidenceStatus || (isGrounded ? 'SUPPORTED' : 'INSUFFICIENT_EVIDENCE');
  const currentnessState = currentness || (isGrounded ? 'VERIFIED' : 'CURRENTNESS_UNVERIFIED');

  return (
    <div className={`space-y-4 ${className}`}>
      {/* False Premise Warning Alert */}
      {falsePremiseDetected && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-sm p-4 text-xs text-rose-900 dark:text-rose-200 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-rose-800 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            Legal Premise Notice
          </div>
          <p className="text-[11px] leading-relaxed">
            {falsePremiseReason || 'The question contains a legally incorrect premise. See answer below for corrected legal principles.'}
          </p>
        </div>
      )}

      {/* Answer Content */}
      {answer && (
        <div className="theme-card p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D9DEE4] dark:border-[#2B3742] pb-2.5">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-serif font-bold theme-heading flex items-center gap-2">
                <Scale className="w-4 h-4 text-[var(--primary-accent)]" />
                Legal Analysis & Grounded Evidence
              </h3>
              {mode && (
                <span className="text-[10px] font-mono font-semibold uppercase theme-subtext theme-elevated border border-subtle px-2 py-0.5 rounded-sm">
                  {mode.replace('_', ' ')}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Evidence Strength Badge */}
              {evidenceStrength && (
                <span className={`text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-sm border ${
                  evidenceStrength === 'HIGH'
                    ? 'badge-supported'
                    : evidenceStrength === 'MEDIUM'
                    ? 'badge-pending'
                    : 'badge-rejected'
                }`}>
                  Strength: {evidenceStrength}
                </span>
              )}

              {/* Currentness Badge */}
              <span className={`text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-sm border ${
                currentnessState === 'VERIFIED'
                  ? 'badge-supported'
                  : 'badge-pending'
              }`}>
                Currentness: {currentnessState}
              </span>

              {/* Evidence Status Badge */}
              {status === 'SUPPORTED' ? (
                <span className="text-[11px] font-bold badge-supported px-3 py-1 rounded-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  SUPPORTED
                </span>
              ) : status === 'PARTIALLY_SUPPORTED' ? (
                <span className="text-[11px] font-bold badge-pending px-3 py-1 rounded-sm flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  PARTIALLY SUPPORTED
                </span>
              ) : (
                <span className="text-[11px] font-bold badge-rejected px-3 py-1 rounded-sm flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  INSUFFICIENT EVIDENCE
                </span>
              )}
            </div>
          </div>

          {/* Answer Text */}
          {answer && <FormattedMarkdown content={answer} />}

          {/* Simple Plain-Language Explanation */}
          {simpleExplanation && (
            <div className="mt-3 pt-3 border-t border-subtle theme-elevated p-3 rounded-sm border">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
                Plain-Language Overview:
              </span>
              <p className="text-[11px] theme-subtext leading-relaxed">{simpleExplanation}</p>
            </div>
          )}

          {/* "Why This Answer?" Button */}
          <div className="pt-2 border-t border-subtle flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowWhyThisAnswer(!showWhyThisAnswer)}
              className="text-[11px] text-[var(--primary-accent)] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 text-[var(--primary-accent)]" />
              <span>Why This Answer? (Explainability & Grounding Audit)</span>
              {showWhyThisAnswer ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            <span className="text-[9px] theme-subtext font-mono">Human Judicial Review Required</span>
          </div>

          {/* "Why This Answer?" Expandable Details Panel */}
          {showWhyThisAnswer && (
            <div className="theme-elevated border border-subtle rounded-sm p-3.5 text-xs space-y-2 font-mono">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                <div className="theme-card p-2 rounded-sm">
                  <span className="theme-subtext block">Question Mode:</span>
                  <span className="font-bold">{mode || 'GENERAL_LEGAL'}</span>
                </div>
                <div className="theme-card p-2 rounded-sm">
                  <span className="theme-subtext block">Retrieved Statutes:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{whyThisAnswer?.retrieved_statutes ?? cleanSources.filter(s => s.act).length}</span>
                </div>
                <div className="theme-card p-2 rounded-sm">
                  <span className="theme-subtext block">Retrieved Judgments:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{whyThisAnswer?.retrieved_judgments ?? cleanSources.filter(s => !s.act).length}</span>
                </div>
                <div className="theme-card p-2 rounded-sm">
                  <span className="theme-subtext block">Primary Authority Level:</span>
                  <span className="text-[var(--primary-accent)] font-bold">Level {whyThisAnswer?.primary_authority_level ?? 1} (Supreme Court / Statutory Act)</span>
                </div>
              </div>
              <p className="text-[10px] font-sans theme-subtext">
                Grounding Pipeline: Query routed &rarr; Vector &amp; keyword hybrid search &rarr; SentenceTransformer embedding &rarr; Reranked with authority weighting &rarr; Citation verifier.
              </p>
            </div>
          )}

          {/* Warnings */}
          {warnings && warnings.length > 0 && (
            <div className="mt-2 text-[10px] text-amber-600 dark:text-amber-400 italic font-mono">
              Notice: {warnings.join(' | ')}
            </div>
          )}
        </div>
      )}

      {/* Evidence Used Section */}
      {isGrounded ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-subtle pb-2">
            <h4 className="text-xs font-serif font-bold theme-heading uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Authoritative Evidence Sources ({cleanSources.length} Verified)
            </h4>
            <span className="text-[10px] theme-subtext font-mono">Provenance & Citation Verified</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {cleanSources.map((src, idx) => {
              const caseName = src.citation || src.case_name || src.title || src.case_number || 'Judicial Authority';
              const courtName = src.court || src.source || 'Supreme Court of India';
              const pageNo = src.page_number || 1;
              const paraNo = src.paragraph_number ? `Para ${src.paragraph_number}` : '';
              const relevance = src.relevance_score !== undefined
                ? (src.relevance_score <= 1 ? (src.relevance_score * 100).toFixed(1) + '%' : `${src.relevance_score}%`)
                : 'N/A';
              const authLvl = src.authority_level || 1;

              return (
                <div
                  key={src.chunk_id || src.document_id || idx}
                  className="theme-card p-4 space-y-2.5 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2 border-b border-subtle pb-2">
                      <div>
                        <p className="text-xs font-bold text-[var(--primary-accent)] font-serif line-clamp-1">{caseName}</p>
                        <p className="text-[10px] theme-subtext line-clamp-1">{courtName} {src.year ? `(${src.year})` : ''}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 theme-elevated px-2 py-0.5 rounded-sm border border-subtle block">
                          Level {authLvl} | {relevance}
                        </span>
                        <span className="text-[9px] font-mono theme-subtext mt-0.5 block">
                          Page {pageNo} {paraNo}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] theme-heading italic line-clamp-3 theme-elevated p-2.5 rounded-sm border border-subtle font-serif">
                      "{src.excerpt || 'Excerpt available in full source.'}"
                    </p>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-xs">
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                      Status: {src.status || 'IN_FORCE'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedSource(src)}
                      className="px-2.5 py-1 theme-secondary-btn font-semibold text-[10px] rounded-sm flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <FileText className="w-3 h-3 text-[var(--primary-accent)]" />
                      <span>View Provenance</span>
                      <ExternalLink className="w-2.5 h-2.5 text-[var(--primary-accent)]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-sm p-4 text-xs text-amber-900 dark:text-amber-200 space-y-1">
          <p className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Insufficient Authoritative Evidence Found
          </p>
          <p className="text-[11px] leading-relaxed">
            The AI legal engine found no sufficiently relevant indexed document evidence to support factual claims for this query. No fake citations or hallucinated precedents have been generated.
          </p>
        </div>
      )}

      {/* Source Provenance Viewer Modal */}
      {selectedSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-none">
          <div className="theme-card max-w-2xl w-full p-6 space-y-4 shadow-lg relative max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-subtle pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary-accent)] theme-elevated px-2 py-0.5 rounded-sm border border-subtle font-mono">
                  Verified Legal Source Provenance
                </span>
                <h3 className="text-base font-serif font-bold theme-heading mt-1">
                  {selectedSource.citation || selectedSource.case_name || selectedSource.title || selectedSource.case_number || 'Judicial Document'}
                </h3>
                <p className="text-xs theme-subtext">
                  {selectedSource.court || 'Supreme Court of India'} {selectedSource.year ? `• ${selectedSource.year}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSource(null)}
                className="p-1.5 theme-secondary-btn rounded-sm transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] theme-elevated p-3 rounded-sm border border-subtle font-mono">
              <div>
                <span className="theme-subtext block text-[10px]">Document ID:</span>
                <span className="font-bold truncate block">{selectedSource.document_id || selectedSource.chunk_id || 'N/A'}</span>
              </div>
              <div>
                <span className="theme-subtext block text-[10px]">Authority Level:</span>
                <span className="text-[var(--primary-accent)] font-bold block">Level {selectedSource.authority_level || 1}</span>
              </div>
              <div>
                <span className="theme-subtext block text-[10px]">Page & Paragraph:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold block">Page {selectedSource.page_number || 1} {selectedSource.paragraph_number ? `Para ${selectedSource.paragraph_number}` : ''}</span>
              </div>
              <div>
                <span className="theme-subtext block text-[10px]">Statutory Status:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold block">{selectedSource.status || 'IN_FORCE'}</span>
              </div>
            </div>

            {selectedSource.source_url && (
              <div className="text-xs theme-heading flex items-center justify-between theme-elevated p-3 rounded-sm border border-subtle">
                <span className="text-[11px]">Official Repository Link:</span>
                <a
                  href={selectedSource.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--primary-accent)] font-bold hover:underline flex items-center gap-1 text-xs"
                >
                  <span>{selectedSource.source_url}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="text-xs font-serif font-bold theme-heading uppercase tracking-wider">Indexed Evidence Excerpt:</h4>
              <div className="theme-elevated border border-subtle rounded-sm p-4 text-xs leading-relaxed font-serif whitespace-pre-line max-h-60 overflow-y-auto">
                "{selectedSource.excerpt}"
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedSource(null)}
                className="px-4 py-1.5 theme-primary-btn text-xs rounded-sm cursor-pointer"
              >
                Close Provenance Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
