import React, { useState } from 'react';
import { BookOpen, Search, Scale, Bot, Cpu, Sparkles, MessageSquare, Send, RefreshCw, CheckCircle2, AlertCircle, Copy, Check, FileText, ArrowRight } from 'lucide-react';
import { fastApi } from '@/services/fastapi';
import { EvidenceCitationViewer } from '@/components/common/EvidenceCitationViewer';
import { FormattedMarkdown } from '@/components/common/FormattedMarkdown';

export const LegalResearchEngine: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'statute' | 'chatbot'>('statute');

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

  // AI Chatbot States
  const [selectedModel, setSelectedModel] = useState<'gemini' | 'openai' | 'rag'>('gemini');
  const [researchDepth, setResearchDepth] = useState<'STANDARD' | 'DEEP'>('STANDARD');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{
    sender: 'user' | 'assistant';
    text: string;
    sources?: any[];
    model?: string;
    explanation?: string;
    grounded?: boolean;
  }>>([
    {
      sender: 'assistant',
      text: 'Hello! I am LEXORA AI Legal Research Assistant. Ask me any question on Indian law, constitutional articles, criminal codes (IPC/BNS/CrPC/BNSS), civil procedure, commercial acts (NI Act/SARFAESI/Arbitration), or factual scenarios.',
      model: 'LEXORA Master Judicial AI'
    }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

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

  const chatPrompts = [
    'What are the mandatory requirements to file a case under Section 138 NI Act for cheque bounce?',
    'Under what circumstances can the High Court quash an FIR under Section 482 CrPC / Section 528 BNSS?',
    'What safeguards protect citizens against arbitrary arrest under Article 21 and Section 41A CrPC?',
    'How can a landlord or tenant legally enforce security deposit refunds under Indian tenancy laws?',
    'What is the evidentiary standard required for electronic records under Section 65B of Evidence Act?',
    'Explain the 60-day demand notice procedure and borrower rights under Section 13(2) SARFAESI Act.'
  ];

  const executeStatutorySearch = async (searchAct: string, searchSection: string, searchTerm: string) => {
    setStatuteLoading(true);
    setStatuteError(null);
    const query = `${searchAct} ${searchSection} ${searchTerm}`.trim();

    try {
      // Execute deep research through backend for exhaustive IRAC synthesis
      const res = await fastApi.researchDeep(query, 'DEEP', undefined, 'JUDGE', undefined, selectedModel);
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

  const handleSendChatMessage = async (overridePrompt?: string) => {
    const textToSend = overridePrompt || chatInput;
    if (!textToSend.trim() || chatLoading) return;

    const userMsg = { sender: 'user' as const, text: textToSend };
    setChatMessages(prev => [...prev, userMsg]);
    if (!overridePrompt) setChatInput('');
    setChatLoading(true);

    try {
      const historyPayload = chatMessages.map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await fastApi.chatLegal(
        textToSend,
        undefined,
        historyPayload,
        'LAWYER',
        researchDepth,
        selectedModel
      );

      if (res && res.answer) {
        setChatMessages(prev => [
          ...prev,
          {
            sender: 'assistant',
            text: res.answer,
            sources: res.sources || [],
            model: selectedModel === 'gemini' ? 'Google Gemini 1.5 Flash' : (selectedModel === 'openai' ? 'OpenAI GPT-4o-mini' : 'Lexora Hybrid RAG'),
            explanation: res.simple_explanation,
            grounded: res.grounded !== false
          }
        ]);
      } else {
        setChatMessages(prev => [
          ...prev,
          {
            sender: 'assistant',
            text: 'I could not retrieve an authoritative answer for this specific query. Please try phrasing your question with specific legal terms or sections.',
            model: 'LEXORA Assistant'
          }
        ]);
      }
    } catch (err: any) {
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: `Communication notice: ${err?.message || 'The legal research service is currently processing high volume. Please try again.'}`,
          model: 'System Notification'
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-subtle pb-4 flex flex-wrap justify-between items-end gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold theme-heading flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            Statutory Legal Research Engine & AI Assistant
          </h1>
          <p className="theme-subtext text-xs sm:text-sm mt-1">
            Exhaustive statutory explorer for Indian articles/sections and interactive multi-model legal AI chatbot.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-surface border border-subtle rounded-lg p-1 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('statute')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'statute'
                ? 'theme-primary-btn shadow-sm'
                : 'theme-subtext hover:theme-heading'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Statutory Article & Section Explorer</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('chatbot')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'chatbot'
                ? 'theme-primary-btn shadow-sm'
                : 'theme-subtext hover:theme-heading'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Legal Research AI Chatbot</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: STATUTORY ARTICLE & SECTION EXPLORER */}
      {/* ============================================================ */}
      {activeTab === 'statute' && (
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
      )}

      {/* ============================================================ */}
      {/* TAB 2: INTERACTIVE AI LEGAL CHATBOT */}
      {/* ============================================================ */}
      {activeTab === 'chatbot' && (
        <div className="space-y-4">
          {/* Controls Bar: Model Selector & Depth */}
          <div className="theme-card border border-subtle rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold theme-subtext uppercase flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Active Intelligence Model:
              </span>
              <div className="flex bg-surface border border-subtle rounded-lg p-0.5 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setSelectedModel('gemini')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                    selectedModel === 'gemini'
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : 'theme-subtext hover:theme-heading'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Google Gemini 1.5 Flash</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedModel('openai')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                    selectedModel === 'openai'
                      ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                      : 'theme-subtext hover:theme-heading'
                  }`}
                >
                  <Bot className="w-3 h-3" />
                  <span>OpenAI GPT-4o-mini</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedModel('rag')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                    selectedModel === 'rag'
                      ? 'bg-amber-600 text-white font-semibold shadow-sm'
                      : 'theme-subtext hover:theme-heading'
                  }`}
                >
                  <Scale className="w-3 h-3" />
                  <span>Lexora Hybrid RAG</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold theme-subtext uppercase">Research Depth:</span>
              <select
                value={researchDepth}
                onChange={(e) => setResearchDepth(e.target.value as any)}
                className="bg-surface border border-subtle rounded-md px-2.5 py-1 text-xs theme-heading outline-none"
              >
                <option value="STANDARD">Standard Research</option>
                <option value="DEEP">Deep Multi-Authority IRAC</option>
              </select>
            </div>
          </div>

          {/* Quick Prompt Chips */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono theme-subtext uppercase">Quick Research Inquiries:</span>
            <div className="flex flex-wrap gap-1.5">
              {chatPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendChatMessage(prompt)}
                  className="px-2.5 py-1 theme-secondary-btn rounded text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer hover:border-blue-500"
                >
                  <MessageSquare className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  <span>{prompt.slice(0, 48)}...</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages Stream */}
          <div className="theme-card border border-subtle rounded-xl p-5 space-y-4 min-h-[420px] max-h-[600px] overflow-y-auto">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className="text-[10px] font-mono font-bold uppercase theme-subtext">
                    {msg.sender === 'user' ? 'Legal Researcher / User' : (msg.model || 'LEXORA Judicial AI')}
                  </span>
                  {msg.sender === 'assistant' && msg.grounded && (
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold px-1.5 py-0.2 rounded border border-emerald-500/20">
                      Authoritative Grounded
                    </span>
                  )}
                </div>

                <div
                  className={`p-4 rounded-xl text-xs max-w-3xl leading-relaxed whitespace-pre-wrap relative group ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                      : 'theme-elevated border border-subtle theme-heading rounded-bl-none shadow-sm'
                  }`}
                >
                  {msg.sender === 'user' ? (
                    msg.text
                  ) : (
                    <FormattedMarkdown content={msg.text} />
                  )}

                  {msg.sender === 'assistant' && (
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.text, idx)}
                      className="absolute top-2 right-2 p-1 rounded bg-surface border border-subtle opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer theme-subtext hover:theme-heading"
                      title="Copy Answer"
                    >
                      {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                {/* Sources attachment if present */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2 w-full max-w-3xl">
                    <div className="bg-surface border border-subtle rounded-lg p-3 space-y-2">
                      <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        Retrieved Judicial Authorities & Citations ({msg.sources.length}):
                      </span>
                      <div className="grid grid-cols-1 gap-2">
                        {msg.sources.slice(0, 3).map((src: any, sIdx: number) => (
                          <div key={sIdx} className="theme-card p-2 rounded border border-subtle text-[11px] space-y-1">
                            <div className="flex justify-between items-center font-bold text-blue-600 dark:text-blue-400">
                              <span>{src.case_name || src.title || 'Legal Precedent'}</span>
                              <span className="text-[10px] theme-subtext font-mono">{src.court || 'Supreme Court of India'}</span>
                            </div>
                            <p className="theme-subtext line-clamp-2 italic font-serif">"{src.excerpt}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {chatLoading && (
              <div className="flex items-center gap-2 theme-subtext text-xs p-3 theme-elevated rounded-lg border border-subtle w-fit">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600 dark:text-blue-400" />
                <span>LEXORA is synthesizing statutory provisions and precedent authorities...</span>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <div className="theme-card border border-subtle rounded-xl p-3 flex items-center gap-2 shadow-sm">
            <textarea
              rows={2}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendChatMessage();
                }
              }}
              placeholder={`Ask any legal question (Using ${selectedModel === 'gemini' ? 'Google Gemini 1.5' : (selectedModel === 'openai' ? 'OpenAI GPT-4o' : 'Lexora RAG')})... Press Enter to send.`}
              className="flex-1 p-2 bg-transparent text-xs theme-heading placeholder:theme-subtext outline-none resize-none"
            />
            <button
              type="button"
              onClick={() => handleSendChatMessage()}
              disabled={chatLoading || !chatInput.trim()}
              className="theme-primary-btn p-3 rounded-lg flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LegalResearchEngine;

