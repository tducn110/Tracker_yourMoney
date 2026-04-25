'use client';

/**
 * S2S Hero Section — Antigravity V1.2 (Light Navy)
 * Migrated to Next.js App Router
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, ChevronDown, Info, TrendingDown, Flame } from 'lucide-react';
import {
  formatVND,
  mockS2SData,
  mockS2SByPeriod,
  type S2SPeriod,
  type S2SStatus,
} from '@/app/data/mockData';

// ─── SVG Ring ────────────────────────────────────────────────────────────────
function S2SRing({
  percent,
  size = 108,
  status,
}: {
  percent: number;
  size?: number;
  status: S2SStatus;
}) {
  const sw = 9;
  const r = (size - sw * 2) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(percent, 100) / 100) * circ;

  const ringColor =
    status === 'danger' ? '#ef4444' : status === 'warning' ? '#f59e0b' : '#10b981';

  return (
    <div className="relative flex items-center justify-center flex-shrink-0">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(67,97,238,0.1)" strokeWidth={sw} />
        <motion.circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: [0.34, 1.56, 0.64, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: 'spring' }}
          className="text-[20px] font-black leading-none"
          style={{ color: ringColor }}
        >
          {percent}%
        </motion.span>
        <span className="text-[8px] font-semibold mt-0.5 text-blue-500/70">đã dùng</span>
      </div>
    </div>
  );
}

// ─── Formula Pill ─────────────────────────────────────────────────────────────
function Pill({ label, sub, accent }: { label: string; sub: string; accent?: boolean }) {
  return (
    <div
      className="flex flex-col items-center px-2.5 py-1.5 rounded-lg"
      style={{
        backgroundColor: accent ? 'rgba(16,185,129,0.1)' : 'rgba(67,97,238,0.08)',
        border: `1px solid ${accent ? 'rgba(16,185,129,0.25)' : 'rgba(67,97,238,0.15)'}`,
        minWidth: 58,
      }}
    >
      <span
        className="text-[10px] font-bold"
        style={{ color: accent ? '#059669' : '#4361ee' }}
      >
        {label}
      </span>
      <span className="text-[8px] font-semibold mt-0.5 text-blue-500/60">{sub}</span>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
interface S2SHeroSectionProps {
  data?: typeof mockS2SData;
}

export function S2SHeroSection({ data = mockS2SData }: S2SHeroSectionProps) {
  const [period, setPeriod] = useState<S2SPeriod>('month');
  const [showBreakdown, setShowBreakdown] = useState(false);

  const periodData = mockS2SByPeriod[period];
  const { s2sRemaining, s2sSpent, s2sBudget, usagePercent, status } = periodData;

  const periodLabel = {
    today: 'Hôm nay',
    week: 'Tuần này',
    month: 'Tháng này',
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl p-6 shadow-sm"
      style={{
        background: 'linear-gradient(135deg, #f0f4ff 0%, #e8eeff 100%)',
        border: '1.5px solid rgba(67,97,238,0.15)',
      }}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} className="text-blue-600" />
          <h3 className="font-bold text-[15px] text-blue-900">Khoảng Chi Tiêu An Toàn</h3>
        </div>
        <div className="flex items-center gap-2">
          {(['month', 'week', 'today'] as S2SPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
              style={{
                backgroundColor: period === p ? 'rgba(67,97,238,0.15)' : 'transparent',
                color: period === p ? '#4361ee' : '#64748b',
              }}
            >
              {periodLabel[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Body */}
      <div className="flex items-center gap-8">
        {/* Left - Amount + Status */}
        <div className="flex-1">
          <div className="flex items-baseline gap-2 mb-2">
            <motion.h2
              key={s2sRemaining}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-[42px] font-black leading-none"
              style={{
                color: status === 'danger' ? '#ef4444' : status === 'warning' ? '#f59e0b' : '#10b981',
              }}
            >
              {formatVND(s2sRemaining)}
            </motion.h2>
            <span className="text-[16px] font-medium text-blue-600/70">còn lại</span>
          </div>

          {/* Status Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg mb-4"
            style={{
              backgroundColor: status === 'danger' ? 'rgba(239,68,68,0.1)' : status === 'warning' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
              border: `1px solid ${status === 'danger' ? 'rgba(239,68,68,0.3)' : status === 'warning' ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)'}`,
            }}
          >
            {status === 'safe' && <span className="text-emerald-600">✓</span>}
            {status === 'warning' && <Flame size={14} className="text-amber-600" />}
            {status === 'danger' && <TrendingDown size={14} className="text-red-600" />}
            <span
              className="text-[12px] font-bold"
              style={{
                color: status === 'danger' ? '#dc2626' : status === 'warning' ? '#d97706' : '#059669',
              }}
            >
              {status === 'safe' ? 'Ngân sách an toàn' : status === 'warning' ? 'Cảnh báo vượt ngân sách' : 'Vượt ngân sách!'}
            </span>
          </div>

          {/* Formula Pills */}
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="flex items-center gap-2 text-[12px] font-medium text-blue-600 hover:text-blue-700"
          >
            <Info size={14} />
            <span>{showBreakdown ? 'Ẩn' : 'Xem'} chi tiết tính toán</span>
            <ChevronDown size={14} className={`transition-transform ${showBreakdown ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showBreakdown && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 mt-3 flex-wrap"
              >
                <Pill label={formatVND(data.monthlyIncome)} sub="Thu nhập" />
                <span className="text-blue-500/50 font-bold">−</span>
                <Pill label={formatVND(s2sSpent)} sub="Đã chi" />
                <span className="text-blue-500/50 font-bold">−</span>
                <Pill label={formatVND(data.fixedExpenses.total)} sub="Chi cố định" />
                <span className="text-blue-500/50 font-bold">−</span>
                <Pill label={formatVND(data.savingsCommitment.total)} sub="Tiết kiệm" />
                <span className="text-blue-500/50 font-bold">=</span>
                <Pill label={formatVND(s2sBudget)} sub="Ngân sách" accent />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right - Ring Chart */}
        <S2SRing percent={usagePercent} status={status} />
      </div>
    </motion.section>
  );
}
