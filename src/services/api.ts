// Frontend API Client connected to Node.js / Express Backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )csrf_token=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token') || localStorage.getItem('token') || sessionStorage.getItem('access_token') || null;
}

export function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', token);
  }
}

export function removeAuthToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token');
    sessionStorage.removeItem('access_token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const csrfToken = getCsrfToken();
  const token = getAuthToken();

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
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      credentials: 'include', // Include HttpOnly cookies on cross-origin / same-origin requests
      headers,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${res.status}`);
    }

    return (await res.json()) as T;
  } catch (error) {
    console.warn(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Auth
  login: (credentials: { email?: string; password?: string; role?: string }) =>
    request<{ token: string; csrfToken?: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (userData: any) =>
    request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  logout: () =>
    request<any>('/auth/logout', {
      method: 'POST',
    }),

  getCurrentUser: () => request<{ user: any }>('/auth/me'),

  getPendingUsers: () => request<{ success: boolean; pendingUsers: any[] }>('/admin/pending-users'),

  approveUser: (userId: string, status: string) =>
    request<{ success: boolean; user: any }>('/admin/approve-user', {
      method: 'POST',
      body: JSON.stringify({ userId, status }),
    }),

  // Cases
  getCases: (params?: { status?: string; division?: string; priority?: string; search?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<any>(`/cases${query ? `?${query}` : ''}`);
  },

  getCaseById: (id: string) => request<any>(`/cases/${id}`),

  searchPublicCases: (query: string) =>
    request<any[]>(`/cases/public/search?q=${encodeURIComponent(query)}`),

  getPublicCaseOrders: (caseId: string) =>
    request<any>(`/cases/public/${encodeURIComponent(caseId)}/orders`),

  createCase: (caseData: any) =>
    request<any>('/cases', {
      method: 'POST',
      body: JSON.stringify(caseData),
    }),

  updateCase: (id: string, caseData: any) =>
    request<any>(`/cases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(caseData),
    }),

  deleteCase: (id: string) =>
    request<any>(`/cases/${id}`, {
      method: 'DELETE',
    }),

  // AI Features
  analyzeCase: (data: { caseId?: string; fileName?: string }) =>
    request<any>('/ai/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  chatAi: (data: { message: string; caseId?: string }) =>
    request<any>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  predictDelay: (data: any) =>
    request<any>('/ai/predict-delay', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Analytics
  getAnalytics: () => request<any>('/analytics/dashboard'),

  // Hearings
  getHearings: (caseIdOrOptions?: string | { caseId?: string; page?: number; limit?: number; date?: string }, page?: number, limit?: number) => {
    const params = new URLSearchParams();
    if (typeof caseIdOrOptions === 'string') {
      params.append('caseId', caseIdOrOptions);
      if (page) params.append('page', String(page));
      if (limit) params.append('limit', String(limit));
    } else if (caseIdOrOptions && typeof caseIdOrOptions === 'object') {
      if (caseIdOrOptions.caseId) params.append('caseId', caseIdOrOptions.caseId);
      if (caseIdOrOptions.date) params.append('date', caseIdOrOptions.date);
      if (caseIdOrOptions.page) params.append('page', String(caseIdOrOptions.page));
      if (caseIdOrOptions.limit) params.append('limit', String(caseIdOrOptions.limit));
    }
    const qStr = params.toString();
    return request<any>(`/hearings${qStr ? `?${qStr}` : ''}`);
  },

  suggestHearing: (data: { caseId: string; targetDate?: string; targetTime?: string; courtRoom?: string; judgeId?: string }) =>
    request<any>('/hearings/suggest', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  approveHearing: (id: string) =>
    request<any>(`/hearings/${id}/approve`, {
      method: 'PUT',
    }),

  rejectHearing: (id: string) =>
    request<any>(`/hearings/${id}/reject`, {
      method: 'PUT',
    }),

  // Drafts
  getDrafts: () => request<{ success: boolean; drafts: any[] }>('/drafts'),

  saveDraft: (data: { caseId: string; docType?: string; title: string; content: string }) =>
    request<{ success: boolean; draft: any }>('/drafts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  signOffDraft: (id: string, status: string, editedContent?: string) =>
    request<{ success: boolean; draft: any; badge?: string }>(`/drafts/${id}/sign-off`, {
      method: 'POST',
      body: JSON.stringify({ status, editedContent }),
    }),

  // Admin Bench Allocations
  getBenchAllocations: () => request<{ success: boolean; allocations: any[] }>('/admin/allocations'),

  createBenchAllocation: (data: { judgeId: string; courtroom: string; date: string; startTime: string; endTime: string; division?: string }) =>
    request<{ success: boolean; allocation: any }>('/admin/allocations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateBenchAllocation: (id: string, data: any) =>
    request<{ success: boolean; allocation: any }>(`/admin/allocations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteBenchAllocation: (id: string) =>
    request<{ success: boolean; message: string }>(`/admin/allocations/${id}`, {
      method: 'DELETE',
    }),

  getJudgesList: () => request<{ success: boolean; judges: any[] }>('/admin/judges'),
  getUsers: () => request<{ success: boolean; users: any[] }>('/admin/users'),
  updateUserStatus: (id: string, status: string) =>
    request<{ success: boolean; user: any }>(`/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  // E-Filings
  submitFiling: (data: { title: string; description?: string; petitioner: string; respondent: string; filingType?: string; court?: string; caseId?: string; documentId?: string }) =>
    request<{ success: boolean; filing: any; message: string }>('/filings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getFilings: () => request<{ success: boolean; filings: any[] }>('/filings'),

  trackFiling: (filingNumber: string) =>
    request<{ success: boolean; filing: any }>(`/filings/track/${encodeURIComponent(filingNumber)}`),

  updateFilingStatus: (id: string, status: string) =>
    request<{ success: boolean; filing: any }>(`/filings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  // Documents Upload
  uploadDocument: async (file: File, caseId?: string) => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('file', file);
    if (caseId) formData.append('caseId', caseId);

    const res = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!res.ok) throw new Error('File upload failed');
    return await res.json();
  },

  getDocumentStatus: (id: string) =>
    request<{ success: boolean; document: any }>(`/documents/${id}/status`),

  // Audit Logs
  getAuditLogs: () => request<{ success: boolean; logs: any[] }>('/audit'),

  // AI & System Health
  getAiHealth: () => request<{ ok: boolean; detail?: string }>('/system/ai-health'),
};
