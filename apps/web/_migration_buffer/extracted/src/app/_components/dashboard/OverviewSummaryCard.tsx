'use client';

/**
 * OverviewSummaryCard — Tổng quan 3-stat: Thu nhập / Chi tiêu / Ví của tôi
 * "Ví của tôi" is clickable → /wallets
 * Removed: S2S (không có S2S)
 */

import { TrendingUp, TrendingDown, Wallet, ChevronRight, Plus } from 'lucide-react';
import { mockFinanceData, formatVND } from '@/app/data/mockData';
import { useWallet } from '@/app/context/WalletContext';
import { Link } from 'react-router';

interface StatConfig {
  icon: React.ReactNode;
  label: string;
  value: string;
  sublabel: string;
  colorText: string;
  colorBg: string;
  colorBorder: string;
  badge?: { text: string; color: string; bg: string };
  href?: string;
}

function StatCell({ icon, label, value, sublabel, colorText, colorBg, colorBorder, badge, href }: StatConfig) {
  const inner = (
    <div
      className="flex-1 p-4 rounded-2xl border transition-all duration-200"
      style={{
        backgroundColor: colorBg,
        borderColor: colorBorder,
        cursor: href ? 'pointer' : 'default',
      }}
    >
      {/* Label row */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-xl bg-white/70 flex items-center justify-center flex-shrink-0 shadow-sm">
          {icon}
        </div>
        <p className="text-[10px] font-black uppercase tracking-wider truncate" style={{ color: colorText }}>
          {label}
        </p>
        {badge && (
          <span
            className="ml-auto text-[9px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: badge.bg, color: badge.color }}
          >
            {badge.text}
          </span>
        )}
        {href && !badge && (
          <ChevronRight size={11} className="ml-auto flex-shrink-0" style={{ color: colorText }} />
        )}
      </div>

      {/* Value */}
      <p className="text-[18px] font-black leading-none truncate" style={{ color: colorText }}>
        {value}
      </p>

      {/* Sublabel */}
      <p className="text-[10px] font-bold text-gray-500 mt-1.5">{sublabel}</p>
    </div>
  );

  if (href) return <Link to={href} className="flex-1 min-w-[130px] hover:opacity-90 transition-opacity">{inner}</Link>;
  return <div className="flex-1 min-w-[130px]">{inner}</div>;
}

export function OverviewSummaryCard() {
  const { total_income, total_expense } = mockFinanceData;
  const { wallets, totalBalance } = useWallet();
  const walletCount = wallets.length;

  const stats: StatConfig[] = [
    {
      icon: <TrendingUp size={13} className="text-emerald-600" />,
      label: 'Thu nhập',
      value: formatVND(total_income),
      sublabel: 'Tháng 4/2026',
      colorText: '#059669',
      colorBg: '#ecfdf5',
      colorBorder: '#a7f3d0',
      badge: { text: '+4.0%', color: '#059669', bg: '#d1fae5' },
    },
    {
      icon: <TrendingDown size={13} className="text-red-500" />,
      label: 'Chi tiêu',
      value: formatVND(total_expense),
      sublabel: 'Tháng 4/2026',
      colorText: '#dc2626',
      colorBg: '#fef2f2',
      colorBorder: '#fecaca',
    },
    {
      icon: <Wallet size={13} className="text-blue-600" />,
      label: 'Ví của tôi',
      value: formatVND(totalBalance),
      sublabel: `${walletCount} tài khoản · Nhấn để xem`,
      colorText: '#2563eb',
      colorBg: '#eff6ff',
      colorBorder: '#bfdbfe',
      href: '/wallets',
    },
  ];

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <StatCell key={stat.label} {...stat} />
        ))}
      </div>

      {/* Quick wallet add shortcut */}
      <Link
        to="/wallets"
        className="flex items-center justify-between px-4 py-2.5 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center">
            <Wallet size={12} className="text-blue-500" />
          </div>
          <span className="text-[11px] font-black text-gray-600 group-hover:text-blue-700 transition-colors">
            Quản lý ví & tài khoản
          </span>
          <span className="text-[10px] font-bold text-gray-400">
            {wallets.map((w) => `${w.icon} ${w.name}`).slice(0, 3).join(' · ')}
            {wallets.length > 3 ? ` +${wallets.length - 3}` : ''}
          </span>
        </div>
        <div className="flex items-center gap-1 text-blue-500">
          <Plus size={11} />
          <span className="text-[10px] font-black">Thêm ví</span>
        </div>
      </Link>
    </div>
  );
}
