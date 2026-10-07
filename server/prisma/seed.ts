import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('============================================================');
  console.log('LEXORA AI — SEEDING REALISTIC INTERCONNECTED DEMO DATA');
  console.log('============================================================\n');

  // 1. Clean existing records in correct foreign-key dependency order
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.draftOrder.deleteMany();
  await prisma.evidence.deleteMany();
  await prisma.document.deleteMany();
  await prisma.hearing.deleteMany();
  await prisma.aiAnalysis.deleteMany();
  await prisma.filing.deleteMany();
  await prisma.benchAllocation.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.case.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('lexora123', 10);

  // 2. CREATE USERS ACROSS ALL 5 ROLES
  console.log('--- Step 1: Seeding Users ---');

  // Judges
  const judgeSharma = await prisma.user.create({
    data: {
      email: 'judge@lexora.gov.in',
      password: hashedPassword,
      name: "Hon'ble Justice Rajesh Sharma",
      role: 'JUDGE',
      designation: 'Senior High Court Judge',
      court: 'High Court of Judicature',
      officialId: 'JUD/HC/2012/048',
      status: 'APPROVED',
      avatar: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=150'
    }
  });

  const judgeRao = await prisma.user.create({
    data: {
      email: 'ananya.rao@judiciary.gov.in',
      password: hashedPassword,
      name: "Hon'ble Justice Ananya Rao",
      role: 'JUDGE',
      designation: 'High Court Judge (Commercial Division)',
      court: 'High Court of Judicature',
      officialId: 'JUD/HC/2016/112',
      status: 'APPROVED',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
    }
  });

  const judgeMenon = await prisma.user.create({
    data: {
      email: 'vikram.menon@judiciary.gov.in',
      password: hashedPassword,
      name: "Hon'ble Justice Vikram Menon",
      role: 'JUDGE',
      designation: 'Special Appellate Judge',
      court: 'High Court of Judicature',
      officialId: 'JUD/HC/2014/089',
      status: 'APPROVED',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    }
  });

  const judgeIyer = await prisma.user.create({
    data: {
      email: 'meera.iyer@judiciary.gov.in',
      password: hashedPassword,
      name: "Hon'ble Justice Meera Iyer",
      role: 'JUDGE',
      designation: 'District & Sessions Judge',
      court: 'District Civil & Criminal Court',
      officialId: 'JUD/DC/2018/301',
      status: 'APPROVED',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150'
    }
  });

  // Lawyers
  const lawyerPriya = await prisma.user.create({
    data: {
      email: 'lawyer@lexora.gov.in',
      password: hashedPassword,
      name: 'Advocate Priya Nair',
      role: 'LAWYER',
      designation: 'Senior Legal Counsel',
      court: 'Supreme Court & High Court Bar Association',
      officialId: 'BAR/MH/2018/1482',
      status: 'APPROVED',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
    }
  });

  const lawyerArjun = await prisma.user.create({
    data: {
      email: 'arjun.sharma@lexora.gov.in',
      password: hashedPassword,
      name: 'Advocate Arjun Sharma',
      role: 'LAWYER',
      designation: 'Advocate on Record',
      court: 'High Court Bar Association',
      officialId: 'BAR/MH/2015/5821',
      status: 'APPROVED',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
    }
  });

  const lawyerRohan = await prisma.user.create({
    data: {
      email: 'rohan.mehta@lexora.gov.in',
      password: hashedPassword,
      name: 'Advocate Rohan Mehta',
      role: 'LAWYER',
      designation: 'Commercial & Arbitration Counsel',
      court: 'High Court Bar Association',
      officialId: 'BAR/DL/2019/2290',
      status: 'APPROVED',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
    }
  });

  const lawyerKavya = await prisma.user.create({
    data: {
      email: 'kavya.nair@lexora.gov.in',
      password: hashedPassword,
      name: 'Advocate Kavya Nair',
      role: 'LAWYER',
      designation: 'Civil & Banking Law Specialist',
      court: 'High Court Bar Association',
      officialId: 'BAR/MH/2020/3104',
      status: 'APPROVED',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
    }
  });

  // Court Staff
  const staffAmit = await prisma.user.create({
    data: {
      email: 'staff@lexora.gov.in',
      password: hashedPassword,
      name: 'Amit Kumar',
      role: 'COURT_STAFF',
      designation: 'Chief Bench Registrar',
      court: 'High Court Registry',
      officialId: 'REG/HC/2019/042',
      status: 'APPROVED',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    }
  });

  const staffSunil = await prisma.user.create({
    data: {
      email: 'sunil.verma@lexora.gov.in',
      password: hashedPassword,
      name: 'Sunil Verma',
      role: 'COURT_STAFF',
      designation: 'Senior Scrutiny & Listing Officer',
      court: 'High Court e-Filing Registry Desk',
      officialId: 'REG/HC/2021/118',
      status: 'APPROVED',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'
    }
  });

  // Citizens / Litigants
  const citizenRamesh = await prisma.user.create({
    data: {
      email: 'citizen@lexora.gov.in',
      password: hashedPassword,
      name: 'Ramesh Patel',
      role: 'CITIZEN',
      designation: 'Authorized Representative (Sunrise Housing)',
      court: 'District Civil Court',
      status: 'APPROVED',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
    }
  });

  const citizenRajiv = await prisma.user.create({
    data: {
      email: 'rajiv.malhotra@citizen.gov.in',
      password: hashedPassword,
      name: 'Rajiv Malhotra',
      role: 'CITIZEN',
      designation: 'Litigant / Petitioner',
      court: 'High Court of Judicature',
      status: 'APPROVED',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
    }
  });

  const citizenNeha = await prisma.user.create({
    data: {
      email: 'neha.verma@citizen.gov.in',
      password: hashedPassword,
      name: 'Neha Verma',
      role: 'CITIZEN',
      designation: 'Litigant / Consumer Petitioner',
      court: 'High Court of Judicature',
      status: 'APPROVED',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
    }
  });

  const citizenArvind = await prisma.user.create({
    data: {
      email: 'arvind.kumar@citizen.gov.in',
      password: hashedPassword,
      name: 'Arvind Kumar',
      role: 'CITIZEN',
      designation: 'Litigant / Respondent',
      court: 'High Court of Judicature',
      status: 'APPROVED',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'
    }
  });

  // Admin
  const adminSunita = await prisma.user.create({
    data: {
      email: 'admin@lexora.gov.in',
      password: hashedPassword,
      name: 'Dr. Sunita Rao',
      role: 'ADMIN',
      designation: 'Director of National Judicial Informatics',
      court: 'National Judicial Data Center',
      officialId: 'ADM/NJDG/2010/001',
      status: 'APPROVED',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150'
    }
  });

  // Pending Registrations for Admin Approval Queue
  await prisma.user.create({
    data: {
      email: 'vikram.sen@lawfirm.in',
      password: hashedPassword,
      name: 'Adv. Vikramaditya Sen',
      role: 'LAWYER',
      designation: 'Senior Advocate (High Court)',
      court: 'High Court Bar Association',
      officialId: 'BAR/MH/2024/8891',
      status: 'PENDING_ADMIN_APPROVAL',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
    }
  });

  await prisma.user.create({
    data: {
      email: 'm.sundaram@judiciary.gov.in',
      password: hashedPassword,
      name: "Hon'ble Justice Meenakshi Sundaram",
      role: 'JUDGE',
      designation: 'District & Sessions Judge',
      court: 'District Civil & Criminal Court',
      officialId: 'JUD/SERVICE/1042',
      status: 'PENDING_ADMIN_APPROVAL',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
    }
  });

  console.log('Users seeded successfully (Judges, Lawyers, Staff, Citizens, Admin, Pending).');

  // 3. SEED INTERCONNECTED CASES
  console.log('--- Step 2: Seeding Cases ---');
  const now = new Date();
  const todayIso = now.toISOString().split('T')[0];
  const tomorrowIso = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const plus3DaysIso = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
  const plus5DaysIso = new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0];
  const plus8DaysIso = new Date(Date.now() + 8 * 86400000).toISOString().split('T')[0];
  const plus12DaysIso = new Date(Date.now() + 12 * 86400000).toISOString().split('T')[0];
  const plus15DaysIso = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];

  const case1 = await prisma.case.create({
    data: {
      caseNumber: 'LEX/ENV/001/2026',
      title: 'M/s Greenfield Bio-Energy Pvt. Ltd. vs. State Environmental Tribunal & Ors.',
      description: 'Writ Petition under Article 226 challenging statutory environmental closure notice issued prior to statutory 45-day appellate window expiry.',
      status: 'Pending',
      priority: 'High',
      division: 'Commercial',
      petitioner: 'M/s Greenfield Bio-Energy Pvt. Ltd.',
      respondent: 'State Environmental Tribunal & Ors.',
      filingDate: '2026-02-10',
      nextHearing: todayIso,
      court: 'High Court of Judicature',
      type: 'Writ Petition',
      delayProbability: 14.5,
      judgeId: judgeSharma.id,
      lawyerId: lawyerPriya.id
    }
  });

  const case2 = await prisma.case.create({
    data: {
      caseNumber: 'LEX/CIV/002/2026',
      title: 'Rajiv Malhotra vs. Orion Infrastructure Ltd.',
      description: 'Specific performance suit for commercial handover of IT corridor infrastructure package with liquidated damages claim under Section 55 Contract Act.',
      status: 'Active',
      priority: 'Medium',
      division: 'Civil',
      petitioner: 'Rajiv Malhotra',
      respondent: 'Orion Infrastructure Ltd.',
      filingDate: '2025-08-15',
      nextHearing: todayIso,
      court: 'High Court of Judicature',
      type: 'Civil Suit',
      delayProbability: 28.0,
      judgeId: judgeSharma.id,
      lawyerId: lawyerPriya.id
    }
  });

  const case3 = await prisma.case.create({
    data: {
      caseNumber: 'LEX/BANK/003/2026',
      title: 'Neha Verma vs. Apex Financial Services',
      description: 'SARFAESI Section 17 petition against arbitrary commercial asset auction notice issued without mandatory 30-day statutory notice.',
      status: 'Pending',
      priority: 'High',
      division: 'Commercial',
      petitioner: 'Neha Verma',
      respondent: 'Apex Financial Services',
      filingDate: '2025-03-12',
      nextHearing: tomorrowIso,
      court: 'High Court of Judicature',
      type: 'Writ Petition',
      delayProbability: 22.0,
      judgeId: judgeRao.id,
      lawyerId: lawyerKavya.id
    }
  });

  const case4 = await prisma.case.create({
    data: {
      caseNumber: 'LEX/PROP/004/2026',
      title: 'Sunrise Housing Cooperative vs. Municipal Authority',
      description: 'Title declaration and perpetual injunction against municipal road widening encroachment on registered cooperative society open layout plot.',
      status: 'Pending',
      priority: 'Medium',
      division: 'Civil',
      petitioner: 'Sunrise Housing Cooperative (Ramesh Patel)',
      respondent: 'Municipal Authority & Town Planning Directorate',
      filingDate: '2025-01-20',
      nextHearing: todayIso,
      court: 'District Civil Court',
      type: 'Civil Suit',
      delayProbability: 35.0,
      judgeId: judgeSharma.id,
      lawyerId: lawyerPriya.id
    }
  });

  const case5 = await prisma.case.create({
    data: {
      caseNumber: 'LEX/CRL/005/2026',
      title: 'State of Maharashtra vs. Arvind Kumar',
      description: 'Criminal revision appeal concerning framing of charges and admissibility of digital forensic ledger records under Section 65B Evidence Act.',
      status: 'Active',
      priority: 'High',
      division: 'Criminal',
      petitioner: 'State of Maharashtra',
      respondent: 'Arvind Kumar',
      filingDate: '2024-11-04',
      nextHearing: todayIso,
      court: 'High Court of Judicature',
      type: 'Criminal Appeal',
      delayProbability: 58.0,
      judgeId: judgeMenon.id,
      lawyerId: lawyerPriya.id
    }
  });

  const case6 = await prisma.case.create({
    data: {
      caseNumber: 'LEX/COM/006/2026',
      title: 'Kavya Enterprises vs. Delta Logistics Pvt. Ltd.',
      description: 'Summary commercial suit under Order XXXVII CPC for recovery of inter-state freight logistics dues with contractual pre-suit interest.',
      status: 'Pending',
      priority: 'Medium',
      division: 'Commercial',
      petitioner: 'Kavya Enterprises',
      respondent: 'Delta Logistics Pvt. Ltd.',
      filingDate: '2025-06-18',
      nextHearing: plus5DaysIso,
      court: 'High Court of Judicature',
      type: 'Commercial Suit',
      delayProbability: 19.5,
      judgeId: judgeSharma.id,
      lawyerId: lawyerArjun.id
    }
  });

  const case7 = await prisma.case.create({
    data: {
      caseNumber: 'LEX/ARB/007/2026',
      title: 'National Highways Authority vs. ABC Infra Projects Ltd.',
      description: 'Section 34 Arbitration & Conciliation Act petition challenging arbitral tribunal award regarding highway toll concession extension.',
      status: 'Active',
      priority: 'High',
      division: 'Commercial',
      petitioner: 'National Highways Authority',
      respondent: 'ABC Infra Projects Ltd.',
      filingDate: '2024-11-20',
      nextHearing: plus8DaysIso,
      court: 'High Court of Judicature',
      type: 'Arbitration Appeal',
      delayProbability: 42.0,
      judgeId: judgeSharma.id,
      lawyerId: lawyerRohan.id
    }
  });

  const case8 = await prisma.case.create({
    data: {
      caseNumber: 'LEX/ADM/008/2026',
      title: 'Bharat Telecom Users Forum vs. Union of India & TRAI',
      description: 'Public Interest Litigation challenging telecom spectrum tariff regulatory notification. Disposed with policy directions.',
      status: 'Closed',
      priority: 'Low',
      division: 'Constitutional',
      petitioner: 'Bharat Telecom Users Forum',
      respondent: 'Union of India & Telecom Regulatory Authority',
      filingDate: '2023-05-10',
      nextHearing: '2026-05-15',
      court: 'High Court of Judicature',
      type: 'Public Interest Litigation',
      delayProbability: 5.0,
      judgeId: judgeSharma.id,
      lawyerId: lawyerPriya.id
    }
  });

  const case9 = await prisma.case.create({
    data: {
      caseNumber: 'LEX/WP/009/2026',
      title: 'Dr. Aditi Sen & Ors. vs. State Medical Council & Health Dept',
      description: 'Special Writ Petition under Article 226 challenging revised emergency hospital staffing regulations without mandatory statutory consultation.',
      status: 'Pending',
      priority: 'High',
      division: 'Constitutional',
      petitioner: 'Dr. Aditi Sen & Resident Doctors Welfare Association',
      respondent: 'State Medical Council & Directorate of Health Services',
      filingDate: '2026-03-01',
      nextHearing: todayIso,
      court: 'High Court of Judicature',
      type: 'Writ Petition',
      delayProbability: 12.0,
      judgeId: judgeSharma.id,
      lawyerId: lawyerPriya.id
    }
  });

  const case10 = await prisma.case.create({
    data: {
      caseNumber: 'LEX/COM/010/2026',
      title: 'FinTech Ventures LLP vs. Reserve Bank Regulatory Authority & Ors.',
      description: 'Commercial dispute under Section 9 Commercial Courts Act regarding neo-banking escrow audit mandate and settlement license timelines.',
      status: 'Active',
      priority: 'High',
      division: 'Commercial',
      petitioner: 'FinTech Ventures LLP',
      respondent: 'Reserve Bank Regulatory Authority & Anr.',
      filingDate: '2026-02-18',
      nextHearing: todayIso,
      court: 'High Court of Judicature',
      type: 'Commercial Suit',
      delayProbability: 19.5,
      judgeId: judgeSharma.id,
      lawyerId: lawyerPriya.id
    }
  });

  const case11 = await prisma.case.create({
    data: {
      caseNumber: 'LEX/CRL/011/2026',
      title: 'State of Maharashtra vs. Sandeep Singhania & Ors.',
      description: 'Special Criminal Revision concerning forensic audit admissibility and interim bail under Section 439 CrPC / BNSS in economic offense investigation.',
      status: 'Pending',
      priority: 'High',
      division: 'Criminal',
      petitioner: 'State of Maharashtra (Economic Offences Wing)',
      respondent: 'Sandeep Singhania & Ors.',
      filingDate: '2026-04-10',
      nextHearing: todayIso,
      court: 'High Court of Judicature',
      type: 'Criminal Revision',
      delayProbability: 31.0,
      judgeId: judgeSharma.id,
      lawyerId: lawyerPriya.id
    }
  });

  console.log('11 Cases seeded across Criminal, Civil, Commercial, and Constitutional divisions.');

  // 4. SEED HEARINGS (TODAY, TOMORROW, UPCOMING, COMPLETED)
  console.log('--- Step 3: Seeding Hearings ---');
  await prisma.hearing.createMany({
    data: [
      // Today's Hearings on Active Cause List (Bench II & coordinate benches)
      {
        caseId: case1.id,
        date: todayIso,
        time: '09:30 AM',
        courtRoom: 'Courtroom No. 1 (Bench II)',
        status: 'Scheduled',
        type: 'Arguments on Interim Injunction',
        suggestedByAi: true,
        aiRationale: 'Urgent stay review scheduled based on judicial docket availability.'
      },
      {
        caseId: case2.id,
        date: todayIso,
        time: '11:00 AM',
        courtRoom: 'Courtroom No. 1 (Bench II)',
        status: 'Scheduled',
        type: 'Preliminary Hearing & Framing of Issues',
        suggestedByAi: false,
      },
      {
        caseId: case4.id,
        date: todayIso,
        time: '01:45 PM',
        courtRoom: 'Courtroom No. 1 (Bench II)',
        status: 'Scheduled',
        type: 'Evidence & Commissioner Report Verification',
        suggestedByAi: false,
      },
      {
        caseId: case9.id,
        date: todayIso,
        time: '02:30 PM',
        courtRoom: 'Courtroom No. 1 (Bench II)',
        status: 'Scheduled',
        type: 'Admission & Notice of Motion',
        suggestedByAi: true,
        aiRationale: 'Statutory urgency: Public health guidelines motion listed for expedited hearing.'
      },
      {
        caseId: case10.id,
        date: todayIso,
        time: '03:45 PM',
        courtRoom: 'Courtroom No. 1 (Bench II)',
        status: 'Scheduled',
        type: 'Interim Protection & Cross-Objections',
        suggestedByAi: false,
      },
      {
        caseId: case11.id,
        date: todayIso,
        time: '04:30 PM',
        courtRoom: 'Courtroom No. 1 (Bench II)',
        status: 'Scheduled',
        type: 'Special Bail Application & Forensic Examination',
        suggestedByAi: true,
        aiRationale: 'Liberty timeline: Accused in judicial custody exceeding 60-day statutory remand threshold.'
      },
      {
        caseId: case5.id,
        date: todayIso,
        time: '03:45 PM',
        courtRoom: 'Courtroom No. 3',
        status: 'Scheduled',
        type: 'Bail Review & Forensic Record Examination',
        suggestedByAi: false,
      },
      // 1 Tomorrow's Hearing
      {
        caseId: case3.id,
        date: tomorrowIso,
        time: '10:30 AM',
        courtRoom: 'Courtroom No. 2',
        status: 'Scheduled',
        type: 'SARFAESI Section 17 Stay Review',
        suggestedByAi: true,
        aiRationale: 'Scheduled ahead of commercial auction date window.'
      },
      // Upcoming Hearings
      {
        caseId: case6.id,
        date: plus5DaysIso,
        time: '11:30 AM',
        courtRoom: 'Courtroom No. 2',
        status: 'Scheduled',
        type: 'Order XXXVII Summary Hearing',
        suggestedByAi: false,
      },
      {
        caseId: case7.id,
        date: plus8DaysIso,
        time: '03:00 PM',
        courtRoom: 'Courtroom No. 1 (Bench II)',
        status: 'Scheduled',
        type: 'Section 34 Final Arguments',
        suggestedByAi: false,
      },
      // 1 Completed Hearing
      {
        caseId: case8.id,
        date: '2026-05-15',
        time: '10:00 AM',
        courtRoom: 'Courtroom No. 1 (Bench II)',
        status: 'Completed',
        type: 'Final Judgment Delivery',
        suggestedByAi: false,
      },
    ]
  });

  console.log('8 Hearings seeded (4 Today, 1 Tomorrow, 2 Upcoming, 1 Completed).');

  // 5. SEED CASE DOCUMENTS & EVIDENCE
  console.log('--- Step 4: Seeding Case Documents & Evidence ---');
  await prisma.document.createMany({
    data: [
      {
        caseId: case1.id,
        fileName: 'Petition_Writ_Art226.pdf',
        filePath: 'uploads/demo/Petition_Writ_Art226.pdf',
        fileSize: 2457600,
        mimeType: 'application/pdf',
        uploadedBy: lawyerPriya.id,
        status: 'INDEXED',
        pageCount: 18,
      },
      {
        caseId: case1.id,
        fileName: 'Environmental_Clearance_Certificate.pdf',
        filePath: 'uploads/demo/Environmental_Clearance_Certificate.pdf',
        fileSize: 1843200,
        mimeType: 'application/pdf',
        uploadedBy: lawyerPriya.id,
        status: 'INDEXED',
        pageCount: 6,
      },
      {
        caseId: case2.id,
        fileName: 'Concession_Agreement_Contract.pdf',
        filePath: 'uploads/demo/Concession_Agreement_Contract.pdf',
        fileSize: 4194304,
        mimeType: 'application/pdf',
        uploadedBy: lawyerRohan.id,
        status: 'INDEXED',
        pageCount: 32,
      },
      {
        caseId: case3.id,
        fileName: 'SARFAESI_Statutory_Notice_13_2.pdf',
        filePath: 'uploads/demo/SARFAESI_Statutory_Notice_13_2.pdf',
        fileSize: 634880,
        mimeType: 'application/pdf',
        uploadedBy: lawyerKavya.id,
        status: 'INDEXED',
        pageCount: 4,
      },
      {
        caseId: case4.id,
        fileName: 'Town_Planning_Layout_Map.pdf',
        filePath: 'uploads/demo/Town_Planning_Layout_Map.pdf',
        fileSize: 5324800,
        mimeType: 'application/pdf',
        uploadedBy: lawyerPriya.id,
        status: 'INDEXED',
        pageCount: 2,
      },
      {
        caseId: case9.id,
        fileName: 'Writ_Petition_Public_Health_Emergency.pdf',
        filePath: 'uploads/demo/Writ_Petition_Public_Health_Emergency.pdf',
        fileSize: 3145728,
        mimeType: 'application/pdf',
        uploadedBy: lawyerPriya.id,
        status: 'INDEXED',
        pageCount: 24,
      },
      {
        caseId: case10.id,
        fileName: 'FinTech_NeoBanking_Escrow_Audit_Report.pdf',
        filePath: 'uploads/demo/FinTech_NeoBanking_Escrow_Audit_Report.pdf',
        fileSize: 4194304,
        mimeType: 'application/pdf',
        uploadedBy: lawyerPriya.id,
        status: 'INDEXED',
        pageCount: 38,
      },
      {
        caseId: case11.id,
        fileName: 'Special_Bail_Application_Under_Sec439.pdf',
        filePath: 'uploads/demo/Special_Bail_Application_Under_Sec439.pdf',
        fileSize: 2097152,
        mimeType: 'application/pdf',
        uploadedBy: lawyerPriya.id,
        status: 'INDEXED',
        pageCount: 16,
      },
    ]
  });

  await prisma.evidence.createMany({
    data: [
      {
        caseId: case1.id,
        fileName: 'Pollution Control Board Inspection Report',
        fileType: 'PDF',
        category: 'Documentary',
        aiTags: JSON.stringify(['PCB Report', 'Air Quality', 'Emission Index', 'Section 21']),
      },
      {
        caseId: case2.id,
        fileName: 'Escrow Account Bank Statement',
        fileType: 'PDF',
        category: 'Documentary',
        aiTags: JSON.stringify(['Escrow', 'Bank Ledger', 'Milestone 4 Payment', 'Default Notice']),
      },
      {
        caseId: case5.id,
        fileName: 'Digital Ledger Server Audit Logs (Forensic Copy)',
        fileType: 'BIN',
        category: 'Forensic',
        aiTags: JSON.stringify(['65B Certificate', 'SHA-256 Hash', 'Audit Trail', 'Transaction ID']),
      },
      {
        caseId: case9.id,
        fileName: 'Directorate General Health Services Advisory Notice',
        fileType: 'PDF',
        category: 'Documentary',
        aiTags: JSON.stringify(['Health Guidelines', 'Article 21', 'Emergency Care', 'Duty Doctors']),
      },
      {
        caseId: case10.id,
        fileName: 'RBI Settlement Audit Compliance Certificate',
        fileType: 'PDF',
        category: 'Documentary',
        aiTags: JSON.stringify(['Escrow Audit', 'Payment Systems Act', 'Commercial Courts Act', 'Reserve Bank']),
      },
      {
        caseId: case11.id,
        fileName: 'Forensic Chartered Accountant Ledger Verification',
        fileType: 'PDF',
        category: 'Forensic',
        aiTags: JSON.stringify(['Forensic Audit', 'Section 439', 'Bank Records', 'Remand Verification']),
      },
    ]
  });

  console.log('Case Documents & Evidence seeded.');

  // 6. SEED DRAFT ORDERS & SUMMONS
  console.log('--- Step 5: Seeding Draft Orders ---');
  await prisma.draftOrder.createMany({
    data: [
      {
        caseId: case1.id,
        docType: 'Order',
        title: 'Ad-Interim Stay Order on Environmental Closure Notice',
        content: `IN THE HIGH COURT OF JUDICATURE AT BOMBAY\nCase No: LEX/ENV/001/2026\n\nUPON hearing learned counsel Advocate Priya Nair for petitioner and Government Pleader for respondents...\nIT IS HEREBY ORDERED that operation of closure notice dated 15.01.2026 shall remain stayed subject to petitioner maintaining emission standards as per Schedule II.`,
        status: 'DRAFT',
      },
      {
        caseId: case2.id,
        docType: 'Summons',
        title: 'Summons for Settlement of Issues (Order V CPC)',
        content: `IN THE HIGH COURT OF JUDICATURE\nCase No: LEX/CIV/002/2026\n\nTo, Orion Infrastructure Ltd.\nYOU ARE HEREBY SUMMONED to appear before this Court in person or by advocate on 10th September 2026 at 11:00 AM to answer all material questions relating to the suit.`,
        status: 'APPROVED',
        signedById: judgeSharma.id,
        signedAt: new Date(),
      },
      {
        caseId: case3.id,
        docType: 'Notice',
        title: 'Notice to Secured Creditor under Section 17 SARFAESI',
        content: `IN THE HIGH COURT OF JUDICATURE\nCase No: LEX/BANK/003/2026\n\nTo, Apex Financial Services\nNOTICE IS HEREBY GIVEN to file reply within 14 days regarding auction notice compliance under Section 13(4).`,
        status: 'APPROVED',
        signedById: judgeSharma.id,
        signedAt: new Date(),
      },
      {
        caseId: case9.id,
        docType: 'Notice',
        title: 'Notice of Motion & Interim Relief Directives',
        content: `IN THE HIGH COURT OF JUDICATURE\nCase No: LEX/WP/009/2026\n\nTo, State Medical Council & Directorate of Health Services\nNOTICE IS HEREBY ISSUED returnable within two weeks. Pending further orders, no adverse coercive actions shall be enforced against duty medical officers.`,
        status: 'DRAFT',
      },
      {
        caseId: case10.id,
        docType: 'Order',
        title: 'Interim Protective Escrow Custody Order',
        content: `IN THE HIGH COURT OF JUDICATURE (COMMERCIAL DIVISION)\nCase No: LEX/COM/010/2026\n\nUPON hearing counsel, the nodal escrow account shall remain operational strictly for verified merchant settlements subject to joint weekly audits.`,
        status: 'DRAFT',
      },
      {
        caseId: case11.id,
        docType: 'Bail Order',
        title: 'Bail Order & Surety Conditions',
        content: `IN THE HIGH COURT OF JUDICATURE (CRIMINAL APPELLATE BENCH)\nCase No: LEX/CRL/011/2026\n\nAccused Sandeep Singhania is hereby admitted to bail subject to executing personal bond of Rs. 2,00,000/- with two solvent sureties and surrender of travel documents.`,
        status: 'DRAFT',
      }
    ]
  });

  console.log('Draft orders and summons seeded.');

  // 7. SEED E-FILINGS (CITIZEN & COURT STAFF PORTALS)
  console.log('--- Step 6: Seeding e-Filings ---');
  await prisma.filing.createMany({
    data: [
      {
        filingNumber: 'FIL-2026-10482',
        applicantId: citizenRajiv.id,
        caseId: case1.id,
        title: 'M/s Greenfield Bio-Energy — Rejoinder to Counter-Affidavit',
        description: 'Rejoinder affidavit clarifying continuous emission monitoring system data.',
        filingType: 'Rejoinder Affidavit',
        court: 'High Court of Judicature',
        petitioner: 'M/s Greenfield Bio-Energy Pvt. Ltd.',
        respondent: 'State Environmental Tribunal',
        status: 'UNDER_REVIEW',
      },
      {
        filingNumber: 'FIL-2026-29184',
        applicantId: citizenRajiv.id,
        caseId: case2.id,
        title: 'Rajiv Malhotra — Application for Early Hearing',
        description: 'Interlocutory application under Section 151 CPC for expedited listing of commercial suit.',
        filingType: 'Interlocutory Application',
        court: 'High Court of Judicature',
        petitioner: 'Rajiv Malhotra',
        respondent: 'Orion Infrastructure Ltd.',
        status: 'ACCEPTED',
      },
      {
        filingNumber: 'FIL-2026-38291',
        applicantId: citizenNeha.id,
        caseId: case3.id,
        title: 'Neha Verma — Urgent Interim Relief Petition',
        description: 'Emergency writ seeking interim stay on e-auction scheduled for next week.',
        filingType: 'Writ Petition',
        court: 'High Court of Judicature',
        petitioner: 'Neha Verma',
        respondent: 'Apex Financial Services',
        status: 'SUBMITTED',
      },
      {
        filingNumber: 'FIL-2026-47102',
        applicantId: citizenRamesh.id,
        caseId: case4.id,
        title: 'Sunrise Housing Cooperative — Site Inspection Report Submission',
        description: 'Court Commissioner survey report submission on society open land boundary.',
        filingType: 'Civil Miscellaneous Petition',
        court: 'District Civil Court',
        petitioner: 'Sunrise Housing Cooperative (Ramesh Patel)',
        respondent: 'Municipal Authority',
        status: 'ACCEPTED',
      },
    ]
  });

  console.log('4 e-Filings seeded in SUBMITTED, UNDER_REVIEW, and ACCEPTED states.');

  // 8. SEED BENCH ALLOCATIONS (ADMIN & STAFF PORTALS)
  console.log('--- Step 7: Seeding Bench Allocations ---');
  await prisma.benchAllocation.createMany({
    data: [
      {
        judgeId: judgeSharma.id,
        courtroom: 'Courtroom #1 (Commercial & Environmental Bench)',
        date: todayIso,
        startTime: '10:00 AM',
        endTime: '04:30 PM',
        division: 'Commercial Debt & Environmental Writs',
        status: 'Active',
      },
      {
        judgeId: judgeRao.id,
        courtroom: 'Courtroom #2 (Civil & Contractual Division)',
        date: todayIso,
        startTime: '10:30 AM',
        endTime: '04:00 PM',
        division: 'Civil Suits & Specific Performance',
        status: 'Active',
      },
      {
        judgeId: judgeMenon.id,
        courtroom: 'Courtroom #3 (Special Criminal Appellate Bench)',
        date: todayIso,
        startTime: '11:00 AM',
        endTime: '05:00 PM',
        division: 'Criminal Appeals & Bail Applications',
        status: 'Active',
      },
      {
        judgeId: judgeIyer.id,
        courtroom: 'Courtroom #4 (Property & Financial Settlements)',
        date: todayIso,
        startTime: '10:00 AM',
        endTime: '03:30 PM',
        division: 'SARFAESI & Land Title Adjudication',
        status: 'Active',
      },
    ]
  });

  console.log('4 Courtroom Bench Allocations seeded.');

  // 9. SEED NOTIFICATIONS (FOR ALL ROLES)
  console.log('--- Step 8: Seeding Role-Based Notifications ---');
  await prisma.notification.createMany({
    data: [
      {
        userId: judgeSharma.id,
        title: 'Matters Requiring Judicial Attention',
        message: '3 urgent interlocutory stay petitions listed for judicial decision today.',
        type: 'alert',
        read: false,
      },
      {
        userId: judgeSharma.id,
        title: 'AI Delay Risk Prediction Complete',
        message: 'Case LEX/CRL/005/2026 backlog delay probability analyzed at 58%.',
        type: 'info',
        read: false,
      },
      {
        userId: lawyerPriya.id,
        title: 'Today Hearing Notice',
        message: 'Hearing scheduled for Greenfield Bio-Energy vs State Environmental Tribunal today at 09:30 AM.',
        type: 'warning',
        read: false,
      },
      {
        userId: lawyerPriya.id,
        title: 'Registry Scrutiny Passed',
        message: 'Rejoinder affidavit accepted in Rajiv Malhotra vs Orion Infrastructure.',
        type: 'success',
        read: true,
      },
      {
        userId: citizenRamesh.id,
        title: 'Upcoming Cause List Listing',
        message: 'Your civil suit Sunrise Housing vs Municipal Authority is listed on 15 September 2026.',
        type: 'info',
        read: false,
      },
      {
        userId: staffAmit.id,
        title: 'Incoming e-Filing Scrutiny Queue',
        message: '4 new citizen electronic filings awaiting registry verification.',
        type: 'alert',
        read: false,
      },
      {
        userId: adminSunita.id,
        title: 'Pending User Approvals',
        message: '2 judicial officer and advocate credential registrations pending verification.',
        type: 'warning',
        read: false,
      },
    ]
  });

  console.log('Notifications seeded for Judges, Lawyers, Staff, Citizens, Admin.');

  // 10. SEED AI ANALYSIS RECORDS
  console.log('--- Step 9: Seeding AI Analysis Records ---');
  await prisma.aiAnalysis.create({
    data: {
      caseId: case1.id,
      keyFindings: JSON.stringify([
        'Statutory 45-day appellate cure window under Section 22 not expired prior to closure order.',
        'High precedent alignment with Supreme Court environmental bench guidelines.',
        'Zero pollution violations recorded in preceding 3 operational quarters.'
      ]),
      legalPrecedents: JSON.stringify([
        "Vellore Citizens' Welfare Forum v. Union of India (1996) 5 SCC 647",
        "M.C. Mehta v. Kamal Nath (1997) 1 SCC 388",
        "Sterlite Industries Ltd. v. Union of India (2013) 4 SCC 575"
      ]),
      riskLevel: 'Low',
      recommendations: 'Grant ad-interim stay on closure notice subject to compliance inspection report within 3 weeks.',
    }
  });

  await prisma.aiAnalysis.create({
    data: {
      caseId: case2.id,
      keyFindings: JSON.stringify([
        'Time is of the essence clause contested under Section 55 Indian Contract Act 1872.',
        'Milestone payments verified through certified banking escrow statements.',
        'Force majeure defense raised without contemporaneous written notice.'
      ]),
      legalPrecedents: JSON.stringify([
        "Kailash Nath Associates v. Delhi Development Authority (2015) 4 SCC 136",
        "Swarnam Ramachandran v. Aravacode Chakungal (2004) 10 SCC 689"
      ]),
      riskLevel: 'Medium',
      recommendations: 'Direct parties to explore Section 89 CPC mediation for liquidated damages settlement.',
    }
  });

  await prisma.aiAnalysis.create({
    data: {
      caseId: case9.id,
      keyFindings: JSON.stringify([
        'Subordinate notification issued without statutory consultation required under Section 14 Medical Council Act.',
        'Prima facie impingement upon right to health under Article 21 Constitution of India.',
        'Urgent ad-interim protection requested for emergency medical personnel duty rotations.'
      ]),
      legalPrecedents: JSON.stringify([
        'Paschim Banga Khet Majoor Samity v. State of West Bengal (1996) 4 SCC 37',
        'Parmanand Katara v. Union of India (1989) 4 SCC 286'
      ]),
      riskLevel: 'Low',
      recommendations: 'Issue notice of motion with 2-week returnable date. Grant interim status quo on punitive roster enforcement.'
    }
  });

  await prisma.aiAnalysis.create({
    data: {
      caseId: case10.id,
      keyFindings: JSON.stringify([
        'Payment and Settlement Systems Act 2007 Section 10 regulatory window contested.',
        'Certified external auditor reports indicate 100% nodal escrow liquidity reconciliation.',
        'Arbitrary freeze notice impacts commercial continuity of 120,000 active retail accounts.'
      ]),
      legalPrecedents: JSON.stringify([
        'Internet and Mobile Association of India v. Reserve Bank of India (2020) 10 SCC 274',
        'Dhampur Sugar Mills Ltd. v. State of U.P. (2007) 8 SCC 338'
      ]),
      riskLevel: 'Medium',
      recommendations: 'Allow restricted escrow operations subject to daily verified compliance reporting to registrar.'
    }
  });

  await prisma.aiAnalysis.create({
    data: {
      caseId: case11.id,
      keyFindings: JSON.stringify([
        'Investigation substantially complete; charge sheet ready for filing.',
        'Passport deposited with investigating agency; zero flight risk demonstrated.',
        'Co-accused granted interim protection by coordinate bench.'
      ]),
      legalPrecedents: JSON.stringify([
        'Satender Kumar Antil v. CBI (2022) 10 SCC 51',
        'Sanjay Chandra v. CBI (2012) 1 SCC 40',
        'P. Chidambaram v. Directorate of Enforcement (2020) 13 SCC 791'
      ]),
      riskLevel: 'Medium',
      recommendations: 'Grant regular bail subject to furnishing ₹2,00,000 surety bond and weekly police attendance.'
    }
  });

  console.log('AI Analysis records seeded.');

  // 11. SEED AUDIT LOGS (CHRONOLOGICAL TRAIL)
  console.log('--- Step 10: Seeding Audit Logs ---');
  await prisma.auditLog.createMany({
    data: [
      {
        actorId: judgeSharma.id,
        actorRole: 'JUDGE',
        action: 'AI_SUMMARIZATION_REVIEW',
        input: JSON.stringify({ caseNumber: 'LEX/ENV/001/2026', document: 'Petition_Writ_Art226.pdf' }),
        output: JSON.stringify({ status: 'ACCEPTED', correctedFindingsCount: 3 }),
        sources: 'Petition_Writ_Art226.pdf (Pages 1-18)',
        outcome: 'ACCEPTED_BY_HUMAN',
      },
      {
        actorId: lawyerPriya.id,
        actorRole: 'LAWYER',
        action: 'RAG_LEGAL_QUERY',
        input: JSON.stringify({ query: 'Precedents for Section 22 statutory cure window before environmental closure' }),
        output: JSON.stringify({ matchesCount: 3, topPrecedent: "Vellore Citizens' Welfare Forum" }),
        sources: 'India Code / Environment Protection Act 1986',
        outcome: 'REVIEWED_HUMAN',
      },
      {
        actorId: staffAmit.id,
        actorRole: 'COURT_STAFF',
        action: 'E_FILING_STATUS_UPDATE',
        input: JSON.stringify({ filingNumber: 'FIL-2026-29184', targetStatus: 'ACCEPTED' }),
        output: JSON.stringify({ status: 'ACCEPTED', docketed: true }),
        sources: 'Rajiv Malhotra Early Hearing Application',
        outcome: 'REVIEWED_HUMAN',
      },
      {
        actorId: judgeSharma.id,
        actorRole: 'JUDGE',
        action: 'HEARING_APPROVAL',
        input: JSON.stringify({ caseNumber: 'LEX/ENV/001/2026', time: '09:30 AM', date: todayIso }),
        output: JSON.stringify({ status: 'APPROVED', scheduledSlot: 'Courtroom No. 1' }),
        sources: 'Judicial Calendar Slot Engine',
        outcome: 'APPROVED',
      },
      {
        actorId: adminSunita.id,
        actorRole: 'ADMIN',
        action: 'BENCH_ALLOCATION_CREATED',
        input: JSON.stringify({ judge: "Hon'ble Justice Rajesh Sharma", courtroom: 'Courtroom #1' }),
        output: JSON.stringify({ allocationId: 'ALLOC-2026-001', status: 'Active' }),
        sources: 'National Judicial Data Grid Roster',
        outcome: 'SUCCESS',
      },
      {
        actorId: lawyerRohan.id,
        actorRole: 'LAWYER',
        action: 'DOCUMENT_INGESTED',
        input: JSON.stringify({ fileName: 'Concession_Agreement_Contract.pdf', caseId: case2.id }),
        output: JSON.stringify({ status: 'INDEXED', chunkCount: 14 }),
        sources: 'Concession_Agreement_Contract.pdf',
        outcome: 'SUCCESS',
      },
    ]
  });

  console.log('Audit Logs seeded.');
  console.log('\n============================================================');
  console.log('LEXORA AI SEEDING COMPLETED WITH 100% DATABASE POPULATION');
  console.log('============================================================');
}

main()
  .catch((e) => {
    console.error('Seed execution error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

