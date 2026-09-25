import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

// Layout
import { DashboardLayout } from '@/components/layout/DashboardLayout';

// Public & Core Pages (Eagerly Loaded)
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';

// Role Portals (Eagerly Loaded)
import { JudgeDashboard } from '@/pages/judge/JudgeDashboard';
import { CaseManagement } from '@/pages/judge/CaseManagement';
import { LawyerDashboard } from '@/pages/lawyer/LawyerDashboard';
import { StaffDashboard } from '@/pages/staff/StaffDashboard';
import { CitizenDashboard } from '@/pages/citizen/CitizenDashboard';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { CaseWorkspacePage } from '@/pages/cases/CaseWorkspacePage';
import { HackathonDemoPage } from '@/pages/demo/HackathonDemoPage';

// Lazy-Loaded Heavy Feature Pages (Phase 19.1 Bundle Optimization)
const SummonsNoticeGeneratorPage = lazy(() => import('@/pages/staff/SummonsNoticeGeneratorPage'));
const CheckCaseStatusPage = lazy(() => import('@/pages/citizen/CheckCaseStatusPage'));
const ViewCauseListsPage = lazy(() => import('@/pages/citizen/ViewCauseListsPage'));
const DownloadOrdersPage = lazy(() => import('@/pages/citizen/DownloadOrdersPage'));
const PayCourtFeesPage = lazy(() => import('@/pages/citizen/PayCourtFeesPage'));
const EfilingPortalPage = lazy(() => import('@/pages/citizen/EfilingPortalPage'));
const CitizenPortal = lazy(() => import('@/pages/citizen/CitizenPortal'));
const NationalJudicialStatsPage = lazy(() => import('@/pages/citizen/NationalJudicialStatsPage'));

const UserManagementPage = lazy(() => import('@/pages/admin/UserManagementPage'));
const AdminAnalyticsPage = lazy(() => import('@/pages/admin/AdminAnalyticsPage'));
const BenchAllocationPage = lazy(() => import('@/pages/admin/BenchAllocationPage'));
const SystemHealth = lazy(() => import('@/pages/admin/SystemHealth').then((m) => ({ default: m.SystemHealth })));

const CaseAnalyzer = lazy(() => import('@/pages/ai/CaseAnalyzer'));
const CaseSummarizer = lazy(() => import('@/pages/ai/CaseSummarizer'));
const SimilarCaseFinder = lazy(() => import('@/pages/ai/SimilarCaseFinder'));
const LegalAssistant = lazy(() => import('@/pages/ai/LegalAssistant'));
const LegalResearchEngine = lazy(() => import('@/pages/ai/LegalResearchEngine'));
const HearingScheduler = lazy(() => import('@/pages/ai/HearingScheduler'));
const DraftGenerator = lazy(() => import('@/pages/ai/DraftGenerator'));
const MultilingualTranslator = lazy(() => import('@/pages/ai/MultilingualTranslator'));
const EvidenceOrganizer = lazy(() => import('@/pages/ai/EvidenceOrganizer'));
const AuditLogsViewer = lazy(() => import('@/pages/ai/AuditLogsViewer'));

const LoadingFallback = () => (
  <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2 min-h-[400px]">
    <Loader2 className="w-6 h-6 animate-spin text-[#C9A24B]" />
    <span>Loading Judicial Intelligence Module...</span>
  </div>
);

function App() {
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Landing & Login */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Dashboard Layout Shell */}
          <Route element={<DashboardLayout />}>
            {/* Interactive Hackathon Demo Route */}
            <Route path="/demo" element={<HackathonDemoPage />} />
            {/* Unified Case Workspace Route */}
            <Route path="/workspace/:caseId" element={<CaseWorkspacePage />} />
            <Route path="/workspace" element={<CaseWorkspacePage />} />

            {/* Judge Portal */}
            <Route path="/judge/dashboard" element={<JudgeDashboard />} />
            <Route path="/judge/cases" element={<CaseManagement />} />
            <Route path="/judge/cases/:id" element={<CaseWorkspacePage />} />
            <Route path="/judge/analytics" element={<JudgeDashboard />} />

            {/* Lawyer Portal */}
            <Route path="/lawyer/dashboard" element={<LawyerDashboard />} />
            <Route path="/lawyer/cases" element={<CaseManagement />} />
            <Route path="/lawyer/cases/:id" element={<CaseWorkspacePage />} />

            {/* Court Staff Portal */}
            <Route path="/staff/dashboard" element={<StaffDashboard />} />
            <Route path="/staff/notices" element={<SummonsNoticeGeneratorPage />} />

            {/* Litigant Citizen Self-Help Portal */}
            <Route path="/citizen/portal" element={<CitizenPortal />} />
            <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
            <Route path="/citizen/case-status" element={<CheckCaseStatusPage />} />
            <Route path="/citizen/cause-lists" element={<ViewCauseListsPage />} />
            <Route path="/citizen/download-orders" element={<DownloadOrdersPage />} />
            <Route path="/citizen/pay-fees" element={<PayCourtFeesPage />} />
            <Route path="/citizen/efiling" element={<EfilingPortalPage />} />

            {/* System Admin Portal */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/cases" element={<CaseManagement />} />
            <Route path="/admin/cases/:id" element={<CaseWorkspacePage />} />
            <Route path="/admin/users" element={<UserManagementPage />} />
            <Route path="/admin/allocations" element={<BenchAllocationPage />} />
            <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
            <Route path="/admin/system-health" element={<SystemHealth />} />
            <Route path="/admin/njdg" element={<NationalJudicialStatsPage />} />

            {/* 15 Core AI Feature Tools */}
            <Route path="/ai/analyzer" element={<CaseAnalyzer />} />
            <Route path="/ai/summarizer" element={<CaseSummarizer />} />
            <Route path="/ai/similar-cases" element={<SimilarCaseFinder />} />
            <Route path="/ai/assistant" element={<LegalAssistant />} />
            <Route path="/ai/research" element={<LegalResearchEngine />} />
            <Route path="/ai/scheduler" element={<HearingScheduler />} />
            <Route path="/ai/drafts" element={<DraftGenerator />} />
            <Route path="/ai/translator" element={<MultilingualTranslator />} />
            <Route path="/ai/evidence" element={<EvidenceOrganizer />} />
            <Route path="/audit" element={<AuditLogsViewer />} />

            {/* Fallback settings */}
            <Route path="/settings" element={<JudgeDashboard />} />
          </Route>

          {/* Fallback Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

export default App;
