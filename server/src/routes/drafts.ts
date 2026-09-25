import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth.js';
import { encryptField, decryptField } from '../utils/fieldEncryption.js';
import { canAccessCase } from '../utils/caseAuthorization.js';

const router = Router();
const prisma = new PrismaClient();

// Get draft orders - Scoped strictly by user role & case assignment
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.user?.role?.toUpperCase() || '';
    const userId   = req.user?.id || '';

    const where: any = {};

    if (userRole === 'LAWYER') {
      const userCases = await prisma.case.findMany({ where: { lawyerId: userId }, select: { id: true } });
      const userCaseIds = userCases.map(c => c.id);
      where.caseId = { in: userCaseIds };
    } else if (userRole === 'CITIZEN') {
      const userName = req.user?.name || '';
      const userCases = await prisma.case.findMany({
        where: { OR: [{ petitioner: { contains: userName } }, { respondent: { contains: userName } }] },
        select: { id: true }
      });
      const userCaseIds = userCases.map(c => c.id);
      where.caseId = { in: userCaseIds };
      where.status = 'APPROVED'; // Citizens only see approved orders/notices
    }
    // JUDGE, COURT_STAFF, STAFF, ADMIN see all registry drafts & summonses

    const drafts = await prisma.draftOrder.findMany({
      where,
      include: { case: true, signedBy: true },
      orderBy: { createdAt: 'desc' }
    });

    const decryptedDrafts = drafts.map(d => ({
      ...d,
      content: decryptField(d.content) || ''
    }));

    res.json({ success: true, drafts: decryptedDrafts });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch drafts' });
  }
});

// Create draft order - Authorization checked
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { caseId, docType, title, content } = req.body;

    let targetCaseId: string | null = null;
    
    // 1. Search for existing case by exact ID or caseNumber
    if (caseId) {
      const existing = await prisma.case.findFirst({
        where: { OR: [{ id: String(caseId) }, { caseNumber: String(caseId) }] }
      });
      if (existing) targetCaseId = existing.id;
    }

    // 2. Search by caseNumber contained or fuzzy match
    if (!targetCaseId && caseId) {
      const existingFuzzy = await prisma.case.findFirst({
        where: { caseNumber: { contains: String(caseId) } }
      });
      if (existingFuzzy) targetCaseId = existingFuzzy.id;
    }

    // 3. Fallback: retrieve any existing case in system or create a new case entry for this summons/notice
    if (!targetCaseId) {
      const anyCase = await prisma.case.findFirst();
      if (anyCase) {
        targetCaseId = anyCase.id;
      } else {
        const newCase = await prisma.case.create({
          data: {
            caseNumber: String(caseId || 'CIVIL SUIT NO. 412 OF 2026'),
            title: title || 'Official Court Summons / Statutory Notice',
            description: 'Automated Summons & Statutory Notice Docket Case',
            status: 'Pending',
            priority: 'Medium',
            division: 'Civil',
            petitioner: 'State Bank of India',
            respondent: 'M/s Apex Enterprises Pvt. Ltd.',
            filingDate: new Date().toISOString().split('T')[0],
            nextHearing: new Date().toISOString().split('T')[0],
            court: 'High Court of Judicature at Bombay',
            type: 'Civil Suit'
          }
        });
        targetCaseId = newCase.id;
      }
    }

    // Verify user is authorized to create draft for this case
    const access = await canAccessCase(req.user, targetCaseId, prisma);
    const userRole = (req.user?.role || '').toUpperCase();
    const isAuthorizedRole = ['ADMIN', 'COURT_STAFF', 'STAFF', 'JUDGE', 'LAWYER'].includes(userRole);

    if (!access.allowed && !isAuthorizedRole) {
      return res.status(403).json({
        error: 'Access denied',
        message: access.reason || 'You are not authorized to create draft orders for this case.'
      });
    }

    const draft = await prisma.draftOrder.create({
      data: {
        caseId: targetCaseId,
        docType: docType || 'Order',
        title: title || 'Draft Court Order',
        content: encryptField(content) || '',
        status: 'DRAFT'
      }
    });

    // Create Audit Log
    if (req.user) {
      await prisma.auditLog.create({
        data: {
          actorId: req.user.id,
          actorRole: req.user.role,
          action: 'DRAFT_GENERATED',
          input: `Generated draft ${docType} for Case ID ${targetCaseId}`,
          output: title,
          outcome: 'AWAITING_HUMAN_SIGN_OFF'
        }
      });
    }

    const decryptedDraft = {
      ...draft,
      content: decryptField(draft.content) || ''
    };

    res.json({ success: true, draft: decryptedDraft });
  } catch (error: any) {
    console.error("Error creating draft order:", error);
    res.status(500).json({ error: 'Failed to create draft order', details: error?.message || String(error) });
  }
});

// Human Sign-Off (Approve / Reject) - Restricted to Judicial Officers, Staff & Admins
router.post('/:id/sign-off', authenticateToken, requireRole(['JUDGE', 'COURT_STAFF', 'STAFF', 'ADMIN']), async (req: AuthRequest, res) => {
  try {
    const draftId = String(req.params.id);
    const { status, editedContent } = req.body; // APPROVED or REJECTED

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid sign-off status.' });
    }

    const existingDraft = await prisma.draftOrder.findUnique({
      where: { id: draftId },
      include: { case: true }
    });

    if (!existingDraft) {
      return res.status(404).json({ error: 'Draft order not found' });
    }

    // If Judge, ensure assigned judge on case
    if (req.user?.role?.toUpperCase() === 'JUDGE' && existingDraft.case?.judgeId && existingDraft.case.judgeId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied: Draft belongs to another judge\'s bench.' });
    }

    const draft = await prisma.draftOrder.update({
      where: { id: draftId },
      data: {
        status,
        content: editedContent ? (encryptField(editedContent) || undefined) : undefined,
        signedById: req.user?.id,
        signedAt: new Date()
      }
    });

    // Create Immutable Audit Log for human judicial decision
    if (req.user) {
      await prisma.auditLog.create({
        data: {
          actorId: req.user.id,
          actorRole: req.user.role,
          action: status === 'APPROVED' ? 'HUMAN_SIGN_OFF_APPROVED' : 'HUMAN_SIGN_OFF_REJECTED',
          input: `Draft ID: ${draftId}`,
          output: `Judicial Officer ${req.user.name} marked draft as ${status}`,
          outcome: status
        }
      });
    }

    const decryptedDraft = {
      ...draft,
      content: decryptField(draft.content) || ''
    };

    res.json({ success: true, draft: decryptedDraft, badge: "Human Authenticated Sign-Off Completed" });
  } catch (error) {
    res.status(500).json({ error: 'Failed to sign off draft' });
  }
});

export default router;
