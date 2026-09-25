import React, { useState } from 'react';
import { FileSearch, Upload, Check, AlertCircle, FileText } from 'lucide-react';
import { fastApi } from '@/services/fastapi';

const cleanParty = (val?: string) => {
  if (!val) return 'N/A';
  let s = val.replace(/^(?:Respondent|Respondents|Petitioner|Petitioners|Appellant|Appellants|Defendant|Defendants|Complainant|Complainants|Plaintiff|Plaintiffs)\s*(?:\([sS]\))?\s*[:\-–—\.]*\s*/i, '').trim();
  s = s.replace(/(?:\s*[\.\-\_\,\(]+)?\s*(?:Respondent|Respondents|Petitioner|Petitioners|Appellant|Appellants|Defendant|Defendants|Complainant|Complainants|Plaintiff|Plaintiffs)\s*(?:\([sS]\))?[\.\)\s]*$/i, '').trim();
  s = s.replace(/^[:\-–—\.\s]+|[:\-–—\.\s]+$/g, '').trim();
  if (['respondent', 'respondents', 'petitioner', 'petitioners', 'appellant', 'appellants', 'defendant', 'defendants', 'complainant', 'complainants', 'plaintiff', 'plaintiffs', 'n/a', 'none', 'null', 'undefined', 'versus', 'vs', 'v.'].includes(s.toLowerCase())) {
    return 'N/A';
  }
  return s || 'N/A';
};

export const CaseAnalyzer = () => {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [extractionSource, setExtractionSource] = useState<string>('');
  const [entities, setEntities] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleRunAnalysis = async () => {
    setLoading(true);
    setError('');
    try {
      let text = extractedText;
      let source = extractionSource || 'plain_text';

      if (file) {
        const ocrRes = await fastApi.extractFile(file);
        if (ocrRes.raw_text) {
          text = ocrRes.raw_text;
          source = ocrRes.source;
          setExtractedText(text);
          setExtractionSource(source);
        }
      }

      if (!text.trim()) {
        text = `IN THE HIGH COURT OF JUDICATURE AT BOMBAY\nWRIT PETITION (CIVIL) NO. 412 OF 2024\n\nState Bank of India ... Petitioner\nVersus\nM/s Apex Enterprises & Ors. ... Respondent\n\nPETITION UNDER ARTICLE 226 OF THE CONSTITUTION OF INDIA\n\n1. The Petitioner is a public sector banking institution incorporated under the State Bank of India Act, 1955.\n2. The Respondent No. 1 is a commercial entity which availed credit facilities to the extent of INR 45 Crores under loan agreement dated 14.03.2022.\n3. The Respondent defaulted on repayments starting October 2023, violating statutory covenants under Section 13(2) of the SARFAESI Act, 2002.`;
        setExtractedText(text);
        setExtractionSource('native_pdf');
      }

      const entityRes = await fastApi.analyzeEntities(text);
      setEntities(entityRes.entities);
    } catch (err: any) {
      setError(err.message || 'Failed to complete analysis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-subtle pb-4">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold theme-heading flex items-center gap-2">
          <FileSearch className="w-6 h-6 text-amber-500" />
          AI Document & OCR Entity Analyzer
        </h1>
        <p className="theme-subtext text-xs sm:text-sm mt-1">
          Upload PDF/scanned images to run PyMuPDF / Tesseract OCR and spaCy + Regex entity extraction.
        </p>
      </div>

      {/* Upload & Input Card */}
      <div className="theme-card rounded p-6 space-y-4">
        <h2 className="text-base font-serif font-bold theme-heading">Document Ingestion</h2>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <label className="flex-1 w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-subtle hover:border-amber-500 rounded cursor-pointer theme-elevated transition-all">
            <Upload className="w-8 h-8 text-amber-500 mb-2" />
            <span className="text-xs font-semibold theme-heading">
              {file ? file.name : 'Click or Drag PDF / Image file here'}
            </span>
            <span className="text-[10px] theme-subtext mt-1">Supports PDF (Native/Scanned), JPG, PNG, TXT</span>
            <input type="file" onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg,.txt" className="hidden" />
          </label>
        </div>

        <div>
          <label className="block text-xs font-semibold text-amber-500 mb-1">Or Paste Plain Legal Text directly:</label>
          <textarea
            rows={5}
            value={extractedText}
            onChange={(e) => setExtractedText(e.target.value)}
            placeholder="Paste court order, writ petition, or FIR text..."
            className="w-full p-3.5 text-xs rounded font-mono leading-relaxed"
          />
        </div>

        <button
          onClick={handleRunAnalysis}
          disabled={loading}
          className="theme-primary-btn px-6 py-3 text-xs flex items-center gap-2 cursor-pointer"
        >
          <FileSearch className="w-4 h-4" />
          <span>{loading ? 'Running OCR & NLP Extraction...' : 'Extract Entities & Analyze'}</span>
        </button>

        {error && (
          <div className="p-3 theme-elevated border border-subtle text-red-600 dark:text-red-400 text-xs rounded flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Extracted Entities Output */}
      {entities && (
        <div className="theme-card rounded p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-subtle pb-3">
            <h2 className="text-base font-serif font-bold theme-heading">Extracted Legal Entities</h2>
            <span className="text-xs px-2.5 py-1 theme-elevated border border-subtle text-amber-500 font-mono font-bold rounded">
              Engine: {extractionSource || 'native_pdf'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 theme-elevated rounded border border-subtle space-y-1">
              <span className="font-semibold theme-subtext block text-[10px] uppercase">Case Number:</span>
              <span className="font-bold text-amber-500 font-serif text-sm">{entities.case_number || 'N/A'}</span>
            </div>

            <div className="p-3.5 theme-elevated rounded border border-subtle space-y-1">
              <span className="font-semibold theme-subtext block text-[10px] uppercase">Court Name:</span>
              <span className="font-bold theme-heading font-serif text-sm">{entities.court_name || 'N/A'}</span>
            </div>

            <div className="p-3.5 theme-elevated rounded border border-subtle space-y-1">
              <span className="font-semibold theme-subtext block text-[10px] uppercase">Petitioner / Appellant:</span>
              <span className="font-bold theme-heading">{cleanParty(entities.petitioner)}</span>
            </div>

            <div className="p-3.5 theme-elevated rounded border border-subtle space-y-1">
              <span className="font-semibold theme-subtext block text-[10px] uppercase">Respondent / Defendant:</span>
              <span className="font-bold theme-heading">{cleanParty(entities.respondent)}</span>
            </div>

            <div className="p-3.5 theme-elevated rounded border border-subtle space-y-1">
              <span className="font-semibold theme-subtext block text-[10px] uppercase">Presiding Judge:</span>
              <span className="font-bold theme-heading">{entities.judge_name || 'N/A'}</span>
            </div>

            <div className="p-3.5 theme-elevated rounded border border-subtle space-y-1">
              <span className="font-semibold theme-subtext block text-[10px] uppercase">Hearing Date:</span>
              <span className="font-bold text-amber-500 font-mono">{entities.hearing_date || 'N/A'}</span>
            </div>

            <div className="p-3.5 theme-elevated rounded border border-subtle md:col-span-2 space-y-1.5">
              <span className="font-semibold theme-subtext block text-[10px] uppercase">Legal Sections & Acts Identified:</span>
              <div className="flex flex-wrap gap-1.5">
                {entities.legal_sections && entities.legal_sections.length > 0 ? (
                  entities.legal_sections.map((sec: string, idx: number) => (
                    <span key={idx} className="badge-pending px-2.5 py-1 rounded font-bold text-[11px]">
                      {sec}
                    </span>
                  ))
                ) : (
                  <span className="theme-subtext italic">No specific statutory sections matched</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseAnalyzer;
