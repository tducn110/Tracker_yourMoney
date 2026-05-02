'use client';

/**
 * Sidebar — Finance Tracker V3
 * Desktop sidebar (collapsible) + Mobile bottom nav.
 * Converted from react-router to next/navigation.
 */

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  ListOrdered,
  Receipt,
  Target,
  Settings,
  BarChart3,
  PiggyBank,
  Wallet,
} from 'lucide-react';

import { SidebarLogo } from './sidebar/SidebarLogo';
import { SidebarNavItem } from './sidebar/SidebarNavItem';
import { SidebarUserCard } from './sidebar/SidebarUserCard';

import { useTranslations } from '@/locales';

// ─── Nav config ───────────────────────────────────────────────────────────────

export const getNavItems = (t: (key: string) => string) => [
  { path: '/',             icon: LayoutDashboard, label: t('nav.overview'),  exact: true,  color: '#4361ee' },
  { path: '/transactions', icon: ListOrdered,      label: t('nav.transactions'),  exact: false, color: '#10b981' },
  { path: '/wallets',      icon: Wallet,           label: t('nav.wallets'),    exact: false, color: '#f59e0b' },
  { path: '/budgets',      icon: PiggyBank,        label: t('nav.budgets'),  exact: false, color: '#8b5cf6' },
  { path: '/goals',        icon: Target,           label: t('nav.goals'),   exact: false, color: '#06b6d4' },
  { path: '/bills',        icon: Receipt,          label: t('nav.bills'),   exact: false, color: '#ef4444' },
  { path: '/analytics',   icon: BarChart3,         label: t('nav.analytics'),  exact: false, color: '#0ea5e9' },
  { path: '/settings',    icon: Settings,           label: t('nav.settings'),   exact: false, color: '#6b7280' },
];

// ─── Desktop Sidebar ──────────────────────────────────────────────────────────

export function Sidebar() {
  const { t } = useTranslations();
  const [open, setOpen] = useState(true);
  const pathname = usePathname();

  const isActive = (path: string, exact?: boolean) =>
    exact ? pathname === path : pathname.startsWith(path);

  const navItems = getNavItems(t);

  return (
    <aside
      className={`
        fixed top-0 left-0 h-full z-50 flex flex-col bg-[#0f172a] border-r border-white/5
        transition-all duration-300 ease-in-out shadow-2xl
        ${open ? 'w-[240px]' : 'w-[72px]'}
        hidden md:flex
      `}
    >
      {/* Logo + collapse button */}
      <SidebarLogo open={open} onToggle={() => setOpen(!open)} />

      {/* Navigation links */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <SidebarNavItem
            key={item.path}
            path={item.path}
            icon={item.icon}
            label={item.label}
            color={item.color}
            isActive={isActive(item.path, item.exact)}
            sidebarOpen={open}
          />
        ))}
      </nav>

      {/* User card + logout */}
      <SidebarUserCard open={open} />
    </aside>
  );
}

// ─── Mobile Bottom Nav ─────────────────────────────────────────────────────────

export function MobileBottomNav() {
  const { t } = useTranslations();
  const pathname = usePathname();
  const navItems = getNavItems(t);
  const mobileItems = navItems.slice(0, 5);

  const isActive = (path: string, exact?: boolean) =>
    exact ? pathname === path : pathname.startsWith(path);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-gray-200/80 shadow-2xl">
      <div className="flex items-center justify-around px-2 py-2">
        {mobileItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path, item.exact);
          return (
            <Link
              key={item.path}
              href={item.path}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all active:scale-95"
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${active ? 'shadow-md' : ''}`}
                style={active ? { backgroundColor: item.color + '20' } : {}}
              >
                <Icon size={18} style={{ color: active ? item.color : '#94a3b8' }} />
              </div>
              <span
                className="text-[10px] font-black"
                style={{ color: active ? item.color : '#94a3b8' }}
              >
                {item.label.split(' ')[0]}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}