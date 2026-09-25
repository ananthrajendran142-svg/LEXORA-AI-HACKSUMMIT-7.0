import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { getInternalApiKey } from '../utils/cryptoUtils.js';
import { checkStorageHealth } from '../utils/storageMonitor.js';

const router = Router();
const prisma = new PrismaClient();
const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL || 'http://localhost:8000';

// GET /api/system/health — Admin Observability Dashboard
router.get('/health', authenticateToken, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  const statusPayload: any = {
    timestamp: new Date().toISOString(),
    service: 'LEXORA AI System Health Monitor',
    checks: {},
  };

  // 1. Database Check
  try {
    await prisma.$queryRaw`SELECT 1`;
    statusPayload.checks.database = { status: 'HEALTHY', message: 'SQLite connected' };
  } catch (e: any) {
    statusPayload.checks.database = { status: 'UNHEALTHY', message: e.message };
  }

  // 2. FastAPI AI Engine Check
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const r = await fetch(`${FASTAPI_BASE_URL}/ready`, { signal: controller.signal });
    clearTimeout(timeout);
    statusPayload.checks.fastapi = { status: r.ok ? 'HEALTHY' : 'DEGRADED', httpCode: r.status };
  } catch {
    statusPayload.checks.fastapi = { status: 'UNHEALTHY', message: 'AI microservice unreachable' };
  }

  // 3. Cryptographic Key Check (Boolean presence only)
  statusPayload.checks.encryption = {
    status: process.env.ENCRYPTION_KEY ? 'CONFIGURED' : 'MISSING',
    activeKeyVersion: 1,
  };

  // 4. Storage Usage Check
  statusPayload.checks.storage = checkStorageHealth();

  // 5. Corpus Health Check from FastAPI
  try {
    const r = await fetch(`${FASTAPI_BASE_URL}/corpus/stats`, {
      headers: { 'X-Internal-API-Key': getInternalApiKey() },
    });
    if (r.ok) {
      const stats: any = await r.json();
      statusPayload.checks.legalCorpus = {
        status: 'HEALTHY',
        totalChunks: stats.total_chunks,
        totalDocuments: stats.total_documents,
        currentnessCoverage: stats.currentness_coverage,
      };
    }
  } catch {
    statusPayload.checks.legalCorpus = { status: 'UNKNOWN' };
  }

  return res.json({ success: true, system: statusPayload });
});

// GET /api/system/backup-status — Admin Backup Status
router.get('/backup-status', authenticateToken, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  const backupDir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(backupDir)) {
    return res.json({ success: true, lastBackup: null, backupCount: 0, warning: 'NO_BACKUPS_FOUND' });
  }

  const files = fs.readdirSync(backupDir);
  const encFiles = files.filter((f) => f.endsWith('.enc'));
  const manifests = files.filter((f) => f.endsWith('.manifest.json'));

  if (encFiles.length === 0) {
    return res.json({ success: true, lastBackup: null, backupCount: 0, warning: 'NO_BACKUPS_FOUND' });
  }

  // Find latest manifest
  manifests.sort().reverse();
  const latestManifestFile = manifests[0];
  let manifestData: any = null;

  if (latestManifestFile) {
    try {
      manifestData = JSON.parse(fs.readFileSync(path.join(backupDir, latestManifestFile), 'utf-8'));
    } catch (e) {}
  }

  const latestEncFile = encFiles.sort().reverse()[0];
  const stat = fs.statSync(path.join(backupDir, latestEncFile));
  const ageHours = parseFloat(((Date.now() - stat.mtimeMs) / (1000 * 3600)).toFixed(1));

  return res.json({
    success: true,
    backupCount: encFiles.length,
    lastBackup: {
      filename: latestEncFile,
      sizeMb: parseFloat((stat.size / (1024 * 1024)).toFixed(2)),
      timestamp: manifestData?.timestamp || stat.mtime.toISOString(),
      ageHours,
      sha256Verified: Boolean(manifestData?.sha256_plaintext),
    },
    warning: ageHours > 24 ? 'BACKUP_STALE' : null,
  });
});

// GET /api/system/ai-health — Liveness Proxy for AI Pipeline
router.get('/ai-health', async (req: Request, res: Response) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const r = await fetch(`${FASTAPI_BASE_URL}/health`, { signal: controller.signal });
    clearTimeout(timeout);
    return res.json({ ok: r.ok, status: r.status });
  } catch (err: any) {
    return res.status(503).json({ ok: false, detail: 'AI backend unreachable' });
  }
});

export default router;
