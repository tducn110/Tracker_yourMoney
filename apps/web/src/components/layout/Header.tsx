'use client';

/**
 * Header — Finance Tracker V3
 * Converted from react-router (useLocation) to next/navigation (usePathname).
 * mockUser/mockWallets replaced with placeholders — will be wired to real API hooks.
 */

import { useState } from 'react';
import { Bell, Plus } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthProvider';
import { useTranslations } from '@/locales';
import { useUnreadCount, useNotifications, useMarkRead, useMarkAllRead } from '@/_lib/hooks/finance';

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


// ─── HomeGreeting ─────────────────────────────────────────────────────────────

function HomeGreeting() {
  const { t } = useTranslations();
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? t('header.greeting.morning') : hour < 18 ? t('header.greeting.afternoon') : t('header.greeting.evening');

  return (
    <div>
      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
        {greeting} 👋
      </p>
      <h1 className="text-[17px] font-black text-gray-900 leading-tight">
        Finance Tracker
      </h1>
    </div>
  );
}

// ─── Notification Bell ────────────────────────────────────────────────────────

function NotificationBell() {
  const { t } = useTranslations();
  const { data: unread = 0 } = useUnreadCount();
  const { data: notifs = [] } = useNotifications();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();
  const [open, setOpen] = useState(false);

  const unreadNotifs = notifs.filter((n: any) => !n.isRead);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Thông báo"
        className="relative w-9 h-9 rounded-xl bg-gray-100 hover:bg-blue-50 text-gray-500 hover:text-blue-600 flex items-center justify-center transition-all active:scale-95 shrink-0"
      >
        <Bell size={17} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-50" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 max-h-[400px] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <p className="text-[13px] font-black text-gray-800">Thông báo</p>
              {unreadNotifs.length > 0 && (
                <button
                  onClick={() => markAllRead.mutate()}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700"
                >
                  Đánh dấu đã đọc
                </button>
              )}
            </div>
            <div className="overflow-y-auto flex-1">
              {unreadNotifs.length === 0 ? (
                <div className="py-10 text-center">
                  <Bell size={28} className="text-gray-200 mx-auto mb-2" />
                  <p className="text-[12px] font-bold text-gray-400">Không có thông báo mới</p>
                </div>
              ) : (
                unreadNotifs.slice(0, 10).map((n: any) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      markRead.mutate(String(n.id));
                      if (n.actionUrl) window.location.href = n.actionUrl;
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50/50 border-b border-gray-50 last:border-0 transition-colors flex items-start gap-3"
                  >
                    <span className="text-lg shrink-0 mt-0.5">{n.icon || '🔔'}</span>
                    <div className="min-w-0">
                      <p className="text-[12px] font-bold text-gray-800 truncate">{n.title}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {new Date(n.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
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
  const pathname = usePathname();

  const isHome    = pathname === '/';
  const ROUTE_TITLES = getRouteTitles(t);
  const pageTitle = ROUTE_TITLES[pathname] ?? 'Finance Tracker';

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
          {/* Notifications */}
          <NotificationBell />

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
          <button aria-label={user?.fullName ?? 'Tài khoản'} className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[11px] font-black shadow-sm shrink-0 hover:scale-105 active:scale-95 transition-all overflow-hidden">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.fullName ?? ''} className="w-full h-full object-cover" />
            ) : (
              user?.fullName?.charAt(0).toUpperCase() ?? 'U'
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
