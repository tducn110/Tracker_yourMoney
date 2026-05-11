'use client';

import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { useBudgetSummary } from '@/_lib/hooks/use-budgets';
import { formatVND } from '@finance/api-client';
import Decimal from 'decimal.js';
import { useTranslations } from '@/locales';

export function QuickStatsCard() {
  const { t } = useTranslations();
  const { data: budgetData, isLoading } = useBudgetSummary();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 flex items-center justify-center min-h-[80px]">
          <Loader2 size={16} className="text-gray-300 animate-spin" />
        </div>
        <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 flex items-center justify-center min-h-[80px]">
          <Loader2 size={16} className="text-gray-300 animate-spin" />
        </div>
      </div>
    );
  }

  const income = new Decimal(budgetData?.totalIncome || 0).toNumber();
  const expense = new Decimal(budgetData?.totalSpent || 0).toNumber();

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Income */}
      <div className="bg-emerald-50 rounded-xl p-3.5 border border-emerald-100">
        <div className="flex items-center gap-1.5 mb-1">
          <TrendingUp size={13} className="text-emerald-600" />
          <p className="text-[10px] font-black text-emerald-700 uppercase tracking-wide">{t('dashboard.overview.income')}</p>
        </div>
        <p className="text-[16px] font-black text-emerald-700">{formatVND(income)}</p>
        <p className="text-[10px] font-bold text-emerald-500 mt-0.5">{t('dashboard.overview.thisMonth')}</p>
      </div>

      {/* Expense */}
      <div className="bg-red-50 rounded-xl p-3.5 border border-red-100">
        <div className="flex items-center gap-1.5 mb-1">
          <TrendingDown size={13} className="text-red-500" />
          <p className="text-[10px] font-black text-red-700 uppercase tracking-wide">{t('dashboard.overview.expense')}</p>
        </div>
        <p className="text-[16px] font-black text-red-600">{formatVND(expense)}</p>
        <p className="text-[10px] font-bold text-red-400 mt-0.5">{t('dashboard.overview.thisMonth')}</p>
      </div>
    </div>
  );
}
