import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, ChevronLeft, ChevronRight, LogOut, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { getNavItems, type NavItem } from '@/data/navigation';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = getNavItems(user?.role || 'judge');

  // Group items by section
  const sections: { name: string; items: NavItem[] }[] = [];
  navItems.forEach((item) => {
    const secName = item.section || 'WORKSPACE';
    let sec = sections.find((s) => s.name === secName);
    if (!sec) {
      sec = { name: secName, items: [] };
      sections.push(sec);
    }
    sec.items.push(item);
  });

  const handleLogout = () => {
    logout();
    navigate('/');
    onMobileClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onMobileClose}
            className="fixed inset-0 bg-stone-900/40 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed left-0 top-0 h-screen flex flex-col theme-sidebar z-40 transition-all duration-200 shadow-xs',
          collapsed ? 'w-16' : 'w-64',
          mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-subtle shrink-0 theme-elevated">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-sm theme-primary-btn flex items-center justify-center font-bold shrink-0">
              <Scale className="w-4 h-4 text-white" />
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="min-w-0">
                <span className="text-sm font-bold tracking-tight block leading-none font-serif theme-heading">
                  LEXORA
                </span>
                <span className="text-[9px] font-mono uppercase block mt-1 tracking-wider font-semibold theme-subtext">
                  Judicial Workstation
                </span>
              </div>
            )}
          </div>
          {mobileOpen && (
            <button
              onClick={onMobileClose}
              className="p-1 rounded hover:opacity-80 lg:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Section */}
        <nav id="tour-sidebar-services" className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {sections.map((sec) => (
            <div key={sec.name} className="space-y-1">
              {(!collapsed || mobileOpen) && (
                <p className="px-3 text-[10px] font-mono font-semibold uppercase tracking-wider mb-1 theme-subtext">
                  {sec.name}
                </p>
              )}
              {sec.items.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.path}
                  onClick={onMobileClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2.5 px-3 py-1.5 rounded-sm text-xs font-medium transition-colors',
                      isActive
                        ? 'sidebar-nav-active'
                        : 'sidebar-nav-item',
                      collapsed && !mobileOpen && 'justify-center px-2'
                    )
                  }
                  title={collapsed && !mobileOpen ? item.label : undefined}
                >
                  <item.icon className="w-4 h-4 shrink-0 opacity-70" />
                  {(!collapsed || mobileOpen) && (
                    <span className="truncate flex-1">{item.label}</span>
                  )}
                  {(!collapsed || mobileOpen) && item.badge && (
                    <span className="px-1.5 py-0.2 rounded-sm badge-pending text-[10px] font-mono font-semibold">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* User Footer */}
        <div className="p-2.5 border-t border-subtle shrink-0 theme-elevated">
          {(!collapsed || mobileOpen) && user && (
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-sm theme-card border border-subtle mb-1.5">
              <div className="w-6 h-6 rounded-sm theme-primary-btn text-white flex items-center justify-center text-xs font-bold shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate theme-heading">{user.name}</p>
                <p className="text-[10px] font-mono capitalize truncate font-semibold theme-subtext">{user.role}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={cn(
              'flex items-center gap-2 px-2.5 py-1.5 rounded-sm text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 w-full transition-colors cursor-pointer',
              collapsed && !mobileOpen && 'justify-center px-2'
            )}
            title={collapsed && !mobileOpen ? 'Logout' : undefined}
          >
            <LogOut className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            {(!collapsed || mobileOpen) && <span className="text-rose-600 dark:text-rose-400">Logout</span>}
          </button>
        </div>

        {/* Collapse Toggle Button */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex absolute -right-3 top-16 w-5 h-5 rounded-full theme-card items-center justify-center hover:opacity-80 transition-colors z-50 cursor-pointer shadow-xs"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>
    </>
  );
}

export default Sidebar;
