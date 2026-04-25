'use client';

/**
 * DashboardGoalsCard — Mục tiêu tiết kiệm trong Dashboard
 * Hiện tất cả goals active + completed, compact list style.
 * No motion/react — pure CSS transitions.
 */

import { ChevronRight, Target, Plus, CheckCircle2, PauseCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGoals } from '@/_lib/hooks/finance';
import { formatCurrency, Goal } from '@finance/api-client';
import Decimal from 'decimal.js';

// ─── Goal Row ─────────────────────────────────────────────────────────────────

const statusMeta: Record<string, { label: string; bg: string; color: string; Icon: any }> = {
  active: {
    label: 'Đang chạy',
    bg: '#eff6ff',
    color: '#2563eb',
    Icon: Target,
  },
  completed: {
    label: 'Hoàn thành',
    bg: '#d1fae5',
    color: '#059669',
    Icon: CheckCircle2,
  },
  paused: {
    label: 'Tạm dừng',
    bg: '#f3f4f6',
    color: '#6b7280',
    Icon: PauseCircle,
  },
  cancelled: {
    label: 'Đã hủy',
    bg: '#fee2e2',
    color: '#ef4444',
    Icon: PauseCircle,
  }
};

function GoalRow({ goal }: { goal: Goal }) {
  const router = useRouter();
  
  const current = new Decimal(goal.currentSaved);
  const target = new Decimal(goal.targetAmount);
  const percent = target.isZero() ? 0 : Math.min(100, Math.round(current.dividedBy(target).times(100).toNumber()));
  
  const meta = statusMeta[goal.status] || statusMeta['active'];

  // Progress color
  const barColor =
    goal.status === 'completed'
      ? '#10b981'
      : percent >= 80
      ? '#8b5cf6'
      : '#4361ee';

  return (
    <div
      className="flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group"
      onClick={() => router.push('/goals')}
    >
      {/* Icon */}
      <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center text-[20px] shrink-0">
        {goal.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-[13px] font-black text-gray-900 truncate">{goal.name}</p>
          <span
            className="text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0"
            style={{ backgroundColor: meta.bg, color: meta.color }}
          >
            {meta.label}
          </span>
        </div>

        <p className="text-[10px] font-bold text-gray-400 mb-1.5">
          {formatCurrency(goal.currentSaved)} / {formatCurrency(goal.targetAmount)}
          {goal.deadline && (
            <span className="ml-1.5 text-gray-300">· {new Date(goal.deadline).toLocaleDateString('vi-VN')}</span>
          )}
        </p>

        {/* Progress */}
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${percent}%`, backgroundColor: barColor }}
          />
        </div>
      </div>

      {/* Percent */}
      <div className="shrink-0 text-right w-10">
        <p className="text-[15px] font-black leading-none" style={{ color: barColor }}>
          {percent}%
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function DashboardGoalsCard() {
  const router = useRouter();
  const { data: goalsData, isLoading } = useGoals();
  const goals = Array.isArray(goalsData) ? goalsData : [];

  return (
    <section>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
            <Target size={14} className="text-violet-600" />
          </div>
          <h2 className="text-[14px] font-black text-gray-900">Mục tiêu tiết kiệm</h2>
        </div>
        <button
          onClick={() => router.push('/goals')}
          className="flex items-center gap-1 text-[12px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
        >
          Tất cả <ChevronRight size={14} />
        </button>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Goal list */}
        <div className="p-2">
          {goals.length === 0 ? (
            <div className="py-8 text-center text-[12px] text-gray-500 font-medium">
              Chưa có mục tiêu nào.
            </div>
          ) : (
            goals.slice(0, 3).map((goal) => (
              <GoalRow key={goal.id} goal={goal} />
            ))
          )}
        </div>

        {/* Footer CTA */}
        <div className="px-4 py-3 border-t border-gray-50">
          <button
            onClick={() => router.push('/goals')}
            className="w-full flex items-center justify-center gap-2 text-[12px] font-bold text-blue-600 hover:text-blue-700 transition-colors py-1"
          >
            <Plus size={14} />
            Thêm mục tiêu mới
          </button>
        </div>
      </div>
    </section>
  );
}
