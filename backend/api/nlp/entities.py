import re
from typing import Dict, List, Any

try:
    import spacy
    nlp = spacy.load("en_core_web_sm")
except Exception:
    nlp = None

def clean_party_name(name_str: str) -> str:
    """Helper to clean party names and remove legal labels or noise."""
    if not name_str:
        return ""
    
    s = name_str.strip()
    
    # Remove leading role labels (e.g. "Respondent:", "Respondents:", "Appellants:")
    s = re.sub(
        r'^(?:Appellants?|Petitioners?|Complainants?|Plaintiffs?|Respondents?|Defendants?|Appellees?)\s*(?:\([sS]\))?\s*[:\-–—\.]*\s*',
        '', s, flags=re.IGNORECASE
    )
    # Remove trailing role tags (e.g. "... Appellant(s)", "... Respondent(s)", "- Respondent", "(Respondent)")
    s = re.sub(
        r'(?:\s*[\.\-\_\,\(]+)?\s*(?:Appellants?|Petitioners?|Complainants?|Plaintiffs?|Respondents?|Defendants?|Appellees?)\s*(?:\([sS]\))?[\.\)\s]*$',
        '', s, flags=re.IGNORECASE
    )
    
    # Strip surrounding punctuation and whitespace
    s = s.strip(' :;-,.\t\n\r"\'()[]{}')
    
    # Reject if the remaining string is just a generic label keyword
    if s.lower() in [
        "respondent", "respondents", "petitioner", "petitioners", 
        "appellant", "appellants", "defendant", "defendants", 
        "complainant", "complainants", "plaintiff", "plaintiffs",
        "n/a", "none", "null", "undefined", "versus", "vs", "v."
    ]:
        return ""
        
    return s

def extract_legal_entities(text: str) -> Dict[str, Any]:
    """
    Extracts structured legal entities using spaCy NER combined with robust multi-pattern regex
    for Indian legal documents (case numbers, court, petitioner, respondent, judge, legal sections).
    """
    entities = {
        "case_number": None,
        "court_name": None,
        "petitioner": None,
        "respondent": None,
        "judge_name": None,
        "legal_sections": [],
        "hearing_date": None,
        "witnesses": [],
        "people": [],
        "organizations": []
    }

    if not text:
        return entities

    # 1. Regex Layer for Case Number
    case_num_match = re.search(
        r'(?:Writ\s+Petition|WP|Special\s+Leave\s+Petition|SLP|Criminal\s+Appeal|Civil\s+Appeal|Crl\.?\s*A\.|CA|Suit|Bail\s+Application|Matrimonial\s+Case|CASE)\s*(?:\([A-Za-z0-9\s\.\-]+\))?\s*(?:No\.?|NO\(S\)\.?|NO\.?\(S\)|/)?\s*(?:NO\.?\s*)?[\w\d\/\-]+\s*(?:of|OF|\/)\s*\d{2,4}',
        text, re.IGNORECASE
    )
    if not case_num_match:
        case_num_match = re.search(
            r'(?:Case\s+No\.|CASE\s+NO\.|Suit\s+No\.|Appeal\s+No\.)\s*[A-Za-z0-9\s\/\-]*\d{2,4}',
            text, re.IGNORECASE
        )
    if case_num_match:
        entities["case_number"] = case_num_match.group(0).strip()

    # 2. Regex Layer for Court Name
    court_match = re.search(
        r'(Supreme\s+Court\s+of\s+India|High\s+Court\s+of\s+[A-Za-z\s]+|High\s+Court\s+at\s+[A-Za-z\s]+|District\s+and\s+Sessions\s+Court|Sessions\s+Court|Tribunal\s+[A-Za-z\s]+)',
        text, re.IGNORECASE
    )
    if court_match:
        entities["court_name"] = court_match.group(0).strip()
    else:
        entities["court_name"] = "Supreme Court of India"

    # 3. Direct Label Extraction (e.g. "Respondent: Neha and Ors." or "Appellants: Rajnesh")
    resp_label_match = re.search(
        r'(?:Respondent|Respondents|Defendant|Defendants|Appellee|Appellees)\s*(?:\([sS]\))?\s*[:\-–—]\s*([^\n\r]+)',
        text, re.IGNORECASE
    )
    if resp_label_match:
        cand = clean_party_name(resp_label_match.group(1))
        if cand:
            entities["respondent"] = cand

    pet_label_match = re.search(
        r'(?:Petitioner|Petitioners|Appellant|Appellants|Complainant|Complainants|Plaintiff|Plaintiffs)\s*(?:\([sS]\))?\s*[:\-–—]\s*([^\n\r]+)',
        text, re.IGNORECASE
    )
    if pet_label_match:
        cand = clean_party_name(pet_label_match.group(1))
        if cand:
            entities["petitioner"] = cand

    # 4. Line format: "RAJNESH ... APPELLANT(S)" vs "NEHA & ANR. ... RESPONDENT(S)"
    if not entities["petitioner"]:
        pet_line_match = re.search(
            r'([^\n\r]+?)\s*(?:\.\.\.|\---|===|\(\s*|\-\s*)\s*(?:Petitioner|Appellant|Complainant|Plaintiff)s?(?:\([sS]\))?',
            text, re.IGNORECASE
        )
        if pet_line_match:
            cand = clean_party_name(pet_line_match.group(1))
            if cand:
                entities["petitioner"] = cand

    if not entities["respondent"]:
        resp_line_match = re.search(
            r'([^\n\r]+?)\s*(?:\.\.\.|\---|===|\(\s*|\-\s*)\s*(?:Respondent|Defendant|Appellee)s?(?:\([sS]\))?',
            text, re.IGNORECASE
        )
        if resp_line_match:
            cand = clean_party_name(resp_line_match.group(1))
            if cand:
                entities["respondent"] = cand

    # 5. Versus Block Extraction (Line by line with VERSUS/VS on its own line)
    if not entities["petitioner"] or not entities["respondent"]:
        vs_blocks = re.split(r'\n\s*(?:VERSUS|VS\.?|V\.?)\s*\n', text, flags=re.IGNORECASE)
        if len(vs_blocks) >= 2:
            lines_before = [l.strip() for l in vs_blocks[0].split('\n') if l.strip()]
            lines_after = [l.strip() for l in vs_blocks[1].split('\n') if l.strip()]
            if lines_before and not entities["petitioner"]:
                cand_p = clean_party_name(lines_before[-1])
                if cand_p:
                    entities["petitioner"] = cand_p
            if lines_after and not entities["respondent"]:
                cand_r = clean_party_name(lines_after[0])
                if cand_r:
                    entities["respondent"] = cand_r

    # 6. Inline Versus Regex (X vs Y or X v. Y)
    if not entities["petitioner"] or not entities["respondent"]:
        vs_match = re.search(
            r'([A-Za-z0-9\.\s,&\(\)\'"-]+?)\s+(?:versus|vs\.?|v\.?)\s+([A-Za-z0-9\.\s,&\(\)\'"-]+)',
            text, re.IGNORECASE
        )
        if vs_match:
            if not entities["petitioner"]:
                cand_p = clean_party_name(vs_match.group(1).split('\n')[-1])
                if cand_p:
                    entities["petitioner"] = cand_p
            if not entities["respondent"]:
                cand_r = clean_party_name(vs_match.group(2).split('\n')[0])
                if cand_r:
                    entities["respondent"] = cand_r

    # Final Sanitization Pass for Parties
    if entities["respondent"]:
        entities["respondent"] = clean_party_name(entities["respondent"])
    if entities["petitioner"]:
        entities["petitioner"] = clean_party_name(entities["petitioner"])

    # 7. Presiding Judge / Bench Extraction
    judge_patterns = [
        r'(?:CORAM|BENCH|PRESENT|BEFORE)\s*:\s*([^\n\r]+)',
        r'(?:JUDGMENT\s+BY|ORDER\s+BY)\s*:\s*([^\n\r]+)',
        r'(?:Hon\'?ble\s+(?:Mr\.|Ms\.|Dr\.|Justice)?\s+([A-Z][A-Za-z\.\s]+(?:,\s*J\.?|,\s*CJI)?))',
        r'BEFORE\s+(?:HIS|HER)\s+LORDSHIP\s+([^\n\r]+)',
        r'\[([A-Z\.\s]{3,}\s*,\s*J\.?)\]'
    ]
    for pattern in judge_patterns:
        j_match = re.search(pattern, text, re.IGNORECASE)
        if j_match:
            raw_judge = j_match.group(1) if j_match.groups() else j_match.group(0)
            cleaned_judge = re.sub(r'^(?:CORAM|BENCH|PRESENT|BEFORE|JUDGMENT BY|ORDER BY)\s*:\s*', '', raw_judge, flags=re.IGNORECASE).strip()
            cleaned_judge = re.sub(r'\s*\.\.\.\s*$', '', cleaned_judge).strip()
            if cleaned_judge and len(cleaned_judge) > 3 and cleaned_judge.lower() not in ["n/a", "none"]:
                entities["judge_name"] = cleaned_judge
                break

    # 8. Legal Sections & Acts
    sections = re.findall(
        r'(?:Section|Sec\.|Article|Art\.)\s*\d+(?:\(\d+\))?(?:\s*(?:of\s+the\s+)?(?:IPC|BNS|CrPC|BNSS|Indian\s+Penal\s+Code|Constitution|NI\s+Act|Evidence\s+Act|IT\s+Act|SARFAESI\s+Act|Hindu\s+Marriage\s+Act|Family\s+Courts\s+Act))?',
        text, re.IGNORECASE
    )
    if sections:
        entities["legal_sections"] = list(dict.fromkeys([s.strip() for s in sections]))

    # 9. Hearing Date / Decided Date
    date_label_match = re.search(
        r'(?:Decided\s+on|Date\s+of\s+Judgment|Dated|Date\s+of\s+Order|Date)\s*[:\-–—]\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4}|[0-9]{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+\s*,?\s*[0-9]{4})',
        text, re.IGNORECASE
    )
    if date_label_match:
        entities["hearing_date"] = date_label_match.group(1).strip()
    else:
        date_match = re.search(
            r'\b(?:\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*,?\s*\d{4})\b',
            text, re.IGNORECASE
        )
        if date_match:
            entities["hearing_date"] = date_match.group(0).strip()

    # 10. spaCy NER Layer (if model loaded)
    if nlp:
        doc = nlp(text[:10000])
        people = set()
        orgs = set()
        for ent in doc.ents:
            if ent.label_ == "PERSON" and len(ent.text.strip()) > 3:
                people.add(ent.text.strip())
            elif ent.label_ in ["ORG", "GPE"] and len(ent.text.strip()) > 3:
                orgs.add(ent.text.strip())
        
        entities["people"] = list(people)[:10]
        entities["organizations"] = list(orgs)[:10]

    return entities
