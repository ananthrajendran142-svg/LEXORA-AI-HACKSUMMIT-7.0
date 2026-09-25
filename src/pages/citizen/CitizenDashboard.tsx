import React, { useState } from 'react';
import { HelpCircle, Search, Globe, CheckSquare, Bot, AlertCircle, ArrowRight, ShieldCheck, FileSearch, Calculator, Sparkles, FileText, Loader2 } from 'lucide-react';
import { api } from '@/services/api';
import { fastApi } from '@/services/fastapi';
import { VoiceMicInput } from '@/components/citizen/VoiceMicInput';
import { FreeLegalAidModal } from '@/components/citizen/FreeLegalAidModal';
import { NoticeDeciphererModal } from '@/components/citizen/NoticeDeciphererModal';
import { CourtFeeCalculatorModal } from '@/components/citizen/CourtFeeCalculatorModal';

const translations: Record<string, Record<string, string>> = {
  English: {
    portalTitle: "Citizen Legal Self-Help & Case Portal",
    subTitle: "e-Courts Citizen Access | Plain Language Legal Assistance",
    caseLookupTitle: "Look Up Your Case Status",
    casePlaceholder: "Enter Case Number (e.g. CIV.SUIT 104/2025 or WP(C) 412/2024)",
    searchBtn: "Search Case",
    askTitle: "Ask Legal Questions in Plain Language",
    askSub: "Get plain explanation of legal rights, procedural steps, and court summons.",
    askPlaceholder: "Ask anything, e.g.: What should I do if I receive a court summons notice?",
    askBtn: "Get Plain Answer",
    checklistTitle: "Litigant Action Checklist",
    langLabel: "Language",
    item1: "Gather Original Title Deeds & Identity Proof",
    item2: "Engage Authorized Legal Practitioner / Legal Aid Counsel",
    item3: "Obtain Certified Copies of Impugned Order",
    item4: "Verify Court Hearing Date on Official Portal",
    completed: "Completed",
    pending: "Action Pending"
  },
  Hindi: {
    portalTitle: "नागरिक कानूनी सहायता एवं मामला पोर्टल",
    subTitle: "ई-कोर्ट नागरिक एक्सेस | सरल भाषा कानूनी सहायता",
    caseLookupTitle: "अपने मामले की स्थिति देखें",
    casePlaceholder: "मामला संख्या दर्ज करें (जैसे CIV.SUIT 104/2025)",
    searchBtn: "खोजें",
    askTitle: "सरल भाषा में कानूनी प्रश्न पूछें",
    askSub: "कानूनी अधिकारों, प्रक्रियात्मक चरणों और अदालती सम्मन का सरल विवरण प्राप्त करें।",
    askPlaceholder: "कुछ भी पूछें, जैसे: यदि मुझे अदालती सम्मन मिले तो मुझे क्या करना चाहिए?",
    askBtn: "सरल उत्तर प्राप्त करें",
    checklistTitle: "याचिकाकर्ता कार्य सूची",
    langLabel: "भाषा",
    item1: "मूल संपत्ति दस्तावेज और पहचान पत्र एकत्र करें",
    item2: "अधिकृत वकील / कानूनी सहायता वकील नियुक्त करें",
    item3: "आक्षेपित आदेश की प्रमाणित प्रतियां प्राप्त करें",
    item4: "आधिकारिक पोर्टल पर सुनवाई की तिथि की पुष्टि करें",
    completed: "पूर्ण",
    pending: "कार्रवाई लंबित"
  },
  Tamil: {
    portalTitle: "குடிமக்கள் சட்ட உதவி மற்றும் வழக்கு போர்ட்டல்",
    subTitle: "ஈ-கோர்ட்ஸ் குடிமக்கள் அணுகல் | எளிய மொழி சட்ட உதவி",
    caseLookupTitle: "உங்கள் வழக்கின் நிலையைக் கண்டறியவும்",
    casePlaceholder: "வழக்கு எண்ணை உள்ளிடவும் (எ.கா. CIV.SUIT 104/2025)",
    searchBtn: "தேடுங்கள்",
    askTitle: "எளிய மொழியில் சட்ட கேள்விகளைக் கேளுங்கள்",
    askSub: "சட்ட உரிமைகள் மற்றும் நீதிமன்ற அழைப்பாணைகளின் எளிய விளக்கத்தைப் பெறுங்கள்.",
    askPlaceholder: "எதையும் கேளுங்கள்: நீதிமன்ற அழைப்பாணை வந்தால் நான் என்ன செய்ய வேண்டும்?",
    askBtn: "எளிய பதிலைப் பெறுங்கள்",
    checklistTitle: "வழக்குதாரர் நடவடிக்கை சரிபார்ப்பு பட்டியல்",
    langLabel: "மொழி",
    item1: "அசல் ஆவணங்கள் மற்றும் அடையாளச் சான்றுகளைச் சேகரிக்கவும்",
    item2: "அங்கீகரிக்கப்பட்ட வழக்கறிஞரை நியமிக்கவும்",
    item3: "சான்றளிக்கப்பட்ட நகல்களைப் பெறுங்கள்",
    item4: "நீதிமன்ற விசாரணை தேதியை சரிபார்க்கவும்",
    completed: "முடிந்தது",
    pending: "நிலுவையில் உள்ளது"
  },
  Telugu: {
    portalTitle: "పౌర న్యాయ సహాయం & కేసు పోర్టల్",
    subTitle: "ఈ-కోర్ట్స్ పౌర ప్రాప్యత | సరళమైన భాషా న్యాయ సహాయం",
    caseLookupTitle: "మీ కేసు స్థితిని తనిఖీ చేయండి",
    casePlaceholder: "కేసు సంఖ్యను నమోదు చేయండి (ఉదా. CIV.SUIT 104/2025)",
    searchBtn: "శోధించండి",
    askTitle: "సరళమైన భాషలో న్యాయపరమైన ప్రశ్నలు అడగండి",
    askSub: "న్యాయపరమైన హక్కులు మరియు సమన్ల వివరణ పొందండి.",
    askPlaceholder: "సమన్లు వచ్చినప్పుడు నేను ఏమి చేయాలి?",
    askBtn: "సమాధానం పొందండి",
    checklistTitle: "వాది చర్యల తనిఖీ జాబితా",
    langLabel: "భాష",
    item1: "అసలు పత్రాలు మరియు గుర్తింపు కార్డులను సేకరించండి",
    item2: "న్యాయవాదిని సంప్రదించండి",
    item3: "ధృవీకరించబడిన ప్రతులను పొందండి",
    item4: "విచారణ తేదీని ధృవీకరించండి",
    completed: "పూర్తయింది",
    pending: "పెండింగ్‌లో ఉంది"
  },
  Marathi: {
    portalTitle: "नागरिक कायदेशीर मदत आणि केस पोर्टल",
    subTitle: "ई-कोर्ट्स नागरिक प्रवेश | सोप्या भाषेतील कायदेशीर मदत",
    caseLookupTitle: "तुमच्या केसची स्थिती तपासा",
    casePlaceholder: "केस क्रमांक टाका (उदा. CIV.SUIT 104/2025)",
    searchBtn: "शोधा",
    askTitle: "सोप्या भाषेत कायदेशीर प्रश्न विचारा",
    askSub: "कायदेशीर हक्क आणि कोर्ट समन्सचे सोपे स्पष्टीकरण मिळवा.",
    askPlaceholder: "कोर्ट समन्स आल्यास मी काय करावे?",
    askBtn: "उत्तर मिळवा",
    checklistTitle: "याचिकाकर्ता कृती यादी",
    langLabel: "भाषा",
    item1: "मूळ कागदपत्रे आणि ओळखपत्रे गोळा करा",
    item2: "अधिकृत वकिलांची नेमणूक करा",
    item3: "प्रमाणित प्रती मिळवा",
    item4: "सुनावणीची तारीख तपासा",
    completed: "पूर्ण",
    pending: "कार्रवाई प्रलंबित"
  },
  Bengali: {
    portalTitle: "নাগরিক আইনি সহায়তা ও কেস পোর্টাল",
    subTitle: "ই-কোর্টস নাগরিক অ্যাক্সেস | সহজ ভাষার আইনি সহায়তা",
    caseLookupTitle: "আপনার মামলার বিবরণ খুঁজুন",
    casePlaceholder: "কেস নম্বর লিখুন (যেমন CIV.SUIT 104/2025)",
    searchBtn: "অনুসন্ধান",
    askTitle: "সহজ ভাষায় আইনি প্রশ্ন জিজ্ঞাসা করুন",
    askSub: "আইনি অধিকার ও আদালতের সমনের সহজ ব্যাখ্যা পান।",
    askPlaceholder: "আদালতের সমন পেলে আমার কী করা উচিত?",
    askBtn: "উত্তর পান",
    checklistTitle: "মামলাকারীর করণীয় তালিকা",
    langLabel: "ভাষা",
    item1: "মূল দলিল ও পরিচয়পত্র সংগ্রহ করুন",
    item2: "আইনজীবী নিয়োগ করুন",
    item3: "সার্টিফাইড কপি সংগ্রহ করুন",
    item4: "শুনানির তারিখ যাচাই করুন",
    completed: "সম্পন্ন",
    pending: "বিচারাধীন"
  },
  Gujarati: {
    portalTitle: "નાગરિક કાનૂની સહાય અને કેસ પોર્ટલ",
    subTitle: "ઈ-કોર્ટ્સ નાગરિક ઍક્સેસ | સરળ ભાષામાં કાનૂની સહાય",
    caseLookupTitle: "તમારા કેસની સ્થિતિ તપાસો",
    casePlaceholder: "કેસ નંબર દાખલ કરો (જેમ કે CIV.SUIT 104/2025)",
    searchBtn: "શોધો",
    askTitle: "સરળ ભાષામાં કાનૂની પ્રશ્નો પૂછો",
    askSub: "કાનૂની અધિકારો અને કોર્ટ સમન્સની સરળ સમજ મેળવો.",
    askPlaceholder: "કોર્ટ સમન્સ મળે તો મારે શું કરવું જોઈએ?",
    askBtn: "જવાબ મેળવો",
    checklistTitle: "અરજદાર કાર્યવાહી યાદી",
    langLabel: "ભાષા",
    item1: "મૂળ દસ્તાવેજો અને ઓળખ પુરાવા એકત્રિત કરો",
    item2: "વકીલની નિમણૂક કરો",
    item3: "પ્રમાણિત નકલો મેળવો",
    item4: "સુનાવણીની તારીખ તપાસો",
    completed: "પૂર્ણ",
    pending: "કાર્યવાહી બાકી"
  }
};

/** Format a date string from Prisma into a human-readable Indian date. */
function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Not available';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

/** From a list of hearings, return the next upcoming hearing date string. */
function resolveNextHearing(hearings: any[], nextHearingFallback: string | null): string {
  if (hearings && hearings.length > 0) {
    const now = new Date();
    const upcoming = hearings
      .map((h: any) => ({ ...h, _d: new Date(h.date) }))
      .filter((h: any) => h._d >= now)
      .sort((a: any, b: any) => a._d.getTime() - b._d.getTime());

    if (upcoming.length > 0) {
      return formatDate(upcoming[0].date);
    }
  }
  if (nextHearingFallback) return formatDate(nextHearingFallback);
  return 'No upcoming hearing scheduled.';
}

export const CitizenDashboard = () => {
  const [caseNoQuery, setCaseNoQuery] = useState('');
  const [searchedCase, setSearchedCase] = useState<any>(null);
  const [caseSearchLoading, setCaseSearchLoading] = useState(false);
  const [caseSearchError, setCaseSearchError] = useState<string | null>(null);
  const [caseNotFound, setCaseNotFound] = useState(false);

  const [plainQuestion, setPlainQuestion] = useState('');
  const [plainAnswer, setPlainAnswer] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState('English');

  // Modals
  const [showLegalAidModal, setShowLegalAidModal] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);

  const t = translations[selectedLang] || translations.English;

  // ─── LIVE CASE LOOKUP ────────────────────────────────────────────────────────
  const handleLookupCase = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = caseNoQuery.trim();
    if (!query) return;

    setCaseSearchLoading(true);
    setCaseSearchError(null);
    setCaseNotFound(false);
    setSearchedCase(null);

    try {
      const results = await api.searchPublicCases(query);

      if (!Array.isArray(results) || results.length === 0) {
        setCaseNotFound(true);
        return;
      }

      const c = results[0];
      setSearchedCase({
        caseNumber: c.caseNumber,
        title: c.title,
        court: c.court || c.division || '—',
        status: c.status,
        nextHearing: resolveNextHearing(c.hearings || [], c.nextHearing),
        stage: c.priority || 'Active',
        description: c.description || null,
        judge: c.judge ? `${c.judge.name}${c.judge.designation ? `, ${c.judge.designation}` : ''}` : null,
      });
    } catch (err: any) {
      // 404 from the API means case not found (structured 404 JSON)
      if (err?.message?.includes('Case not found') || err?.message?.includes('404')) {
        setCaseNotFound(true);
      } else {
        setCaseSearchError('LIVE API ERROR — Unable to retrieve case information.');
      }
    } finally {
      setCaseSearchLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchedCase(null);
    setCaseSearchError(null);
    setCaseNotFound(false);
    setCaseNoQuery('');
  };

  // ─── PLAIN LANGUAGE AI ASSISTANT ─────────────────────────────────────────────
  // Uses GLOBAL PRECEDENT search (findSimilarCases) because the citizen portal
  // is not scoped to a specific case — no case_id is available here.
  const handleAskPlainHelp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plainQuestion.trim()) return;
    setLoading(true);
    try {
      const res = await fastApi.findSimilarCases(plainQuestion, 4);
      // Reformat similar-cases response into a plain-language answer shape
      const topExcerpts = (res.matches || [])
        .slice(0, 3)
        .map((m: any) => m.excerpt || '')
        .filter(Boolean);
      setPlainAnswer({
        answer: topExcerpts.length > 0
          ? topExcerpts.join('\n\n')
          : 'No relevant legal information found for your question.',
        sources: (res.matches || []).slice(0, 3).map((m: any) => m.case_name || m.document_name || 'Legal Reference')
      });
    } catch {
      setPlainAnswer({
        answer: "The AI Legal Assistant is currently unavailable. Please try again shortly or consult the District Legal Services Authority (DLSA) for free legal aid.",
        sources: []
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-subtle pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold theme-heading">
            {t.portalTitle}
          </h1>
          <p className="theme-subtext text-xs sm:text-sm mt-1">
            {t.subTitle}
          </p>
        </div>

        {/* Multilingual Selector Pill */}
        <div className="mt-3 sm:mt-0 flex items-center gap-2 theme-elevated px-3.5 py-2 rounded border border-subtle text-xs shadow-sm">
          <Globe className="w-4 h-4 text-amber-500" />
          <span className="font-bold theme-heading">{t.langLabel}:</span>
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="font-bold text-xs rounded px-2 py-1 cursor-pointer"
          >
            <option value="English">English</option>
            <option value="Hindi">हिंदी (Hindi)</option>
            <option value="Marathi">मराठी (Marathi)</option>
            <option value="Tamil">தமிழ் (Tamil)</option>
            <option value="Bengali">বাংলা (Bengali)</option>
            <option value="Gujarati">ગુજરાતી (Gujarati)</option>
            <option value="Telugu">తెలుగు (Telugu)</option>
          </select>
        </div>
      </div>

      {/* Citizen Power Tools Action Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setShowLegalAidModal(true)}
          className="p-4 theme-card hover:bg-slate-100 dark:hover:bg-slate-800 rounded flex items-center gap-3 text-left transition-all group cursor-pointer"
        >
          <div className="p-3 theme-elevated text-blue-500 rounded group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold theme-heading text-xs">Free Legal Aid Application</h3>
            <p className="text-[10px] theme-subtext">DLSA Section 12 Counsel Generator</p>
          </div>
        </button>

        <button
          onClick={() => setShowNoticeModal(true)}
          className="p-4 theme-card hover:bg-slate-100 dark:hover:bg-slate-800 rounded flex items-center gap-3 text-left transition-all group cursor-pointer"
        >
          <div className="p-3 theme-elevated text-blue-500 rounded group-hover:scale-105 transition-transform">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold theme-heading text-xs">Notice & Summons Decipherer</h3>
            <p className="text-[10px] theme-subtext">Plain Language Risk & Action Steps</p>
          </div>
        </button>

        <button
          onClick={() => setShowCalculatorModal(true)}
          className="p-4 theme-card hover:bg-slate-100 dark:hover:bg-slate-800 rounded flex items-center gap-3 text-left transition-all group cursor-pointer"
        >
          <div className="p-3 theme-elevated text-blue-500 rounded group-hover:scale-105 transition-transform">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold theme-heading text-xs">Court Fee & Stamp Duty Calculator</h3>
            <p className="text-[10px] theme-subtext">Ad-Valorem Filing Charge Calculator</p>
          </div>
        </button>
      </div>

      {/* Case Status Quick Lookup */}
      <div className="theme-card rounded p-6 space-y-4">
        <h2 className="text-base font-serif font-bold theme-heading">{t.caseLookupTitle}</h2>
        <form onSubmit={handleLookupCase} className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            placeholder={t.casePlaceholder}
            value={caseNoQuery}
            onChange={(e) => setCaseNoQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 text-xs rounded"
          />
          <button
            type="submit"
            disabled={caseSearchLoading || !caseNoQuery.trim()}
            className="theme-primary-btn px-6 py-2.5 text-xs flex items-center gap-2"
          >
            {caseSearchLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            {caseSearchLoading ? 'Searching...' : t.searchBtn}
          </button>
          {(searchedCase || caseNotFound || caseSearchError) && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="theme-secondary-btn px-4 py-2.5 text-xs"
            >
              Clear
            </button>
          )}
        </form>

        {/* Loading State */}
        {caseSearchLoading && (
          <div className="flex items-center gap-3 text-xs theme-subtext py-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            Searching live e-Courts database...
          </div>
        )}

        {/* Not Found State */}
        {caseNotFound && !caseSearchLoading && (
          <div className="flex items-start gap-3 p-4 theme-elevated rounded border border-subtle text-xs text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold">Case not found.</p>
              <p className="theme-subtext mt-0.5">Please verify the case number or party name and try again. Ensure you use the exact format (e.g. CIV.SUIT 104/2025).</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {caseSearchError && !caseSearchLoading && (
          <div className="flex items-start gap-3 p-4 theme-elevated rounded border border-subtle text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>{caseSearchError}</p>
          </div>
        )}

        {/* Live Result */}
        {searchedCase && !caseSearchLoading && (
          <div className="theme-elevated p-4 rounded space-y-2 border border-subtle">
            <div className="flex justify-between items-center">
              <span className="font-bold text-blue-500 text-sm">{searchedCase.caseNumber}</span>
              <span className="badge-pending px-2.5 py-1 text-xs font-bold rounded">
                {searchedCase.status}
              </span>
            </div>
            <p className="text-xs"><strong>Title:</strong> {searchedCase.title}</p>
            <p className="text-xs"><strong>Court:</strong> {searchedCase.court}</p>
            {searchedCase.judge && (
              <p className="text-xs"><strong>Presiding Officer:</strong> {searchedCase.judge}</p>
            )}
            <p className="text-xs">
              <strong>Next Hearing:</strong>{' '}
              <span className="text-amber-500 font-mono">{searchedCase.nextHearing}</span>
            </p>
            {searchedCase.description && (
              <p className="text-xs theme-card p-3 rounded border border-subtle mt-2 theme-subtext leading-relaxed">
                <strong className="theme-heading">Case Description:</strong> {searchedCase.description}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Plain Language AI Assistant with Voice Microphone Input */}
      <div className="theme-card rounded p-6 space-y-4">
        <div className="flex justify-between items-start flex-wrap gap-2">
          <div>
            <h2 className="text-base font-serif font-bold theme-heading flex items-center gap-2">
              <Bot className="w-5 h-5 text-amber-500" />
              {t.askTitle}
            </h2>
            <p className="text-xs theme-subtext mt-1">{t.askSub}</p>
          </div>

          {/* Voice Microphone Button */}
          <VoiceMicInput onTranscript={(text) => setPlainQuestion(text)} lang={selectedLang === 'Hindi' ? 'hi-IN' : 'en-IN'} />
        </div>

        <form onSubmit={handleAskPlainHelp} className="space-y-3">
          <textarea
            rows={3}
            placeholder={t.askPlaceholder}
            value={plainQuestion}
            onChange={(e) => setPlainQuestion(e.target.value)}
            className="w-full p-3.5 text-xs rounded leading-relaxed"
          />
          <button
            type="submit"
            disabled={loading}
            className="theme-primary-btn px-6 py-2.5 text-xs flex items-center gap-1.5 cursor-pointer"
          >
            {loading ? 'Asking AI Assistant...' : t.askBtn}
          </button>
        </form>

        {plainAnswer && (
          <div className="p-4 theme-elevated rounded border border-subtle text-xs theme-subtext space-y-2 leading-relaxed">
            <p className="whitespace-pre-wrap font-sans">{plainAnswer.answer}</p>
            {plainAnswer.sources && plainAnswer.sources.length > 0 && (
              <div className="text-[10px] theme-subtext pt-2 border-t border-subtle">
                <strong className="theme-heading">Legal Sources:</strong> {plainAnswer.sources.join(', ')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <FreeLegalAidModal isOpen={showLegalAidModal} onClose={() => setShowLegalAidModal(false)} />
      <NoticeDeciphererModal isOpen={showNoticeModal} onClose={() => setShowNoticeModal(false)} />
      <CourtFeeCalculatorModal isOpen={showCalculatorModal} onClose={() => setShowCalculatorModal(false)} />
    </div>
  );
};

export default CitizenDashboard;
