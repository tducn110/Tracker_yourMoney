'use client';

/**
 * Header — Finance Tracker V3
 * - HomeGreeting: clickable wallet area opens multi-wallet selector panel
 * - No motion/react — pure CSS transitions
 */

import { useState, useRef, useEffect } from 'react';
import { Bell, Search, Plus, X, ChevronDown, Check, Wallet } from 'lucide-react';
import {
  mockUser,
  getGreeting,
  formatVND,
  getTotalWalletBalance,
  getDefaultWallet,
  mockWallets,
  type MockWallet,
} from '@/app/data/mockData';
import { useLocation } from 'react-router';

// ─── Constants ────────────────────────────────────────────────────────────────

const ROUTE_TITLES: Record<string, string> = {
  '/':             'Tổng Quan',
  '/transactions': 'Giao Dịch',
  '/budgets':      'Ngân Sách',
  '/goals':        'Mục Tiêu',
  '/bills':        'Hóa Đơn',
  '/analytics':    'Phân Tích',
  '/settings':     'Cài Đặt',
};

// ─── Wallet Selector Panel ────────────────────────────────────────────────────

interface WalletSelectorPanelProps {
  wallets: MockWallet[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onClose: () => void;
}

function WalletSelectorPanel({ wallets, selected, onToggle, onClose }: WalletSelectorPanelProps) {
  const visibleTotal = getTotalWalletBalance(
    wallets.filter((w) => selected.has(w.id))
  );

  return (
    <div className="absolute top-full left-0 mt-2 w-[300px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2">
          <Wallet size={14} className="text-blue-600" />
          <p className="text-[13px] font-black text-gray-900">Chọn ví hiển thị</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors active:scale-95"
        >
          <X size={13} className="text-gray-500" />
        </button>
      </div>

      {/* Wallet list */}
      <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto">
        {wallets.map((wallet) => {
          const isSel = selected.has(wallet.id);
          return (
            <button
              key={wallet.id}
              onClick={() => onToggle(wallet.id)}
              className="w-full flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-gray-50 active:scale-[0.98]"
            >
              {/* Wallet icon */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                style={{ backgroundColor: `${wallet.colorHex}20` }}
              >
                {wallet.icon}
              </div>

              {/* Info */}
              <div className="flex-1 text-left min-w-0">
                <p className="text-[13px] font-black text-gray-900 truncate">{wallet.name}</p>
                <p className="text-[11px] font-bold text-gray-400">
                  {formatVND(wallet.balance)}
                </p>
              </div>

              {/* Checkbox */}
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-150"
                style={{
                  backgroundColor: isSel ? wallet.colorHex : 'transparent',
                  border: isSel ? 'none' : '2px solid #d1d5db',
                }}
              >
                {isSel && <Check size={11} className="text-white" strokeWidth={3} />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Panel footer — total of selected */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-between">
        <p className="text-[11px] font-bold text-gray-500">
          {selected.size}/{wallets.length} ví được chọn
        </p>
        <p className="text-[13px] font-black text-blue-600">{formatVND(visibleTotal)}</p>
      </div>
    </div>
  );
}

// ─── HomeGreeting ─────────────────────────────────────────────────────────────

function HomeGreeting() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedWallets, setSelectedWallets] = useState<Set<string>>(
    new Set(mockWallets.map((w) => w.id))
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // Close panel on outside click
  useEffect(() => {
    if (!panelOpen) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setPanelOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [panelOpen]);

  const visibleWallets = mockWallets.filter((w) => selectedWallets.has(w.id));
  const totalBalance   = getTotalWalletBalance(visibleWallets);
  const defaultWallet  = getDefaultWallet(mockWallets);

  const toggleWallet = (id: string) => {
    setSelectedWallets((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id); // keep at least 1 selected
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const walletLabel =
    selectedWallets.size === mockWallets.length
      ? 'Tất cả ví'
      : `${selectedWallets.size} ví`;

  return (
    <div>
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
        {getGreeting()} 👋
      </p>
      <h1 className="text-[17px] font-black text-gray-900 leading-tight">
        {mockUser.full_name}
      </h1>

      {/* Interactive balance + wallet pill */}
      <div ref={containerRef} className="relative flex items-center gap-2 mt-1">
        <span className="text-[14px] font-black text-gray-700">
          {formatVND(totalBalance)}
        </span>
        <span className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0" />

        {/* Wallet pill — click to open panel */}
        <button
          onClick={() => setPanelOpen((v) => !v)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all hover:shadow-sm active:scale-95"
          style={{
            backgroundColor: `${defaultWallet.colorHex}14`,
            borderColor: panelOpen ? defaultWallet.colorHex : `${defaultWallet.colorHex}40`,
          }}
        >
          <span className="text-[12px]">{defaultWallet.icon}</span>
          <span
            className="text-[11px] font-bold"
            style={{ color: defaultWallet.colorHex }}
          >
            {walletLabel}
          </span>
          <ChevronDown
            size={10}
            className={`transition-transform duration-200 ${panelOpen ? 'rotate-180' : ''}`}
            style={{ color: defaultWallet.colorHex }}
          />
        </button>

        {/* Dropdown panel */}
        {panelOpen && (
          <WalletSelectorPanel
            wallets={mockWallets}
            selected={selectedWallets}
            onToggle={toggleWallet}
            onClose={() => setPanelOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

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
      className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-blue-50 text-gray-500 hover:text-blue-600 flex items-center justify-center transition-all active:scale-95 flex-shrink-0"
    >
      {children}
    </button>
  );
}

// ─── Main Header ──────────────────────────────────────────────────────────────

interface HeaderProps {
  onQuickAddClick?: () => void;
}

export function Header({ onQuickAddClick }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

  const isHome    = location.pathname === '/';
  const pageTitle = ROUTE_TITLES[location.pathname] ?? 'S2S Finance';

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
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Search toggle */}
          <IconButton onClick={() => setSearchOpen((v) => !v)} title="Tìm kiếm">
            {searchOpen ? <X size={17} /> : <Search size={17} />}
          </IconButton>

          {/* Notifications */}
          <div className="relative">
            <IconButton title="Thông báo">
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
            <span>Thêm nhanh</span>
          </button>

          {/* Avatar */}
          <button className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[11px] font-black shadow-sm flex-shrink-0 hover:scale-105 active:scale-95 transition-all">
            {mockUser.avatar}
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
            <Search size={16} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Tìm kiếm giao dịch, mục tiêu, hóa đơn..."
              className="flex-1 bg-transparent outline-none text-[14px] text-gray-900 placeholder:text-gray-400"
              autoFocus={searchOpen}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
