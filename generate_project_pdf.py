import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """Two-pass canvas to dynamically compute and print total page numbers and header/footer."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#0F172A"))
        
        # Header banner (pages 2+)
        if self._pageNumber > 1:
            self.drawString(54, 750, "LEXORA AI — Project Overview, Architecture & Role-Based Login Modules")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(54, 742, 558, 742)
            
        # Footer banner (all pages)
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawString(54, 36, "LEXORA AI — Next-Gen Judicial Intelligence Platform | Comprehensive Documentation")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 36, page_str)
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(54, 48, 558, 48)
        self.restoreState()

def build_comprehensive_pdf(output_path):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Color Palette
    primary = colors.HexColor("#0F172A")       # Dark Navy
    secondary = colors.HexColor("#0284C7")     # Ocean Blue
    accent = colors.HexColor("#0D9488")        # Teal
    dark_body = colors.HexColor("#1E293B")     # Charcoal Body Text
    light_bg = colors.HexColor("#F8FAFC")      # Slate Light Background
    card_border = colors.HexColor("#E2E8F0")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=primary,
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=secondary,
        spaceAfter=12
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=17,
        textColor=primary,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=secondary,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    h3_style = ParagraphStyle(
        'Heading3_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=accent,
        spaceBefore=6,
        spaceAfter=2,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=dark_body,
        spaceAfter=5
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=dark_body,
        leftIndent=10,
        spaceAfter=2.5
    )

    code_style = ParagraphStyle(
        'Code_Custom',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=10.5,
        textColor=primary,
        backColor=colors.HexColor("#F1F5F9"),
        borderColor=colors.HexColor("#CBD5E1"),
        borderWidth=0.5,
        borderPadding=5,
        spaceBefore=4,
        spaceAfter=6
    )

    story = []

    # ── 1. TITLE & DOCUMENT HEADER ──────────────────────────────────────────────
    story.append(Paragraph("LEXORA AI", title_style))
    story.append(Paragraph("Next-Gen Judicial Intelligence & Smart Court Automation Platform", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=secondary, spaceAfter=10))

    meta_info = [
        [Paragraph("<b>Project Identity:</b> LEXORA AI Judicial Platform", body_style), Paragraph("<b>Repository:</b> LEXORA-AI-HACKSUMMIT-7.0", body_style)],
        [Paragraph("<b>Target Audience:</b> Judges, Advocates, Registry Staff, Litigants, Admins", body_style), Paragraph("<b>Security Suite Status:</b> 103/103 Tests Passed (100%)", body_style)]
    ]
    meta_table = Table(meta_info, colWidths=[250, 254])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), light_bg),
        ('BOX', (0,0), (-1,-1), 0.5, card_border),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 10))

    # ── 2. WHAT IS THE PROJECT? ──────────────────────────────────────────────────
    story.append(Paragraph("1. What is LEXORA AI?", h1_style))
    story.append(Paragraph(
        "<b>LEXORA AI</b> is an enterprise-grade, full-stack AI platform designed to transform the judicial system "
        "by automating routine legal workflows, optimizing courtroom scheduling, accelerating precedent research, "
        "and digitizing court filings. The project was built to address the critical challenge of court backlogs—such as the "
        "over 5 crore (50 million) pending court cases in India—by providing judicial officers, legal professionals, court staff, "
        "and citizens with an intelligent, secure, and intuitive digital ecosystem.",
        body_style
    ))
    story.append(Paragraph(
        "By harnessing state-of-the-art Natural Language Processing (NLP), Optical Character Recognition (OCR), "
        "Retrieval-Augmented Generation (RAG), and algorithmic scheduling engines, LEXORA AI converts unstructured "
        "legal filings into structured, searchable digital data while maintaining strict zero-trust security.",
        body_style
    ))
    story.append(Spacer(1, 6))

    # ── 3. WHAT IS THE PROJECT ABOUT? ────────────────────────────────────────────
    story.append(Paragraph("2. What is the Project About?", h1_style))
    story.append(Paragraph(
        "LEXORA AI integrates multiple specialized domains into a single unified judicial platform:",
        body_style
    ))

    about_points = [
        ("AI-Powered Precedent & RAG Research", "Allows judges and lawyers to query landmark Supreme Court and High Court rulings using natural language. The system retrieves exact case citations, factual parallels, and statutory interpretations."),
        ("Automated Court Filing & OCR Processing", "Ingests scanned PDF petitions, affidavits, and evidence. Extracting party names, case numbers, statutory sections (IPC / BNS / CRPC), and hearing dates automatically."),
        ("Conflict-Free Smart Hearing Scheduler", "Algorithmic scheduling engine that evaluates judge bench availability, advocate schedules, courtroom capacity, and case urgency to assign optimal hearing dates without human error or double-booking."),
        ("Role-Scoped Zero-Trust Dashboards", "Tailored interfaces for Judges, Advocates, Registry Staff, Citizens, and System Administrators, enforcing strict role-based data boundaries."),
        ("Bank-Grade Cryptography & Auditability", "All sensitive case documents and personal party data are encrypted at rest using versioned AES-256-GCM encryption, while Argon2id protects user credentials.")
    ]
    for title, desc in about_points:
        story.append(Paragraph(f"• <b>{title}:</b> {desc}", bullet_style))
    story.append(Spacer(1, 10))

    # ── 4. DETAILED ROLE-BASED LOGIN MODULES (WHAT EACH LOGIN DEALS WITH) ───────
    story.append(Paragraph("3. Detailed Module Breakdown by Login Portal", h1_style))
    story.append(Paragraph(
        "The LEXORA AI application provides <b>5 specialized login portals</b>. Below is a comprehensive breakdown of the exact "
        "dashboards, tools, and topics handled within each user login role:",
        body_style
    ))
    story.append(Spacer(1, 4))

    # --- A. JUDGE PORTAL ---
    story.append(Paragraph("A. Hon'ble Judge Portal (`JUDGE` Role Login)", h2_style))
    story.append(Paragraph("<b>Demo Account:</b> <code>judge@lexora.gov.in</code> | Password: <code>lexora123</code>", body_style))
    judge_topics = [
        ("Daily Bench List & Cause List", "Provides the presiding judge with an organized chronological view of all cases listed before their bench for today, including hearing priority, case type, advocate names, and urgent motion flags."),
        ("Interactive Case File Reviewer", "Allows the judge to inspect complete case details, petition text, uploaded party evidence, and historic court orders in a clean side-by-side view."),
        ("AI Case Summarizer & Key Issue Extraction", "Generates concise, AI-powered executive summaries of lengthy petitions, highlighting central legal issues, disputed facts, and relevant IPC / BNS statutory provisions."),
        ("Precedent Research Briefs", "Displays automated AI suggestions of matching Supreme Court and High Court precedents relevant to the active case, including similarity scores and ratio decidendi summaries."),
        ("Draft Order Generator & Approval Suite", "Enables judges to generate, edit, approve, and digitally sign interim orders, summons, bail rulings, and final judgments using customizable judicial templates."),
        ("Smart Adjournment & Hearing Management", "Allows judges to update hearing outcomes (Completed, Adjourned, Reserved for Orders) and leverage AI delay risk analysis to pick optimal future hearing dates.")
    ]
    for topic, detail in judge_topics:
        story.append(Paragraph(f"<b>1. {topic}:</b> {detail}", bullet_style))
    story.append(Spacer(1, 6))

    # --- B. LAWYER / ADVOCATE PORTAL ---
    story.append(Paragraph("B. Lawyer / Advocate Portal (`LAWYER` Role Login)", h2_style))
    story.append(Paragraph("<b>Demo Account:</b> <code>lawyer@lexora.gov.in</code> | Password: <code>lexora123</code>", body_style))
    lawyer_topics = [
        ("Advocate Workspace & Active Case Roster", "Displays all cases where the advocate is designated counsel, showing current case stage, upcoming court dates, opposite party details, and judge bench allocations."),
        ("AI Legal Research Engine", "A specialized conversational legal AI assistant enabling advocates to query legal doctrines, search precedent case law, and draft legal arguments with exact statutory references."),
        ("IPC to BNS Statutory Mapper", "Instant cross-referencing tool that maps legacy Indian Penal Code (IPC) sections to the newly enacted Bharatiya Nyaya Sanhita (BNS) statutory sections."),
        ("Evidence & Document Vault", "Secure digital repository where advocates can upload client evidence, witness statements, affidavits, and written arguments prior to court hearings."),
        ("e-Filing Submission Portal", "Allows legal counsel to electronically draft and submit new petitions, interim applications, and urgent stay motions directly to the court registry.")
    ]
    for topic, detail in lawyer_topics:
        story.append(Paragraph(f"<b>2. {topic}:</b> {detail}", bullet_style))
    story.append(Spacer(1, 6))

    # --- C. COURT STAFF & REGISTRY PORTAL ---
    story.append(Paragraph("C. Court Staff & Registry Portal (`STAFF` Role Login)", h2_style))
    court_staff_topics = [
        ("e-Filing Scrutiny & Defect Management", "Court registry staff inspect newly submitted e-Filings, verify document formatting, check court fee payments, and issue acceptance or defect notice notices."),
        ("Automated Summons & Notice Generator", "Generates official court summons, notices, and warrants by auto-populating case details, party addresses, and court dates into legally binding PDF templates."),
        ("Cause List Publishing Engine", "Compiles daily courtroom cause lists, orders bench rosters, and publishes official public hearing schedules for advocates and litigants."),
        ("Bulk OCR & Document Digitization", "Processes scanned physical case files into machine-readable text using optical character recognition (OCR) for database indexing and RAG vector embedding.")
    ]
    for topic, detail in court_staff_topics:
        story.append(Paragraph(f"<b>3. {topic}:</b> {detail}", bullet_style))
    story.append(Spacer(1, 6))

    # --- D. CITIZEN / LITIGANT PORTAL ---
    story.append(Paragraph("D. Citizen / Litigant Portal (`CITIZEN` Role Login)", h2_style))
    citizen_topics = [
        ("Public Case Status Tracker", "Allows litigants and citizens to search case progress using CNR Number, Case Number, or Party Name to check upcoming hearing dates and bench details."),
        ("Orders & Judgment Download Center", "Provides free public access to certified downloadable PDF copies of interim directions, court orders, and final judgments."),
        ("Public Cause List Viewer", "Enables citizens to view daily courtroom cause lists sorted by court, judge name, or legal counsel."),
        ("Online Court Fee Payment Calculator", "Interactive tool for calculating and simulating digital court fee payments for new electronic petitions."),
        ("National Judicial Data Insights", "Public analytics portal displaying court disposal efficiency rates, pending case statistics, and division benchmarks.")
    ]
    for topic, detail in citizen_topics:
        story.append(Paragraph(f"<b>4. {topic}:</b> {detail}", bullet_style))
    story.append(Spacer(1, 6))

    # --- E. ADMIN PORTAL ---
    story.append(Paragraph("E. System Administrator Portal (`ADMIN` Role Login)", h2_style))
    admin_topics = [
        ("User Verification & Role Approvals", "Administrators verify official IDs of registering judges, advocates, and staff members before granting system permissions."),
        ("Bench Allocation & Courtroom Manager", "Tools for creating court divisions (Civil, Criminal, Constitutional) and allocating judges to specific courtrooms and benches."),
        ("System Infrastructure & Health Monitor", "Real-time diagnostic dashboard monitoring Node backend status, Python AI microservice, database health, and backup storage."),
        ("Cryptographic Key & Security Management", "Manages master AES-256-GCM encryption key rotation, Argon2id security compliance, and zero-trust data access policies."),
        ("Immutable Audit Log Inspector", "Comprehensive audit log viewer tracking every user login, case query, file upload, and judicial order for legal compliance and security.")
    ]
    for topic, detail in admin_topics:
        story.append(Paragraph(f"<b>5. {topic}:</b> {detail}", bullet_style))
    story.append(Spacer(1, 12))

    # ── 5. SYSTEM ARCHITECTURE & SECURITY ───────────────────────────────────────
    story.append(Paragraph("4. Technical Architecture & Security Highlights", h1_style))
    
    tech_table_data = [
        [Paragraph("<b>Layer</b>", h2_style), Paragraph("<b>Technology Stack</b>", h2_style), Paragraph("<b>Functionality Summary</b>", h2_style)],
        [
            Paragraph("<b>Frontend UI</b>", body_style),
            Paragraph("React 19, TypeScript, Vite, Tailwind CSS", body_style),
            Paragraph("Responsive, dark-mode glassmorphic interface with role-scoped navigation.", body_style)
        ],
        [
            Paragraph("<b>API Gateway</b>", body_style),
            Paragraph("Node.js, Express, Prisma ORM, SQLite", body_style),
            Paragraph("Central API gateway managing authentication, rate limiting, and database operations.", body_style)
        ],
        [
            Paragraph("<b>AI Service</b>", body_style),
            Paragraph("FastAPI, ChromaDB, PyMuPDF, spaCy NLP", body_style),
            Paragraph("High-speed microservice for vector embeddings, precedent retrieval, and OCR extraction.", body_style)
        ],
        [
            Paragraph("<b>Security</b>", body_style),
            Paragraph("AES-256-GCM, Argon2id, CSRF Double-Submit", body_style),
            Paragraph("103/103 passed security unit tests protecting against prompt injection and cross-user data leakage.", body_style)
        ]
    ]
    tech_table = Table(tech_table_data, colWidths=[100, 180, 224])
    tech_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, card_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, light_bg]),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(tech_table)
    story.append(Spacer(1, 14))

    # ── 6. QUICK START & DEMO CREDENTIALS TABLE ────────────────────────────────
    story.append(Paragraph("5. Local Access & Demo Credentials Table", h1_style))
    story.append(Paragraph("The platform is live locally and accessible at <b>http://localhost:5173/</b>:", body_style))
    
    cred_summary_data = [
        [Paragraph("<b>Role Login Portal</b>", h2_style), Paragraph("<b>Demo Email</b>", h2_style), Paragraph("<b>Password</b>", h2_style), Paragraph("<b>Primary Focus / Access</b>", h2_style)],
        [Paragraph("<b>Judge</b>", body_style), Paragraph("judge@lexora.gov.in", body_style), Paragraph("lexora123", body_style), Paragraph("Bench cause list, case summarizer, draft orders", body_style)],
        [Paragraph("<b>Lawyer / Advocate</b>", body_style), Paragraph("lawyer@lexora.gov.in", body_style), Paragraph("lexora123", body_style), Paragraph("Case roster, RAG precedent search, IPC/BNS mapper", body_style)],
        [Paragraph("<b>Court Staff</b>", body_style), Paragraph("staff@lexora.gov.in", body_style), Paragraph("lexora123", body_style), Paragraph("e-Filing scrutiny, summons generation, OCR indexing", body_style)],
        [Paragraph("<b>Citizen</b>", body_style), Paragraph("citizen@lexora.gov.in", body_style), Paragraph("lexora123", body_style), Paragraph("Public case status, order downloads, court fee pay", body_style)],
        [Paragraph("<b>Admin</b>", body_style), Paragraph("admin@lexora.gov.in", body_style), Paragraph("lexora123", body_style), Paragraph("User approvals, bench allocation, audit logs", body_style)]
    ]
    cred_summary_table = Table(cred_summary_data, colWidths=[100, 140, 90, 174])
    cred_summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), secondary),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, card_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, light_bg]),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(cred_summary_table)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Detailed PDF successfully generated at: {output_path}")

if __name__ == "__main__":
    output_pdf = os.path.join(os.getcwd(), "LEXORA_AI_Full_Project_Documentation.pdf")
    build_comprehensive_pdf(output_pdf)
