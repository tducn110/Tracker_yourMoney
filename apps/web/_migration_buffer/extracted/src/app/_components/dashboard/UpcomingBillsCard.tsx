'use client';

import { ArrowRight, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router';
import { mockBills, formatVND } from '@/app/data/mockData';

export function UpcomingBillsCard() {
  const navigate = useNavigate();
  const pendingBills = mockBills.filter(b => b.status !== 'paid');

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
            <Receipt size={14} className="text-amber-600" />
          </div>
          <h3 className="text-[13px] font-black text-gray-900">Hóa đơn sắp tới</h3>
        </div>
        <button
          onClick={() => navigate('/bills')}
          className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
        >
          Xem hết <ArrowRight size={12} />
        </button>
      </div>
      <div className="p-2 divide-y divide-gray-50/80">
        {pendingBills.slice(0, 4).map((bill) => (
          <div key={bill.id} className="flex items-center gap-3 px-3 py-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-[15px] flex-shrink-0 ${
                bill.status === 'overdue' ? 'bg-red-50' : 'bg-amber-50'
              }`}
            >
              {bill.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-black text-gray-900 truncate">{bill.name}</p>
              <p
                className={`text-[10px] font-bold ${
                  bill.status === 'overdue' ? 'text-red-500' : 'text-amber-500'
                }`}
              >
                {bill.status === 'overdue' ? '🚨 Quá hạn' : `Ngày ${bill.due_day} hàng tháng`}
              </p>
            </div>
            <p className="text-[12px] font-black text-gray-800 flex-shrink-0">
              {formatVND(bill.amount)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
