'use client';

/**
 * Header — Finance Tracker V3
 * Converted from react-router (useLocation) to next/navigation (usePathname).
 * mockUser/mockWallets replaced with placeholders — will be wired to real API hooks.
 */

import { useState } from 'react';
import { Bell, Search, Plus, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthProvider';
import { useTranslations } from '@/locales';

// ─── Constants ────────────────────────────────────────────────────────────────

const getRouteTitles = (t: (key: string) => string): Record<string, string> => ({
  '/':             t('nav.overview'),
  '/transactions': t('nav.transactions'),
  '/budgets':      t('nav.budgets'),
  '/goals':        t('nav.goals'),
  '/bills':        t('nav.bills'),
  '/analytics':    t('nav.analytics'),
  '/settings':     t('nav.settings'),
  '/wallets':      t('nav.wallets'),
});


// ─── Icon button ──────────────────────────────────────────────────────────────

function IconButton({
  onClick,
  children,
  title,
}: {
  onClick?: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-blue-50 text-gray-500 hover:text-blue-600 flex items-center justify-center transition-all active:scale-95 shrink-0"
    >
      {children}
    </button>
  );
}

// ─── HomeGreeting ─────────────────────────────────────────────────────────────

function HomeGreeting() {
  const { t } = useTranslations();
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? t('header.greeting.morning') : hour < 18 ? t('header.greeting.afternoon') : t('header.greeting.evening');

  return (
    <div>
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
        {greeting} 👋
      </p>
      <h1 className="text-[17px] font-black text-gray-900 leading-tight">
        S2S Finance
      </h1>
    </div>
  );
}

// ─── Main Header ──────────────────────────────────────────────────────────────

interface HeaderProps {
  onQuickAddClick?: () => void;
}

export function Header({ onQuickAddClick }: HeaderProps) {
  const { t } = useTranslations();
  const { user } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();

  const isHome    = pathname === '/';
  const ROUTE_TITLES = getRouteTitles(t);
  const pageTitle = ROUTE_TITLES[pathname] ?? 'S2S Finance';

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        {/* Left: greeting or page title */}
        <div className="flex-1 min-w-0 pr-4">
          {isHome ? (
            <HomeGreeting />
          ) : (
            <h1 className="text-[17px] font-black text-gray-900 truncate">{pageTitle}</h1>
          )}
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Search toggle */}
          <IconButton onClick={() => setSearchOpen((v) => !v)} title={t('header.search.tooltip')}>
            {searchOpen ? <X size={17} /> : <Search size={17} />}
          </IconButton>

          {/* Notifications */}
          <div className="relative">
            <IconButton title={t('header.notifications')}>
              <Bell size={17} />
            </IconButton>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white pointer-events-none" />
          </div>

          {/* Quick Add */}
          <button
            onClick={onQuickAddClick}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-white text-[12px] font-black shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
            style={{ background: 'linear-gradient(135deg, #4361ee, #6366f1)' }}
          >
            <Plus size={15} />
            <span>{t('header.quickAdd')}</span>
          </button>

          {/* Avatar placeholder */}
          <button className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[11px] font-black shadow-sm shrink-0 hover:scale-105 active:scale-95 transition-all overflow-hidden">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.fullName ?? ''} className="w-full h-full object-cover" />
            ) : (
              user?.fullName?.charAt(0).toUpperCase() ?? 'U'
            )}
          </button>
        </div>
      </div>

      {/* Search dropdown */}
      <div
        className="overflow-hidden transition-all duration-200 border-t border-gray-200/50"
        style={{ maxHeight: searchOpen ? '80px' : '0px', opacity: searchOpen ? 1 : 0 }}
      >
        <div className="px-4 md:px-6 py-3 bg-white/60">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100 transition-all">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder={t('header.search.placeholder')}
              className="flex-1 bg-transparent outline-none text-[14px] text-gray-900 placeholder:text-gray-400"
              autoFocus={searchOpen}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
