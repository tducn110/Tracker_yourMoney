'use client';

import { CalendarDays } from 'lucide-react';
import { mockS2SData, formatVND } from '@/app/data/mockData';

export function FixedExpensesCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center">
            <CalendarDays size={14} className="text-gray-600" />
          </div>
          <h3 className="text-[13px] font-black text-gray-900">Chi phí cố định (Antigravity)</h3>
        </div>
        <span className="text-[12px] font-black text-gray-700">
          {formatVND(mockS2SData.fixedExpenses.total)}
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-0 divide-y divide-x divide-gray-50">
        {mockS2SData.fixedExpenses.breakdown.map((item, i) => (
          <div key={i} className="flex items-center gap-2.5 p-3.5">
            <span className="text-[18px] flex-shrink-0">{item.icon}</span>
            <div className="min-w-0">
              <p className="text-[11px] font-black text-gray-700 truncate">{item.name}</p>
              <p className="text-[12px] font-black text-gray-900">{formatVND(item.amount)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
