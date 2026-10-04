import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.js';
import casesRoutes from './routes/cases.js';
import aiRoutes from './routes/ai.js';
import hearingsRoutes from './routes/hearings.js';
import analyticsRoutes from './routes/analytics.js';
import documentsRoutes from './routes/documents.js';
import draftsRoutes from './routes/drafts.js';
import auditRoutes from './routes/audit.js';
import adminRoutes from './routes/admin.js';
import filingsRoutes from './routes/filings.js';
import notificationsRoutes from './routes/notifications.js';
import { validateCryptoConfig } from './utils/cryptoUtils.js';
import { requestLogger } from './middleware/logger.js';
import systemRoutes from './routes/system.js';
import { getFastApiBaseUrl } from './utils/urlUtils.js';

dotenv.config();

// ── Production Fail-Closed Secret Validation ──────────────────────────────────
// ENCRYPTION_KEY must NEVER be set from a hardcoded fallback.
// If missing or invalid, crash startup immediately.
try {
  validateCryptoConfig();
} catch (err: any) {
  console.error('[FATAL] Cryptographic startup validation failed:', err.message);
  process.exit(1);
}

const isProd = process.env.NODE_ENV === 'production';

// Production requires all critical secrets to be explicitly configured.
if (isProd) {
  const requiredSecrets: { name: string; minLen: number }[] = [
    { name: 'JWT_SECRET', minLen: 32 },
    { name: 'ENCRYPTION_KEY', minLen: 32 },
    { name: 'INTERNAL_API_KEY', minLen: 24 },
    { name: 'BACKUP_ENCRYPTION_KEY', minLen: 32 },
    { name: 'CLIENT_URL', minLen: 4 },
  ];
  const failures: string[] = [];
  for (const { name, minLen } of requiredSecrets) {
    const val = process.env[name];
    if (!val || val.length < minLen) {
      failures.push(`${name} is missing or too short (minimum ${minLen} characters)`);
    }
  }
  if (failures.length > 0) {
    console.error('[FATAL] Production startup aborted — missing required configuration:');
    failures.forEach((f) => console.error(`  ✗ ${f}`));
    process.exit(1);
  }
  console.log('[STARTUP] Production secret validation: PASS');
}

const app = express();
const server = http.createServer(app);

// Trust proxy for Render / Cloud load balancers
app.set('trust proxy', 1);

const parseAllowedOrigins = (): string[] => {
  const configured = (process.env.CLIENT_URL || '')
    .split(',')
    .map((u) => u.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  const expanded: string[] = [];
  for (const u of configured) {
    expanded.push(u);
    if (!u.startsWith('http://') && !u.startsWith('https://')) {
      expanded.push(`https://${u}`);
      expanded.push(`http://${u}`);
    } else {
      expanded.push(u.replace(/^https?:\/\//, ''));
    }
  }

  const defaults = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5000',
  ];

  return Array.from(new Set([...expanded, ...defaults]));
};

const isOriginAllowed = (origin?: string): boolean => {
  if (!origin) return true; // Non-browser / server-to-server requests
  const normalized = origin.trim().replace(/\/+$/, '');
  const allowed = parseAllowedOrigins();
  if (allowed.includes(normalized)) return true;

  const host = normalized.replace(/^https?:\/\//, '').split(':')[0];
  if (allowed.includes(host)) return true;

  // Wildcard allowances for cloud deployments
  if (
    host.endsWith('.onrender.com') ||
    host.endsWith('.vercel.app') ||
    host.endsWith('.pages.dev') ||
    host.endsWith('.netlify.app')
  ) {
    return true;
  }
  return false;
};

const io = new SocketIOServer(server, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS Access Denied on Socket.io'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000;

// ── Security Middlewares ───────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  hsts: isProd ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
  contentSecurityPolicy: isProd ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", "ws:", "wss:", "*"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    }
  } : false,
}));

app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked origin: ${origin}. Allowed: ${parseAllowedOrigins().join(', ')}`);
      callback(new Error('CORS Access Denied: Origin not permitted by LEXORA security policy.'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Request-ID', 'X-Internal-API-Key'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// ── Request ID + Structured Logging Middleware ────────────────────────────────
app.use(requestLogger);

// ── Rate Limiters ─────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { error: 'Too many authentication attempts, please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', globalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Protected routes (Document files are downloaded via GET /api/documents/:id/download)
// Notice: express.static('/uploads') is intentionally absent for document security.

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/cases', casesRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/hearings', hearingsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/drafts', draftsRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/filings', filingsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/system', systemRoutes);

// ── Liveness Health Check (process alive — no dependency info) ────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'alive',
    service: 'LEXORA AI Judicial Intelligence Platform',
    timestamp: new Date().toISOString(),
    uptime_s: Math.floor(process.uptime()),
  });
});

// ── Readiness Check (checks DB + FastAPI reachability) ───────────────────────
app.get('/api/ready', async (_req, res) => {
  const checks: Record<string, { ok: boolean; detail?: string }> = {};

  // Check 1: Database
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$disconnect();
    checks.database = { ok: true };
  } catch {
    checks.database = { ok: false, detail: 'Database unreachable' };
  }

  // Check 2: FastAPI AI backend
  try {
    const fastapiUrl = getFastApiBaseUrl();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const r = await fetch(`${fastapiUrl}/health`, { signal: controller.signal });
    clearTimeout(timeout);
    checks.fastapi = { ok: r.ok };
  } catch {
    checks.fastapi = { ok: false, detail: 'AI backend unreachable' };
  }

  const allOk = Object.values(checks).every((c) => c.ok);
  const statusCode = allOk ? 200 : 503;

  return res.status(statusCode).json({
    ready: allOk,
    checks,
    timestamp: new Date().toISOString(),
  });
});

// ── Static Frontend Serving & SPA Catch-All ──────────────────────────────────
const distCandidates = [
  path.resolve(process.cwd(), 'dist'),
  path.resolve(process.cwd(), '../dist'),
  path.resolve(__dirname, '../../dist'),
  path.resolve(__dirname, '../dist'),
];
const distPath = distCandidates.find((p) => fs.existsSync(path.join(p, 'index.html')));

if (distPath) {
  console.log(`[LEXORA] Serving frontend static assets from: ${distPath}`);
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ── Socket.io Real-time event handling ───────────────────────────────────────
io.on('connection', (socket) => {
  socket.on('join_case_room', (caseId) => {
    socket.join(`case_${caseId}`);
  });
  socket.on('send_notification', (data) => {
    io.emit('new_notification', data);
  });
  socket.on('disconnect', () => {});
});

// ── Graceful Shutdown ─────────────────────────────────────────────────────────
let shuttingDown = false;

async function gracefulShutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[SHUTDOWN] Received ${signal} — initiating graceful shutdown...`);

  // Hard kill after 30 seconds
  const hardKill = setTimeout(() => {
    console.error('[SHUTDOWN] Hard kill timeout reached — forcing exit.');
    process.exit(1);
  }, 30000);

  server.close(async () => {
    console.log('[SHUTDOWN] HTTP server closed.');
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      await prisma.$disconnect();
      console.log('[SHUTDOWN] Database connection closed.');
    } catch {}
    clearTimeout(hardKill);
    console.log('[SHUTDOWN] Graceful shutdown complete.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ── Start Server ──────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`[LEXORA] Backend running on port ${PORT} (NODE_ENV=${process.env.NODE_ENV || 'development'})`);
});

