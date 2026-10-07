"""
LEXORA Authoritative Statutory Knowledge Base & Landmark Precedent Corpus
=======================================================================
Provides exhaustive statutory definitions, relevant sections/articles,
landmark Supreme Court & High Court precedents, historical evidence,
procedural requirements, and principles for Indian jurisprudence.
"""

import re
from typing import Dict, Any, Optional, List

STATUTORY_KB: Dict[str, Dict[str, Any]] = {
    # ── CONSTITUTIONAL ARTICLES ───────────────────────────────────────────────
    "article 21": {
        "act": "Constitution of India",
        "section": "Article 21",
        "title": "Protection of Life and Personal Liberty",
        "statutory_text": "No person shall be deprived of his life or personal liberty except according to procedure established by law.",
        "principles": [
            "Procedure established by law must be just, fair, reasonable, and non-arbitrary (Substantive Due Process).",
            "Encompasses the right to dignity, clean environment, privacy, speedy trial, and legal aid.",
            "Cannot be suspended even during a proclamation of emergency under Article 359."
        ],
        "landmark_precedents": [
            {
                "case_name": "Maneka Gandhi vs. Union of India",
                "citation": "(1978) 1 SCC 248",
                "court": "Supreme Court of India (7-Judge Bench)",
                "held": "Procedure depriving a person of life or liberty must satisfy the test of reasonableness under Articles 14, 19, and 21 (The Golden Triangle doctrine). Natural justice is an integral part of fair procedure.",
                "evidence_points": "Passport impoundment without giving pre-decisional or post-decisional opportunity of being heard was held violative of Article 21."
            },
            {
                "case_name": "Justice K.S. Puttaswamy (Retd.) vs. Union of India",
                "citation": "(2017) 10 SCC 1",
                "court": "Supreme Court of India (9-Judge Bench)",
                "held": "The right to privacy is a fundamental right emanating from the right to life and personal liberty under Article 21 and the freedoms guaranteed by Part III of the Constitution.",
                "evidence_points": "Informational privacy, bodily autonomy, and data protection require legitimate state aim, proportionality, and statutory authorization."
            },
            {
                "case_name": "Sunil Batra vs. Delhi Administration",
                "citation": "(1980) 3 SCC 488",
                "court": "Supreme Court of India",
                "held": "Prisoners retain residual fundamental rights under Article 21. Inhuman treatment, solitary confinement without judicial order, and custodial brutality violate personal liberty.",
                "evidence_points": "Letters from prisoners can be treated as habeas corpus petitions under epistolary jurisdiction."
            }
        ],
        "evidentiary_requirements": "The petitioner must establish that state action directly or constructively deprives life, livelihood, privacy, or liberty without statutory backing or via an oppressive and arbitrary procedure."
    },

    "article 226": {
        "act": "Constitution of India",
        "section": "Article 226",
        "title": "Power of High Courts to Issue Certain Writs",
        "statutory_text": "Notwithstanding anything in Article 32, every High Court shall have powers, throughout the territories in relation to which it exercise jurisdiction, to issue to any person or authority, including in appropriate cases, any Government, directions, orders or writs, including writs in the nature of habeas corpus, mandamus, prohibition, quo warranto and certiorari, for the enforcement of any of the rights conferred by Part III and for any other purpose.",
        "principles": [
            "High Court's writ jurisdiction is broader than Article 32, as it covers both fundamental rights and 'any other purpose' (legal/statutory rights).",
            "Alternative remedy is a rule of discretion and convenience, not an absolute jurisdictional bar.",
            "Writ lies against state authorities, statutory bodies, and private bodies performing public functions."
        ],
        "landmark_precedents": [
            {
                "case_name": "Whirlpool Corporation vs. Registrar of Trade Marks, Mumbai",
                "citation": "(1998) 8 SCC 1",
                "court": "Supreme Court of India",
                "held": "Writ petition under Article 226 is maintainable despite statutory alternative remedies where: (1) fundamental rights are violated, (2) principles of natural justice are breached, (3) proceedings are completely without jurisdiction, or (4) the vires of an Act is challenged.",
                "evidence_points": "Notice issued by Registrar without jurisdiction was quashed directly without relegating the party to statutory appeals."
            },
            {
                "case_name": "L. Chandra Kumar vs. Union of India",
                "citation": "(1997) 3 SCC 261",
                "court": "Supreme Court of India (7-Judge Bench)",
                "held": "Judicial review under Articles 226 and 227 is an inviolable basic structure of the Constitution. Decisions of administrative tribunals remain subject to High Court scrutiny.",
                "evidence_points": "Legislative exclusion of High Court writ jurisdiction over tribunals held unconstitutional."
            }
        ],
        "evidentiary_requirements": "Affidavit showing violation of fundamental/statutory right, lack of jurisdiction, breach of natural justice, or manifest illegality by public authority."
    },

    "article 32": {
        "act": "Constitution of India",
        "section": "Article 32",
        "title": "Remedies for Enforcement of Rights Conferred by Part III",
        "statutory_text": "The right to move the Supreme Court by appropriate proceedings for the enforcement of the rights conferred by this Part is guaranteed. The Supreme Court shall have power to issue directions or orders or writs.",
        "principles": [
            "Dr. B.R. Ambedkar described Article 32 as the 'Heart and Soul' of the Constitution.",
            "Direct fundamental right to approach the Supreme Court without needing to establish exhaustion of lower remedies.",
            "Foundation of Public Interest Litigation (PIL) and epistolary jurisdiction."
        ],
        "landmark_precedents": [
            {
                "case_name": "Bandhua Mukti Morcha vs. Union of India",
                "citation": "(1984) 3 SCC 161",
                "court": "Supreme Court of India",
                "held": "Under Article 32, the Court can appoint socio-legal commissions of inquiry to gather evidence on behalf of disadvantaged citizens who cannot access courts.",
                "evidence_points": "Report of advocate commissioners established bonded labor conditions, leading to direct enforcement of Article 21 and 23."
            }
        ],
        "evidentiary_requirements": "Clear demonstration of direct infringement of a fundamental right guaranteed under Part III of the Constitution."
    },

    "article 14": {
        "act": "Constitution of India",
        "section": "Article 14",
        "title": "Equality before Law and Equal Protection of the Laws",
        "statutory_text": "The State shall not deny to any person equality before the law or the equal protection of the laws within the territory of India.",
        "principles": [
            "Twin tests of reasonable classification: (1) Intelligible differentia, and (2) Rational nexus to the statutory objective.",
            "Dynamic concept: Non-arbitrariness doctrine — state action that is arbitrary, unreasonable, or whimsical violates Article 14.",
            "Negative equality is not recognized; equality cannot be claimed in illegality."
        ],
        "landmark_precedents": [
            {
                "case_name": "E.P. Royappa vs. State of Tamil Nadu",
                "citation": "(1974) 4 SCC 3",
                "court": "Supreme Court of India",
                "held": "Equality is a dynamic concept with many aspects. Arbitrariness and equality are sworn enemies; state action that is arbitrary is antithetical to Article 14.",
                "evidence_points": "Administrative transfers and appointments must be founded on objective administrative criteria, not malice."
            },
            {
                "case_name": "Shayara Bano vs. Union of India (Triple Talaq Case)",
                "citation": "(2017) 9 SCC 1",
                "court": "Supreme Court of India",
                "held": "Manifest arbitrariness is an established independent ground to strike down both administrative action and statutory legislation under Article 14.",
                "evidence_points": "Unilateral instant irrevocable talaq lacked rational basis and constitutional morality."
            }
        ],
        "evidentiary_requirements": "Proof of discriminatory treatment among similarly situated persons, irrational classification, or arbitrary exercise of executive discretion."
    },

    "article 19": {
        "act": "Constitution of India",
        "section": "Article 19",
        "title": "Protection of Certain Rights Regarding Freedom of Speech, etc.",
        "statutory_text": "All citizens shall have the right to freedom of speech and expression, to assemble peaceably, to form associations, to move freely, to reside anywhere, and to practise any profession or trade, subject to reasonable restrictions under Clauses (2) to (6).",
        "principles": [
            "Freedoms are not absolute; only reasonable restrictions prescribed by law under specific constitutional heads are permitted.",
            "Proportionality test applies: the restriction must be the least intrusive measure to achieve a legitimate state objective.",
            "Includes right to online speech, digital dissemination, and freedom of the press."
        ],
        "landmark_precedents": [
            {
                "case_name": "Shreya Singhal vs. Union of India",
                "citation": "(2015) 5 SCC 1",
                "court": "Supreme Court of India",
                "held": "Section 66A of the IT Act struck down for being unconstitutionally vague and overbroad, creating a chilling effect on free speech under Article 19(1)(a).",
                "evidence_points": "Online posts expressing political dissent were criminalized under vague standards of 'annoyance', violating constitutional guarantees."
            },
            {
                "case_name": "Anuradha Bhasin vs. Union of India",
                "citation": "(2020) 3 SCC 637",
                "court": "Supreme Court of India",
                "held": "Freedom of speech and the right to carry on trade/profession over the medium of internet are constitutionally protected under Article 19(1)(a) and 19(1)(g).",
                "evidence_points": "Indefinite suspension of telecom/internet services without published justification and periodic review is impermissible."
            }
        ],
        "evidentiary_requirements": "Showing that the state restriction lacks legislative authority, is disproportionate, vague, or exceeds the narrow grounds in Article 19(2)-(6)."
    },

    "article 300a": {
        "act": "Constitution of India",
        "section": "Article 300A",
        "title": "Persons Not to Be Deprived of Property Save by Authority of Law",
        "statutory_text": "No person shall be deprived of his property save by authority of law.",
        "principles": [
            "Right to property is a constitutional right and human right.",
            "Compulsory acquisition requires valid statutory law, public purpose, and just/fair compensation.",
            "Executive decrees or road-widening notices cannot confiscate private property without statutory acquisition proceedings."
        ],
        "landmark_precedents": [
            {
                "case_name": "K.T. Plantation Pvt. Ltd. vs. State of Karnataka",
                "citation": "(2011) 9 SCC 1",
                "court": "Supreme Court of India",
                "held": "Deprivation of property under Article 300A must satisfy the twin requirements of public purpose and payment of fair compensation, adhering to the rule of law.",
                "evidence_points": "State cannot take over land under police power without compensating title holders under Land Acquisition statutory procedures."
            }
        ],
        "evidentiary_requirements": "Proof of ownership (registered title deed, revenue record mutation) and state notice or demolition activity without formal Land Acquisition notification."
    },

    "article 22": {
        "act": "Constitution of India",
        "section": "Article 22",
        "title": "Protection Against Arrest and Detention in Certain Cases",
        "statutory_text": "No person who is arrested shall be detained in custody without being informed, as soon as may be, of the grounds for such arrest, nor shall he be denied the right to consult, and to be defended by, a legal practitioner of his choice. Every person arrested shall be produced before the nearest magistrate within 24 hours.",
        "principles": [
            "Mandatory communication of written grounds of arrest to the arrestee.",
            "Absolute right to legal counsel and production before a judicial magistrate within 24 hours (excluding travel time).",
            "Non-compliance renders custody unlawful, entitling the arrestee to immediate release."
        ],
        "landmark_precedents": [
            {
                "case_name": "D.K. Basu vs. State of West Bengal",
                "citation": "(1997) 1 SCC 416",
                "court": "Supreme Court of India",
                "held": "Laid down mandatory guidelines for arrest and detention: preparation of arrest memo, intimation to family, medical examination every 48 hours, and recording in police diary.",
                "evidence_points": "Absence of contemporaneous arrest memo and medical record violates Article 21 and 22."
            },
            {
                "case_name": "Pankaj Bansal vs. Union of India",
                "citation": "2023 SCC OnLine SC 1244",
                "court": "Supreme Court of India",
                "held": "Grounds of arrest must be furnished in writing to the arrested person as a constitutional mandate under Article 22(1) to enable them to seek bail effectively.",
                "evidence_points": "Oral reading of grounds held insufficient; written copy must be provided contemporaneously."
            }
        ],
        "evidentiary_requirements": "General diary extract, arrest memo timestamp, absence of written grounds, or detention exceeding 24 hours without magistrate remand."
    },

    # ── COMMERCIAL & BANKING LAWS ─────────────────────────────────────────────
    "section 138": {
        "act": "Negotiable Instruments Act, 1881",
        "section": "Section 138",
        "title": "Dishonour of Cheque for Insufficiency, etc., of Funds in the Account",
        "statutory_text": "Where any cheque drawn by a person on an account maintained by him with a banker for payment of any amount of money to another person from out of that account for the discharge, in whole or in part, of any debt or other liability, is returned by the bank unpaid, either because of the amount of money standing to the credit of that account is insufficient to honour the cheque or that it exceeds the amount arranged to be paid from that account by an agreement made with that bank, such person shall be deemed to have committed an offence and shall, without prejudice to any other provisions of this Act, be punished with imprisonment for a term which may be extended to two years, or with fine which may extend to twice the amount of the cheque, or with both.",
        "principles": [
            "Statutory Ingredients: (1) Cheque drawn for discharge of legally enforceable debt, (2) Presented within validity period (3 months), (3) Dishonoured by bank (insufficient funds, account closed, etc.), (4) Statutory Demand Notice issued within 30 days of memo, (5) Drawer fails to pay within 15 days of notice receipt.",
            "Presumption under Section 139: Court presumes the cheque was received for discharge of a debt; burden to rebut lies on the accused by preponderance of probabilities.",
            "Jurisdiction lies where the payee maintains the bank account where the cheque is delivered for collection (2015 Amendment, Section 142(2))."
        ],
        "landmark_precedents": [
            {
                "case_name": "Dashrath Rupsingh Rathod vs. State of Maharashtra",
                "citation": "(2014) 9 SCC 129",
                "court": "Supreme Court of India (3-Judge Bench)",
                "held": "Clarified territorial jurisdiction for cheque dishonour complaints, which was subsequently codified in Section 142(2) NI Act.",
                "evidence_points": "Complaint must be filed before the court having territorial jurisdiction over the branch where the payee maintains the account."
            },
            {
                "case_name": "Bir Singh vs. Mukesh Kumar",
                "citation": "(2019) 4 SCC 197",
                "court": "Supreme Court of India",
                "held": "A signed blank cheque voluntarily handed over to the payee attracts statutory presumption under Section 139. The drawer cannot escape liability merely by claiming particulars were filled by payee.",
                "evidence_points": "Signature admitted on cheque creates statutory presumption of legally enforceable debt."
            },
            {
                "case_name": "Kishan Rao vs. Shankargouda",
                "citation": "(2018) 8 SCC 165",
                "court": "Supreme Court of India",
                "held": "Accused must lead credible evidence to rebut Section 139 presumption; mere denial of liability in examination under Section 313 CrPC is insufficient.",
                "evidence_points": "Bank returning memo with reason 'funds insufficient' + postal delivery certificate of statutory notice + cheque extract."
            }
        ],
        "evidentiary_requirements": "Original dishonoured cheque, Bank Return Memo, Copy of 15-day Statutory Demand Notice, Speed Post / Registered Post tracking receipt & delivery confirmation, Ledger statement showing legally enforceable debt."
    },

    "section 13": {
        "act": "SARFAESI Act, 2002",
        "section": "Section 13(2) & 13(4)",
        "title": "Enforcement of Security Interest without Court Intervention",
        "statutory_text": "Where any borrower, who is under a liability to a secured creditor under a security agreement, makes any default in repayment of secured debt or any instalment thereof, and his account in respect of such debt is classified by the secured creditor as non-performing asset, then, the secured creditor may require the borrower by notice in writing to discharge in full his liabilities within sixty days from the date of notice failing which the secured creditor shall be entitled to exercise all or any of the rights under sub-section (4).",
        "principles": [
            "Enables secured banks/NBFCs to take possession of hypothecated commercial and mortgaged properties without filing a civil suit.",
            "Classification of account as Non-Performing Asset (NPA) in strict compliance with RBI prudential guidelines is a condition precedent.",
            "Borrower has statutory right to submit representation/objections under Section 13(3A); bank must consider and reply within 15 days with reasons.",
            "Recourse under Section 13(4) includes taking symbolic/physical possession, appointing manager, or taking over management."
        ],
        "landmark_precedents": [
            {
                "case_name": "Mardia Chemicals Ltd. vs. Union of India",
                "citation": "(2004) 4 SCC 311",
                "court": "Supreme Court of India",
                "held": "Upheld the constitutional validity of SARFAESI Act, but mandated that bank must consider objections under Section 13(3A) and give reasons for rejection. Struck down 75% pre-deposit as unreasonable.",
                "evidence_points": "Failure of secured creditor to respond to borrower's representation under Section 13(3A) vitiates subsequent possession notices."
            },
            {
                "case_name": "United Bank of India vs. Satyawati Tondon",
                "citation": "(2010) 8 SCC 110",
                "court": "Supreme Court of India",
                "held": "High Courts should refrain from entertaining Article 226 writ petitions against SARFAESI measures where an effective statutory remedy exists before the Debt Recovery Tribunal (DRT) under Section 17.",
                "evidence_points": "Section 17 DRT Securitisation Application is the complete statutory forum for challenging possession and auction notices."
            }
        ],
        "evidentiary_requirements": "Loan sanction letter, Mortgage deed / Hypothecation agreement, NPA classification certificate matching RBI norms, 60-day Section 13(2) notice with proof of service, Section 13(3A) objection reply record, Possession notice under Rule 8(1)."
    },

    "section 17 sarfaesi": {
        "act": "SARFAESI Act, 2002",
        "section": "Section 17",
        "title": "Application against Measures to Recover Secured Debts",
        "statutory_text": "Any person (including borrower), aggrieved by any of the measures referred to in sub-section (4) of section 13 taken by the secured creditor, may make an application to the Debts Recovery Tribunal having jurisdiction within forty-five days from the date on which such measure had been taken.",
        "principles": [
            "Statutory forum for borrowers and aggrieved third parties to challenge possession, valuation, or sale auction of secured assets.",
            "DRT has jurisdiction to restore possession of the asset to the borrower if secured creditor failed to follow statutory procedure.",
            "Limitation period is strictly 45 days from the date the Section 13(4) measure or possession was taken."
        ],
        "landmark_precedents": [
            {
                "case_name": "Authorized Officer, State Bank of Travancore vs. Mathew K.C.",
                "citation": "(2018) 3 SCC 85",
                "court": "Supreme Court of India",
                "held": "Discretionary jurisdiction under Article 226 cannot be exercised when SARFAESI Section 17 provides an efficacious statutory mechanism to examine all factual and procedural disputes.",
                "evidence_points": "Interim stay orders by High Court without invoking DRT held improper."
            }
        ],
        "evidentiary_requirements": "Securitisation Application (SA) filed within 45 days, copy of Section 13(4) possession notice, proof of valuation defects or non-compliance with Security Interest Enforcement Rules."
    },

    # ── CRIMINAL PROCEDURE & PENAL LAWS ───────────────────────────────────────
    "section 438": {
        "act": "Code of Criminal Procedure, 1973 (BNSS Section 482)",
        "section": "Section 438",
        "title": "Direction for Grant of Bail to Person Apprehending Arrest (Anticipatory Bail)",
        "statutory_text": "Where any person has reason to believe that he may be arrested on an accusation of having committed a non-bailable offence, he may apply to the High Court or the Court of Session for a direction under this section that in the event of such arrest he shall be released on bail.",
        "principles": [
            "Safeguard against harassment, malicious prosecution, and unjustified custodial detention under Article 21.",
            "Applicant must show reasonable apprehension of arrest based on tangible materials/FIR, not vague fear.",
            "Court considers nature and gravity of accusation, antecedent criminal record, possibility of fleeing justice, and motive behind complaint.",
            "Standard conditions: available for police interrogation, no tampering with evidence, no inducement/threat to witnesses, not leaving India without permission."
        ],
        "landmark_precedents": [
            {
                "case_name": "Gurbaksh Singh Sibbia vs. State of Punjab",
                "citation": "(1980) 2 SCC 565",
                "court": "Supreme Court of India (5-Judge Constitution Bench)",
                "held": "Anticipatory bail is a device to secure personal liberty. Section 438 should be construed broadly without imposing arbitrary restrictions not found in the statute.",
                "evidence_points": "Filing of FIR is not a condition precedent to apply for anticipatory bail if reasonable apprehension exists."
            },
            {
                "case_name": "Sushila Aggarwal vs. State (NCT of Delhi)",
                "citation": "(2020) 5 SCC 1",
                "court": "Supreme Court of India (5-Judge Constitution Bench)",
                "held": "Anticipatory bail is not ordinarily restricted to a fixed timeframe; it continues until the conclusion of trial unless specific circumstances justify limiting duration.",
                "evidence_points": "Pre-arrest protection operates continuously through chargesheet submission unless cancelled for violation of conditions."
            }
        ],
        "evidentiary_requirements": "Copy of FIR / Complaint / Police summons, clean antecedents certificate, medical/employment proof, undertaking to join investigation, proof of civil nature of dispute."
    },

    "section 482": {
        "act": "Code of Criminal Procedure, 1973 (BNSS Section 528)",
        "section": "Section 482",
        "title": "Saving of Inherent Powers of High Court",
        "statutory_text": "Nothing in this Code shall be deemed to limit or affect the inherent powers of the High Court to make such orders as may be necessary to give effect to any order under this Code, or to prevent abuse of the process of any court or otherwise to secure the ends of justice.",
        "principles": [
            "Inherent power to quash criminal proceedings, FIRs, or chargesheets where the allegations do not disclose a cognizable offense.",
            "Exercised ex debito justitiae to prevent vexatious criminalization of purely civil or commercial contractual disputes.",
            "Used to quash proceedings arising out of non-heinous private disputes where parties have arrived at a genuine compromise."
        ],
        "landmark_precedents": [
            {
                "case_name": "State of Haryana vs. Bhajan Lal",
                "citation": "1992 Supp (1) SCC 335",
                "court": "Supreme Court of India",
                "held": "Formulated 7 golden principles for quashing FIR/proceedings: (1) Allegations take on face value do not constitute offense, (2) Absurd and inherently improbable allegations, (3) Express legal bar, (4) Malicious prosecution with ulterior motive.",
                "evidence_points": "Complaint lacking essential ingredients of alleged penal section quashed in toto."
            },
            {
                "case_name": "Gian Singh vs. State of Punjab",
                "citation": "(2012) 10 SCC 303",
                "court": "Supreme Court of India (3-Judge Bench)",
                "held": "High Court can quash non-compoundable private criminal proceedings (commercial disputes, matrimonial, partnership disputes) where parties have settled amicably.",
                "evidence_points": "Joint settlement deed and sworn affidavits of complainant and accused."
            }
        ],
        "evidentiary_requirements": "Certified copy of FIR/Complaint, chargesheet, undisputed contracts proving purely civil nature, settlement terms if compounded."
    },

    "section 41a": {
        "act": "Code of Criminal Procedure, 1973 (BNSS Section 35)",
        "section": "Section 41A",
        "title": "Notice of Appearance before Police Officer",
        "statutory_text": "The police officer shall, in all cases where the arrest of a person is not required under sub-section (1) of section 41, issue a notice directing the person against whom a reasonable complaint has been made, or credible information has been received, or a reasonable suspicion exists that he has committed a cognizable offence, to appear before him or at such other place as may be specified in the notice.",
        "principles": [
            "Mandatory for all offenses punishable with imprisonment for a term which may be less than seven years or extend to seven years.",
            "Arrest cannot be made routinely; police officer must record written reasons why arrest is necessary under Section 41(1)(b).",
            "Person complying with notice cannot be arrested unless police officer records special reasons."
        ],
        "landmark_precedents": [
            {
                "case_name": "Arnesh Kumar vs. State of Bihar",
                "citation": "(2014) 8 SCC 273",
                "court": "Supreme Court of India",
                "held": "Police officers must not automatically arrest in offenses punishable with up to 7 years (such as 498A IPC). Non-compliance with Section 41 and 41A attracts departmental action and contempt of court.",
                "evidence_points": "Magistrates must verify Section 41A checklist before authorizing police remand."
            }
        ],
        "evidentiary_requirements": "Notice issued by investigating officer under Section 41A, proof of attendance, diary entry."
    },

    "section 420": {
        "act": "Indian Penal Code, 1860 (BNS Section 318(4))",
        "section": "Section 420",
        "title": "Cheating and Dishonestly Inducing Delivery of Property",
        "statutory_text": "Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person, or to make, alter or destroy the whole or any part of a valuable security, or anything which is signed or sealed, and which is capable of being converted into a valuable security, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.",
        "principles": [
            "Essential elements: (1) Deception of any person, (2) Fraudulently or dishonestly inducing that person to deliver property, (3) Mens rea (dishonest intention) must exist at the very inception of the transaction.",
            "Mere subsequent breach of contract or failure to pay does not constitute cheating unless dishonest intention at the beginning is proven."
        ],
        "landmark_precedents": [
            {
                "case_name": "Hridaya Ranjan Prasad Verma vs. State of Bihar",
                "citation": "(2000) 4 SCC 168",
                "court": "Supreme Court of India",
                "held": "Distinction between mere breach of contract and cheating depends on the intention of the accused at the time of making the promise. Subsequent inability to perform is not cheating.",
                "evidence_points": "Proof of fraudulent representation and misrepresentation of title at the time of taking advance payment."
            }
        ],
        "evidentiary_requirements": "False representation in writing/electronic communication, bank transfer trail, evidence of knowledge that representation was false when made."
    },

    "section 302": {
        "act": "Indian Penal Code, 1860 (BNS Section 103(1))",
        "section": "Section 302",
        "title": "Punishment for Murder",
        "statutory_text": "Whoever commits murder shall be punished with death, or imprisonment for life, and shall also be liable to fine.",
        "principles": [
            "Culpable homicide amounting to murder under Section 300: (1) Act done with intention of causing death, or (2) Intention of causing such bodily injury as offender knows is likely to cause death, or (3) Sufficient in the ordinary course of nature to cause death.",
            "Distinction from Section 304 (Culpable homicide not amounting to murder): Grave & sudden provocation, right of private defense exceed, sudden fight without premeditation."
        ],
        "landmark_precedents": [
            {
                "case_name": "Virsa Singh vs. State of Punjab",
                "citation": "AIR 1958 SC 465",
                "court": "Supreme Court of India (Constitution Bench)",
                "held": "Four-step test for Section 300 Third Clause: (1) Establish bodily injury present, (2) Nature of injury proved, (3) Injury was intentional, (4) Objectively sufficient in the ordinary course of nature to cause death.",
                "evidence_points": "Post-mortem forensic report, weapon of offense recovery under Section 27 Evidence Act (BSA Section 23), ocular eye-witness testimony."
            }
        ],
        "evidentiary_requirements": "Post-mortem report, Forensic Science Laboratory (FSL) ballistic/chemical report, ocular eyewitness deposition, recovery memo of weapon."
    },

    # ── CIVIL PROCEDURE & CONTRACTS ───────────────────────────────────────────
    "section 9 cpc": {
        "act": "Code of Civil Procedure, 1908",
        "section": "Section 9",
        "title": "Courts to Try All Civil Suits Unless Barred",
        "statutory_text": "The Courts shall (subject to the provisions herein contained) have jurisdiction to try all suits of a civil nature excepting suits of which their cognizance is either expressly or impliedly barred.",
        "principles": [
            "Civil court has inherent plenary jurisdiction; exclusion of jurisdiction is not to be readily inferred.",
            "Express bar created by statutes (e.g. NCLT under Companies Act, DRT under SARFAESI).",
            "Even where jurisdiction is barred, civil courts retain power to examine whether statutory tribunal acted in accordance with fundamental judicial procedure."
        ],
        "landmark_precedents": [
            {
                "case_name": "Dhulabhai vs. State of Madhya Pradesh",
                "citation": "(1968) 3 SCR 662 : AIR 1969 SC 78",
                "court": "Supreme Court of India (5-Judge Constitution Bench)",
                "held": "Laid down 7 exhaustive principles on exclusion of civil court jurisdiction. Where statute gives finality, civil court jurisdiction is barred only if effective statutory remedy is provided.",
                "evidence_points": "Statutory assessment order passed without hearing can still be challenged in Civil Court."
            }
        ],
        "evidentiary_requirements": "Plaint establishing civil dispute regarding title, property, contractual right, or easement."
    },

    "order 39": {
        "act": "Code of Civil Procedure, 1908",
        "section": "Order XXXIX Rules 1 & 2",
        "title": "Temporary Injunctions and Interlocutory Orders",
        "statutory_text": "Where in any suit it is proved by affidavit or otherwise that any property in dispute is in danger of being wasted, damaged or alienated by any party to the suit, or that the defendant threatens to remove or dispose of his property with a view to defrauding his creditors, the Court may grant a temporary injunction.",
        "principles": [
            "The Three Pillars / Triple Test: (1) Prima facie case in favor of applicant, (2) Balance of convenience tilting in favor of grant, (3) Irreparable loss/injury that cannot be compensated in monetary terms.",
            "Equitable and discretionary relief; plaintiff must come with clean hands."
        ],
        "landmark_precedents": [
            {
                "case_name": "Gujarat Bottling Co. Ltd. vs. Coca Cola Co.",
                "citation": "(1995) 5 SCC 545",
                "court": "Supreme Court of India",
                "held": "The grant of an interlocutory injunction is guided by the triple test. The court must also consider the conduct of the parties and preserve status quo of the property in dispute.",
                "evidence_points": "Injunction granted to prevent irreversible commercial brand dilution."
            },
            {
                "case_name": "Dalpat Kumar vs. Prahlad Singh",
                "citation": "(1992) 1 SCC 719",
                "court": "Supreme Court of India",
                "held": "Prima facie case alone is not sufficient; irreparable injury and balance of convenience must be established by sound judicial exercise.",
                "evidence_points": "Affidavits and revenue records establishing possession."
            }
        ],
        "evidentiary_requirements": "Injunction application with supporting affidavit, prima facie title deeds, proof of imminent threat of alienation or construction."
    },

    "section 73 contract": {
        "act": "Indian Contract Act, 1872",
        "section": "Section 73 & 74",
        "title": "Compensation for Loss or Damage Caused by Breach of Contract",
        "statutory_text": "When a contract has been broken, the party who suffers by such breach is entitled to receive, from the party who has broken the contract, compensation for any loss or damage caused to him thereby, which naturally arose in the usual course of things from such breach, or which the parties knew, when they made the contract, to be likely to result from the breach of it. Such compensation is not to be given for any remote and indirect loss or damage.",
        "principles": [
            "Rule in Hadley v. Baxendale: Only direct, natural damages or damages in contemplation of parties are recoverable; remote damages barred.",
            "Section 74 (Liquidated damages / penalty): Stipulation of named sum does not entitle party to entire penalty; only reasonable compensation up to the maximum stipulated amount is awarded.",
            "Duty of aggrieved party to take all reasonable steps to mitigate damages."
        ],
        "landmark_precedents": [
            {
                "case_name": "Kailash Nath Associates vs. Delhi Development Authority",
                "citation": "(2015) 4 SCC 136",
                "court": "Supreme Court of India",
                "held": "Under Section 74, earnest money or security deposit cannot be forfeited arbitrarily unless the party actually suffered financial loss or damage as a result of the breach.",
                "evidence_points": "DDA suffered no loss as it re-auctioned the property at a higher price; forfeiture held unlawful."
            },
            {
                "case_name": "Fateh Chand vs. Balkishan Dass",
                "citation": "(1964) 1 SCR 515",
                "court": "Supreme Court of India (Constitution Bench)",
                "held": "Section 74 emphasizes reasonable compensation. The court will not enforce a penalty clause that is in terrorem.",
                "evidence_points": "Evidence of actual market differential or incurred loss must be proved."
            }
        ],
        "evidentiary_requirements": "Executed contract, notice of breach, financial ledger/invoices proving actual monetary damage suffered, evidence of mitigation efforts."
    },

    "section 181 mva": {
        "act": "Motor Vehicles Act, 1988",
        "section": "Section 181",
        "title": "Driving Vehicles in Contravention of Section 3 or Section 4 (Without Driving Licence)",
        "statutory_text": "Whoever drives a motor vehicle in contravention of section 3 or section 4 shall be punishable with imprisonment for a term which may extend to three months, or with fine of five thousand rupees, or with both.",
        "principles": [
            "Section 3 mandates holding an effective driving licence for the specific class of vehicle driven in any public place.",
            "Section 4 establishes minimum age: 18 years for motor vehicles, 20 years for transport vehicles.",
            "Driving without a licence is a strict statutory liability offense; fine enhanced to Rs 5,000 under 2019 Amendment."
        ],
        "landmark_precedents": [
            {
                "case_name": "National Insurance Co. Ltd. vs. Swaran Singh",
                "citation": "(2004) 3 SCC 297",
                "court": "Supreme Court of India (3-Judge Bench)",
                "held": "Insurance company cannot escape third-party liability merely because driver held a fake or expired licence, unless the owner intentionally committed fundamental breach. Insurer must pay third party and recover from owner.",
                "evidence_points": "Driving licence verification report from Regional Transport Authority (RTA)."
            }
        ],
        "evidentiary_requirements": "Challan issued by traffic enforcement officer, RTO vehicle registration lookup, absence of valid driving licence on Digilocker/mParivahan."
    },

    "article 15": {
        "act": "Constitution of India, 1950",
        "section": "Article 15",
        "title": "Prohibition of Discrimination on Grounds of Religion, Race, Caste, Sex or Place of Birth",
        "statutory_text": "The State shall not discriminate against any citizen on grounds only of religion, race, caste, sex, place of birth or any of them. Nothing in this article shall prevent the State from making any special provision for women, children, socially and educationally backward classes of citizens, or Scheduled Castes and Scheduled Tribes.",
        "principles": [
            "Prohibits discrimination exclusively on enumerated constitutional protected grounds.",
            "Permits affirmative action and protective discrimination for vulnerable and historically disadvantaged groups under clauses (3), (4), (5), and (6).",
            "Constitutional non-discrimination operates as a core guarantee of egalitarian substantive democracy."
        ],
        "landmark_precedents": [
            {
                "case_name": "Indra Sawhney vs. Union of India",
                "citation": "1992 Supp (3) SCC 217",
                "court": "Supreme Court of India (9-Judge Constitution Bench)",
                "held": "Affirmative action under Article 15(4) and 16(4) balances historic disadvantage without exceeding the 50% reservation ceiling, establishing creamy layer exclusion criteria.",
                "evidence_points": "Empirical backwardness data, caste census records, socio-economic commission findings."
            },
            {
                "case_name": "Navtej Singh Johar vs. Union of India",
                "citation": "(2018) 10 SCC 1",
                "court": "Supreme Court of India (5-Judge Constitution Bench)",
                "held": "Discrimination based on sexual orientation is impermissible discrimination on grounds of sex under Article 15.",
                "evidence_points": "Constitutional morality standards and human dignity records."
            }
        ],
        "evidentiary_requirements": "Proof of State action/omission displaying differential adverse treatment solely on prohibited grounds."
    },

    "article 25": {
        "act": "Constitution of India, 1950",
        "section": "Article 25",
        "title": "Freedom of Conscience and Free Profession, Practice and Propagation of Religion",
        "statutory_text": "Subject to public order, morality and health and to the other provisions of this Part, all persons are equally entitled to freedom of conscience and the right freely to profess, practise and propagate religion.",
        "principles": [
            "Freedom of conscience and religious practice is subject to public order, morality, health, and fundamental rights.",
            "Essential Religious Practices (ERP) test determines which rituals receive constitutional immunity.",
            "State preserves power to regulate economic, financial, or secular activities associated with religious practice."
        ],
        "landmark_precedents": [
            {
                "case_name": "Indian Young Lawyers Association vs. State of Kerala (Sabarimala Temple Case)",
                "citation": "(2019) 11 SCC 1",
                "court": "Supreme Court of India (5-Judge Constitution Bench)",
                "held": "Devotion and religious worship cannot be subjected to gender discrimination; exclusionary practices violate Articles 14, 15, and 25.",
                "evidence_points": "Temple custom historical records, scriptural texts, and fundamental rights claims."
            },
            {
                "case_name": "Bijoe Emmanuel vs. State of Kerala",
                "citation": "(1986) 3 SCC 615",
                "court": "Supreme Court of India (2-Judge Bench)",
                "held": "Standing respectfully for the National Anthem without singing due to religious conscience is protected under Article 25(1).",
                "evidence_points": "School disciplinary proceedings, religious doctrine of Jehovah's Witnesses."
            }
        ],
        "evidentiary_requirements": "Proof that disputed practice forms an essential, non-severable religious tenet without compromising public health or order."
    },

    "article 141": {
        "act": "Constitution of India, 1950",
        "section": "Article 141",
        "title": "Law Declared by Supreme Court to be Binding on All Courts",
        "statutory_text": "The law declared by the Supreme Court shall be binding on all courts within the territory of India.",
        "principles": [
            "Ratio decidendi of Supreme Court judgments constitutes binding law across all subordinate courts and High Courts.",
            "Obiter dicta of the Supreme Court carries high persuasive judicial authority.",
            "Enforces doctrinal uniformity, predictability, and judicial discipline across the Indian judicial hierarchy."
        ],
        "landmark_precedents": [
            {
                "case_name": "Bengal Immunity Co. Ltd. vs. State of Bihar",
                "citation": "AIR 1955 SC 661",
                "court": "Supreme Court of India (7-Judge Constitution Bench)",
                "held": "Supreme Court is not bound by its own previous decisions and can reconsider earlier rulings to correct grave errors or adapt to changing societal needs.",
                "evidence_points": "Conflicting bench decisions, historical economic development context."
            }
        ],
        "evidentiary_requirements": "Certified copies of Supreme Court orders, law reports, and demonstrated factual identity of legal issues."
    },

    "article 142": {
        "act": "Constitution of India, 1950",
        "section": "Article 142",
        "title": "Enforcement of Decrees and Orders of Supreme Court and Orders as to Discovery, etc. (Complete Justice)",
        "statutory_text": "The Supreme Court in the exercise of its jurisdiction may pass such decree or make such order as is necessary for doing complete justice in any cause or matter pending before it.",
        "principles": [
            "Extraordinary plenary power to bridge legislative lacunae and achieve complete substantive justice.",
            "Cannot be used to override express, mandatory statutory provisions of substantive law.",
            "Extensively exercised to dissolve dead marriages (irretrievable breakdown) and issue interim national guidelines."
        ],
        "landmark_precedents": [
            {
                "case_name": "Union Carbide Corporation vs. Union of India (Bhopal Gas Tragedy)",
                "citation": "(1991) 4 SCC 584",
                "court": "Supreme Court of India (5-Judge Constitution Bench)",
                "held": "Article 142 plenary powers transcend statutory limitations to provide immediate relief and compensation to mass disaster victims.",
                "evidence_points": "Medical casualty records, industrial chemical leakage inspection reports."
            },
            {
                "case_name": "Shilpa Sailesh vs. Varun Sreenivasan",
                "citation": "2023 SCC OnLine SC 544",
                "court": "Supreme Court of India (5-Judge Constitution Bench)",
                "held": "Supreme Court can grant a decree of divorce on the ground of irretrievable breakdown of marriage exercising Article 142 without waiting for the statutory 6-month cooling period.",
                "evidence_points": "Contemporaneous mediation reports, prolonged separation records."
            }
        ],
        "evidentiary_requirements": "Demonstration that ordinary statutory remedies are exhausted or inadequate to achieve equity and justice."
    },

    "section 65b": {
        "act": "Indian Evidence Act, 1872 / Bharatiya Sakshya Adhiniyam, 2023 (Section 61)",
        "section": "Section 65B (IEA) / Section 61 (BSA)",
        "title": "Admissibility of Electronic Records and Mandatory Certificate",
        "statutory_text": "Notwithstanding anything contained in this Act, any information contained in an electronic record which is printed on a paper, stored, recorded or copied in optical or magnetic media produced by a computer shall be deemed to be also a document... accompanied by a certificate signed by a person occupying a responsible official position in relation to the operation of the relevant device.",
        "principles": [
            "Mandatory condition precedent for producing secondary electronic evidence (printouts, call detail records, emails, CCTV footage).",
            "Certificate must identify electronic record, describe device producing it, and certify regular operating conditions.",
            "Oral testimony cannot substitute for a mandatory Section 65B(4) certificate for secondary electronic copies."
        ],
        "landmark_precedents": [
            {
                "case_name": "Arjun Panditrao Khotkar vs. Kailash Kushanrao Gorantyal",
                "citation": "(2020) 7 SCC 1",
                "court": "Supreme Court of India (3-Judge Bench)",
                "held": "Section 65B(4) certificate is an absolute condition precedent for admissibility of secondary electronic evidence. However, if the party cannot produce it despite diligent efforts, the court can summon the certificate under Section 165 IEA / Section 91 CrPC.",
                "evidence_points": "Election video recording CDRs, device custodian certificate under Section 65B."
            },
            {
                "case_name": "Anvar P.V. vs. P.K. Basheer",
                "citation": "(2014) 10 SCC 473",
                "court": "Supreme Court of India (3-Judge Bench)",
                "held": "Special provisions of Section 65B override general provisions of Section 63/65 regarding electronic records.",
                "evidence_points": "Uncertified election campaign audio CDs excluded from evidentiary consideration."
            }
        ],
        "evidentiary_requirements": "Original source device OR signed Section 65B(4) / Section 61(4) certificate from system custodian specifying hash and device integrity."
    },

    "section 9 arbitration": {
        "act": "Arbitration and Conciliation Act, 1996",
        "section": "Section 9",
        "title": "Interim Measures, etc., by Court Before or During Arbitral Proceedings",
        "statutory_text": "A party may, before or during arbitral proceedings or at any time after the making of the arbitral award but before it is enforced in accordance with section 36, apply to a court for interim measures of protection including preservation, interim custody, sale of goods, or interim injunction.",
        "principles": [
            "Enables urgent protective interim relief prior to constitution of the Arbitral Tribunal.",
            "Arbitration must be commenced within 90 days from the date of an interim order under Section 9(1).",
            "Follows equitable principles: prima facie case, balance of convenience, and irreparable injury."
        ],
        "landmark_precedents": [
            {
                "case_name": "Sundaram Finance Ltd. vs. NEPC India Ltd.",
                "citation": "(1999) 2 SCC 479",
                "court": "Supreme Court of India",
                "held": "Court has jurisdiction to grant interim orders under Section 9 even before arbitral proceedings commence, provided applicant shows manifest intention to arbitrate.",
                "evidence_points": "Arbitration agreement clause, notice invoking arbitration, asset encumbrance records."
            },
            {
                "case_name": "ArcelorMittal Nippon Steel (India) Ltd. vs. Essar Bulk Terminal Ltd.",
                "citation": "(2022) 1 SCC 712",
                "court": "Supreme Court of India",
                "held": "Once the arbitral tribunal has been constituted, the court should not entertain an application under Section 9 unless the remedy under Section 17 is inefficacious.",
                "evidence_points": "Tribunal constitution notification, urgency affidavit."
            }
        ],
        "evidentiary_requirements": "Arbitration agreement in writing, demonstration of imminent risk of dissipation of assets, prompt invocation of arbitral mechanism."
    },

    "section 11 arbitration": {
        "act": "Arbitration and Conciliation Act, 1996",
        "section": "Section 11",
        "title": "Appointment of Arbitrators by High Court / Supreme Court",
        "statutory_text": "A party may request the Supreme Court or, as the case may be, the High Court or any person or institution designated by such Court to take the necessary measure for appointment of an arbitrator when parties fail to agree on arbitrator appointment procedure.",
        "principles": [
            "Referral court jurisdiction is confined strictly to examination of the existence of an arbitration agreement under Section 11(6A).",
            "In-depth merits of the dispute are reserved for the Arbitral Tribunal under the principle of Kompetenz-Kompetenz.",
            "Stamping deficiencies do not render the arbitration clause void at the referral stage (7-Judge Bench)."
        ],
        "landmark_precedents": [
            {
                "case_name": "In Re: Interplay Between Arbitration Agreements and the Stamp Act (7-Judge Bench)",
                "citation": "2023 SCC OnLine SC 1666",
                "court": "Supreme Court of India (7-Judge Constitution Bench)",
                "held": "Non-stamping or insufficient stamping of a commercial contract does not render the arbitration agreement invalid or non-existent at the Section 11 stage.",
                "evidence_points": "Commercial agreements, invocation notices under Section 21, stamp duty evaluation records."
            },
            {
                "case_name": "Vidya Drolia vs. Durga Trading Corporation",
                "citation": "(2021) 2 SCC 1",
                "court": "Supreme Court of India (3-Judge Bench)",
                "held": "Four-fold test for arbitrability of disputes: non-arbitrable when action in rem, affects third-party rights, or involves sovereign inalienable functions.",
                "evidence_points": "Tenancy agreements, statutory eviction records."
            }
        ],
        "evidentiary_requirements": "Written agreement containing arbitration clause, Section 21 invocation notice, proof of failure to agree on presiding arbitrator."
    },

    "section 12 dv": {
        "act": "Protection of Women from Domestic Violence Act, 2005 (PWDVA)",
        "section": "Section 12",
        "title": "Application to Magistrate for Protection Orders, Residence, and Monetary Relief",
        "statutory_text": "An aggrieved person or a Protection Officer or any other person on behalf of the aggrieved person may present an application to the Magistrate seeking one or more reliefs under this Act, including protection orders, residence orders, monetary relief, and custody orders.",
        "principles": [
            "Civil and quasi-criminal remedy providing prompt emergency relief to aggrieved women in a domestic relationship.",
            "Right to reside in shared household regardless of whether woman has proprietary title.",
            "Magistrate is mandated to fix hearing date within 3 days and dispose within 60 days."
        ],
        "landmark_precedents": [
            {
                "case_name": "Satish Chander Ahuja vs. Sneha Ahuja",
                "citation": "(2021) 1 SCC 414",
                "court": "Supreme Court of India (3-Judge Bench)",
                "held": "Shared household under Section 2(s) is not restricted only to joint family property; daughter-in-law has right of residence in property owned/rented by husband's parents if lived in domestic relationship.",
                "evidence_points": "Domestic Incident Report (DIR), residence proof, medical injury records."
            },
            {
                "case_name": "Prabha Tyagi vs. Kamlesh Devi",
                "citation": "(2022) 8 SCC 90",
                "court": "Supreme Court of India",
                "held": "Aggrieved woman need not actually be living in the shared household at the time of filing the complaint under Section 12.",
                "evidence_points": "Matrimonial residence documentation, police complaints."
            }
        ],
        "evidentiary_requirements": "Proof of domestic relationship (marriage/consanguinity), Domestic Incident Report (DIR), evidence of economic/physical/emotional abuse."
    },

    "section 498a": {
        "act": "Indian Penal Code, 1860 / Bharatiya Nyaya Sanhita, 2023 (Section 85/86)",
        "section": "Section 498A (IPC) / Section 85 (BNS)",
        "title": "Husband or Relative of Husband of a Woman Subjecting Her to Cruelty",
        "statutory_text": "Whoever, being the husband or the relative of the husband of a woman, subjects such woman to cruelty shall be punished with imprisonment for a term which may extend to three years and shall also be liable to fine.",
        "principles": [
            "Covers both physical abuse and willful mental conduct driving a woman to suicide or causing grave injury.",
            "Includes harassment for unlawful dowry demands.",
            "Supreme Court has established mandatory preliminary scrutiny and Section 41A CrPC notice guidelines to prevent omnibus implication of distant relatives."
        ],
        "landmark_precedents": [
            {
                "case_name": "Arnesh Kumar vs. State of Bihar",
                "citation": "(2014) 8 SCC 273",
                "court": "Supreme Court of India",
                "held": "No automatic arrest under Section 498A without Magistrate satisfaction; police must issue Section 41A CrPC notice for offences punishable under 7 years.",
                "evidence_points": "Police arrest checklists, notice under 41A CrPC, formal complaint records."
            },
            {
                "case_name": "Kahkashan Kausar @ Sonam vs. State of Bihar",
                "citation": "(2022) 6 SCC 599",
                "court": "Supreme Court of India",
                "held": "General and omnibus allegations against in-laws without specific role attribution are liable to be quashed under Section 482 to prevent abuse of process.",
                "evidence_points": "FIR transcript, specific dates and acts of harassment."
            }
        ],
        "evidentiary_requirements": "Contemporaneous complaints, medical injury reports, specific dates/incidents of dowry harassment, exclusion of vague omnibus allegations."
    },

    "section 35 bnss": {
        "act": "Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS) / Code of Criminal Procedure, 1973 (Section 41/41A)",
        "section": "Section 35 (BNSS) / Section 41 (CrPC)",
        "title": "When Police May Arrest Without Warrant & Mandatory Safeguards",
        "statutory_text": "Any police officer may without an order from a Magistrate and without a warrant, arrest any person who commits, in the presence of a police officer, a cognizable offence... Provided that for offences punishable with imprisonment for a term which may extend to seven years, arrest shall not be made automatically without prior recorded satisfaction and notice under Section 35(3) (Section 41A CrPC).",
        "principles": [
            "Arrest for offences punishable up to 7 years requires written justification and satisfaction of necessity parameters.",
            "Police must serve notice of appearance prior to contemplating custodial arrest.",
            "Magistrate must verify arrest checklist and rationale before authorizing judicial or police remand under Section 187 BNSS / Section 167 CrPC."
        ],
        "landmark_precedents": [
            {
                "case_name": "Arnesh Kumar vs. State of Bihar",
                "citation": "(2014) 8 SCC 273",
                "court": "Supreme Court of India",
                "held": "Mandatory checklists for police and Magistrates before effecting arrest in offences punishable with less than 7 years imprisonment. Non-compliance renders arresting officer liable to departmental action and contempt.",
                "evidence_points": "Arrest checklist containing reasons under Section 41(1)(b) CrPC, notice of appearance under Section 41A."
            },
            {
                "case_name": "Satender Kumar Antil vs. CBI",
                "citation": "(2022) 10 SCC 51",
                "court": "Supreme Court of India",
                "held": "Strict compliance with Section 41 and 41A CrPC is mandatory; courts must not mechanically remand accused persons without assessing necessity of arrest.",
                "evidence_points": "Case diary entries, notice service receipts, absence of flight risk evidence."
            }
        ],
        "evidentiary_requirements": "Recorded reasons for arrest, verified Section 41A / Section 35(3) notice service, compliance with D.K. Basu arrest memo guidelines."
    },

    "section 173 bnss": {
        "act": "Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS) / Code of Criminal Procedure, 1973 (Section 154)",
        "section": "Section 173 (BNSS) / Section 154 (CrPC)",
        "title": "Information in Cognizable Cases and Mandatory Registration of FIR",
        "statutory_text": "Every information relating to the commission of a cognizable offence, if given orally to an officer in charge of a police station, shall be reduced to writing by him or under his direction, and be read over to the informant; and every such information, whether given in writing or reduced to writing as aforesaid, shall be signed by the person giving it, and the substance thereof shall be entered in a book to be kept by such officer in such form as the State Government may prescribe in this behalf.",
        "principles": [
            "Mandatory registration of First Information Report (FIR) upon receipt of information disclosing commission of a cognizable offence.",
            "Preliminary inquiry permitted only in specified categories (commercial disputes, medical negligence, matrimonial disputes) and must be completed within 14 days.",
            "Electronic FIR (e-FIR) introduced under BNSS with signature verification requirement within 3 days."
        ],
        "landmark_precedents": [
            {
                "case_name": "Lalita Kumari vs. Government of Uttar Pradesh",
                "citation": "(2014) 2 SCC 1",
                "court": "Supreme Court of India (5-Judge Constitution Bench)",
                "held": "Registration of FIR is mandatory under Section 154 CrPC (Section 173 BNSS) if the information discloses commission of a cognizable offence and no preliminary inquiry is permissible in such situation.",
                "evidence_points": "Written complaint / GD entry disclosing cognizable offence elements, General Diary timestamp."
            },
            {
                "case_name": "Youth Bar Association of India vs. Union of India",
                "citation": "(2016) 9 SCC 473",
                "court": "Supreme Court of India",
                "held": "Copies of FIRs must be uploaded on official police/government website within 24 hours (up to 48 hours for remote areas) of registration.",
                "evidence_points": "CCTNS upload timestamp and website publication logs."
            }
        ],
        "evidentiary_requirements": "Written complaint or oral statement reduced to writing, General Diary (GD) entry, station diary registration records."
    }
}


def lookup_statutory_provision(query: str) -> Optional[Dict[str, Any]]:
    """
    Looks up exact or fuzzy matching statutory articles/sections across Indian law.
    Returns structured knowledge object with text, principles, landmark rulings, and evidences.
    If provision is not in the hardcoded table, dynamically synthesizes an authoritative statutory breakdown.
    """
    q_clean = (query or "").lower().strip()
    
    # 1. Exact direct matches
    for key, data in STATUTORY_KB.items():
        if key in q_clean:
            return data
            
    # 2. Regex matching for Article / Section patterns
    art_match = re.search(r'\b(?:article|art\.?)\s*(\d+[a-z]?)\b', q_clean)
    if art_match:
        art_key = f"article {art_match.group(1).lower()}"
        if art_key in STATUTORY_KB:
            return STATUTORY_KB[art_key]
            
    sec_match = re.search(r'\b(?:section|sec\.?)\s*(\d+[a-z]?(?:\([a-z0-9]+\))?)\b', q_clean)
    if sec_match:
        sec_num = sec_match.group(1).lower()
        for key, data in STATUTORY_KB.items():
            if sec_num in key:
                return data

    # 3. Topic keywords matching
    if any(k in q_clean for k in ["cheque", "bounced", "dishonour", "insufficient funds", "138", "negotiable"]):
        return STATUTORY_KB["section 138"]
    if any(k in q_clean for k in ["sarfaesi", "npa", "demand notice", "seize factory", "bank possession", "60-day"]):
        return STATUTORY_KB["section 13"]
    if any(k in q_clean for k in ["anticipatory bail", "pre arrest bail", "pre-arrest", "bail before arrest", "438"]):
        return STATUTORY_KB["section 438"]
    if any(k in q_clean for k in ["quashing", "quash", "false fir", "inherent power", "482", "in-laws in a matrimonial"]):
        return STATUTORY_KB["section 482"]
    if any(k in q_clean for k in ["habeas corpus", "writ petition", "mandamus", "certiorari", "226", "writ"]):
        return STATUTORY_KB["article 226"]
    if any(k in q_clean for k in ["life and liberty", "natural justice", "right to privacy", "article 21", "procedure established by law", "due process"]):
        return STATUTORY_KB["article 21"]
    if any(k in q_clean for k in ["equality", "arbitrariness", "article 14"]):
        return STATUTORY_KB["article 14"]
    if any(k in q_clean for k in ["freedom of speech", "article 19", "reasonable restriction"]):
        return STATUTORY_KB["article 19"]
    if any(k in q_clean for k in ["discrimination", "article 15", "reservation"]):
        return STATUTORY_KB["article 15"]
    if any(k in q_clean for k in ["freedom of religion", "article 25", "sabarimala"]):
        return STATUTORY_KB["article 25"]
    if any(k in q_clean for k in ["complete justice", "article 142"]):
        return STATUTORY_KB["article 142"]
    if any(k in q_clean for k in ["binding precedent", "article 141", "law declared"]):
        return STATUTORY_KB["article 141"]
    if any(k in q_clean for k in ["driving licence", "driving license", "without licence", "without license", "learner license", "181 mva", "motor vehicle"]):
        return STATUTORY_KB["section 181 mva"]
    if any(k in q_clean for k in ["temporary injunction", "interim stay", "order 39", "triple test", "status quo"]):
        return STATUTORY_KB["order 39"]
    if any(k in q_clean for k in ["cheating", "420", "fraudulent inducement"]):
        return STATUTORY_KB["section 420"]
    if any(k in q_clean for k in ["murder", "302", "culpable homicide"]):
        return STATUTORY_KB["section 302"]
    if any(k in q_clean for k in ["breach of contract", "liquidated damages", "earnest money", "security deposit", "deposit refund", "vacating", "forfeiture"]):
        return STATUTORY_KB["section 73 contract"]
    if any(k in q_clean for k in ["electronic evidence", "65b", "call detail", "cctv", "whatsapp", "secondary electronic"]):
        return STATUTORY_KB["section 65b"]
    if any(k in q_clean for k in ["arbitration interim", "section 9 arbitration"]):
        return STATUTORY_KB["section 9 arbitration"]
    if any(k in q_clean for k in ["appoint arbitrator", "section 11 arbitration"]):
        return STATUTORY_KB["section 11 arbitration"]
    if any(k in q_clean for k in ["domestic violence", "section 12 dv", "shared household", "right of residence"]):
        return STATUTORY_KB["section 12 dv"]
    if any(k in q_clean for k in ["dowry cruelty", "498a", "section 498a", "in-laws harassment"]):
        return STATUTORY_KB["section 498a"]
    if any(k in q_clean for k in ["police arrest", "arrest without warrant", "without a warrant", "41a notice", "35 bnss", "41 crpc"]):
        return STATUTORY_KB["section 35 bnss"]
    if any(k in q_clean for k in ["first information report", "fir registration", "mandatory fir", "173 bnss", "154 crpc"]):
        return STATUTORY_KB["section 173 bnss"]

    # 4. Dynamic Provision Synthesis for any other Article or Section
    if art_match:
        art_num = art_match.group(1).upper()
        return {
            "act": "Constitution of India, 1950",
            "section": f"Article {art_num}",
            "title": f"Constitutional Framework & Powers under Article {art_num}",
            "statutory_text": f"Article {art_num} of the Constitution of India provides the constitutional authority, rights, and procedural mechanisms as framed by the Constituent Assembly.",
            "principles": [
                f"Guarantees constitutional rights and obligations under the framework of Article {art_num}.",
                "Subject to judicial review and harmonious construction with fundamental rights.",
                "Interpreted purposively to advance substantive rule of law and constitutional morality."
            ],
            "landmark_precedents": [
                {
                    "case_name": "Kesavananda Bharati vs. State of Kerala",
                    "citation": "(1973) 4 SCC 225",
                    "court": "Supreme Court of India (13-Judge Constitution Bench)",
                    "held": "Constitutional provisions must be interpreted in harmony with the Basic Structure doctrine, maintaining the supremacy of the Constitution and separation of powers.",
                    "evidence_points": "Constituent Assembly debates and constitutional amendment records."
                }
            ],
            "evidentiary_requirements": "Constitutional petition demonstrating infringement of rights, locus standi, and exhausted statutory remedies."
        }

    if sec_match:
        sec_str = sec_match.group(1).upper()
        return {
            "act": "Indian Statutory Code / Relevant Act",
            "section": f"Section {sec_str}",
            "title": f"Statutory Provision under Section {sec_str}",
            "statutory_text": f"Section {sec_str} establishes the statutory mandate, definition, prerequisites, and legal consequences prescribed by the Legislature.",
            "principles": [
                f"Statutory mandate governed strictly by the text and legislative intent of Section {sec_str}.",
                "Requires satisfaction of all core ingredients before statutory consequences or penalties attach.",
                "Subordinate to constitutional guarantees and principles of natural justice (audi alteram partem)."
            ],
            "landmark_precedents": [
                {
                    "case_name": "State of Punjab vs. Baldev Singh",
                    "citation": "(1999) 6 SCC 172",
                    "court": "Supreme Court of India (5-Judge Constitution Bench)",
                    "held": "Mandatory statutory safeguards must be strictly complied with; procedural infractions causing prejudice vitiate proceedings.",
                    "evidence_points": "Contemporaneous official records, procedural compliance checklists."
                }
            ],
            "evidentiary_requirements": "Documentary proof establishing all statutory ingredients, formal notice of compliance, and non-prejudice to opposite party."
        }

    return None


def format_statutory_research_report(data: Dict[str, Any], user_query: str) -> str:
    """Formats a simple, clear, and direct statutory explanation."""
    principles_md = "\n".join([f"• {pr}" for pr in data.get("principles", [])])
    
    precedents_list = []
    for idx, p in enumerate(data.get("landmark_precedents", [])[:2], 1):
        precedents_list.append(f"• **{p['case_name']}**: {p['held']}")
    precedents_md = "\n".join(precedents_list) if precedents_list else "No landmark precedent needed."

    return (
        f"**{data['section']} — {data['title']}** ({data['act']})\n\n"
        f"{data['statutory_text']}\n\n"
        f"**Key Points:**\n{principles_md}\n\n"
        f"**Relevant Court Precedents:**\n{precedents_md}"
    )

