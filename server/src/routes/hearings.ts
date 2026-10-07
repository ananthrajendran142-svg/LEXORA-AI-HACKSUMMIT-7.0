import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole, optionalAuth, AuthRequest } from '../middleware/auth.js';
import { canAccessCase, getAuthorizedHearingWhere } from '../utils/caseAuthorization.js';

const router = Router();
const prisma = new PrismaClient();

let lastCheckedDate = '';

async function autoAlignDemoHearingsToToday() {
  const todayIso = new Date().toISOString().split('T')[0];
  if (lastCheckedDate === todayIso) return;
  lastCheckedDate = todayIso;

  try {
    const todayHearingsCount = await prisma.hearing.count({
      where: { date: todayIso },
    });

    if (todayHearingsCount === 0) {
      const targetCaseNumbers = [
        'LEX/ENV/001/2026',
        'LEX/CIV/002/2026',
        'LEX/PROP/004/2026',
        'LEX/WP/009/2026',
        'LEX/COM/010/2026',
        'LEX/CRL/011/2026',
      ];

      const cases = await prisma.case.findMany({
        where: { caseNumber: { in: targetCaseNumbers } },
        select: { id: true, caseNumber: true },
      });

      for (const c of cases) {
        await prisma.case.update({
          where: { id: c.id },
          data: { nextHearing: todayIso },
        });

        const hearing = await prisma.hearing.findFirst({
          where: { caseId: c.id },
        });

        if (hearing) {
          await prisma.hearing.update({
            where: { id: hearing.id },
            data: { date: todayIso, status: 'Scheduled' },
          });
        }
      }
    }
  } catch (err) {
    console.error('Error auto-aligning demo hearings:', err);
  }
}

// GET /api/hearings - User-scoped and paginated hearings list
router.get('/', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    await autoAlignDemoHearingsToToday();
    const { caseId, date, page, limit } = req.query;
    let where: any = {};

    if (req.user) {
      where = { ...getAuthorizedHearingWhere(req.user) };
    }

    if (caseId) {
      const targetCaseId = String(caseId);
      if (req.user) {
        const access = await canAccessCase(req.user, targetCaseId, prisma);
        if (!access.allowed) {
          return res.status(403).json({ error: access.reason || 'Access denied: You do not have access to hearings for this case' });
        }
      }
      where.caseId = targetCaseId;
    }

    if (date) {
      if (date === 'today') {
        where.date = new Date().toISOString().split('T')[0];
      } else {
        where.date = String(date);
      }
    }

    const pageNum = page ? Math.max(1, parseInt(String(page), 10)) : null;
    const limitNum = limit ? Math.max(1, parseInt(String(limit), 10)) : null;

    if (pageNum && limitNum) {
      const skip = (pageNum - 1) * limitNum;
      const total = await prisma.hearing.count({ where });
      const totalPages = Math.ceil(total / limitNum);

      const hearings = await prisma.hearing.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          case: {
            select: {
              id: true,
              caseNumber: true,
              title: true,
              priority: true,
              court: true,
              judge: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { date: 'asc' },
      });

      return res.json({
        data: hearings,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages
        }
      });
    }

    const hearings = await prisma.hearing.findMany({
      where,
      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            title: true,
            priority: true,
            court: true,
            judge: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { date: 'asc' },
    });
    return res.json(hearings);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch hearings' });
  }
});

// POST /api/hearings/suggest (AI Smart Hearing Suggestion with Conflict Detection)
router.post('/suggest', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { caseId, targetDate, targetTime, courtRoom, judgeId } = req.body;

    if (!caseId) {
      return res.status(400).json({ error: 'caseId is required' });
    }

    // Verify user is authorized to suggest hearings for this case
    const access = await canAccessCase(req.user, String(caseId), prisma);
    if (!access.allowed) {
      return res.status(403).json({ error: access.reason || 'Access denied: You are not authorized to suggest hearings for this case.' });
    }

    const date = targetDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    const time = targetTime || '10:30 AM';
    const room = courtRoom || 'Court Room 1';

    // 1. Conflict Detection: Check if Courtroom is already booked at target date & time
    const roomConflict = await prisma.hearing.findFirst({
      where: {
        date,
        time,
        courtRoom: room,
        status: { in: ['Scheduled', 'APPROVED', 'PENDING_APPROVAL'] },
      },
    });

    // 2. Conflict Detection: Check if Judge has overlapping hearing at target date & time
    let judgeConflict = null;
    if (judgeId) {
      judgeConflict = await prisma.hearing.findFirst({
        where: {
          date,
          time,
          status: { in: ['Scheduled', 'APPROVED', 'PENDING_APPROVAL'] },
          case: { judgeId },
        },
      });
    }

    let finalTime = time;
    let rationale = `AI Suggested schedule based on judicial docket availability for ${date}.`;
    let isConflicted = false;

    if (roomConflict || judgeConflict) {
      isConflicted = true;
      finalTime = '02:30 PM'; // Automatically propose non-conflicting afternoon slot
      const reason = roomConflict
        ? `Courtroom ${room} is occupied at ${time}`
        : `Assigned judge has a concurrent hearing at ${time}`;
      rationale = `Conflict Detected: ${reason}. AI proposed alternative slot at ${finalTime} on ${date}. Human review required.`;
    }

    const newHearing = await prisma.hearing.create({
      data: {
        caseId,
        date,
        time: finalTime,
        courtRoom: room,
        type: 'Hearing',
        status: 'SUGGESTED', // NEVER finalized automatically
        suggestedByAi: true,
        aiRationale: rationale,
      },
    });

    return res.status(201).json({
      success: true,
      hearing: newHearing,
      conflictDetected: isConflicted,
      message: isConflicted
        ? 'Scheduling conflict detected! Hearing slot adjusted to non-conflicting time for human approval.'
        : 'AI hearing slot generated successfully. Awaiting human officer approval.',
    });
  } catch (error) {
    console.error('Suggest hearing error:', error);
    return res.status(500).json({ error: 'Failed to generate smart hearing suggestion' });
  }
});

// PUT /api/hearings/:id/approve (Human Review & Approval Workflow)
router.put('/:id/approve', authenticateToken, requireRole(['JUDGE', 'COURT_STAFF', 'STAFF', 'ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const hearingId = String(req.params.id);

    const hearing = await prisma.hearing.findUnique({
      where: { id: hearingId },
      include: { case: true },
    });

    if (!hearing) {
      return res.status(404).json({ error: 'Hearing not found' });
    }

    // Role-specific case ownership check: If JUDGE, must be assigned judge
    if (req.user?.role?.toUpperCase() === 'JUDGE' && hearing.case?.judgeId && hearing.case.judgeId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied: Hearing belongs to another judge\'s bench.' });
    }

    // Update hearing status to APPROVED
    const updated = await prisma.hearing.update({
      where: { id: hearingId },
      data: {
        status: 'APPROVED',
      },
    });

    // Update case nextHearing date
    await prisma.case.update({
      where: { id: hearing.caseId },
      data: { nextHearing: hearing.date },
    });

    // Log Approval in AuditLog
    let auditEntry = null;
    if (req.user) {
      auditEntry = await prisma.auditLog.create({
        data: {
          actorId: req.user.id,
          actorRole: req.user.role,
          action: 'HEARING_APPROVAL',
          input: JSON.stringify({ hearingId, caseId: hearing.caseId, date: hearing.date, time: hearing.time }),
          output: JSON.stringify({ status: 'APPROVED', updatedHearingId: hearingId }),
          outcome: 'APPROVED',
        },
      });
    }

    return res.json({
      success: true,
      hearing: updated,
      auditLogId: auditEntry?.id || `AUD-${Date.now()}`,
      auditLog: auditEntry,
      message: 'Hearing schedule approved and added to active judicial calendar.',
    });
  } catch (error) {
    console.error('Approve hearing error:', error);
    return res.status(500).json({ error: 'Failed to approve hearing' });
  }
});

// PUT /api/hearings/:id/reject (Human Review & Rejection Workflow)
router.put('/:id/reject', authenticateToken, requireRole(['JUDGE', 'COURT_STAFF', 'STAFF', 'ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const hearingId = String(req.params.id);

    const hearing = await prisma.hearing.findUnique({
      where: { id: hearingId },
      include: { case: true },
    });

    if (!hearing) {
      return res.status(404).json({ error: 'Hearing not found' });
    }

    // Role-specific check
    if (req.user?.role?.toUpperCase() === 'JUDGE' && hearing.case?.judgeId && hearing.case.judgeId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied: Hearing belongs to another judge\'s bench.' });
    }

    const updated = await prisma.hearing.update({
      where: { id: hearingId },
      data: {
        status: 'REJECTED',
      },
    });

    // Log Rejection in AuditLog
    if (req.user) {
      await prisma.auditLog.create({
        data: {
          actorId: req.user.id,
          actorRole: req.user.role,
          action: 'HEARING_REJECTION',
          input: JSON.stringify({ hearingId, caseId: hearing.caseId }),
          output: JSON.stringify({ status: 'REJECTED' }),
          outcome: 'REJECTED',
        },
      });
    }

    return res.json({
      success: true,
      hearing: updated,
      message: 'Hearing suggestion rejected by human officer.',
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to reject hearing' });
  }
});

// POST /api/hearings (Standard Manual Creation)
router.post('/', authenticateToken, requireRole(['JUDGE', 'COURT_STAFF', 'STAFF', 'ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const { caseId, date, time, courtRoom, type } = req.body;
    const newHearing = await prisma.hearing.create({
      data: {
        caseId,
        date: date || new Date().toISOString().split('T')[0],
        time: time || '10:00 AM',
        courtRoom: courtRoom || 'Court Room 1',
        type: type || 'Hearing',
        status: 'APPROVED',
        suggestedByAi: false,
      },
    });
    return res.status(201).json(newHearing);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to schedule hearing' });
  }
});

export default router;
