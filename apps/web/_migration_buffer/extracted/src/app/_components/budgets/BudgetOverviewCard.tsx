'use client';

/**
 * BudgetOverviewCard — Budget-First Dashboard Hero
 * No motion/react — CSS transitions only
 */

import { TrendingUp, TrendingDown, ArrowRight, PiggyBank } from 'lucide-react';
import { mockBudgetSummary, mockBudgets, formatVND } from '@/app/data/mockData';
import { useNavigate } from 'react-router';

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function BudgetProgressBar({ percent, size = 'md' }: { percent: number; size?: 'sm' | 'md' }) {
  const clamped = Math.min(percent, 100);
  const color =
    percent >= 100 ? '#ef4444'
    : percent >= 80 ? '#f59e0b'
    : percent >= 40 ? '#4361ee'
    : '#6b7280';

  return (
    <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${size === 'sm' ? 'h-1.5' : 'h-2.5'}`}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${clamped}%`, backgroundColor: color }}
      />
    </div>
  );
}

// ─── Mini Budget Row ─────────────────────────────────────────────────────────
function MiniBudgetRow({ budget }: { budget: typeof mockBudgets[0] }) {
  const colorClass =
    budget.percent >= 100 ? 'text-red-600 bg-red-50'
    : budget.percent >= 80 ? 'text-amber-600 bg-amber-50'
    : 'text-blue-600 bg-blue-50';

  return (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[14px] ${colorClass}`}>
        {budget.categories[0]?.icon ?? '📊'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[12px] font-semibold text-gray-700 truncate">{budget.name}</span>
          <span className="text-[11px] font-bold ml-2 flex-shrink-0" style={{
            color: budget.percent >= 100 ? '#ef4444' : budget.percent >= 80 ? '#f59e0b' : '#4361ee'
          }}>
            {budget.percent}%
          </span>
        </div>
        <BudgetProgressBar percent={budget.percent} size="sm" />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface BudgetOverviewCardProps {
  data?: typeof mockBudgetSummary;
}

export function BudgetOverviewCard({ data = mockBudgetSummary }: BudgetOverviewCardProps) {
  const navigate = useNavigate();
  const { totalLimit, totalSpent, left, percent } = data;
  const isOverBudget = percent >= 100;

  return (
    <div className="rounded-xl p-4 shadow-sm bg-white border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <PiggyBank size={14} className="text-blue-600" />
          </div>
          <h3 className="font-black text-[13px] text-gray-900">Ngân sách</h3>
        </div>
        <button
          onClick={() => navigate('/budgets')}
          className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
        >
          Chi tiết <ArrowRight size={12} />
        </button>
      </div>

      {/* Amount */}
      <div className="mb-3">
        <div className="flex items-baseline gap-2 mb-1.5">
          <h2
            className="text-[28px] font-black leading-none"
            style={{ color: isOverBudget ? '#ef4444' : '#10b981' }}
          >
            {left < 0 ? '-' : ''}{formatVND(Math.abs(left))}
          </h2>
          <span className="text-[13px] font-bold text-gray-500">còn lại</span>
        </div>

        <BudgetProgressBar percent={percent} />

        <div className="flex justify-between text-[11px] font-semibold text-gray-500 mt-1.5">
          <span>{formatVND(totalSpent)} / {formatVND(totalLimit)}</span>
          <span className={percent >= 100 ? 'text-red-600' : percent >= 80 ? 'text-amber-600' : 'text-blue-600'}>
            {percent}%
          </span>
        </div>
      </div>

      {/* Status Badge */}
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold"
        style={{
          backgroundColor: isOverBudget ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
          color: isOverBudget ? '#dc2626' : '#059669',
          border: `1px solid ${isOverBudget ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
        }}
      >
        {isOverBudget ? <TrendingDown size={11} /> : <TrendingUp size={11} />}
        {isOverBudget ? 'Vượt ngân sách' : 'An toàn'}
      </div>
    </div>
  );
}
