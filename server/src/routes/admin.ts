import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Helper function to check if time slots overlap
function isTimeOverlapping(start1: string, end1: string, start2: string, end2: string): boolean {
  // Convert HH:MM strings to minutes for direct comparison
  const parseMin = (t: string) => {
    if (!t) return 0;
    const clean = t.trim().toUpperCase();
    const isPM = clean.includes('PM');
    const isAM = clean.includes('AM');
    const parts = clean.replace(/(AM|PM|\s)/g, '').split(':');
    let hours = parseInt(parts[0], 10) || 0;
    const mins = parseInt(parts[1], 10) || 0;
    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;
    return hours * 60 + mins;
  };

  const s1 = parseMin(start1);
  const e1 = parseMin(end1);
  const s2 = parseMin(start2);
  const e2 = parseMin(end2);

  return s1 < e2 && e1 > s2;
}

// GET /api/admin/allocations (and /bench-allocations alias) — Fetch all bench allocations
const getAllocationsHandler = async (req: AuthRequest, res: Response) => {
  try {
    const allocations = await prisma.benchAllocation.findMany({
      include: {
        judge: {
          select: {
            id: true,
            name: true,
            email: true,
            designation: true,
            court: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ success: true, allocations });
  } catch (error) {
    console.error('Failed to fetch allocations:', error);
    return res.status(500).json({ error: 'Failed to fetch bench allocations' });
  }
};

router.get('/allocations', authenticateToken, requireRole(['ADMIN', 'JUDGE', 'COURT_STAFF', 'STAFF']), getAllocationsHandler);
router.get('/bench-allocations', authenticateToken, requireRole(['ADMIN', 'JUDGE', 'COURT_STAFF', 'STAFF']), getAllocationsHandler);

// GET /api/admin/judges — Fetch all judges for allocation dropdowns
router.get('/judges', authenticateToken, requireRole(['ADMIN', 'JUDGE', 'COURT_STAFF', 'STAFF']), async (req: AuthRequest, res: Response) => {
  try {
    const judges = await prisma.user.findMany({
      where: { role: 'JUDGE' },
      select: {
        id: true,
        name: true,
        email: true,
        designation: true,
        court: true,
        status: true,
      },
      orderBy: { name: 'asc' }
    });
    return res.json({ success: true, judges });
  } catch (error) {
    console.error('Failed to fetch judges:', error);
    return res.status(500).json({ error: 'Failed to fetch judges list' });
  }
});

// GET /api/admin/pending-users — Fetch registrations awaiting admin approval
router.get('/pending-users', authenticateToken, requireRole(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const pendingUsers = await prisma.user.findMany({
      where: {
        status: { in: ['PENDING', 'PENDING_ADMIN_APPROVAL'] }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        designation: true,
        court: true,
        officialId: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ success: true, pendingUsers });
  } catch (error) {
    console.error('Failed to fetch pending users:', error);
    return res.status(500).json({ error: 'Failed to fetch pending users' });
  }
});

// POST /api/admin/approve-user — Approve or reject pending user registration
router.post('/approve-user', authenticateToken, requireRole(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const { userId, status } = req.body;
    if (!userId || !status) {
      return res.status(400).json({ error: 'userId and status are required' });
    }

    const validStatus = status.toUpperCase();
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status: validStatus === 'APPROVED' ? 'APPROVED' : 'REJECTED' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true
      }
    });

    if (req.user) {
      await prisma.auditLog.create({
        data: {
          actorId: req.user.id,
          actorRole: req.user.role,
          action: `USER_${validStatus}`,
          input: `Action on User ID ${userId} (${updatedUser.name})`,
          output: `Status set to ${updatedUser.status}`,
          outcome: 'SUCCESS'
        }
      });
    }

    return res.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error('Failed to approve/reject user:', error);
    return res.status(500).json({ error: 'Failed to update user status', details: error.message });
  }
});

// GET /api/admin/users — Fetch all users in system for RBAC management
router.get('/users', authenticateToken, requireRole(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        designation: true,
        court: true,
        officialId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ success: true, users });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return res.status(500).json({ error: 'Failed to fetch system users' });
  }
});

// PUT /api/admin/users/:id/status — Toggle or set user active/suspended status
router.put('/users/:id/status', authenticateToken, requireRole(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { status: String(status).toUpperCase() },
      select: { id: true, name: true, email: true, status: true }
    });

    return res.json({ success: true, user });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update user status', details: error.message });
  }
});

// POST /api/admin/allocations & /bench-allocations — Create new bench allocation with conflict detection
const createAllocationHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { judgeId, courtroom, date, startTime, endTime, division } = req.body;

    if (!judgeId || !courtroom || !date || !startTime || !endTime) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'judgeId, courtroom, date, startTime, and endTime are required fields.'
      });
    }

    // ── Past Date Validation ────
    const todayStr = new Date().toISOString().split('T')[0];
    if (date < todayStr) {
      return res.status(400).json({
        error: 'Invalid Date',
        message: 'Cannot create a bench allocation for a past date. Please select today or a future date.'
      });
    }

    // Verify Judge exists
    const judge = await prisma.user.findUnique({ where: { id: judgeId } });
    if (!judge) {
      return res.status(404).json({ error: 'Judge not found', message: `No user found with ID ${judgeId}` });
    }

    // ── Conflict Check: Check for overlapping allocations on the same date ────
    const existingOnDate = await prisma.benchAllocation.findMany({
      where: {
        date,
        status: { not: 'Cancelled' }
      }
    });

    for (const alloc of existingOnDate) {
      const sameJudge = alloc.judgeId === judgeId;
      const sameCourtroom = alloc.courtroom.toLowerCase() === courtroom.toLowerCase();

      if ((sameJudge || sameCourtroom) && isTimeOverlapping(startTime, endTime, alloc.startTime, alloc.endTime)) {
        const conflictReason = sameJudge
          ? `Judge ${judge.name} is already allocated to ${alloc.courtroom} on ${date} (${alloc.startTime} - ${alloc.endTime})`
          : `Courtroom ${courtroom} is already assigned on ${date} (${alloc.startTime} - ${alloc.endTime})`;

        return res.status(409).json({
          error: 'Conflict Detected',
          message: conflictReason,
          conflictType: sameJudge ? 'JUDGE_BUSY' : 'COURTROOM_BUSY',
          existingAllocation: alloc
        });
      }
    }

    const allocation = await prisma.benchAllocation.create({
      data: {
        judgeId,
        courtroom,
        date,
        startTime,
        endTime,
        division: division || judge.court || 'General Division',
        status: 'Active'
      },
      include: {
        judge: {
          select: {
            id: true,
            name: true,
            email: true,
            designation: true,
            court: true,
          }
        }
      }
    });

    // Create Audit Log
    if (req.user) {
      await prisma.auditLog.create({
        data: {
          actorId: req.user.id,
          actorRole: req.user.role,
          action: 'BENCH_ALLOCATION_CREATED',
          input: `Allocated Judge ${judge.name} to ${courtroom} on ${date} (${startTime}-${endTime})`,
          output: `Allocation ID ${allocation.id}`,
          outcome: 'SUCCESS'
        }
      });
    }

    return res.status(201).json({ success: true, allocation });
  } catch (error) {
    console.error('Failed to create allocation:', error);
    return res.status(500).json({ error: 'Failed to create bench allocation' });
  }
};

router.post('/allocations', authenticateToken, requireRole(['ADMIN', 'JUDGE', 'COURT_STAFF', 'STAFF']), createAllocationHandler);
router.post('/bench-allocations', authenticateToken, requireRole(['ADMIN', 'JUDGE', 'COURT_STAFF', 'STAFF']), createAllocationHandler);

// PUT /api/admin/allocations/:id & /bench-allocations/:id — Update bench allocation status or details
const updateAllocationHandler = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { courtroom, date, startTime, endTime, division, status } = req.body;

    const existing = await prisma.benchAllocation.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Allocation not found' });
    }

    const updated = await prisma.benchAllocation.update({
      where: { id },
      data: {
        courtroom: courtroom || existing.courtroom,
        date: date || existing.date,
        startTime: startTime || existing.startTime,
        endTime: endTime || existing.endTime,
        division: division || existing.division,
        status: status || existing.status,
      },
      include: { judge: true }
    });

    return res.json({ success: true, allocation: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update bench allocation' });
  }
};

router.put('/allocations/:id', authenticateToken, requireRole(['ADMIN', 'JUDGE', 'COURT_STAFF', 'STAFF']), updateAllocationHandler);
router.put('/bench-allocations/:id', authenticateToken, requireRole(['ADMIN', 'JUDGE', 'COURT_STAFF', 'STAFF']), updateAllocationHandler);

// DELETE /api/admin/allocations/:id & /bench-allocations/:id — Delete bench allocation
const deleteAllocationHandler = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.benchAllocation.delete({ where: { id } });
    return res.json({ success: true, message: 'Allocation deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete bench allocation' });
  }
};

router.delete('/allocations/:id', authenticateToken, requireRole(['ADMIN', 'JUDGE', 'COURT_STAFF', 'STAFF']), deleteAllocationHandler);
router.delete('/bench-allocations/:id', authenticateToken, requireRole(['ADMIN', 'JUDGE', 'COURT_STAFF', 'STAFF']), deleteAllocationHandler);

// POST /api/admin/demo-reset — Safe Deterministic Demo Environment Reset
router.post('/demo-reset', authenticateToken, requireRole(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const { confirm } = req.body;
    if (confirm !== true && confirm !== 'YES') {
      return res.status(400).json({
        error: 'Confirmation Required',
        message: 'Explicit confirmation required (confirm: true or confirm: "YES") to execute demo reset.',
      });
    }

    // Safely remove only synthetic demo records (hearings, draftOrders, evidences, documents)
    await prisma.hearing.deleteMany({
      where: { case: { caseNumber: { in: ['WP(C) 412/2024', 'CRL.A. 9912/2023', 'CIV.SUIT 104/2025'] } } },
    });
    await prisma.draftOrder.deleteMany({
      where: { case: { caseNumber: { in: ['WP(C) 412/2024', 'CRL.A. 9912/2023', 'CIV.SUIT 104/2025'] } } },
    });
    await prisma.evidence.deleteMany({
      where: { case: { caseNumber: { in: ['WP(C) 412/2024', 'CRL.A. 9912/2023', 'CIV.SUIT 104/2025'] } } },
    });
    await prisma.aiAnalysis.deleteMany({
      where: { case: { caseNumber: { in: ['WP(C) 412/2024', 'CRL.A. 9912/2023', 'CIV.SUIT 104/2025'] } } },
    });

    // Reset hearing status on main demo cases
    const case1 = await prisma.case.findFirst({ where: { caseNumber: 'WP(C) 412/2024' } });
    if (case1) {
      await prisma.hearing.create({
        data: {
          caseId: case1.id,
          date: '2026-08-14',
          time: '10:30 AM',
          courtRoom: 'Courtroom No. 4 (Bench II)',
          status: 'SUGGESTED',
          type: 'Arguments on Interim Relief',
          suggestedByAi: true,
          aiRationale: 'AI Suggested schedule based on judicial docket availability. Human review required.',
        },
      });

      await prisma.draftOrder.create({
        data: {
          caseId: case1.id,
          docType: 'Notice',
          title: 'Show Cause Notice to Respondent',
          content: `DRAFT — AI-GENERATED, UNEXECUTED (REVIEW REQUIRED)\n\nIN THE HIGH COURT OF JUDICATURE\nCase No: WP(C) 412/2024\n\nTo,\nM/s Apex Enterprises\n\nWHEREAS the Petitioner has filed the present writ petition for recovery of dues...\nYOU ARE HEREBY SUMMONED to appear before this Court on 14th August 2026 at 10:30 AM.`,
          status: 'DRAFT',
        },
      });
    }

    // Log Audit Entry for Reset Operation
    if (req.user) {
      await prisma.auditLog.create({
        data: {
          actorId: req.user.id,
          actorRole: req.user.role,
          action: 'DEMO_ENVIRONMENT_RESET',
          input: 'Execution of Admin Demo Reset',
          output: 'Demo cases WP(C) 412/2024 and CRL.A. 9912/2023 reset to pristine state',
          outcome: 'SUCCESS',
        },
      });
    }

    return res.json({
      success: true,
      message: 'Demo environment reset successfully. Demo cases and recommendations restored to pristine state.',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Demo reset error:', error);
    return res.status(500).json({ error: 'Failed to reset demo environment', details: error.message });
  }
});

export default router;
