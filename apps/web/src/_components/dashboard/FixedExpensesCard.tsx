'use client';

import { CalendarDays, Loader2 } from 'lucide-react';
import { useBills } from '@/_lib/hooks/finance';
import { formatCurrency, Bill } from '@finance/api-client';
import Decimal from 'decimal.js';
import { useTranslations } from '@/locales';

export function FixedExpensesCard() {
  const { data: apiBills = [], isLoading } = useBills();
  const t = useTranslations();
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[100px] flex items-center justify-center">
        <Loader2 size={24} className="text-gray-300 animate-spin" />
      </div>
    );
  }

  const activeBills = apiBills.filter((b: Bill) => b.status === 'active');
  const totalMonthly = activeBills.reduce((sum: Decimal, b: Bill) => sum.plus(new Decimal(b.amount || 0)), new Decimal(0));

  if (activeBills.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center">
            <CalendarDays size={14} className="text-gray-600" />
          </div>
          <h3 className="text-[13px] font-black text-gray-900">{t('dashboard.fixedExpenses.title')}</h3>
        </div>
        <span className="text-[12px] font-black text-gray-700">
          {formatCurrency(totalMonthly.toNumber())}
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-0 divide-y divide-x divide-gray-50">
        {activeBills.map((item: Bill) => (
          <div key={item.id} className="flex items-center gap-2.5 p-3.5">
            <span className="text-[18px] shrink-0">{item.icon || '🧾'}</span>
            <div className="min-w-0">
              <p className="text-[11px] font-black text-gray-700 truncate">{item.name}</p>
              <p className="text-[12px] font-black text-gray-900">{formatCurrency(new Decimal(item.amount || 0).toNumber())}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
