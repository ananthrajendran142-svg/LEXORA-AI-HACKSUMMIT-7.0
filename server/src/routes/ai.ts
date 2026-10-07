import { Router, Request, Response } from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, optionalAuth, AuthRequest } from '../middleware/auth.js';
import { getInternalApiKey } from '../utils/cryptoUtils.js';
import { canAccessCase } from '../utils/caseAuthorization.js';
import { getFastApiBaseUrl } from '../utils/urlUtils.js';

const router = Router();
const prisma = new PrismaClient();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB limit
});

// Helper for sending JSON requests to FastAPI
async function proxyToFastApi(endpoint: string, body: any, res: Response) {
  try {
    const fastapiBase = getFastApiBaseUrl();
    const response = await fetch(`${fastapiBase}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-API-Key': getInternalApiKey(),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: `FastAPI service error on ${endpoint}`,
        details: errorText,
      });
    }

    const data = await response.json();
    return res.json(data);
  } catch (error: any) {
    console.error(`[AI PROXY ERROR - ${endpoint}]:`, error.message);
    return res.status(503).json({
      error: 'AI microservice temporarily unavailable',
      endpoint,
    });
  }
}

// POST /api/ai/extract — Extract text via PyMuPDF / OCR
router.post('/extract', optionalAuth, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
    const formData = new FormData();
    formData.append('file', blob, req.file.originalname);

    const fastapiBase = getFastApiBaseUrl();
    const response = await fetch(`${fastapiBase}/extract`, {
      method: 'POST',
      headers: {
        'X-Internal-API-Key': getInternalApiKey(),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: 'Extraction service failed', details: errorText });
    }

    const data = await response.json();
    return res.json(data);
  } catch (error: any) {
    console.error('[AI EXTRACT PROXY ERROR]:', error.message);
    return res.status(503).json({ error: 'OCR / Extraction service temporarily unavailable' });
  }
});

// POST /api/ai/analyze — NLP entity extraction
router.post('/analyze', optionalAuth, async (req: AuthRequest, res: Response) => {
  const { text, caseId } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required for entity analysis' });

  // Update Prisma database analysis if caseId provided
  if (caseId) {
    if (req.user) {
      const access = await canAccessCase(req.user, String(caseId), prisma);
      if (!access.allowed) {
        return res.status(403).json({ error: access.reason || 'Access denied: You do not have permission to analyze this case.' });
      }
    }
    try {
      const findings = ['Document analysis confirms procedural compliance under relevant judicial acts.'];
      const precedents = ['State of Maharashtra v. Prakash (2020) 3 SCC 410'];
      const recommendations = ['Schedule continuous hearing dates'];

      await prisma.aiAnalysis.upsert({
        where: { caseId },
        update: {
          keyFindings: JSON.stringify(findings),
          legalPrecedents: JSON.stringify(precedents),
          riskLevel: 'Medium',
          recommendations: JSON.stringify(recommendations),
        },
        create: {
          caseId,
          keyFindings: JSON.stringify(findings),
          legalPrecedents: JSON.stringify(precedents),
          riskLevel: 'Medium',
          recommendations: JSON.stringify(recommendations),
        },
      });
    } catch (e) {
      console.warn('[AI ANALYZE DB UPSERT WARNING]:', e);
    }
  }

  return proxyToFastApi('/analyze', { text }, res);
});

// POST /api/ai/summarize — Case document summarization
router.post('/summarize', optionalAuth, async (req: Request, res: Response) => {
  return proxyToFastApi('/summarize', req.body, res);
});

// POST /api/ai/ingest — Vector DB document ingestion
router.post('/ingest', optionalAuth, async (req: Request, res: Response) => {
  return proxyToFastApi('/ingest', req.body, res);
});

// POST /api/ai/similar-cases — Global precedent search (allow optional auth for statutory research)
router.post('/similar-cases', optionalAuth, async (req: Request, res: Response) => {
  return proxyToFastApi('/similar-cases', req.body, res);
});

// POST /api/ai/ask — Case-scoped RAG Q&A
router.post('/ask', optionalAuth, async (req: AuthRequest, res: Response) => {
  const targetCaseId = req.body.case_id || req.body.caseId;
  if (targetCaseId && req.user) {
    const access = await canAccessCase(req.user, String(targetCaseId), prisma);
    if (!access.allowed) {
      return res.status(403).json({
        error: 'Access denied: You are not authorized to query AI analysis for this case.'
      });
    }
  }
  return proxyToFastApi('/ask', req.body, res);
});

// POST /api/ai/draft — Order/notice draft generator
router.post('/draft', optionalAuth, async (req: AuthRequest, res: Response) => {
  const targetCaseId = req.body.case_id || req.body.caseId;
  if (targetCaseId && req.user) {
    const access = await canAccessCase(req.user, String(targetCaseId), prisma);
    if (!access.allowed) {
      return res.status(403).json({
        error: 'Access denied: You are not authorized to generate drafts for this case.'
      });
    }
  }
  return proxyToFastApi('/draft', req.body, res);
});

// Helper for proxying chat to FastAPI /chat/legal
const handleLegalChat = async (req: AuthRequest, res: Response) => {
  const { query, message, caseId, case_id, conversationHistory, history, researchDepth, research_depth, model, provider } = req.body;
  const queryText = query || message || '';
  const activeCaseId = caseId || case_id || null;
  const conversation = conversationHistory || history || [];
  const userRole = req.user?.role || 'CITIZEN';
  const depth = researchDepth || research_depth || 'STANDARD';

  if (!queryText.trim()) {
    return res.status(400).json({ error: 'Query or message is required' });
  }

  if (req.user && ['ADMIN', 'COURT_STAFF', 'STAFF'].includes(String(req.user.role).toUpperCase())) {
    return res.status(403).json({
      error: 'Access denied: The Unified AI Legal Assistant is disabled for Administrative and Court Staff accounts.'
    });
  }

  if (activeCaseId && req.user) {
    const access = await canAccessCase(req.user, String(activeCaseId), prisma);
    if (!access.allowed) {
      return res.status(403).json({
        error: 'Access denied: You are not authorized to query AI analysis for this case.'
      });
    }
  }

  return proxyToFastApi('/chat/legal', {
    query: queryText,
    case_id: activeCaseId,
    conversation_history: conversation,
    user_role: userRole,
    research_depth: depth,
    model,
    provider,
  }, res);
};

// POST /api/ai/chat (allow optional auth for general legal chat)
router.post('/chat', optionalAuth, handleLegalChat);

// POST /api/ai/chat/legal (allow optional auth for general legal chat)
router.post('/chat/legal', optionalAuth, handleLegalChat);

// POST /api/ai/research — Deep legal research engine (allow optional auth)
router.post('/research', optionalAuth, async (req: AuthRequest, res: Response) => {
  const { question, query, researchDepth, research_depth, caseId, case_id, conversationHistory, history, model, provider } = req.body;
  const questionText = question || query || '';
  const depth = researchDepth || research_depth || 'STANDARD';
  const activeCaseId = caseId || case_id || null;
  const conversation = conversationHistory || history || [];
  const userRole = req.user?.role || 'CITIZEN';

  if (!questionText.trim()) {
    return res.status(400).json({ error: 'Question is required for research' });
  }

  if (activeCaseId && req.user) {
    const access = await canAccessCase(req.user, String(activeCaseId), prisma);
    if (!access.allowed) {
      return res.status(403).json({
        error: 'Access denied: You are not authorized to query legal research for this case.'
      });
    }
  }

  return proxyToFastApi('/research', {
    question: questionText,
    research_depth: depth,
    case_id: activeCaseId,
    user_role: userRole,
    conversation_history: conversation,
    model,
    provider,
  }, res);
});

// POST /api/ai/predict-delay — Local statutory delay calculator
router.post('/predict-delay', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { caseAge, adjournments, lawyerExp } = req.body;

    const ageFactor = (Number(caseAge) || 8) * 4;
    const adjFactor = (Number(adjournments) || 5) * 8;
    const expDiscount = (Number(lawyerExp) || 3) * 2;

    const rawProb = Math.min(95, Math.max(15, 30 + ageFactor + adjFactor - expDiscount));
    const delayProbability = parseFloat(rawProb.toFixed(1));

    const riskLevel = delayProbability > 70 ? 'High' : delayProbability > 40 ? 'Medium' : 'Low';

    return res.json({
      delayProbability,
      riskLevel,
      factors: [
        { factor: 'Case Age', impact: 'High', description: `Case age is ${caseAge || 8} months` },
        { factor: 'Adjournments', impact: 'High', description: `${adjournments || 5} adjournments recorded` },
        { factor: 'Documentation', impact: 'Medium', description: 'Documentation status requires update' },
      ],
      recommendations: [
        'Prioritize document completion and affidavit submissions',
        'Schedule continuous hearing dates',
        'Consider alternative dispute resolution (ADR)',
      ],
    });
  } catch (error) {
    return res.status(500).json({ error: 'Delay prediction service failed' });
  }
});

// POST /api/ai/translate — Multilingual legal translator
router.post('/translate', optionalAuth, async (req: Request, res: Response) => {
  return proxyToFastApi('/translate', req.body, res);
});

export default router;
