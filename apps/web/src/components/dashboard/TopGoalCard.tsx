'use client';

/**
 * TopGoalCard — Top active savings goal (dashboard widget)
 * Section header "Mục tiêu" + one prominent goal card.
 * No motion/react — CSS transitions only.
 */

import { ChevronRight, Target, TrendingUp, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGoals } from '@/_lib/hooks/finance';
import { formatVND, Goal } from '@finance/api-client';
import Decimal from 'decimal.js';
import { useTranslations } from '@/locales';

export function TopGoalCard() {
  const { t } = useTranslations();
  const router = useRouter();
  const { data: goals = [], isLoading } = useGoals();
  
  const topGoal = goals.find((g: Goal) => g.status === 'active');

  if (isLoading) {
    return (
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
              <Target size={14} className="text-purple-600" />
            </div>
            <h2 className="text-[14px] font-black text-gray-900">{t('dashboard.goals.title')}</h2>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm min-h-[160px] flex items-center justify-center">
          <Loader2 size={24} className="text-gray-300 animate-spin" />
        </div>
      </section>
    );
  }

  if (!topGoal) return null;

  const targetAmount = new Decimal(topGoal.targetAmount || 0).toNumber();
  const currentSaved = new Decimal(topGoal.currentSaved || 0).toNumber();
  const monthlyContribution = new Decimal(topGoal.monthlyContribution || 0).toNumber();

  const percent = targetAmount > 0 
    ? Math.min(100, Math.round((currentSaved / targetAmount) * 100))
    : 0;
  const remaining = Math.max(0, targetAmount - currentSaved);

  return (
    <section>
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
            <Target size={14} className="text-purple-600" />
          </div>
          <h2 className="text-[14px] font-black text-gray-900">{t('dashboard.goals.title')}</h2>
        </div>
        <button
          onClick={() => router.push('/goals')}
          className="flex items-center gap-1 text-[12px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
        >
          {t('dashboard.goals.viewAll')} <ChevronRight size={14} />
        </button>
      </div>

      {/* Goal card */}
      <div
        className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 cursor-pointer p-5"
        onClick={() => router.push('/goals')}
      >
        {/* Top row */}
        <div className="flex items-start gap-4 mb-4">
          {/* Goal icon */}
          <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-[28px] shrink-0">
            {topGoal.icon || '🎯'}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-[16px] font-black text-gray-900 truncate leading-tight">
              {topGoal.name}
            </h3>
            <p className="text-[12px] font-bold text-gray-400 mt-0.5">
              {t('dashboard.goals.deadline')}: {topGoal.deadline || t('dashboard.goals.none')}
            </p>
            {monthlyContribution > 0 && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <TrendingUp size={11} className="text-purple-500" />
                <span className="text-[11px] font-bold text-purple-600">
                  +{formatVND(monthlyContribution)}{t('dashboard.goals.perMonth')}
                </span>
              </div>
            )}
          </div>

          {/* Percentage */}
          <div className="shrink-0 text-right">
            <p className="text-[28px] font-black text-purple-600 leading-none">{percent}%</p>
            <p className="text-[10px] font-bold text-gray-400 mt-0.5">{t('dashboard.goals.completed')}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-linear-to-r from-purple-500 to-indigo-500 transition-all duration-700"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Amount row */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-400 mb-0.5">{t('dashboard.goals.saved')}</p>
            <p className="text-[18px] font-black text-gray-900 leading-none">
              {formatVND(currentSaved)}
            </p>
          </div>
          <div className="w-px h-8 bg-gray-100 shrink-0" />
          <div className="text-center">
            <p className="text-[11px] font-bold text-gray-400 mb-0.5">{t('dashboard.goals.target')}</p>
            <p className="text-[18px] font-black text-gray-700 leading-none">
              {formatVND(targetAmount)}
            </p>
          </div>
          <div className="w-px h-8 bg-gray-100 shrink-0" />
          <div className="text-right">
            <p className="text-[11px] font-bold text-gray-400 mb-0.5">{t('dashboard.goals.remaining')}</p>
            <p className="text-[18px] font-black text-purple-600 leading-none">
              {formatVND(remaining)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
