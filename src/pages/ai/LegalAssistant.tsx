import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Scale,
  Send,
  Plus,
  Copy,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sun,
  Moon,
  User,
  ArrowLeft,
  Paperclip,
  X,
  FileText,
  AlertCircle,
  ShieldCheck,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { fastApi } from '@/services/fastapi';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { EvidenceCitationViewer, type EvidenceSource } from '@/components/common/EvidenceCitationViewer';
import { FormattedMarkdown } from '@/components/common/FormattedMarkdown';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  grounded?: boolean;
  sources?: EvidenceSource[];
  mode?: string;
  evidenceStatus?: string;
  evidenceStrength?: string;
  researchDepth?: string;
  currentness?: string;
  simpleExplanation?: string;
  warnings?: string[];
  falsePremiseDetected?: boolean;
  falsePremiseReason?: string;
  whyThisAnswer?: any;
  disclaimer?: string;
}

export const LegalAssistant: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const caseId = searchParams.get('caseId') || undefined;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [attachmentText, setAttachmentText] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [expandedSources, setExpandedSources] = useState<Record<number, boolean>>({});

  // Unified Multi-Model & Research Depth Selector States
  const [selectedModel, setSelectedModel] = useState<'hybrid' | 'gemini' | 'openai' | 'llama'>('hybrid');
  const [researchDepth, setResearchDepth] = useState<'STANDARD' | 'DEEP' | 'DOCUMENT_ANALYSIS' | 'DRAFTING'>('STANDARD');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const toggleSourceExpand = (index: number) => {
    setExpandedSources((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleFileAttach = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setAttachmentName(file.name);

    try {
      const res = await fastApi.extractFile(file);
      if (res && res.text) {
        setAttachmentText(res.text);
      } else {
        setAttachmentText(`[Attached file: ${file.name}]`);
      }
    } catch {
      setAttachmentText(`[Attached file reference: ${file.name}]`);
    } finally {
      setIsUploading(false);
    }
  };

  const clearAttachment = () => {
    setAttachmentName(null);
    setAttachmentText(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleNewConversation = () => {
    setMessages([]);
    setInputQuery('');
    clearAttachment();
    setExpandedSources({});
  };

  const handleSendMessage = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    let queryText = (customQuery || inputQuery).trim();
    if (attachmentText) {
      queryText = `[ATTACHED FILE FOR ANALYSIS: ${attachmentName}]\n${attachmentText.substring(0, 2000)}\n\nUSER QUESTION: ${queryText}`.trim();
    }

    if (!queryText || loading) return;

    const userDisplayMessage = (customQuery || inputQuery).trim() || `Analyze attached document: ${attachmentName}`;

    setInputQuery('');
    clearAttachment();

    const updatedMessages: Message[] = [...messages, { sender: 'user', text: userDisplayMessage }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const conversationHistory = updatedMessages.map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const res = await fastApi.chatLegal(
        queryText,
        caseId,
        conversationHistory,
        user?.role?.toUpperCase() || 'CITIZEN',
        researchDepth,
        selectedModel
      );

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: res.answer || res.text || 'No authoritative response generated.',
          grounded: Boolean(res.grounded),
          sources: res.sources || [],
          mode: res.mode || (selectedModel.toUpperCase() + ' · ' + researchDepth),
          evidenceStatus: res.evidence_status || (res.grounded ? 'SUPPORTED' : 'INSUFFICIENT_EVIDENCE'),
          evidenceStrength: res.evidence_strength || 'HIGH',
          currentness: res.currentness || 'VERIFIED',
          simpleExplanation: res.simple_explanation,
          warnings: res.warnings || [],
          falsePremiseDetected: Boolean(res.false_premise_detected),
          falsePremiseReason: res.false_premise_reason,
          whyThisAnswer: res.why_this_answer,
          disclaimer: res.disclaimer,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Sorry, I could not process your request right now. Please verify server connectivity and try again.',
          grounded: false,
          sources: [],
          mode: 'GENERAL_LEGAL',
          evidenceStatus: 'SERVICE_UNAVAILABLE',
          currentness: 'CURRENTNESS_UNVERIFIED',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'Analyze document clauses & detect potential legal risks',
    'What are the mandatory requirements for Section 138 NI Act cheque bounce notice?',
    'Under what circumstances can High Court quash FIR under Section 482 CrPC / Sec 528 BNSS?',
    'Draft a formal legal notice for breach of contract & non-payment',
    'Summarize legal precedent & statutory provisions for Section 13(2) SARFAESI Act'
  ];

  return (
    <div className="theme-card p-6 shadow-sm space-y-4 flex flex-col min-h-[calc(100vh-140px)] font-sans">
      {/* ── Page Header Bar ────────────────────────────────────────────── */}
      <div className="border-b border-[#D9DEE4] dark:border-[#2B3742] pb-4 flex flex-wrap justify-between items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            <h1 className="text-xl sm:text-2xl font-serif font-bold theme-heading tracking-tight">
              Unified AI Legal Assistant
            </h1>
          </div>
          <p className="text-xs theme-subtext mt-1">
            All-in-one conversational AI combining Google Gemini, ChatGPT/OpenAI, and LEXORA Hybrid RAG Vector Search.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {caseId ? (
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-sm badge-supported border flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              CASE-SCOPED: {caseId}
            </span>
          ) : (
            <span className="text-[10px] font-mono theme-subtext uppercase tracking-wider theme-elevated px-2.5 py-1 rounded-sm border border-subtle">
              UNIFIED LEGAL RESEARCH
            </span>
          )}

          <button
            type="button"
            onClick={handleNewConversation}
            className="px-3 py-1.5 theme-secondary-btn rounded-sm text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-[var(--primary-accent)]" />
            <span>New Session</span>
          </button>
        </div>
      </div>

      {/* ── Multi-Model & Engine Switcher Bar ────────────────────────────── */}
      <div className="theme-elevated p-3 rounded-lg border border-subtle flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-[10px] theme-subtext uppercase tracking-wider">AI ENGINE MODEL:</span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedModel('hybrid')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer border ${
                selectedModel === 'hybrid'
                  ? 'theme-primary-btn font-bold shadow-xs border-[var(--primary-accent)]'
                  : 'theme-card theme-subtext border-subtle hover:theme-heading'
              }`}
            >
              ⚡ LEXORA Hybrid RAG
            </button>
            <button
              type="button"
              onClick={() => setSelectedModel('gemini')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer border ${
                selectedModel === 'gemini'
                  ? 'bg-blue-600 text-white font-bold shadow-xs border-blue-700'
                  : 'theme-card theme-subtext border-subtle hover:theme-heading'
              }`}
            >
              🤖 Gemini 1.5 Pro
            </button>
            <button
              type="button"
              onClick={() => setSelectedModel('openai')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer border ${
                selectedModel === 'openai'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs border-emerald-700'
                  : 'theme-card theme-subtext border-subtle hover:theme-heading'
              }`}
            >
              🧠 ChatGPT (GPT-4o)
            </button>
            <button
              type="button"
              onClick={() => setSelectedModel('llama')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer border ${
                selectedModel === 'llama'
                  ? 'bg-purple-600 text-white font-bold shadow-xs border-purple-700'
                  : 'theme-card theme-subtext border-subtle hover:theme-heading'
              }`}
            >
              🔒 Secure Llama 3
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-[10px] theme-subtext uppercase tracking-wider">RESEARCH MODE:</span>
          <select
            value={researchDepth}
            onChange={(e) => setResearchDepth(e.target.value as any)}
            className="px-2.5 py-1 theme-card border border-subtle rounded-md text-[11px] font-bold theme-heading outline-none cursor-pointer"
          >
            <option value="STANDARD">⚡ Standard Legal Q&A</option>
            <option value="DEEP">🔍 Deep Precedent & Statute RAG</option>
            <option value="DOCUMENT_ANALYSIS">📄 Document Clause & Risk Review</option>
            <option value="DRAFTING">📜 Order & Motion Drafter</option>
          </select>
        </div>
      </div>

      {/* ── Conversation Scroll Container ────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-1 max-h-[55vh] min-h-[350px]">
        {/* Initial Empty Welcome State */}
        {messages.length === 0 && (
          <div className="min-h-[280px] flex flex-col items-center justify-center text-center py-6 space-y-4 my-auto">
            <div className="w-12 h-12 rounded-full border border-subtle theme-card flex items-center justify-center shadow-md">
              <Scale className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>

            <div className="space-y-1.5 max-w-lg">
              <h2 className="text-lg font-serif font-bold theme-heading tracking-tight">Unified AI Legal Assistant & Model Switcher</h2>
              <p className="text-xs theme-subtext leading-relaxed">
                Choose your preferred AI model (Gemini, ChatGPT, Llama, or LEXORA Hybrid RAG), attach documents for instant risk analysis, or query statutory acts and court precedents.
              </p>
            </div>

            {/* Quick Action Preset Pills */}
            <div className="flex flex-wrap justify-center gap-2 max-w-xl">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(undefined, prompt)}
                  className="px-3 py-1.5 theme-elevated border border-subtle rounded-md text-[11px] theme-heading hover:border-[var(--primary-accent)] cursor-pointer text-left transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Conversation Message List */}
        {messages.map((msg, idx) => (
          <div key={idx} className="space-y-2">
            {/* User Message */}
            {msg.sender === 'user' ? (
              <div className="flex flex-col items-end space-y-1">
                <div className="flex items-center gap-1 text-[10px] font-mono theme-subtext uppercase">
                  <User className="w-3 h-3 text-[var(--primary-accent)]" />
                  <span>{user?.name || 'USER'}</span>
                </div>
                <div className="bg-surface border border-subtle text-xs p-4 rounded-sm theme-heading max-w-[90%] sm:max-w-[80%] leading-relaxed font-sans shadow-sm whitespace-pre-line">
                  {msg.text}
                </div>
              </div>
            ) : (
              /* Assistant Response */
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-xs font-serif font-bold theme-heading">LEXORA</span>
                    {msg.mode && (
                      <span className="text-[9px] font-mono font-semibold uppercase px-2 py-0.5 rounded-sm border border-subtle theme-elevated theme-subtext">
                        {msg.mode.replace('_', ' ')}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(msg.text, idx)}
                    className="text-[10px] font-mono theme-subtext hover:theme-heading flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Copy className="w-3 h-3 text-[var(--primary-accent)]" />
                    <span>{copiedIdx === idx ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="theme-card p-5 space-y-4 shadow-sm border border-subtle rounded-sm">
                  {/* Legal Answer Text */}
                  <FormattedMarkdown content={msg.text} />

                  {/* Plain Language Overview */}
                  {msg.simpleExplanation && (
                    <div className="pt-3 border-t border-subtle theme-elevated p-3 rounded-sm border border-subtle">
                      <span className="text-[10px] font-mono font-bold uppercase text-blue-600 dark:text-blue-400 block mb-1">
                        Plain-Language Overview:
                      </span>
                      <p className="text-[11px] theme-subtext leading-relaxed">{msg.simpleExplanation}</p>
                    </div>
                  )}

                  {/* Expandable Sources & Evidence Section */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="pt-3 border-t border-subtle space-y-2">
                      <button
                        type="button"
                        onClick={() => toggleSourceExpand(idx)}
                        className="text-xs font-mono font-semibold text-[var(--primary-accent)] flex items-center justify-between w-full hover:underline cursor-pointer py-1"
                      >
                        <span className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" />
                          <span>Sources &amp; Authoritative Evidence ({msg.sources.length})</span>
                        </span>
                        {expandedSources[idx] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {expandedSources[idx] && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2">
                          {msg.sources.map((src, sIdx) => {
                            const title = src.citation || src.act || src.case_name || src.title || 'Legal Document';
                            const courtName = src.court || src.source || 'Statutory Code';
                            const relevance = src.relevance_score !== undefined
                              ? (src.relevance_score <= 1 ? (src.relevance_score * 100).toFixed(1) + '%' : `${src.relevance_score}%`)
                              : 'N/A';
                            return (
                              <div key={sIdx} className="theme-elevated p-3 rounded-sm border border-subtle space-y-1.5 text-xs font-mono">
                                <div className="flex justify-between items-start border-b border-subtle pb-1">
                                  <div>
                                    <p className="font-bold text-[var(--primary-accent)] truncate max-w-[200px]">{title}</p>
                                    <p className="text-[10px] theme-subtext">{courtName}</p>
                                  </div>
                                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                    Level {src.authority_level || 1} | {relevance}
                                  </span>
                                </div>
                                <p className="text-[11px] theme-heading italic font-serif line-clamp-2">
                                  "{src.excerpt || 'Excerpt indexed in corpus.'}"
                                </p>
                                <div className="text-[9px] theme-subtext flex justify-between">
                                  <span>Status: {src.status || 'IN_FORCE'}</span>
                                  <span>Page {src.page_number || 1} {src.paragraph_number ? `Para ${src.paragraph_number}` : ''}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Human Review Disclaimer Footer */}
                  <div className="pt-2 border-t border-subtle flex flex-wrap justify-between items-center text-[10px] theme-subtext font-mono gap-2">
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      <span>HUMAN JUDICIAL REVIEW REQUIRED · AI assists, human decides</span>
                    </div>

                    {msg.evidenceStatus && (
                      <span className={`px-2 py-0.5 rounded-sm font-bold border uppercase text-[9px] ${
                        msg.evidenceStatus === 'SUPPORTED'
                          ? 'badge-supported'
                          : msg.evidenceStatus === 'PARTIALLY_SUPPORTED'
                          ? 'badge-pending'
                          : 'badge-rejected'
                      }`}>
                        {msg.evidenceStatus.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Researching Indicator */}
        {loading && (
          <div className="flex items-center gap-3 p-4 theme-elevated border border-subtle rounded-sm text-xs font-mono text-[var(--primary-accent)]">
            <Loader2 className="w-4 h-4 animate-spin text-[var(--primary-accent)]" />
            <span>RESEARCHING LEGAL AUTHORITIES &amp; VERIFYING EVIDENCE SOURCES...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Bottom Input Bar Area ────────────────────────────────────────── */}
      <div className="pt-2 border-t border-subtle space-y-2">
        {/* File Attachment Pill */}
        {attachmentName && (
          <div className="flex items-center gap-2 text-xs font-mono theme-elevated border border-subtle px-3 py-1.5 rounded-sm w-fit">
            <FileText className="w-3.5 h-3.5 text-[var(--primary-accent)]" />
            <span className="truncate max-w-xs">{attachmentName}</span>
            <button
              type="button"
              onClick={clearAttachment}
              className="p-0.5 hover:text-rose-500 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="relative flex items-end gap-2 theme-elevated p-2 border border-subtle rounded-md shadow-sm">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileAttach}
            className="hidden"
            accept=".pdf,.txt,.doc,.docx,.jpg,.png"
          />

          {/* Document Attachment Button */}
          <button
            type="button"
            disabled={isUploading || loading}
            onClick={() => fileInputRef.current?.click()}
            title="Attach Document or Brief for AI Analysis"
            className="p-2.5 theme-secondary-btn rounded-sm text-xs flex items-center justify-center cursor-pointer transition-colors"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[var(--primary-accent)]" />
            ) : (
              <Paperclip className="w-4 h-4 text-[var(--primary-accent)]" />
            )}
          </button>

          {/* Multiline Textarea */}
          <textarea
            ref={textareaRef}
            rows={2}
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask LEXORA a legal question... (Enter to send, Shift+Enter for new line)"
            disabled={loading}
            className="flex-1 bg-transparent border-0 p-2 text-xs theme-heading outline-none resize-none min-h-[44px] max-h-32"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={loading || (!inputQuery.trim() && !attachmentText)}
            className="p-2.5 theme-primary-btn text-xs rounded-sm flex items-center justify-center cursor-pointer font-semibold shrink-0 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
          </button>
        </form>

        <div className="flex justify-between items-center text-[10px] theme-subtext font-mono px-1">
          <span>LEXORA Grounded RAG Intelligence Engine</span>
          <span>Shift + Enter for multiline</span>
        </div>
      </div>
    </div>
  );
};

export default LegalAssistant;
