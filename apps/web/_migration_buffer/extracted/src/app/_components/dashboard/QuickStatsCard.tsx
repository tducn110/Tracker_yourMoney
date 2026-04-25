'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import { mockS2SData, formatVND } from '@/app/data/mockData';

export function QuickStatsCard() {
  const totalExpense = mockS2SData.s2sSpent + mockS2SData.fixedExpenses.total;

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Income */}
      <div className="bg-emerald-50 rounded-xl p-3.5 border border-emerald-100">
        <div className="flex items-center gap-1.5 mb-1">
          <TrendingUp size={13} className="text-emerald-600" />
          <p className="text-[10px] font-black text-emerald-700 uppercase tracking-wide">Thu nhập</p>
        </div>
        <p className="text-[16px] font-black text-emerald-700">{formatVND(mockS2SData.monthlyIncome)}</p>
        <p className="text-[10px] font-bold text-emerald-500 mt-0.5">Tháng 4/2026</p>
      </div>

      {/* Expense */}
      <div className="bg-red-50 rounded-xl p-3.5 border border-red-100">
        <div className="flex items-center gap-1.5 mb-1">
          <TrendingDown size={13} className="text-red-500" />
          <p className="text-[10px] font-black text-red-700 uppercase tracking-wide">Chi tiêu</p>
        </div>
        <p className="text-[16px] font-black text-red-600">{formatVND(totalExpense)}</p>
        <p className="text-[10px] font-bold text-red-400 mt-0.5">Tháng 4/2026</p>
      </div>
    </div>
  );
}
