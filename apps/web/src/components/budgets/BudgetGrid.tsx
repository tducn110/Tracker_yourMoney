'use client';

/**
 * BudgetGrid — Dashboard budget section (compact mode)
 * Shows: summary banner + ONE featured budget card + Create CTA
 * Full-width, no motion/react — pure CSS transitions.
 */

import { ChevronRight, Layers, CalendarDays, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useBudgets, useBudgetSummary } from '@/_lib/hooks/use-budgets';
import { formatVND, Budget } from '@finance/api-client';
import Decimal from 'decimal.js';
import { Skeleton } from '@/components/ui/skeleton';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getProgressColor(percent: number): string {
  if (percent >= 100) return '#ef4444';
  if (percent >= 80)  return '#f59e0b';
  return '#4361ee';
}

function getStatusBadge(percent: number): { text: string; bg: string; textColor: string } {
  if (percent >= 100) return { text: 'Vượt ngân sách', bg: '#fee2e2', textColor: '#dc2626' };
  if (percent >= 80)  return { text: 'Gần hết',        bg: '#fef3c7', textColor: '#d97706' };
  if (percent >= 20)  return { text: 'Đang chạy',      bg: '#eff6ff', textColor: '#2563eb' };
  return { text: 'Mới bắt đầu', bg: '#f3f4f6', textColor: '#6b7280' };
}

const periodLabel: Record<string, string> = {
  weekly: 'Tuần', monthly: 'Tháng', quarterly: 'Quý', yearly: 'Năm', custom: 'Tùy chỉnh',
};

// ─── Summary Banner ────────────────────────────────────────────────────────────

function BudgetSummaryBanner() {
  const { data: summaryData, isLoading } = useBudgetSummary();

  if (isLoading) {
    return (
      <div className="rounded-2xl h-[200px] shadow-sm animate-pulse" style={{ background: '#1e293b' }} />
    );
  }

  if (!summaryData) {
    return (
      <div
        className="rounded-2xl p-5 shadow-sm relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #0f4c81 100%)',
        }}
      >
        <div className="flex flex-col items-center justify-center text-center min-h-[160px]">
          <p className="text-[24px] font-black text-white mb-1">0 ₫</p>
          <p className="text-[12px] font-bold text-blue-300">Chưa có ngân sách nào</p>
        </div>
      </div>
    );
  }

  const { totalLimit, totalSpent, left, percent } = summaryData;
  const numericLeft = parseFloat(left || '0');
  const isOver = percent >= 100;
  const isWarn = percent >= 80;

  const summaryColor = isOver ? '#ef4444' : isWarn ? '#f59e0b' : '#34d399';
  const statusText = isOver ? 'Vượt hạn mức!' : isWarn ? 'Sắp hết' : 'Đang tốt';
  const statusBg = isOver ? '#fee2e2' : isWarn ? '#fef3c7' : '#d1fae5';
  const statusColor = isOver ? '#dc2626' : isWarn ? '#b45309' : '#065f46';

  return (
    <div
      className="rounded-2xl p-5 shadow-sm relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #0f4c81 100%)',
      }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-0.5">
            Tổng quan ngân sách
          </p>
          <p className="text-[22px] sm:text-[28px] font-black text-white leading-none truncate">
            {formatVND(numericLeft < 0 ? '0' : left)}{' '}
            <span className="text-[12px] font-bold text-blue-300">còn lại</span>
          </p>
        </div>
        <span
          className="text-[11px] font-black px-3 py-1.5 rounded-full"
          style={{ backgroundColor: statusBg, color: statusColor }}
        >
          {statusText}
        </span>
      </div>

      {/* 2-col stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/10 rounded-xl px-4 py-3">
          <p className="text-[10px] font-bold text-blue-200 mb-1 uppercase tracking-wide">Hạn mức</p>
          <p className="text-[16px] sm:text-[20px] font-black text-white leading-none truncate">{formatVND(totalLimit)}</p>
        </div>
        <div className="bg-white/10 rounded-xl px-4 py-3">
          <p className="text-[10px] font-bold text-blue-200 mb-1 uppercase tracking-wide">Đã chi</p>
          <p
            className="text-[16px] sm:text-[20px] font-black leading-none truncate"
            style={{ color: isOver ? '#fca5a1' : isWarn ? '#fde68a' : '#6ee7b7' }}
          >
            {formatVND(totalSpent)}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between mb-1.5">
          <span className="text-[11px] font-black text-blue-200">{percent}% đã dùng</span>
          <span className="text-[11px] font-bold text-blue-300">{100 - Math.min(percent, 100)}% còn lại</span>
        </div>
        <div className="h-3 w-full bg-white/15 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${Math.min(percent, 100)}%`, backgroundColor: summaryColor }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Featured Budget Card ──────────────────────────────────────────────────────

function FeaturedBudgetCard({ budget }: { budget: Budget }) {
  const router = useRouter();
  const spent = new Decimal(budget.spent || '0');
  const target = new Decimal(budget.targetAmount);
  const left = target.minus(spent);
  const percent = target.isZero() ? 0 : spent.div(target).times(100).toDecimalPlaces(0).toNumber();
  const numericLeft = left.toNumber();

  const status = getStatusBadge(percent);
  const progressColor = getProgressColor(percent);
  const amountColor = numericLeft < 0 ? '#dc2626' : '#111827';

  const today = new Date();
  const endDate = new Date(budget.endDate);
  const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / 86_400_000));

  return (
    <div
      onClick={() => router.push(`/budgets/${budget.id}`)}
      className="group bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer flex flex-col h-full"
    >
      {/* Top row: name + status + period */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex items-center gap-1 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-[20px]">
              {budget.icon || '💰'}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3
              className="text-[16px] font-black truncate group-hover:text-blue-600 transition-colors"
              style={{ color: percent >= 100 ? '#dc2626' : '#111827' }}
            >
              {budget.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="text-[10px] font-black px-2.5 py-0.5 rounded-full"
                style={{ backgroundColor: status.bg, color: status.textColor }}
              >
                {status.text}
              </span>
              <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                <CalendarDays size={10} />
                {periodLabel[budget.periodType] || budget.periodType}
              </span>
              {daysLeft > 0 && (
                <span className="text-[10px] font-bold text-gray-400">
                  Còn {daysLeft} ngày
                </span>
              )}
            </div>
          </div>
        </div>

        {percent >= 80 && (
          <div className="shrink-0 ml-2">
            <AlertCircle
              size={18}
              style={{ color: percent >= 100 ? '#ef4444' : '#f59e0b' }}
            />
          </div>
        )}
      </div>

      {/* Amount row */}
      <div className="flex items-end justify-between mb-4 flex-1">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span
              className="text-[24px] sm:text-[32px] font-black leading-none truncate"
              style={{ color: amountColor }}
            >
              {numericLeft < 0 ? '−' : ''}{formatVND(left.abs())}
            </span>
            <span className="text-[13px] font-bold text-gray-400">còn lại</span>
          </div>
          <p className="text-[12px] font-bold text-gray-500 mt-1">
            <span style={{ color: progressColor }}>{formatVND(spent)}</span>
            {' '}/ {formatVND(budget.targetAmount)} hạn mức
          </p>
        </div>

        <div className="text-right shrink-0">
          <p
            className="text-[28px] font-black leading-none"
            style={{ color: progressColor }}
          >
            {percent}%
          </p>
          <p className="text-[12px] font-bold text-gray-400 mt-0.5">đã dùng</p>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${Math.min(percent, 100)}%`, backgroundColor: progressColor }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Create CTA ────────────────────────────────────────────────────────────────

function BudgetCreateCTA() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/budgets')}
      className="w-full h-full bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 cursor-pointer group flex flex-col items-center justify-center min-h-[160px]"
    >
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
          <Layers size={18} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
        </div>
        <div className="text-center">
          <p className="text-[15px] font-black text-gray-900 group-hover:text-blue-600 transition-colors">
            Tạo ngân sách mới
          </p>
          <p className="text-[11px] font-bold text-gray-400 mt-1">Quản lý chi tiêu thông minh</p>
        </div>
        <ChevronRight size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors mt-2" />
      </div>
    </button>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function BudgetGrid() {
  const router = useRouter();
  const { data: budgetsData, isLoading } = useBudgets();
  const budgets = budgetsData || [];

  const activeBudgets = budgets.filter((b) => b.status === 'active');
  const latestBudget = activeBudgets.length > 0 ? activeBudgets[activeBudgets.length - 1] : null;
  const hasAnyBudget = budgets.length > 0;

  return (
    <section>
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center">
            <Layers size={14} className="text-gray-400" />
          </div>
          <h2 className="text-[14px] font-black text-gray-900">Ngân sách</h2>
        </div>
        {hasAnyBudget && (
          <button
            onClick={() => router.push('/budgets')}
            className="text-[12px] font-black text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Tất cả <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* Summary Banner */}
      <BudgetSummaryBanner />

      {/* Featured Budget + CTA, or loading skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 items-stretch">
          <Skeleton className="h-[132px] rounded-2xl bg-gray-100" />
          <Skeleton className="h-[132px] rounded-2xl bg-gray-100" />
        </div>
      ) : hasAnyBudget ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 items-stretch">
          {latestBudget && <FeaturedBudgetCard budget={latestBudget} />}
          <BudgetCreateCTA />
        </div>
      ) : (
        <div className="mt-3">
          <BudgetCreateCTA />
        </div>
      )}
    </section>
  );
}
