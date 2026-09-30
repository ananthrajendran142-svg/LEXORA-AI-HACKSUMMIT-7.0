import { Router, type Request, type Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { authenticateToken, requireRole, type AuthRequest } from '../middleware/auth.js';
import { hashPassword, verifyPassword, needsArgon2Rehash } from '../utils/passwordUtils.js';
import { encryptField, decryptField } from '../utils/fieldEncryption.js';

const router = Router();
const prisma = new PrismaClient();

const isProd = process.env.NODE_ENV === 'production';

// Helper to check password strength: min 8 chars, 1 upper, 1 number, 1 special char
export function isPasswordStrong(pwd: string): boolean {
  if (pwd.length < 8) return false;
  if (!/[A-Z]/.test(pwd)) return false;
  if (!/[0-9]/.test(pwd)) return false;
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return false;
  return true;
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function setAuthCookies(res: Response, accessToken: string, refreshToken: string, csrfToken: string) {
  const sameSiteMode = isProd ? 'none' : 'lax';
  const secureMode = isProd ? true : false;

  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: secureMode,
    sameSite: sameSiteMode,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: secureMode,
    sameSite: sameSiteMode,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.cookie('csrf_token', csrfToken, {
    httpOnly: false, // Non-HttpOnly so client JavaScript can read and mirror in X-CSRF-Token header
    secure: secureMode,
    sameSite: sameSiteMode,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function clearAuthCookies(res: Response) {
  const sameSiteMode = isProd ? 'none' : 'lax';
  const secureMode = isProd ? true : false;
  res.clearCookie('access_token', { sameSite: sameSiteMode, secure: secureMode });
  res.clearCookie('refresh_token', { sameSite: sameSiteMode, secure: secureMode });
  res.clearCookie('csrf_token', { sameSite: sameSiteMode, secure: secureMode });
}

// POST /api/auth/register - Official Registration with Argon2id
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, role, designation, court, officialId } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    if (!isPasswordStrong(password)) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 number, and 1 special character.'
      });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'An official account with this email already exists.' });
    }

    const hashedPassword = await hashPassword(password);
    const roleUpper = String(role).toUpperCase();

    // Citizens & Admins auto-approve; Officials (Judges, Lawyers, Staff) require Admin approval
    const status = (roleUpper === 'CITIZEN' || roleUpper === 'ADMIN') ? 'APPROVED' : 'PENDING_ADMIN_APPROVAL';

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: roleUpper,
        designation: designation || 'Official Applicant',
        court: court || 'State Judiciary',
        officialId: encryptField(officialId || 'N/A'),
        status
      }
    });

    // Create Audit Log entry
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        actorRole: user.role,
        action: 'OFFICIAL_REGISTRATION_SUBMITTED',
        input: `Registration for ${name} (${user.role}) - ID: ${officialId || 'N/A'}`,
        output: `Account created with status: ${status} (Argon2id Hashed)`,
        outcome: status
      }
    });

    if (status === 'PENDING_ADMIN_APPROVAL') {
      return res.json({
        success: true,
        pending: true,
        message: 'Registration submitted successfully. Account is pending verification by the National Judicial Administrator.'
      });
    }

    return res.json({
      success: true,
      pending: false,
      message: 'Account created successfully. You may now log in.'
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Failed to process official registration.' });
  }
});

// POST /api/auth/login - Secure Auth with Status Check & Transparent Argon2id Migration
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Verify Password against stored hash (Argon2id or legacy bcrypt)
    const validPassword = await verifyPassword(password, user.password);
    if (!validPassword) {
      // Log failed login attempt
      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          actorRole: user.role,
          action: 'LOGIN_FAILURE',
          input: `Failed login attempt for ${email}`,
          output: 'Invalid credentials provided',
          outcome: 'REJECTED'
        }
      }).catch(() => {});
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Transparent password hash migration from legacy bcrypt to Argon2id
    if (needsArgon2Rehash(user.password)) {
      try {
        const newArgon2Hash = await hashPassword(password);
        await prisma.user.update({
          where: { id: user.id },
          data: { password: newArgon2Hash }
        });
        await prisma.auditLog.create({
          data: {
            actorId: user.id,
            actorRole: user.role,
            action: 'PASSWORD_HASH_MIGRATED',
            input: `Transparent rehash for ${user.email}`,
            output: 'Migrated legacy bcrypt hash to Argon2id',
            outcome: 'SUCCESS'
          }
        }).catch(() => {});
        console.log(`[AUTH] Seamlessly migrated user password hash to Argon2id for ${user.email}`);
      } catch (rehashErr) {
        console.error('[AUTH] Transparent rehash failed:', rehashErr);
      }
    }

    // Check Account Status
    if (user.status === 'PENDING' || user.status === 'PENDING_ADMIN_APPROVAL') {
      return res.status(403).json({
        error: 'Account pending verification by National Judicial Administrator. Access denied until official credential verification.'
      });
    }

    if (user.status === 'REJECTED') {
      const reasonMsg = user.rejectionReason
        ? `Official registration request was rejected by Judicial Administrator. Reason: ${user.rejectionReason}`
        : 'Official registration request was rejected by Judicial Administrator.';
      return res.status(403).json({
        error: reasonMsg
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('FATAL: JWT_SECRET environment variable is missing.');
      return res.status(500).json({ error: 'Server configuration error: JWT secret missing.' });
    }

    // Short-lived Access Token (15 min)
    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      secret,
      { expiresIn: '15m', algorithm: 'HS256' }
    );

    // Cryptographically Random Refresh Token & CSRF Token
    const rawRefreshToken = crypto.randomBytes(32).toString('hex');
    const csrfToken = crypto.randomBytes(16).toString('hex');
    const tokenHash = hashToken(rawRefreshToken);
    const familyId = crypto.randomUUID();

    // Store Refresh Token Hash in Database
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        familyId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        deviceInfo: req.headers['user-agent'] || 'Unknown Device'
      }
    });

    // Set Security Cookies
    setAuthCookies(res, accessToken, rawRefreshToken, csrfToken);

    // Log Login Success Security Event
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        actorRole: user.role,
        action: 'LOGIN_SUCCESS',
        input: `User ${user.email} authenticated successfully`,
        output: `Session created with Argon2id verification`,
        outcome: 'SUCCESS'
      }
    }).catch(() => {});

    return res.json({
      token: accessToken,
      csrfToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.toLowerCase(),
        designation: user.designation,
        court: user.court,
        status: user.status
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/refresh - Refresh Token Rotation & Reuse Detection
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const rawToken = req.cookies?.refresh_token || req.body?.refreshToken;
    if (!rawToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const tokenHash = hashToken(rawToken);
    const existingSession = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true }
    });

    // If token not found in DB
    if (!existingSession) {
      clearAuthCookies(res);
      return res.status(401).json({ error: 'Invalid or revoked refresh token' });
    }

    // Reuse Detection: If token is already revoked or rotated, revoke the entire session family!
    if (existingSession.revokedAt || existingSession.rotatedAt) {
      console.warn(
        `[SECURITY EVENT] Refresh token reuse detected! Revoking token family ${existingSession.familyId} ` +
        `for user ${existingSession.userId}`
      );
      // Revoke all tokens in family
      await prisma.refreshToken.updateMany({
        where: { familyId: existingSession.familyId },
        data: { revokedAt: new Date() }
      });
      await prisma.auditLog.create({
        data: {
          actorId: existingSession.userId,
          actorRole: existingSession.user.role,
          action: 'TOKEN_REUSE_DETECTED',
          input: `Reuse of rotated token family ${existingSession.familyId}`,
          output: 'Entire session family revoked for security',
          outcome: 'REVOKED'
        }
      }).catch(() => {});

      clearAuthCookies(res);
      return res.status(403).json({ error: 'Security breach detected: Session family revoked due to token replay.' });
    }

    // Check expiration
    if (new Date() > existingSession.expiresAt) {
      await prisma.refreshToken.update({
        where: { id: existingSession.id },
        data: { revokedAt: new Date() }
      });
      clearAuthCookies(res);
      return res.status(401).json({ error: 'Expired refresh token' });
    }

    const user = existingSession.user;

    // Issue new Access Token
    const newAccessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      secret,
      { expiresIn: '15m', algorithm: 'HS256' }
    );

    // Rotate Refresh Token
    const newRawRefreshToken = crypto.randomBytes(32).toString('hex');
    const newCsrfToken = crypto.randomBytes(16).toString('hex');
    const newTokenHash = hashToken(newRawRefreshToken);

    // Mark current token as rotated
    await prisma.refreshToken.update({
      where: { id: existingSession.id },
      data: { rotatedAt: new Date() }
    });

    // Save new refresh token in same family
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: newTokenHash,
        familyId: existingSession.familyId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        deviceInfo: req.headers['user-agent'] || 'Unknown Device'
      }
    });

    // Set updated cookies
    setAuthCookies(res, newAccessToken, newRawRefreshToken, newCsrfToken);

    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        actorRole: user.role,
        action: 'TOKEN_REFRESH',
        input: `Token rotated for user ${user.email}`,
        output: 'Issued new access token and rotated refresh token',
        outcome: 'SUCCESS'
      }
    }).catch(() => {});

    return res.json({
      token: newAccessToken,
      csrfToken: newCsrfToken
    });

  } catch (error) {
    console.error('Refresh error:', error);
    return res.status(500).json({ error: 'Failed to refresh token' });
  }
});

// POST /api/auth/logout - Server-Side Session Revocation
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const rawToken = req.cookies?.refresh_token || req.body?.refreshToken;
    if (rawToken) {
      const tokenHash = hashToken(rawToken);
      const session = await prisma.refreshToken.findUnique({ where: { tokenHash } });
      if (session) {
        await prisma.refreshToken.update({
          where: { id: session.id },
          data: { revokedAt: new Date() }
        });
        await prisma.auditLog.create({
          data: {
            actorId: session.userId,
            actorRole: 'USER',
            action: 'LOGOUT',
            input: `User logged out`,
            output: `Server session revoked`,
            outcome: 'SUCCESS'
          }
        }).catch(() => {});
      }
    }

    clearAuthCookies(res);
    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    clearAuthCookies(res);
    return res.json({ success: true, message: 'Logged out' });
  }
});

// POST /api/auth/revoke-all-sessions - Invalidate all active sessions for user
router.post('/revoke-all-sessions', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    await prisma.refreshToken.updateMany({
      where: { userId: req.user.id, revokedAt: null },
      data: { revokedAt: new Date() }
    });

    await prisma.auditLog.create({
      data: {
        actorId: req.user.id,
        actorRole: req.user.role,
        action: 'ALL_SESSIONS_REVOKED',
        input: `User revoked all active sessions`,
        output: 'All refresh tokens invalidated',
        outcome: 'SUCCESS'
      }
    });

    clearAuthCookies(res);
    return res.json({ success: true, message: 'All active sessions have been revoked.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to revoke sessions.' });
  }
});

// GET /api/auth/pending-users - Admin Protected Route
router.get('/pending-users', authenticateToken, requireRole(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const pendingUsers = await prisma.user.findMany({
      where: { status: 'PENDING_ADMIN_APPROVAL' },
      select: { id: true, name: true, email: true, role: true, designation: true, court: true, officialId: true, createdAt: true }
    });
    const decryptedUsers = pendingUsers.map(u => ({
      ...u,
      officialId: decryptField(u.officialId)
    }));
    return res.json({ success: true, pendingUsers: decryptedUsers });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch pending applications.' });
  }
});

// POST /api/auth/approve-user/:id - Admin Protected Route
router.post('/approve-user/:id', authenticateToken, requireRole(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const userId = String(req.params.id);
    const status = String(req.body.status); // APPROVED or REJECTED

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid approval status.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status }
    });

    // Create Audit Log
    if (req.user) {
      await prisma.auditLog.create({
        data: {
          actorId: req.user.id,
          actorRole: req.user.role,
          action: status === 'APPROVED' ? 'OFFICIAL_USER_APPROVED' : 'OFFICIAL_USER_REJECTED',
          input: `Target User ID: ${userId} (${updatedUser.name})`,
          output: `Admin ${req.user.name} marked account status as ${status}`,
          outcome: status
        }
      });
    }

    return res.json({ success: true, user: updatedUser });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update user approval status.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.toLowerCase(),
        designation: user.designation,
        court: user.court,
        status: user.status
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

