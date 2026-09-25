import React, { useState, useEffect } from 'react';
import { Download, FileText, Search, ShieldCheck, CheckCircle, Lock } from 'lucide-react';
import { api } from '../../services/api';

export const DownloadOrdersPage: React.FC = () => {
  const [searchNo, setSearchNo] = useState('');
  const [orders, setOrders] = useState([
    {
      id: 'ord_1',
      caseNo: 'WP(C) 412/2024',
      title: 'State Bank of India vs. M/s Apex Enterprises',
      date: '14th February 2026',
      judge: 'Hon\'ble Justice Rajesh Sharma',
      orderType: 'Interim Notice & Attachment Order',
      fileSize: '1.4 MB',
      content: `IN THE HIGH COURT OF JUDICATURE AT BOMBAY
WRIT PETITION (CIVIL) NO. 412 OF 2024

State Bank of India                          ... PETITIONER
VERSUS
M/s Apex Enterprises & Ors.                  ... RESPONDENTS

INTERIM ORDER DATED 14TH FEBRUARY 2026
======================================================
1. UPON HEARING the learned counsel for the petitioner, IT IS HEREBY ORDERED that Notice be issued to Respondent returnable within three weeks.
2. The Respondent is directed to maintain status quo regarding hypothecated commercial properties until the next date of hearing.
3. Matter listed for next hearing on 14th August 2026.

DATED THIS 14TH DAY OF FEBRUARY 2026.
[DIGITALLY SIGNED & VERIFIED BY REGISTRAR]`
    },
    {
      id: 'ord_2',
      caseNo: 'CIV.SUIT 104/2025',
      title: 'Ramesh Patel vs. Municipal Corporation of Greater Mumbai',
      date: '10th May 2026',
      judge: 'Hon\'ble Justice Sunita Rao',
      orderType: 'Summons Directions & Extension Order',
      fileSize: '890 KB',
      content: `IN THE COURT OF DISTRICT CIVIL JUDGE, BOMBAY
CIVIL SUIT NO. 104 OF 2025

Ramesh Patel                                 ... PLAINTIFF
VERSUS
Municipal Corporation of Greater Mumbai       ... DEFENDANT

DIRECTIONS ORDER DATED 10TH MAY 2026
======================================================
1. Time to file Written Statement by Defendant is extended by 30 days under Order VIII Rule 1 CPC.
2. Plaintiff permitted to place additional survey maps on record.

DATED THIS 10TH DAY OF MAY 2026.
[DIGITALLY SIGNED & VERIFIED BY REGISTRAR]`
    }
  ]);

  useEffect(() => {
    async function loadLiveOrders() {
      try {
        const res = await api.getDrafts();
        if (res.success && res.drafts && res.drafts.length > 0) {
          const formatted = res.drafts.map((d: any) => ({
            id: d.id,
            caseNo: d.case?.caseNumber || d.caseId || 'COURT ORDER',
            title: d.title || 'Official Court Summons / Order',
            date: new Date(d.createdAt).toLocaleDateString(),
            judge: d.signedBy?.name || 'Hon\'ble Presiding Judicial Officer',
            orderType: `${d.docType || 'Summons'} (${d.status || 'DRAFT'})`,
            fileSize: `${Math.round((d.content?.length || 500) / 1024 * 10) / 10} KB`,
            content: d.content
          }));

          setOrders((prev) => {
            const existingIds = new Set(prev.map(p => p.id));
            const newOrders = formatted.filter((f: any) => !existingIds.has(f.id));
            return [...newOrders, ...prev];
          });
        }
      } catch {
        // Fallback
      }
    }
    loadLiveOrders();
  }, []);

  const handleDownload = (ord: any) => {
    const blob = new Blob([ord.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Certified_Court_Order_${ord.caseNo.replace(/\s+/g, '_')}.txt`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-subtle pb-4">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold theme-heading flex items-center gap-2">
          <Download className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          Download Certified Orders & Judgments
        </h1>
        <p className="theme-subtext text-xs sm:text-sm mt-1">
          Search, View, and Download Digitally Signed Certified Copies of High Court & District Court Decrees
        </p>
      </div>

      {/* Orders List */}
      <div className="theme-card rounded-xl p-6 space-y-4 shadow-xl">
        <h2 className="text-base font-serif font-bold theme-heading flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Available Certified Orders for Verification & Download
        </h2>

        <div className="space-y-4">
          {orders.map((ord) => (
            <div key={ord.id} className="p-4 theme-elevated border border-subtle rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-subtle pb-3">
                <div>
                  <span className="text-[10px] theme-subtext font-bold uppercase">{ord.orderType}</span>
                  <h3 className="text-base font-serif font-bold text-blue-600 dark:text-blue-400">{ord.caseNo} — {ord.title}</h3>
                  <p className="text-xs theme-subtext">Presiding Officer: {ord.judge} | Order Date: {ord.date}</p>
                </div>

                <button
                  onClick={() => handleDownload(ord)}
                  className="theme-primary-btn px-4 py-2 text-xs font-bold rounded-xl shadow flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Certified Order ({ord.fileSize})</span>
                </button>
              </div>

              {/* Document Preview Box */}
              <div className="p-3 theme-card border border-subtle rounded-lg text-xs font-mono theme-heading leading-relaxed max-h-36 overflow-y-auto">
                <pre className="whitespace-pre-wrap font-mono">{ord.content}</pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DownloadOrdersPage;
