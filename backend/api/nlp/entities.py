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
    s = re.sub(r'^(?:Appellants?|Petitioners?|Complainants?|Plaintiffs?|Respondents?|Defendants?|Appellees?)\s*[:\-–—]\s*', '', s, flags=re.IGNORECASE)
    # Remove trailing role tags (e.g. "... Appellant", "... Respondent", "... Petitioner")
    s = re.sub(r'\s*\.\.\.\s*(?:Appellants?|Petitioners?|Complainants?|Plaintiffs?|Respondents?|Defendants?|Appellees?)$', '', s, flags=re.IGNORECASE)
    
    # Strip punctuation and spaces
    s = s.strip(' :;-,.')
    
    # Reject if the remaining string is just a generic label keyword
    if s.lower() in ["respondent", "respondents", "petitioner", "petitioners", "appellant", "appellants", "defendant", "defendants", "n/a", "none"]:
        return ""
        
    return s

def extract_legal_entities(text: str) -> Dict[str, Any]:
    """
    Extracts structured legal entities using spaCy NER combined with robust rule-based regex
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
        r'(?:Writ\s+Petition|WP|Special\s+Leave\s+Petition|SLP|Criminal\s+Appeal|Civil\s+Appeal|Crl\.?\s*A\.|CA|Suit\s+No\.|Case\s+No\.|CASE\s+NO\.)\s*(?:\([A-Za-z0-9\s-]+\))?\s*(?:No\.|\/)?\s*[A-Za-z0-9\s\/\-]*\d{2,4}',
        text, re.IGNORECASE
    )
    if case_num_match:
        entities["case_number"] = case_num_match.group(0).strip()

    # 2. Regex Layer for Court Name
    court_match = re.search(
        r'(Supreme\s+Court\s+of\s+India|High\s+Court\s+of\s+[A-Za-z\s]+|District\s+and\s+Sessions\s+Court|Sessions\s+Court|Tribunal\s+[A-Za-z\s]+)',
        text, re.IGNORECASE
    )
    if court_match:
        entities["court_name"] = court_match.group(0).strip()
    else:
        entities["court_name"] = "Supreme Court of India"

    # 3. Direct Label Extraction (e.g. "Respondent: Neha and Ors." or "Appellants: Rajnesh")
    resp_label_match = re.search(r'(?:Respondent|Respondents|Defendant|Defendants|Appellee|Appellees)\s*[:\-–—]\s*([^\n\r]+)', text, re.IGNORECASE)
    if resp_label_match:
        resp_candidate = clean_party_name(resp_label_match.group(1))
        if resp_candidate:
            entities["respondent"] = resp_candidate

    pet_label_match = re.search(r'(?:Petitioner|Petitioners|Appellant|Appellants|Complainant|Complainants|Plaintiff|Plaintiffs)\s*[:\-–—]\s*([^\n\r]+)', text, re.IGNORECASE)
    if pet_label_match:
        pet_candidate = clean_party_name(pet_label_match.group(1))
        if pet_candidate:
            entities["petitioner"] = pet_candidate

    # 4. Line format: "X ... Petitioner" vs "Y ... Respondent"
    if not entities["petitioner"]:
        pet_line_match = re.search(r'([^\n\r]+?)\s*\.\.\.\s*(?:Petitioner|Appellant|Complainant|Plaintiff)s?', text, re.IGNORECASE)
        if pet_line_match:
            cand = clean_party_name(pet_line_match.group(1))
            if cand:
                entities["petitioner"] = cand

    if not entities["respondent"]:
        resp_line_match = re.search(r'([^\n\r]+?)\s*\.\.\.\s*(?:Respondent|Defendant|Appellee)s?', text, re.IGNORECASE)
        if resp_line_match:
            cand = clean_party_name(resp_line_match.group(1))
            if cand:
                entities["respondent"] = cand

    # 5. Versus Format (X vs Y or X v. Y)
    if not entities["petitioner"] or not entities["respondent"]:
        vs_match = re.search(r'([A-Z0-9\.\s,&\(\)\'"-]+?)\s+(?:versus|vs\.?|v\.?)\s+([A-Z0-9\.\s,&\(\)\'"-]+)', text, re.IGNORECASE)
        if vs_match:
            if not entities["petitioner"]:
                cand_pet = clean_party_name(vs_match.group(1).split('\n')[-1])
                if cand_pet:
                    entities["petitioner"] = cand_pet
            if not entities["respondent"]:
                cand_resp = clean_party_name(vs_match.group(2).split('\n')[0])
                if cand_resp:
                    entities["respondent"] = cand_resp

    # Final Sanitization Pass
    if entities["respondent"]:
        entities["respondent"] = clean_party_name(entities["respondent"])
    if entities["petitioner"]:
        entities["petitioner"] = clean_party_name(entities["petitioner"])

    # 6. Judge Name
    judge_match = re.search(r'(?:Hon\'?ble\s+(?:Mr\.|Ms\.|Justice)?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)|CORAM\s*:\s*([A-Za-z\.\s,]+))', text)
    if judge_match:
        entities["judge_name"] = (judge_match.group(1) or judge_match.group(2)).strip()

    # 7. Legal Sections & Acts
    sections = re.findall(
        r'(?:Section|Sec\.|Article|Art\.)\s*\d+(?:\(\d+\))?(?:\s*(?:of\s+the\s+)?(?:IPC|BNS|CrPC|BNSS|Indian\s+Penal\s+Code|Constitution|NI\s+Act|Evidence\s+Act|IT\s+Act))?',
        text, re.IGNORECASE
    )
    if sections:
        entities["legal_sections"] = list(set([s.strip() for s in sections]))

    # 8. Witnesses
    witnesses = re.findall(r'\b(?:PW|DW)-\d+\b|\bWitness\s+\d+:\s*([A-Z][a-z]+\s+[A-Z][a-z]+)', text)
    if witnesses:
        entities["witnesses"] = list(set([w if isinstance(w, str) else w[0] for w in witnesses]))

    # 9. Hearing Date
    date_match = re.search(r'\b(?:\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*,?\s*\d{4})\b', text, re.IGNORECASE)
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
