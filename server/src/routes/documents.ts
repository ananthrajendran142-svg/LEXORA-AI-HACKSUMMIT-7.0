import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { encryptBuffer, decryptBuffer, getInternalApiKey, zeroBuffer } from '../utils/cryptoUtils.js';
import { canAccessCase } from '../utils/caseAuthorization.js';
import { getFastApiBaseUrl } from '../utils/urlUtils.js';

const router = Router();
const prisma = new PrismaClient();

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Memory storage guarantees plaintext buffer never touches disk before AES-256-GCM encryption
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB hard limit
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.txt', '.md'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, PNG, JPG, and TXT files are permitted.'));
    }
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// processDocumentAI
//
// Runs extraction → ChromaDB ingestion for an uploaded document.
//
// RAG CASE ISOLATION CONTRACT
// ────────────────────────────
// Every chunk stored in ChromaDB receives  case_id = caseId  so that
// Phase 17.1 case-scoped retrieval (where={"case_id": caseId}) works correctly.
//
// If caseId is null/undefined the document is a standalone/global upload
// and its chunks will have  case_id = ""  (global precedent behaviour).
//
// The /ingest payload MUST include case_id so ChromaDB metadata is correct.
// ─────────────────────────────────────────────────────────────────────────────
async function processDocumentAI(
  docId: string,
  filePath: string,
  originalName: string,
  caseId: string | null | undefined
): Promise<void> {
  try {
    // 1. Update status to PROCESSING
    await prisma.document.update({
      where: { id: docId },
      data: { status: 'PROCESSING' }
    });

    const rawDiskBuffer = fs.readFileSync(filePath);
    const decryptedBuffer = decryptBuffer(rawDiskBuffer);
    let extractRes: any;
    try {
      const blob = new Blob([decryptedBuffer], { type: 'application/pdf' });
      const formData = new FormData();
      formData.append('file', blob, originalName);

      // 2. Call Python FastAPI /extract with internal key authentication
      const fastapiBase = getFastApiBaseUrl();
      extractRes = await fetch(`${fastapiBase}/extract`, {
        method: 'POST',
        headers: {
          'X-Internal-API-Key': getInternalApiKey()
        },
        body: formData,
      });
    } finally {
      zeroBuffer(decryptedBuffer); // Memory safety: zero out decrypted buffer after HTTP dispatch
    }

    if (!extractRes.ok) {
      const errText = await extractRes.text();
      throw new Error(`Extraction failed: ${errText}`);
    }

    const extractData: any = await extractRes.json();
    if (!extractData.success || !extractData.raw_text) {
      throw new Error(extractData.error || 'Text extraction returned empty content');
    }

    // 3. Update status to EXTRACTED
    await prisma.document.update({
      where: { id: docId },
      data: {
        status: 'EXTRACTED',
        pageCount: extractData.page_count || 1
      }
    });

    // 4. Update status to INDEXING
    await prisma.document.update({
      where: { id: docId },
      data: { status: 'INDEXING' }
    });

    // ── Fetch authoritative case metadata from Prisma ──────────────────────────
    let caseName = 'Unassigned Judicial File';
    let caseNumber = '';
    let court = 'Supreme Court of India';
    let caseTitle = '';
    let resolvedCaseId = '';  // what goes into ChromaDB metadata

    if (caseId) {
      const caseRecord = await prisma.case.findUnique({ where: { id: caseId } });
      if (caseRecord) {
        caseName    = caseRecord.title;
        caseNumber  = caseRecord.caseNumber;
        court       = caseRecord.court;
        caseTitle   = caseRecord.title;
        resolvedCaseId = caseId;           // confirmed valid — use it
      } else {
        console.warn(`[INGEST] caseId=${caseId} not found in Prisma — attaching unresolved case scope`);
        resolvedCaseId = caseId;
      }
    }

    const ingestPayload = {
      text: extractData.raw_text,
      metadata: {
        document_id:   docId,
        document_name: originalName,
        case_id:        resolvedCaseId,
        case_name:      caseName,
        case_number:    caseNumber,
        court:          court,
        title:          caseTitle || originalName,
        year:           new Date().getFullYear(),
        page_number:    1,
        source:         extractData.source || 'native_pdf',
      }
    };

    console.log(
      `[INGEST] Sending to FastAPI /ingest: doc_id=${docId} case_id="${resolvedCaseId}" ` +
      `case_number="${caseNumber}" doc="${originalName}"`
    );

    const fastapiBase = getFastApiBaseUrl();
    const ingestRes = await fetch(`${fastapiBase}/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-API-Key': getInternalApiKey()
      },
      body: JSON.stringify(ingestPayload)
    });

    if (!ingestRes.ok) {
      throw new Error(`Vector ingestion failed: HTTP ${ingestRes.status}`);
    }

    const ingestData: any = await ingestRes.json();
    if (!ingestData.success) {
      throw new Error(ingestData.error || 'ChromaDB vector ingestion failed');
    }

    console.log(
      `[INGEST] Success: doc_id=${docId} chunks_ingested=${ingestData.chunks_ingested} ` +
      `case_id="${resolvedCaseId}" status=INDEXED`
    );

    // 6. Update status to INDEXED
    await prisma.document.update({
      where: { id: docId },
      data: {
        status: 'INDEXED',
        errorReason: null
      }
    });

  } catch (error: any) {
    console.error(`[INGEST] Document processing failed for doc_id=${docId}:`, error);
    await prisma.document.update({
      where: { id: docId },
      data: {
        status: 'FAILED',
        errorReason: error.message || 'AI pipeline processing error'
      }
    }).catch(() => {});
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/documents/upload
//
// AUTHORIZATION MODEL
// ────────────────────
// If caseId is provided in the request body:
//   - The case must exist in Prisma.
//   - The authenticated user must be authorized to upload to that case:
//       JUDGE   → must be the assigned judge (or no judge assigned yet)
//       LAWYER  → must be the assigned lawyer (or no lawyer assigned yet)
//       ADMIN / COURT_STAFF / STAFF → always allowed
//   - Unauthorized upload → 403
//
// If caseId is absent:
//   - The document is treated as a standalone/global upload.
//   - It will be indexed WITHOUT case_id (global precedent behaviour).
//   - This is allowed — no validation error for absent caseId.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/upload', authenticateToken, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { caseId } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role?.toUpperCase() || '';

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // ── Case-specific upload authorization ──────────────────────────────────────
    if (caseId && String(caseId).trim()) {
      const caseRecord = await prisma.case.findUnique({ where: { id: String(caseId) } });

      if (!caseRecord) {
        return res.status(404).json({
          error: 'Case not found',
          message: `No case found with ID "${caseId}". Upload aborted.`
        });
      }

      // Authorization check — prevent unauthorized uploads to another user's case
      const isPrivilegedRole = ['ADMIN', 'COURT_STAFF', 'STAFF'].includes(userRole);
      const isAssignedJudge  = userRole === 'JUDGE'  && (!caseRecord.judgeId  || caseRecord.judgeId  === userId);
      const isAssignedLawyer = userRole === 'LAWYER' && (!caseRecord.lawyerId || caseRecord.lawyerId === userId);

      if (!isPrivilegedRole && !isAssignedJudge && !isAssignedLawyer) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You are not authorized to upload documents to this case.'
        });
      }
    }

    // Generate sanitized unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const sanitizedBase = path.basename(req.file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
    const filename = `${uniqueSuffix}-${sanitizedBase}`;
    const absolutePath = path.join(uploadDir, filename);

    // Encrypt memory buffer directly before writing to disk
    let encryptedBuffer: Buffer;
    try {
      encryptedBuffer = encryptBuffer(req.file.buffer);
    } catch (encErr) {
      console.error('[UPLOAD] Error encrypting uploaded file buffer in RAM:', encErr);
      return res.status(500).json({ error: 'File encryption failed' });
    } finally {
      zeroBuffer(req.file.buffer); // Zero out plaintext buffer in memory
    }

    // Write ONLY the encrypted binary buffer to disk
    fs.writeFileSync(absolutePath, encryptedBuffer);

    // Create Prisma document record
    const doc = await prisma.document.create({
      data: {
        caseId:     caseId ? String(caseId) : null,
        fileName:   req.file.originalname,
        filePath:   `/uploads/${filename}`,
        fileSize:   req.file.size,
        mimeType:   req.file.mimetype,
        uploadedBy: userId,
        status:     'PROCESSING',
        pageCount:  0
      },
    });

    // Trigger AI Extraction & Vector Ingestion in background
    processDocumentAI(doc.id, absolutePath, req.file.originalname, caseId || null);

    return res.status(201).json(doc);
  } catch (error) {
    console.error('[UPLOAD] Upload error:', error);
    return res.status(500).json({ error: 'File upload failed' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/documents/:id/download — Authenticated document download with decryption
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id/download', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const docId = String(req.params.id);
    const userId = req.user?.id;
    const userRole = req.user?.role?.toUpperCase() || '';

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const doc = await prisma.document.findUnique({ where: { id: docId } });
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const isPrivilegedRole = ['ADMIN', 'COURT_STAFF', 'STAFF'].includes(userRole);
    const isUploader = doc.uploadedBy === userId;

    if (!isPrivilegedRole && !isUploader) {
      if (doc.caseId) {
        const access = await canAccessCase(req.user, doc.caseId, prisma);
        if (!access.allowed) {
          return res.status(403).json({
            error: 'Access denied',
            message: access.reason || 'You are not authorized to download this document.'
          });
        }
      } else {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You are not authorized to download this document.'
        });
      }
    }

    if (!doc.filePath) {
      return res.status(404).json({ error: 'File path not recorded in database' });
    }

    const localFilePath = path.join(process.cwd(), doc.filePath.replace(/^\//, ''));
    if (!fs.existsSync(localFilePath)) {
      return res.status(404).json({ error: 'Physical document file not found on disk' });
    }

    // Read encrypted binary from disk and decrypt in-memory
    const encryptedDiskBuffer = fs.readFileSync(localFilePath);
    const decryptedBuffer = decryptBuffer(encryptedDiskBuffer);

    res.setHeader('Content-Type', doc.mimeType || 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(doc.fileName)}"`);
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');

    res.send(decryptedBuffer);
    zeroBuffer(decryptedBuffer); // Memory safety: zero out buffer post response
    return;
  } catch (error) {
    console.error('[DOWNLOAD] Document download error:', error);
    return res.status(500).json({ error: 'Failed to download document' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/documents/:id/status — Authenticated status polling
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id/status', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const docId = String(req.params.id);
    const doc = await prisma.document.findUnique({
      where: { id: docId },
      select: {
        id: true,
        caseId: true,
        fileName: true,
        status: true,
        pageCount: true,
        errorReason: true,
        uploadedAt: true,
        uploadedBy: true
      }
    });

    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const userRole = req.user?.role?.toUpperCase() || '';
    const userId   = req.user?.id || '';
    const isPrivileged = ['ADMIN', 'COURT_STAFF', 'STAFF'].includes(userRole);
    const isUploader   = doc.uploadedBy === userId;

    if (!isPrivileged && !isUploader) {
      if (doc.caseId) {
        const access = await canAccessCase(req.user, doc.caseId, prisma);
        if (!access.allowed) {
          return res.status(403).json({ error: 'Access denied: You cannot view this document status' });
        }
      } else {
        return res.status(403).json({ error: 'Access denied: You cannot view this document status' });
      }
    }

    return res.json({ success: true, document: doc });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch document status' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/documents — Authenticated user-scoped document list
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { caseId } = req.query;
    const userRole = req.user?.role?.toUpperCase() || '';
    const userId   = req.user?.id || '';

    const where: any = {};

    if (caseId) {
      const targetCaseId = String(caseId);
      const access = await canAccessCase(req.user, targetCaseId, prisma);
      if (!access.allowed) {
        return res.status(403).json({
          error: 'Access denied: You do not have access to documents for this case'
        });
      }
      where.caseId = targetCaseId;
    } else {
      // Without caseId filter, scope strictly by user role
      if (userRole === 'LAWYER') {
        const userCases = await prisma.case.findMany({ where: { lawyerId: userId }, select: { id: true } });
        const userCaseIds = userCases.map(c => c.id);
        where.OR = [
          { uploadedBy: userId },
          { caseId: { in: userCaseIds } }
        ];
      } else if (userRole === 'JUDGE') {
        const userCases = await prisma.case.findMany({ where: { OR: [{ judgeId: userId }, { judgeId: null }] }, select: { id: true } });
        const userCaseIds = userCases.map(c => c.id);
        where.OR = [
          { uploadedBy: userId },
          { caseId: { in: userCaseIds } }
        ];
      } else if (userRole === 'CITIZEN') {
        const userName = req.user?.name || '';
        const userCases = await prisma.case.findMany({
          where: { OR: [{ petitioner: { contains: userName } }, { respondent: { contains: userName } }] },
          select: { id: true }
        });
        const userCaseIds = userCases.map(c => c.id);
        where.OR = [
          { uploadedBy: userId },
          { AND: [{ caseId: { in: userCaseIds } }, { status: 'INDEXED' }] }
        ];
      }
      // ADMIN & COURT_STAFF see all
    }

    const docs = await prisma.document.findMany({
      where,
      orderBy: { uploadedAt: 'desc' }
    });
    return res.json(docs);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/documents/:id — Document deletion with ChromaDB vector purge
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const docId = String(req.params.id);
    const userId = req.user?.id;
    const userRole = req.user?.role?.toUpperCase() || '';

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const doc = await prisma.document.findUnique({ where: { id: docId } });
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check authorization: Admin, Staff, Uploader, or assigned Judge/Lawyer of the case
    const isPrivilegedRole = ['ADMIN', 'COURT_STAFF', 'STAFF'].includes(userRole);
    const isUploader = doc.uploadedBy === userId;
    let isAssignedAuthorized = false;

    if (doc.caseId) {
      const access = await canAccessCase(req.user, doc.caseId, prisma);
      if (access.allowed && ['JUDGE', 'LAWYER'].includes(userRole)) {
        isAssignedAuthorized = true;
      }
    }

    if (!isPrivilegedRole && !isUploader && !isAssignedAuthorized) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You are not authorized to delete this document.'
      });
    }

    // 1. Purge vectors from ChromaDB via FastAPI endpoint
    try {
      const fastapiBase = getFastApiBaseUrl();
      const purgeRes = await fetch(`${fastapiBase}/documents/${encodeURIComponent(docId)}`, {
        method: 'DELETE',
        headers: {
          'X-Internal-API-Key': getInternalApiKey()
        }
      });
      if (purgeRes.ok) {
        const purgeData: any = await purgeRes.json();
        console.log(`[VECTOR PURGE] ChromaDB purge response for doc ${docId}:`, purgeData);
      } else {
        console.warn(`[VECTOR PURGE] FastAPI vector purge returned status ${purgeRes.status}`);
      }
    } catch (err: any) {
      console.error(`[VECTOR PURGE] Failed to reach FastAPI for vector purge:`, err?.message || err);
    }

    // 2. Remove file from disk if path exists
    if (doc.filePath) {
      const localFilePath = path.join(process.cwd(), doc.filePath.replace(/^\//, ''));
      if (fs.existsSync(localFilePath)) {
        fs.unlink(localFilePath, (err) => {
          if (err) console.error(`[DELETE] Error deleting physical file ${localFilePath}:`, err);
        });
      }
    }

    // 3. Delete document record from Prisma
    await prisma.document.delete({ where: { id: docId } });

    return res.json({
      success: true,
      message: 'Document and associated vector chunks purged successfully',
      deletedDocumentId: docId
    });
  } catch (error) {
    console.error('[DELETE] Document deletion error:', error);
    return res.status(500).json({ error: 'Failed to delete document' });
  }
});

export default router;


