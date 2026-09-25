import {
  LayoutDashboard,
  FolderOpen,
  FileSearch,
  BookOpen,
  Clock,
  Calendar,
  Bell,
  Settings,
  BarChart3,
  Scale,
  Users,
  Briefcase,
  FileText,
  Search,
  CalendarPlus,
  Globe,
  FileCode,
  ShieldCheck,
  FolderKanban,
  HelpCircle,
  Building,
  Download,
  CreditCard,
  FilePlus,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  section?: 'WORKSPACE' | 'LEGAL RESEARCH' | 'DECISIONS' | 'SYSTEM';
  badge?: number;
}

export const judgeNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Bench Dashboard', icon: LayoutDashboard, path: '/judge/dashboard', section: 'WORKSPACE' },
  { id: 'cases', label: 'Case Vault', icon: FolderOpen, path: '/judge/cases', section: 'WORKSPACE' },
  
  { id: 'assistant', label: 'Unified AI Assistant', icon: Sparkles, path: '/ai/assistant', section: 'LEGAL RESEARCH' },
  { id: 'research', label: 'Legal Research Engine', icon: BookOpen, path: '/ai/research', section: 'LEGAL RESEARCH' },
  { id: 'similar-cases', label: 'Precedent Finder', icon: FileSearch, path: '/ai/similar-cases', section: 'LEGAL RESEARCH' },
  { id: 'analyzer', label: 'Document Analysis', icon: FileText, path: '/ai/analyzer', section: 'LEGAL RESEARCH' },
  { id: 'translator', label: 'Multilingual Translation', icon: Globe, path: '/ai/translator', section: 'LEGAL RESEARCH' },
  
  { id: 'drafts', label: 'Draft Order Generator', icon: FileCode, path: '/ai/drafts', section: 'DECISIONS' },
  { id: 'evidence', label: 'Bench Evidence Notes', icon: FolderKanban, path: '/ai/evidence', section: 'DECISIONS' },
];

export const lawyerNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Lawyer Workbench', icon: LayoutDashboard, path: '/lawyer/dashboard', section: 'WORKSPACE' },
  { id: 'my-cases', label: 'My Cases', icon: Briefcase, path: '/lawyer/cases', section: 'WORKSPACE' },
  
  { id: 'assistant', label: 'Unified AI Assistant', icon: Sparkles, path: '/ai/assistant', section: 'LEGAL RESEARCH' },
  { id: 'research', label: 'Legal Research Engine', icon: BookOpen, path: '/ai/research', section: 'LEGAL RESEARCH' },
  { id: 'similar-cases', label: 'Precedent Search', icon: FileSearch, path: '/ai/similar-cases', section: 'LEGAL RESEARCH' },
  { id: 'analyzer', label: 'Document Analysis', icon: FileText, path: '/ai/analyzer', section: 'LEGAL RESEARCH' },
  
  { id: 'drafts', label: 'Pleadings & Drafts', icon: FileCode, path: '/ai/drafts', section: 'DECISIONS' },
  { id: 'translator', label: 'Translation Service', icon: Globe, path: '/ai/translator', section: 'DECISIONS' },
];

export const staffNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Staff Console', icon: LayoutDashboard, path: '/staff/dashboard', section: 'WORKSPACE' },
  { id: 'cases', label: 'Case Filings', icon: FolderOpen, path: '/judge/cases', section: 'WORKSPACE' },
  { id: 'scheduler', label: 'Courtroom Allocations', icon: CalendarPlus, path: '/admin/allocations', section: 'WORKSPACE' },
  { id: 'assistant', label: 'Unified AI Assistant', icon: Sparkles, path: '/ai/assistant', section: 'DECISIONS' },
  { id: 'drafts', label: 'Summons & Notices', icon: FileCode, path: '/staff/notices', section: 'DECISIONS' },
  { id: 'evidence', label: 'Evidence Indexer', icon: FolderKanban, path: '/ai/evidence', section: 'DECISIONS' },
];

export const citizenNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Public Portal', icon: HelpCircle, path: '/citizen/dashboard', section: 'WORKSPACE' },
  { id: 'case-status', label: 'Case Status Lookup', icon: Search, path: '/citizen/case-status', section: 'WORKSPACE' },
  { id: 'cause-lists', label: 'Cause Lists', icon: Calendar, path: '/citizen/cause-lists', section: 'WORKSPACE' },
  { id: 'download-orders', label: 'Court Orders & Judgments', icon: Download, path: '/citizen/download-orders', section: 'WORKSPACE' },
  { id: 'pay-fees', label: 'Court Fees Payment', icon: CreditCard, path: '/citizen/pay-fees', section: 'WORKSPACE' },
  { id: 'efiling', label: 'e-Filing Portal', icon: FilePlus, path: '/citizen/efiling', section: 'WORKSPACE' },
  { id: 'assistant', label: 'Unified AI Legal Guide', icon: Sparkles, path: '/ai/assistant', section: 'LEGAL RESEARCH' },
  { id: 'translator', label: 'Multilingual Information', icon: Globe, path: '/ai/translator', section: 'LEGAL RESEARCH' },
];

export const adminNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Admin Console', icon: LayoutDashboard, path: '/admin/dashboard', section: 'WORKSPACE' },
  { id: 'users', label: 'User & Role Management', icon: Users, path: '/admin/users', section: 'WORKSPACE' },
  { id: 'allocations', label: 'Bench Allocation', icon: Building, path: '/admin/allocations', section: 'WORKSPACE' },
  { id: 'cases', label: 'All Cases Registry', icon: FolderOpen, path: '/admin/cases', section: 'WORKSPACE' },
  { id: 'analytics', label: 'System Analytics', icon: BarChart3, path: '/admin/analytics', section: 'SYSTEM' },
  { id: 'njdg', label: 'National Judicial Data', icon: BarChart3, path: '/admin/njdg', section: 'SYSTEM' },
  { id: 'audit', label: 'System Audit Trail', icon: ShieldCheck, path: '/audit', section: 'SYSTEM' },
];

export function getNavItems(role: string): NavItem[] {
  const normalized = (role || 'judge').toLowerCase();
  switch (normalized) {
    case 'judge':
      return judgeNavItems;
    case 'lawyer':
      return lawyerNavItems;
    case 'court_staff':
    case 'staff':
      return staffNavItems;
    case 'citizen':
      return citizenNavItems;
    case 'admin':
      return adminNavItems;
    default:
      return judgeNavItems;
  }
}
