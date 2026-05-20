'use client';

/**
 * DashboardGoalsCard — Mục tiêu tiết kiệm trong Dashboard
 * Hiện tất cả goals active + completed, compact list style.
 * No motion/react — pure CSS transitions.
 */

import { ChevronRight, Target, Plus, CheckCircle2, PauseCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGoals } from '@/_lib/hooks/finance';
import { formatVND, Goal } from '@finance/api-client';
import Decimal from 'decimal.js';
import { useTranslations } from '@/locales';
import { Skeleton } from '@/components/ui/skeleton';

// ─── Goal Row ─────────────────────────────────────────────────────────────────

function GoalRow({ goal }: { goal: Goal }) {
  const router = useRouter();
  const { t } = useTranslations();

  const getStatusMeta = (status: string) => {
    const meta: Record<string, { label: string; bg: string; color: string; Icon: any }> = {
      active: {
        label: t('dashboard.goals.status.active'),
        bg: '#eff6ff',
        color: '#2563eb',
        Icon: Target,
      },
      completed: {
        label: t('dashboard.goals.status.completed'),
        bg: '#d1fae5',
        color: '#059669',
        Icon: CheckCircle2,
      },
      paused: {
        label: t('dashboard.goals.status.paused'),
        bg: '#f3f4f6',
        color: '#6b7280',
        Icon: PauseCircle,
      },
      cancelled: {
        label: t('dashboard.goals.status.cancelled'),
        bg: '#fee2e2',
        color: '#ef4444',
        Icon: PauseCircle,
      }
    };
    return meta[status] || meta['active'];
  };

  const current = new Decimal(goal.currentSaved);
  const target = new Decimal(goal.targetAmount);
  const percent = target.isZero() ? 0 : Math.min(100, Math.round(current.dividedBy(target).times(100).toNumber()));
  
  const meta = getStatusMeta(goal.status);

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

        <p className="text-[10px] font-bold text-gray-400 mb-1.5 truncate">
          {formatVND(goal.currentSaved)} / {formatVND(goal.targetAmount)}
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
  const { t } = useTranslations();
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
          <h2 className="text-[14px] font-black text-gray-900">{t('dashboard.goals.savingsGoals')}</h2>
        </div>
        <button
          onClick={() => router.push('/goals')}
          className="flex items-center gap-1 text-[12px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
        >
          {t('dashboard.goals.viewAll')} <ChevronRight size={14} />
        </button>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Goal list */}
        <div className="p-2">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3 px-2 py-2">
                  <Skeleton className="h-11 w-11 rounded-xl bg-gray-100" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-36 bg-gray-100" />
                    <Skeleton className="h-3 w-48 bg-gray-100" />
                    <Skeleton className="h-1.5 w-full bg-gray-100" />
                  </div>
                  <Skeleton className="h-4 w-9 bg-gray-100" />
                </div>
              ))}
            </div>
          ) : goals.length === 0 ? (
            <div className="py-8 text-center text-[12px] text-gray-500 font-medium">
              {t('dashboard.goals.noGoals')}
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
            {t('dashboard.goals.addNew')}
          </button>
        </div>
      </div>
    </section>
  );
}
