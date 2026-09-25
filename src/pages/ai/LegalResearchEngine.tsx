import React, { useState } from 'react';
import { BookOpen, Search, Scale, Bot, Cpu, Sparkles, MessageSquare, Send, RefreshCw, CheckCircle2, AlertCircle, Copy, Check, FileText, ArrowRight } from 'lucide-react';
import { fastApi } from '@/services/fastapi';
import { EvidenceCitationViewer } from '@/components/common/EvidenceCitationViewer';
import { FormattedMarkdown } from '@/components/common/FormattedMarkdown';

export const LegalResearchEngine: React.FC = () => {
  // Statutory Provision Search States
  const [actQuery, setActQuery] = useState('Constitution of India');
  const [sectionQuery, setSectionQuery] = useState('Article 21');
  const [keyword, setKeyword] = useState('Personal Liberty & Natural Justice');
  const [statuteResults, setStatuteResults] = useState<any[]>([]);
  const [statuteAnswer, setStatuteAnswer] = useState<string>('');
  const [statuteExplanation, setStatuteExplanation] = useState<string>('');
  const [isStatuteGrounded, setIsStatuteGrounded] = useState<boolean>(true);
  const [statuteLoading, setStatuteLoading] = useState(false);
  const [statuteError, setStatuteError] = useState<string | null>(null);

  const presets = [
    { act: 'Constitution of India', section: 'Article 21', term: 'Right to Life, Personal Liberty & Privacy' },
    { act: 'Constitution of India', section: 'Article 14', term: 'Right to Equality & Protection from Arbitrariness' },
    { act: 'Constitution of India', section: 'Article 226', term: 'High Court Writ Jurisdiction & Natural Justice' },
    { act: 'Negotiable Instruments Act, 1881', section: 'Section 138', term: 'Cheque Dishonour, 15-Day Statutory Notice' },
    { act: 'SARFAESI Act, 2002', section: 'Section 13(2)', term: '60-Day Demand Notice & Asset Attachment' },
    { act: 'Code of Criminal Procedure, 1973', section: 'Section 438', term: 'Anticipatory Bail & Police Arrest Safeguards' },
    { act: 'Code of Criminal Procedure, 1973', section: 'Section 482', term: 'High Court Inherent Powers to Quash FIR' },
    { act: 'Indian Penal Code, 1860', section: 'Section 420', term: 'Cheating & Dishonest Inducement of Property' },
    { act: 'Indian Evidence Act, 1872', section: 'Section 65B', term: 'Admissibility of Electronic Records & Certificate' },
    { act: 'Arbitration and Conciliation Act, 1996', section: 'Section 9', term: 'Interim Measures by Court Before Tribunal' },
    { act: 'Motor Vehicles Act, 1988', section: 'Section 181', term: 'Driving Without Valid License Penalty' },
    { act: 'Code of Civil Procedure, 1908', section: 'Order 39', term: 'Temporary Injunction & Prima Facie Triple Test' },
  ];

  const executeStatutorySearch = async (searchAct: string, searchSection: string, searchTerm: string) => {
    setStatuteLoading(true);
    setStatuteError(null);
    const query = `${searchAct} ${searchSection} ${searchTerm}`.trim();

    try {
      // Execute deep research through backend for exhaustive IRAC synthesis
      const res = await fastApi.researchDeep(query, 'DEEP', undefined, 'JUDGE', undefined, 'gemini');
      if (res && res.answer) {
        setStatuteAnswer(res.answer);
        setStatuteResults(res.sources || []);
        setIsStatuteGrounded(res.grounded !== false);
        setStatuteExplanation(res.simple_explanation || `Retrieved authoritative statutory analysis for ${searchAct} ${searchSection}.`);
      } else {
        // Fallback to similar cases
        const simRes = await fastApi.findSimilarCases(query, 5);
        if (simRes && simRes.matches && simRes.matches.length > 0) {
          setStatuteResults(simRes.matches);
          setIsStatuteGrounded(true);
          const topMatch = simRes.matches[0];
          const summaryText = simRes.llm_relevance_explanation
            ? `### STATUTORY RESEARCH SUMMARY\n\n**Provision:** ${searchAct} — ${searchSection}\n\n${simRes.llm_relevance_explanation}`
            : `### STATUTORY RESEARCH SUMMARY\n\n**Provision:** ${searchAct} — ${searchSection}\n\n"${topMatch.excerpt}"`;
          setStatuteAnswer(summaryText);
          setStatuteExplanation(`Vector retrieval found ${simRes.matches.length} authoritative source(s) matching ${searchSection}.`);
        } else {
          setStatuteResults([]);
          setIsStatuteGrounded(false);
          setStatuteAnswer('');
          setStatuteExplanation('');
        }
      }
    } catch (err: any) {
      setStatuteResults([]);
      setIsStatuteGrounded(false);
      setStatuteAnswer('');
      setStatuteExplanation('');
      setStatuteError(err?.message || 'Failed to communicate with Legal Research Service.');
    } finally {
      setStatuteLoading(false);
    }
  };

  const handleStatuteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeStatutorySearch(actQuery, sectionQuery, keyword);
  };

  const applyPreset = (preset: typeof presets[0]) => {
    setActQuery(preset.act);
    setSectionQuery(preset.section);
    setKeyword(preset.term);
    executeStatutorySearch(preset.act, preset.section, preset.term);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-subtle pb-4 flex flex-wrap justify-between items-end gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold theme-heading flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            Statutory Legal Research Engine
          </h1>
          <p className="theme-subtext text-xs sm:text-sm mt-1">
            Exhaustive statutory explorer for Indian articles, sections, ratios decidendi, and landmark SC precedents.
          </p>
        </div>
      </div>

      {/* STATUTORY ARTICLE & SECTION EXPLORER CONTENT */}
      <div className="space-y-6">
        {/* Presets */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 font-mono uppercase flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Direct Statutory Presets (Constitutional, Criminal & Civil):
          </span>
          <div className="flex flex-wrap gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p)}
                className="px-3 py-1.5 theme-secondary-btn rounded-md text-xs font-medium flex items-center gap-1.5 cursor-pointer hover:border-amber-500 transition-colors"
              >
                <Scale className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="font-semibold text-amber-600 dark:text-amber-400">{p.section}:</span>
                <span className="theme-subtext">{p.term.slice(0, 30)}...</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search Form Card */}
        <div className="theme-card border border-subtle rounded-xl p-5 shadow-sm space-y-4">
          <form onSubmit={handleStatuteSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold theme-subtext mb-1.5 font-mono">Act / Statute / Code:</label>
              <input
                type="text"
                placeholder="e.g. Constitution of India / IPC / NI Act / SARFAESI"
                value={actQuery}
                onChange={(e) => setActQuery(e.target.value)}
                className="w-full p-2.5 bg-surface border border-subtle rounded-lg text-xs outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold theme-subtext mb-1.5 font-mono">Section / Article / Order:</label>
              <input
                type="text"
                placeholder="e.g. Article 21, Section 138, Section 438, Order 39"
                value={sectionQuery}
                onChange={(e) => setSectionQuery(e.target.value)}
                className="w-full p-2.5 bg-surface border border-subtle rounded-lg text-xs outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold theme-subtext mb-1.5 font-mono">Topic Keywords / Legal Issue:</label>
              <input
                type="text"
                placeholder="e.g. Personal Liberty, Bounced Cheque, Bail Safeguards"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full p-2.5 bg-surface border border-subtle rounded-lg text-xs outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div className="md:col-span-3 flex items-center justify-between pt-1">
              <span className="text-[11px] theme-subtext">
                Retrieves statutory verbatim text, landmark SC precedents, ratio decidendi & past evidence requirements.
              </span>
              <button
                type="submit"
                disabled={statuteLoading}
                className="px-5 py-2.5 theme-primary-btn text-xs rounded-lg flex items-center gap-2 cursor-pointer font-semibold disabled:opacity-50"
              >
                <Search className="w-4 h-4 text-white" />
                <span>{statuteLoading ? 'Analyzing Statutory Authorities...' : 'Execute Statutory Analysis'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Service Error Alert Banner */}
        {statuteError && (
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg p-4 text-xs text-rose-900 dark:text-rose-200 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-rose-800 dark:text-rose-300">
              <Scale className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>Service Notice: {statuteError}</span>
            </div>
          </div>
        )}

        {/* Verified Evidence & Citation Results */}
        {!statuteError && statuteAnswer && (
          <EvidenceCitationViewer
            answer={statuteAnswer}
            simpleExplanation={statuteExplanation}
            grounded={isStatuteGrounded}
            sources={statuteResults}
            mode="STATUTORY_RESEARCH"
            evidenceStatus={isStatuteGrounded ? 'SUPPORTED' : 'INSUFFICIENT_EVIDENCE'}
          />
        )}
      </div>
    </div>
  );
};

export default LegalResearchEngine;

