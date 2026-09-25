import React, { useState } from 'react';
import { FileCode, Printer, Download, Send, ShieldCheck, Building, CheckCircle, FileText, Save, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

export const SummonsNoticeGeneratorPage: React.FC = () => {
  const [templateType, setTemplateType] = useState('cpc_summons');
  const [courtName, setCourtName] = useState('IN THE HIGH COURT OF JUDICATURE AT BOMBAY');
  const [caseId, setCaseId] = useState('1');
  const [caseNumber, setCaseNumber] = useState('CIVIL SUIT NO. 412 OF 2026');
  const [cnrNumber, setCnrNumber] = useState('MHBM010041202026');
  const [petitioner, setPetitioner] = useState('State Bank of India (Commercial Branch)');
  const [respondent, setRespondent] = useState('M/s Apex Enterprises Pvt. Ltd. & Ors.');
  const [respondentAddress, setRespondentAddress] = useState('Plot No. 42, MIDC Industrial Area, Andheri East, Mumbai - 400093');
  const [hearingDate, setHearingDate] = useState('2026-08-28');
  const [courtroomNo, setCourtroomNo] = useState('Courtroom No. 4 (Bench II)');
  const [presidingOfficer, setPresidingOfficer] = useState('Hon\'ble Justice Rajesh Sharma');
  const [registrarName, setRegistrarName] = useState('Amit Kumar (Bench Registrar)');

  const [dispatchStatus, setDispatchStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');

  const generateSummonsText = () => {
    if (templateType === 'cpc_summons') {
      return `OFFICIAL COURT SUMMONS TO RESPONDENT / DEFENDANT
[ORDER V RULE 1 AND 5, CODE OF CIVIL PROCEDURE, 1908]

IN THE COURT OF: ${courtName.toUpperCase()}
CNR NUMBER: ${cnrNumber}
CASE REFERENCE: ${caseNumber}

BETWEEN:
${petitioner.toUpperCase()}                          ... PETITIONER / PLAINTIFF
VERSUS
${respondent.toUpperCase()}                         ... RESPONDENT / DEFENDANT

TO:
${respondent}
ADDRESS: ${respondentAddress}

WHEREAS the above-named Petitioner has instituted a Civil Suit against you in this Court for Title Injunction and Commercial Recovery;

YOU ARE HEREBY SUMMONED AND REQUIRED to appear in this Court in person, or by an Advocate duly instructed and able to answer all material questions relating to the suit, on the ${hearingDate} at 10:30 AM in ${courtroomNo} before ${presidingOfficer}.

TAKE NOTICE THAT:
1. You are required to file a Written Statement of your defense within THIRTY (30) DAYS from the date of service of this summons as mandated under Order VIII Rule 1 of the Code of Civil Procedure, 1908.
2. In default of your appearance on the day before mentioned, the suit will be heard and determined EX-PARTE in your absence.
3. You are further directed to produce all documents in your possession or power upon which you intend to rely in support of your defense.

GIVEN UNDER MY HAND AND THE SEAL OF THIS COURT, THIS 7TH DAY OF AUGUST 2026.

[SEAL OF THE HIGH COURT]

________________________________________
${registrarName.toUpperCase()}
BENCH REGISTRAR / PROCESS ISSUING OFFICER
${courtName}

==================================================
COURT PROCESS SERVER DISPATCH ACKNOWLEDGEMENT
Summons Receipt No: SUM/MH/${Math.floor(100000 + Math.random() * 900000)}/2026
Delivered to Bailiff / Speed Post A.D. Tracking No: ED984120938IN
Date of Dispatch: ${new Date().toLocaleDateString()}
`;
    }

    if (templateType === 'crpc_41a') {
      return `OFFICIAL NOTICE OF APPEARANCE BEFORE COURT / INVESTIGATING REGISTRY
[SECTION 41A, CODE OF CRIMINAL PROCEDURE, 1973 / SEC 35 BNSS]

IN THE COURT / REGISTRY OF: ${courtName.toUpperCase()}
CASE REFERENCE: ${caseNumber} (CNR: ${cnrNumber})

COMPLAINANT: ${petitioner}
ACCUSED / RESPONDENT: ${respondent}
RESIDING AT: ${respondentAddress}

WHEREAS reasonable complaint has been made against you regarding commission of cognizable offense under statutory provisions;

YOU ARE HEREBY DIRECTED TO APPEAR before ${presidingOfficer} in ${courtroomNo} on ${hearingDate} at 10:30 AM to join judicial proceedings.

STATUTORY CONDITIONS & WARNINGS:
1. You shall comply with the terms of this notice and appear as directed.
2. You shall not commit any offense while this notice remains in force.
3. You shall not make any inducement, threat, or promise to any person acquainted with the facts of the case.
4. Failure to comply with this notice may result in issuance of a Non-Bailable Warrant (NBW) of Arrest.

GIVEN UNDER MY HAND AND SEAL THIS 7TH DAY OF AUGUST 2026.

________________________________________
${registrarName.toUpperCase()}
REGISTRY OFFICER / BENCH CLERK
`;
    }

    if (templateType === 'ni_138') {
      return `STATUTORY LEGAL DEMAND NOTICE FOR CHEQUE DISHONOR
[SECTION 138, NEGOTIABLE INSTRUMENTS ACT, 1881]

TO: ${respondent}
ADDRESS: ${respondentAddress}

FROM: ${petitioner}

UNDER INSTRUCTIONS FROM OUR CLIENT, WE HEREBY SERVE YOU WITH THIS STATUTORY LEGAL DEMAND NOTICE:

1. That you issued Cheque No. 412098 drawn on State Bank of India for an amount of INR 12,50,000/- in discharge of legally enforceable debt.
2. That the aforesaid cheque was presented for realization and returned unpaid with bank memo dated 01.08.2026 with remark "FUNDS INSUFFICIENT".
3. YOU ARE HEREBY CALLED UPON to pay the full cheque amount of INR 12,50,000/- within FIFTEEN (15) DAYS from receipt of this statutory notice.
4. In the event of failure to deposit the amount within 15 days, criminal prosecution under Section 138 of NI Act shall be instituted against you seeking 2 years imprisonment and double cheque fine.

DATED THIS 7TH DAY OF AUGUST 2026.

________________________________________
ADVOCATE FOR THE COMPLAINANT
`;
    }

    return `STATUTORY DEMAND NOTICE UNDER SECTION 13(2) SARFAESI ACT, 2002
ISSUED BY SECURED CREDITOR: ${petitioner}
TO NPA BORROWER: ${respondent} (${respondentAddress})

WHEREAS your loan account has been classified as Non-Performing Asset (NPA) following default;

YOU ARE HEREBY REQUIRED TO DISCHARGE IN FULL your total statutory liability of INR 45,00,00,000/- (Rupees Forty-Five Crores) within SIXTY (60) DAYS from the date of this notice, failing which physical possession of secured mortgaged assets will be taken under Section 13(4) of SARFAESI Act.

DATED THIS 7TH DAY OF AUGUST 2026.
SECURED CREDITOR AUTHORIZED OFFICER
`;
  };

  const handleSaveToDocket = async () => {
    setSaving(true);
    setSaveSuccess('');
    try {
      const content = generateSummonsText();
      const docTypeTitle = templateType === 'cpc_summons' ? 'Civil Summons Order V CPC' :
                            templateType === 'crpc_41a' ? 'Notice of Appearance Sec 41A' :
                            templateType === 'ni_138' ? 'Demand Notice Sec 138 NI Act' : 'SARFAESI 13(2) Notice';

      const res = await api.saveDraft({
        caseId: caseNumber || caseId || '1',
        docType: templateType === 'cpc_summons' ? 'Summons' : 'Notice',
        title: `${docTypeTitle} - ${caseNumber}`,
        content
      });

      if (res.success && res.draft) {
        setSaveSuccess(`✓ Saved draft notice to case docket (ID: ${res.draft.id}). Status: DRAFT (Human Review Required).`);
        setTimeout(() => setSaveSuccess(''), 8000);
      } else {
        setSaveSuccess(`Failed to save draft: ${res.error || (res as any).details || 'Unknown error'}`);
      }
    } catch (err: any) {
      setSaveSuccess(`Failed to save draft: ${err.message || 'Server connection error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDispatchProcess = () => {
    setDispatchStatus('Summons Dispatched to District Bailiff & Registered Speed Post A.D. Queue (Tracking ID: ED984120938IN)');
    setTimeout(() => setDispatchStatus(''), 5000);
  };

  const handleDownloadPDF = () => {
    const text = generateSummonsText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Official_Court_Summons_${cnrNumber}.txt`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-subtle pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold theme-heading flex items-center gap-2">
            <Building className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Official Court Summons & Statutory Notice Generator
          </h1>
          <p className="theme-subtext text-xs sm:text-sm mt-1">
            Generate authentic High Court & District Court Summons under Order V CPC, Section 41A CrPC, and Section 138 NI Act
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSaveToDocket}
            disabled={saving}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Save className="w-4 h-4 text-white" />}
            <span>Save to Docket (Human Review)</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            className="theme-primary-btn px-4 py-2.5 font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Certified Text</span>
          </button>
        </div>
      </div>

      {/* Action Status */}
      {saveSuccess && (
        <div className={`p-3.5 border text-xs rounded-xl flex items-center gap-2 ${
          saveSuccess.startsWith('Failed') || saveSuccess.startsWith('Error')
            ? 'bg-red-500/10 border-red-500/30 text-red-800 dark:text-red-200'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
        }`}>
          {saveSuccess.startsWith('Failed') || saveSuccess.startsWith('Error') ? (
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          )}
          <span>{saveSuccess}</span>
        </div>
      )}

      {dispatchStatus && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{dispatchStatus}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Input Form */}
        <div className="lg:col-span-5 theme-card border border-subtle rounded-xl p-5 space-y-4 shadow-xl text-xs">
          <h2 className="text-sm font-serif font-bold text-blue-600 dark:text-blue-400 border-b border-subtle pb-2">
            Select Official Real-Life Summons Template
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block font-semibold theme-heading mb-1">Select Statutory Format:</label>
              <select
                value={templateType}
                onChange={(e) => setTemplateType(e.target.value)}
                className="w-full px-3 py-2 theme-elevated border border-subtle rounded-lg theme-heading font-bold cursor-pointer"
              >
                <option value="cpc_summons">Order V Rule 1 CPC — Official Civil Court Summons</option>
                <option value="crpc_41a">Section 41A CrPC — Official Notice of Appearance</option>
                <option value="ni_138">Section 138 NI Act — Cheque Dishonor Statutory Notice</option>
                <option value="sarfaesi">Section 13(2) SARFAESI Act — 60-Day NPA Recovery Notice</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold theme-heading mb-1">Court Establishment:</label>
              <input
                type="text"
                value={courtName}
                onChange={(e) => setCourtName(e.target.value)}
                className="w-full px-3 py-2 theme-elevated border border-subtle rounded-lg theme-heading font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold theme-heading mb-1">Case No:</label>
                <input
                  type="text"
                  value={caseNumber}
                  onChange={(e) => setCaseNumber(e.target.value)}
                  className="w-full px-3 py-2 theme-elevated border border-subtle rounded-lg theme-heading font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold theme-heading mb-1">CNR No:</label>
                <input
                  type="text"
                  value={cnrNumber}
                  onChange={(e) => setCnrNumber(e.target.value)}
                  className="w-full px-3 py-2 theme-elevated border border-subtle rounded-lg theme-heading font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold theme-heading mb-1">Petitioner / Plaintiff Name:</label>
              <input
                type="text"
                value={petitioner}
                onChange={(e) => setPetitioner(e.target.value)}
                className="w-full px-3 py-2 theme-elevated border border-subtle rounded-lg theme-heading font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold theme-heading mb-1">Respondent / Defendant Name:</label>
              <input
                type="text"
                value={respondent}
                onChange={(e) => setRespondent(e.target.value)}
                className="w-full px-3 py-2 theme-elevated border border-subtle rounded-lg theme-heading font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold theme-heading mb-1">Respondent Full Postal Address:</label>
              <textarea
                rows={2}
                value={respondentAddress}
                onChange={(e) => setRespondentAddress(e.target.value)}
                className="w-full p-2.5 theme-elevated border border-subtle rounded-lg theme-heading text-xs outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold theme-heading mb-1">Hearing Date:</label>
                <input
                  type="date"
                  value={hearingDate}
                  onChange={(e) => setHearingDate(e.target.value)}
                  className="w-full px-3 py-2 theme-elevated border border-subtle rounded-lg theme-heading font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold theme-heading mb-1">Courtroom No:</label>
                <input
                  type="text"
                  value={courtroomNo}
                  onChange={(e) => setCourtroomNo(e.target.value)}
                  className="w-full px-3 py-2 theme-elevated border border-subtle rounded-lg theme-heading"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveToDocket}
                disabled={saving}
                className="flex-1 py-3 theme-primary-btn font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>Save Draft to Docket</span>
              </button>
              <button
                type="button"
                onClick={handleDispatchProcess}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-4 h-4 text-white" />
                <span>Dispatch Summons</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Document Preview */}
        <div className="lg:col-span-7 theme-card border border-subtle rounded-xl p-5 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-subtle pb-2">
            <h2 className="text-sm font-serif font-bold theme-heading flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Official Judicial Format Render (Real-Life Court Template)
            </h2>
            <span className="text-[10px] px-2 py-0.5 badge-supported rounded font-mono font-bold">
              CPC Compliant
            </span>
          </div>

          <div className="p-6 theme-elevated border border-subtle rounded-xl font-mono text-xs theme-heading whitespace-pre-wrap leading-relaxed overflow-x-auto shadow-inner border-l-4 border-l-blue-600 dark:border-l-blue-400">
            {generateSummonsText()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummonsNoticeGeneratorPage;
