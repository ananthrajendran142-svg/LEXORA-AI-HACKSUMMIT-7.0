import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, FileText, Download, Bot, Calendar, Users, Briefcase, FileCode2, Loader2 } from 'lucide-react';
import { useAnimations } from '@/hooks/useAnimations';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { api } from '@/services/api';

type TabType = 'Overview' | 'Parties' | 'Timeline' | 'Documents' | 'Hearings/History' | 'AI Summary' | 'Notes';

export function CaseDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { containerVariants, itemVariants } = useAnimations();
  const [activeTab, setActiveTab] = useState<TabType>('Overview');
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.getCaseById(id)
      .then((data) => setCaseData(data))
      .catch((err) => console.error('Failed to fetch case detail:', err))
      .finally(() => setLoading(false));
  }, [id]);

  const tabs: TabType[] = ['Overview', 'Parties', 'Timeline', 'Documents', 'Hearings/History', 'AI Summary', 'Notes'];

  if (loading) {
    return (
      <div className="p-12 text-center text-xs theme-subtext flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
        <span>Loading case record from database...</span>
      </div>
    );
  }

  if (!caseData) {
    return <div className="p-8 text-center text-slate-500">Case record not found in database</div>;
  }

  const caseTimelineEvents = [
    {
      date: caseData.filingDate || '2026-01-10',
      event: 'Initial Petition Filed',
      type: 'filing',
      description: `Case registered with High Court Registry by ${caseData.petitioner || 'Petitioner'}.`,
    },
    ...(caseData.hearings || []).map((h: any) => ({
      date: h.date,
      event: `Hearing: ${h.type || 'Court Session'}`,
      type: 'hearing',
      description: `Scheduled at ${h.time || '10:30 AM'} in ${h.courtRoom || 'Courtroom 1'}. Status: ${h.status}.`,
    })),
    ...(caseData.documents || []).map((d: any) => ({
      date: d.uploadedAt ? new Date(d.uploadedAt).toISOString().split('T')[0] : '2026-02-01',
      event: `Document Ingested: ${d.fileName}`,
      type: 'document',
      description: `Indexed for judicial semantic research (${d.status || 'INDEXED'}).`,
    })),
  ];

  const docsList = (caseData.documents && caseData.documents.length > 0)
    ? caseData.documents.map((d: any) => ({
        id: d.id,
        name: d.fileName || 'Pleading Document.pdf',
        date: d.uploadedAt ? new Date(d.uploadedAt).toISOString().split('T')[0] : '2026-01-15',
        size: `${((d.fileSize || 102400) / 1024).toFixed(1)} KB`,
        type: 'PDF',
      }))
    : [
        { id: '1', name: 'Petition & Affidavits.pdf', date: caseData.filingDate || '2026-01-15', size: '2.4 MB', type: 'PDF' },
        { id: '2', name: 'Written Submissions.pdf', date: caseData.filingDate || '2026-02-05', size: '1.8 MB', type: 'PDF' }
      ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/judge/cases')}
            className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 -ml-2 text-xs"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Case List
          </Button>
          
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-display">
              {caseData.caseNumber}
            </h1>
            <StatusBadge status={caseData.status} />
            <StatusBadge status={caseData.priority} />
          </div>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium">
            {caseData.title}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-white/10">
        <div className="flex overflow-x-auto gap-4 sm:gap-6 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors relative cursor-pointer ${
                activeTab === tab
                  ? 'text-[var(--primary-accent)] font-bold'
                  : 'theme-subtext hover:theme-heading'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary-accent)]"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <motion.div variants={itemVariants} className="pt-2">
        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="glass-card lg:col-span-1">
              <CardHeader className="border-b border-slate-200 dark:border-white/10">
                <CardTitle className="text-base flex items-center gap-2 font-display">
                  <Briefcase className="w-4 h-4 text-amber-500" />
                  Case Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Type</p>
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">{caseData.type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Division</p>
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">{caseData.division}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Court</p>
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">{caseData.court}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Judge</p>
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">{caseData.judge}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Filing Date</p>
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">{caseData.filingDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Next Hearing</p>
                    <p className="font-semibold text-sm text-amber-500">{caseData.nextHearing}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card lg:col-span-2">
              <CardHeader className="border-b border-slate-200 dark:border-white/10">
                <CardTitle className="text-base flex items-center gap-2 font-display">
                  <FileText className="w-4 h-4 text-amber-500" />
                  Case Brief & Description
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                  {caseData.description}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'Parties' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader className="border-b border-slate-200 dark:border-white/10">
                <CardTitle className="text-base flex items-center gap-2 font-display">
                  <Users className="w-4 h-4 text-cyan-500" />
                  Petitioner / Appellant
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-lg font-bold text-slate-900 dark:text-white mb-1 font-display">
                  {caseData.petitioner}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Representation: {caseData.petitionerLawyer || caseData.lawyer?.name || 'Advocate for Petitioner'}</p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="border-b border-slate-200 dark:border-white/10">
                <CardTitle className="text-base flex items-center gap-2 font-display">
                  <Users className="w-4 h-4 text-purple-500" />
                  Respondent / Defendant
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-lg font-bold text-slate-900 dark:text-white mb-1 font-display">
                  {caseData.respondent}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Representation: {caseData.respondentLawyer || 'Standing Counsel'}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'Timeline' && (
          <Card className="glass-card">
            <CardHeader className="border-b border-slate-200 dark:border-white/10">
              <CardTitle className="text-base flex items-center gap-2 font-display">
                <Clock className="w-4 h-4 text-amber-500" />
                Case History & Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-200 dark:before:bg-white/10">
                {caseTimelineEvents.map((event, index) => {
                  let dotColor = 'bg-slate-500';
                  if (event.type === 'filing') dotColor = 'bg-amber-500';
                  if (event.type === 'hearing') dotColor = 'bg-cyan-500';
                  if (event.type === 'document') dotColor = 'bg-blue-500';
                  if (event.type === 'ai') dotColor = 'bg-purple-500';
                  if (event.type === 'adjournment') dotColor = 'bg-red-500';

                  return (
                    <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full border-4 border-white dark:border-navy-900 ${dotColor} shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow z-10`} />
                      <div className="w-[calc(100%-3.5rem)] md:w-[calc(50%-2rem)] bg-slate-50/80 dark:bg-white/[0.02] p-4 rounded-xl border border-slate-200 dark:border-white/10">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-sm text-slate-900 dark:text-white font-display">{event.event}</h4>
                          <time className="text-xs font-semibold text-amber-500">{event.date}</time>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300">{event.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'Documents' && (
          <Card className="glass-card">
            <CardHeader className="border-b border-slate-200 dark:border-white/10">
              <CardTitle className="text-base flex items-center gap-2 font-display">
                <FileCode2 className="w-4 h-4 text-amber-500" />
                Attached Case Records
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {docsList.map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 hover:border-amber-500/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">{doc.name}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          <span>{doc.date}</span>
                          <span>•</span>
                          <span>{doc.size}</span>
                          <span>•</span>
                          <span>{doc.type}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-slate-500 hover:text-amber-500">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'AI Summary' && (
          <Card className="glass-card overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-cyan-500 to-amber-500" />
            <CardHeader className="border-b border-slate-200 dark:border-white/10">
              <CardTitle className="text-base flex items-center gap-2 font-display">
                <Bot className="w-5 h-5 text-amber-500" />
                AI Generated Case Brief
              </CardTitle>
              <CardDescription className="text-xs">
                Autonomous briefing synthesized from court transcripts and filed affidavits.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <p>
                Based on active docket records, <strong>{caseData.caseNumber}</strong> ({caseData.title}) is a {caseData.type} matter currently before the {caseData.court}.
              </p>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 space-y-2">
                <h4 className="text-amber-500 font-semibold text-xs font-display">Key Judicial Issues:</h4>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li>Maintainability under the specified division jurisdiction.</li>
                  <li>Evaluation of primary witness testimonies filed during preliminary hearings.</li>
                  <li>Applicability of precedents established under Apex Court rulings.</li>
                </ul>
              </div>
              <p>
                <strong>Current Status:</strong> Marked as {caseData.status}. Next hearing date: {caseData.nextHearing}. Presiding judge: {caseData.judge}.
              </p>
            </CardContent>
          </Card>
        )}

        {(activeTab === 'Hearings/History' || activeTab === 'Notes') && (
          <Card className="glass-card">
            <CardHeader className="border-b border-slate-200 dark:border-white/10">
              <CardTitle className="text-base font-display">{activeTab}</CardTitle>
            </CardHeader>
            <CardContent className="py-12 text-center text-xs text-slate-500">
              <Calendar className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p>No additional {activeTab.toLowerCase()} recorded for this case file.</p>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </motion.div>
  );
}

export default CaseDetails;
