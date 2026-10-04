// Client for AI Services routed securely through Express API Gateway (/api/ai/...)
// Direct browser calls to FastAPI (Port 8000) are eliminated for production security architecture.

import { getApiBaseUrl, getAuthToken } from './api';

function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )csrf_token=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

async function fastApiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || 'POST').toUpperCase();
  const csrfToken = getCsrfToken();
  const token = getAuthToken();
  const baseUrl = getApiBaseUrl();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (csrfToken && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    headers['X-CSRF-Token'] = csrfToken;
  }

  try {
    const res = await fetch(`${baseUrl}/ai${endpoint}`, {
      ...options,
      credentials: 'include',
      headers,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'AI Service Error' }));
      throw new Error(err.detail || err.error || `HTTP ${res.status}`);
    }

    return (await res.json()) as T;
  } catch (error) {
    console.warn(`AI Service call to ${endpoint} failed:`, error);
    throw error;
  }
}

export const fastApi = {
  // Extract text via PyMuPDF / OCR
  extractFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const csrfToken = getCsrfToken();
    const token = getAuthToken();
    const baseUrl = getApiBaseUrl();
    const headers: Record<string, string> = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    const res = await fetch(`${baseUrl}/ai/extract`, {
      method: 'POST',
      credentials: 'include',
      headers,
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Extraction Error' }));
      throw new Error(err.detail || err.error || `Extraction failed with status ${res.status}`);
    }

    return await res.json();
  },

  // NLP Entity extraction
  analyzeEntities: (text: string, caseId?: string) =>
    fastApiRequest<any>('/analyze', {
      method: 'POST',
      body: JSON.stringify({ text, caseId }),
    }),

  // Summarize case document
  summarize: (text: string) =>
    fastApiRequest<any>('/summarize', {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),

  // Vector DB Document Ingest — supply case_id in metadata for case-scoped isolation
  ingestDoc: (text: string, metadata: any) =>
    fastApiRequest<any>('/ingest', {
      method: 'POST',
      body: JSON.stringify({ text, metadata }),
    }),

  // Global precedent search across entire precedent knowledge base
  findSimilarCases: (text: string, top_k: number = 5) =>
    fastApiRequest<any>('/similar-cases', {
      method: 'POST',
      body: JSON.stringify({ text, top_k }),
    }),

  // Case-scoped RAG Q&A (retrieval strictly filtered to case_id)
  askRAG: (question: string, caseId: string, caseContext?: string) =>
    fastApiRequest<any>('/ask', {
      method: 'POST',
      body: JSON.stringify({ question, case_id: caseId, case_context: caseContext }),
    }),

  // AI Draft Generator
  generateDraft: (docType: string, caseContext: any) =>
    fastApiRequest<any>('/draft', {
      method: 'POST',
      body: JSON.stringify({ doc_type: docType, case_context: caseContext }),
    }),

  // Unified legal chatbot
  chatLegal: (query: string, caseId?: string, history?: any[], userRole?: string, researchDepth?: string, model?: string) =>
    fastApiRequest<any>('/chat/legal', {
      method: 'POST',
      body: JSON.stringify({
        query,
        case_id: caseId || null,
        conversation_history: history || [],
        user_role: userRole || 'CITIZEN',
        research_depth: researchDepth || 'STANDARD',
        model: model || 'gemini',
        provider: model || 'gemini',
      }),
    }),

  // Deep legal research engine
  researchDeep: (question: string, depth?: string, caseId?: string, userRole?: string, history?: any[], model?: string) =>
    fastApiRequest<any>('/research', {
      method: 'POST',
      body: JSON.stringify({
        question,
        research_depth: depth || 'STANDARD',
        case_id: caseId || null,
        user_role: userRole || 'CITIZEN',
        conversation_history: history || [],
        model: model || 'gemini',
        provider: model || 'gemini',
      }),
    }),

  // Multilingual judicial translator
  translate: (text: string, targetLang: string) =>
    fastApiRequest<{ success: boolean; translated_text: string; target_lang: string }>('/translate', {
      method: 'POST',
      body: JSON.stringify({
        text,
        target_lang: targetLang,
      }),
    }),
};
