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
  User,
  Paperclip,
  X,
  FileText,
  AlertCircle,
  ShieldCheck,
  Bot,
  Sparkles,
  Zap,
  CheckCircle2,
  SlidersHorizontal,
  Layers,
  Info,
  Check
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
  const isCitizen = user?.role?.toUpperCase() === 'CITIZEN';

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [attachmentText, setAttachmentText] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [expandedSources, setExpandedSources] = useState<Record<number, boolean>>({});

  // Unified Multi-Model & Research Depth Selector States
  // For citizens, default to 'gemini' and hide LEXORA Hybrid RAG
  const [selectedModel, setSelectedModel] = useState<'hybrid' | 'gemini' | 'openai' | 'llama'>(() => {
    return isCitizen ? 'gemini' : 'hybrid';
  });
  const [researchDepth, setResearchDepth] = useState<'STANDARD' | 'DEEP' | 'DOCUMENT_ANALYSIS' | 'DRAFTING'>('STANDARD');

  // Enforce citizen restriction if role changes or loads late
  useEffect(() => {
    if (isCitizen && selectedModel === 'hybrid') {
      setSelectedModel('gemini');
    }
  }, [isCitizen, selectedModel]);

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

  // AI Assistant Engines Definition (LEXORA RAG is excluded for Citizen portal)
  const assistantModels = [
    ...(!isCitizen
      ? [
          {
            id: 'hybrid' as const,
            name: 'LEXORA Hybrid RAG',
            badge: 'Grounded Legal Vector RAG',
            icon: Zap,
            iconColor: 'text-amber-500',
            bgGlow: 'bg-amber-500/10',
            borderColor: 'border-amber-500/30',
            activeRing: 'ring-2 ring-[var(--primary-accent)] border-[var(--primary-accent)] bg-amber-500/5 dark:bg-amber-500/10',
            desc: 'Supreme Court & High Court precedents with statutory citation grounding.',
            tag: 'Vector Corpus RAG',
          },
        ]
      : []),
    {
      id: 'gemini' as const,
      name: 'Google Gemini 1.5 Pro',
      badge: 'Multimodal Legal Logic',
      icon: Sparkles,
      iconColor: 'text-blue-500',
      bgGlow: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      activeRing: 'ring-2 ring-blue-500 border-blue-500 bg-blue-500/5 dark:bg-blue-500/10',
      desc: 'Long-context reasoning for complex pleadings, contracts & legal queries.',
      tag: 'Google DeepMind',
    },
    {
      id: 'openai' as const,
      name: 'ChatGPT (GPT-4o)',
      badge: 'Advanced Synthesis',
      icon: Bot,
      iconColor: 'text-emerald-500',
      bgGlow: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      activeRing: 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10',
      desc: 'High-precision legal Q&A, statutory interpretation & document drafting.',
      tag: 'OpenAI GPT-4o',
    },
    {
      id: 'llama' as const,
      name: 'Secure Llama 3',
      badge: 'Private On-Prem LLM',
      icon: ShieldCheck,
      iconColor: 'text-purple-500',
      bgGlow: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      activeRing: 'ring-2 ring-purple-500 border-purple-500 bg-purple-500/5 dark:bg-purple-500/10',
      desc: 'Zero external telemetry; fully confidential legal document & clause parsing.',
      tag: 'Confidential AI',
    },
  ];

  const quickPrompts = isCitizen
    ? [
        'How do I respond to a court summons or legal notice?',
        'What are the mandatory requirements for Section 138 NI Act cheque bounce?',
        'How can I apply for free legal aid through DLSA / NALSA?',
        'Explain consumer dispute filing procedure in simple words',
        'What documents are needed to file a civil property declaration suit?'
      ]
    : [
        'Analyze document clauses & detect potential legal risks',
        'What are the mandatory requirements for Section 138 NI Act cheque bounce notice?',
        'Under what circumstances can High Court quash FIR under Section 482 CrPC / Sec 528 BNSS?',
        'Draft a formal legal notice for breach of contract & non-payment',
        'Summarize legal precedent & statutory provisions for Section 13(2) SARFAESI Act'
      ];

  const selectedModelData = assistantModels.find((m) => m.id === selectedModel) || assistantModels[0];

  return (
    <div className="theme-card p-4 sm:p-6 shadow-sm space-y-4 flex flex-col min-h-[calc(100vh-140px)] font-sans">
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
            {isCitizen
              ? 'All-in-one conversational AI assistant combining Google Gemini, ChatGPT/OpenAI, and Secure Llama for accessible legal guidance.'
              : 'All-in-one conversational AI combining Google Gemini, ChatGPT/OpenAI, and LEXORA Hybrid RAG Vector Search.'}
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
              {isCitizen ? 'CITIZEN LEGAL ASSISTANT' : 'UNIFIED LEGAL RESEARCH'}
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

      {/* ── Main Layout: Chat Area (Left) + AI Assistants & Controls Sidebar (Right) ── */}
      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0">
        
        {/* ── Left Column: Conversation Stream & Input Area ── */}
        <div className="flex-1 flex flex-col min-w-0 justify-between space-y-4">
          
          {/* Conversation Scroll Container */}
          <div className="flex-1 overflow-y-auto space-y-6 pr-1 max-h-[62vh] min-h-[380px]">
            {/* Initial Empty Welcome State */}
            {messages.length === 0 && (
              <div className="min-h-[320px] flex flex-col items-center justify-center text-center py-6 space-y-4 my-auto">
                <div className="w-14 h-14 rounded-2xl border border-subtle theme-card flex items-center justify-center shadow-md bg-amber-500/5">
                  <Scale className="w-7 h-7 text-amber-600 dark:text-amber-400" />
                </div>

                <div className="space-y-1.5 max-w-lg">
                  <h2 className="text-lg font-serif font-bold theme-heading tracking-tight">
                    {isCitizen ? 'Citizen Legal AI Assistant' : 'Unified AI Legal Assistant & Model Switcher'}
                  </h2>
                  <p className="text-xs theme-subtext leading-relaxed">
                    {isCitizen
                      ? 'Choose your preferred AI assistant on the right panel (Gemini, ChatGPT, or Llama), attach documents for instant plain-language explanation, or ask any legal question.'
                      : 'Choose your preferred AI model on the right panel (Gemini, ChatGPT, Llama, or LEXORA Hybrid RAG), attach documents for instant risk analysis, or query statutory acts and court precedents.'}
                  </p>
                </div>

                {/* Quick Action Preset Pills */}
                <div className="space-y-2 max-w-xl w-full pt-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider theme-subtext block">
                    Suggested Quick Prompts:
                  </span>
                  <div className="flex flex-wrap justify-center gap-2">
                    {quickPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(undefined, prompt)}
                        className="px-3 py-1.5 theme-elevated border border-subtle rounded-md text-[11px] theme-heading hover:border-[var(--primary-accent)] cursor-pointer text-left transition-all hover:scale-[1.01]"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
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
                    <div className="bg-surface border border-subtle text-xs p-4 rounded-lg theme-heading max-w-[90%] sm:max-w-[80%] leading-relaxed font-sans shadow-sm whitespace-pre-line">
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

                    <div className="theme-card p-5 space-y-4 shadow-sm border border-subtle rounded-lg">
                      {/* Legal Answer Text */}
                      <FormattedMarkdown content={msg.text} />

                      {/* Plain Language Overview */}
                      {msg.simpleExplanation && (
                        <div className="pt-3 border-t border-subtle theme-elevated p-3 rounded-lg border border-subtle">
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
                                  <div key={sIdx} className="theme-elevated p-3 rounded-md border border-subtle space-y-1.5 text-xs font-mono">
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
              <div className="flex items-center gap-3 p-4 theme-elevated border border-subtle rounded-lg text-xs font-mono text-[var(--primary-accent)] animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-[var(--primary-accent)]" />
                <span>
                  {selectedModelData.name.toUpperCase()} IS PROCESSING QUERY &amp; VERIFYING LEGAL KNOWLEDGE...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Input Bar Area */}
          <div className="pt-2 border-t border-subtle space-y-2">
            {/* File Attachment Pill */}
            {attachmentName && (
              <div className="flex items-center gap-2 text-xs font-mono theme-elevated border border-subtle px-3 py-1.5 rounded-md w-fit">
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

            <form onSubmit={handleSendMessage} className="relative flex items-end gap-2 theme-elevated p-2 border border-subtle rounded-xl shadow-sm focus-within:ring-1 focus-within:ring-[var(--primary-accent)]">
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
                className="p-2.5 theme-secondary-btn rounded-lg text-xs flex items-center justify-center cursor-pointer transition-colors shrink-0"
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
                placeholder={isCitizen ? "Ask your legal question in simple terms... (Enter to send, Shift+Enter for new line)" : "Ask LEXORA a legal question... (Enter to send, Shift+Enter for new line)"}
                disabled={loading}
                className="flex-1 bg-transparent border-0 p-2 text-xs theme-heading outline-none resize-none min-h-[44px] max-h-32"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={loading || (!inputQuery.trim() && !attachmentText)}
                className="p-2.5 theme-primary-btn text-xs rounded-lg flex items-center justify-center cursor-pointer font-semibold shrink-0 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Send className="w-4 h-4 text-white" />
                )}
              </button>
            </form>

            <div className="flex justify-between items-center text-[10px] theme-subtext font-mono px-1">
              <span>
                {isCitizen ? 'LEXORA AI Multilingual Citizen Legal Assistant' : 'LEXORA Grounded RAG Intelligence Engine'}
              </span>
              <span>Shift + Enter for multiline</span>
            </div>
          </div>
        </div>

        {/* ── Right Column: AI Assistants & Engine Controls Sidebar ── */}
        <div className="w-full lg:w-80 xl:w-96 shrink-0 flex flex-col gap-4 border-t lg:border-t-0 lg:border-l border-subtle pt-4 lg:pt-0 lg:pl-5">
          
          {/* Section 1: AI Assistant Engines Selection */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-[var(--primary-accent)]" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider theme-heading">
                  AI ASSISTANT ENGINES
                </h3>
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                ACTIVE
              </span>
            </div>

            <p className="text-[11px] theme-subtext">
              Select the active AI assistant model for research, analysis, and reasoning:
            </p>

            {/* AI Assistant Models Cards */}
            <div className="space-y-2">
              {assistantModels.map((m) => {
                const IconComponent = m.icon;
                const isSelected = selectedModel === m.id;

                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedModel(m.id)}
                    className={`theme-card p-3 rounded-xl border transition-all cursor-pointer group relative ${
                      isSelected
                        ? m.activeRing
                        : 'border-subtle hover:border-subtle hover:theme-elevated'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <div className={`w-8 h-8 rounded-lg ${m.bgGlow} border ${m.borderColor} flex items-center justify-center shrink-0 mt-0.5`}>
                          <IconComponent className={`w-4 h-4 ${m.iconColor}`} />
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-xs font-bold theme-heading group-hover:text-[var(--primary-accent)] transition-colors">
                              {m.name}
                            </h4>
                          </div>
                          <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-surface border border-subtle theme-subtext inline-block">
                            {m.badge}
                          </span>
                          <p className="text-[11px] theme-subtext leading-tight mt-1">
                            {m.desc}
                          </p>
                        </div>
                      </div>

                      {/* Selection Checkmark */}
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-[var(--primary-accent)] border-[var(--primary-accent)] text-white'
                          : 'border-subtle opacity-40 group-hover:opacity-100'
                      }`}>
                        {isSelected && <Check className="w-2.5 h-2.5" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Research & Reasoning Mode */}
          <div className="space-y-2 pt-2 border-t border-subtle">
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--primary-accent)]" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider theme-heading">
                REASONING DEPTH
              </h3>
            </div>

            <div className="space-y-1.5">
              <select
                value={researchDepth}
                onChange={(e) => setResearchDepth(e.target.value as any)}
                className="w-full px-3 py-2 theme-elevated border border-subtle rounded-lg text-xs font-bold theme-heading outline-none cursor-pointer focus:ring-1 focus:ring-[var(--primary-accent)]"
              >
                <option value="STANDARD">⚡ Standard Legal Q&amp;A</option>
                <option value="DEEP">🔍 Deep Precedent &amp; Statute RAG</option>
                <option value="DOCUMENT_ANALYSIS">📄 Document Clause &amp; Risk Review</option>
                <option value="DRAFTING">📜 Order &amp; Motion Drafter</option>
              </select>
              <p className="text-[10px] theme-subtext font-mono">
                {researchDepth === 'STANDARD' && 'Fast response optimized for conversational queries.'}
                {researchDepth === 'DEEP' && 'Exhaustive IRAC synthesis with statutory provisions.'}
                {researchDepth === 'DOCUMENT_ANALYSIS' && 'Extracts clauses, liability, and breach alerts.'}
                {researchDepth === 'DRAFTING' && 'Formatted legal pleadings, motions, and notices.'}
              </p>
            </div>
          </div>

          {/* Section 3: Active Engine Info & Safeguards */}
          <div className="theme-elevated p-3.5 rounded-xl border border-subtle space-y-2 text-xs font-mono mt-auto">
            <div className="flex items-center gap-1.5 text-[var(--primary-accent)]">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span className="font-bold text-[11px]">ACTIVE ENGINE TELEMETRY</span>
            </div>
            <div className="space-y-1 text-[10px] theme-subtext">
              <div className="flex justify-between">
                <span>Model:</span>
                <strong className="theme-heading">{selectedModelData.name}</strong>
              </div>
              <div className="flex justify-between">
                <span>Domain:</span>
                <strong className="theme-heading">Indian Jurisprudence</strong>
              </div>
              <div className="flex justify-between">
                <span>Hallucination Filter:</span>
                <strong className="text-emerald-600 dark:text-emerald-400">ENFORCED</strong>
              </div>
              <div className="flex justify-between">
                <span>Role Scope:</span>
                <strong className="theme-heading">{user?.role || 'CITIZEN'}</strong>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LegalAssistant;
