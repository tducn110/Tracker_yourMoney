'use client';

import { useMemo } from 'react';
import { ArrowRight, Receipt } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useBills } from '@/_lib/hooks/finance';
import { formatVND, Bill } from '@finance/api-client';
import { useTranslations } from '@/locales';
import { Skeleton } from '@/components/ui/skeleton';

export function UpcomingBillsCard() {
  const router = useRouter();
  const { t } = useTranslations();
  const { data: billsData, isLoading } = useBills();
  const allBills = Array.isArray(billsData) ? (billsData as Bill[]) : [];
  
  const activeBills = useMemo(() => {
    // Backend trả về isActive (boolean), không phải status (string)
    return allBills
      .filter((b) => b.isActive === true)
      .sort((a, b) => a.dueDay - b.dueDay);
  }, [allBills]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
            <Receipt size={14} className="text-amber-600" />
          </div>
          <h3 className="text-[13px] font-black text-gray-900">{t('dashboard.bills.title')}</h3>
        </div>
        <button
          onClick={() => router.push('/bills')}
          className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
        >
          {t('dashboard.bills.viewAll')} <ArrowRight size={12} />
        </button>
      </div>
      <div className="p-2 divide-y divide-gray-50/80 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2 p-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 px-1 py-2">
                <Skeleton className="h-8 w-8 rounded-xl bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-28 bg-gray-100" />
                  <Skeleton className="h-3 w-20 bg-gray-100" />
                </div>
                <Skeleton className="h-4 w-16 bg-gray-100" />
              </div>
            ))}
          </div>
        ) : activeBills.length === 0 ? (
          <div className="py-8 text-center text-[12px] text-gray-500 font-medium">
            {t('dashboard.bills.noBills')}
          </div>
        ) : (
          activeBills.slice(0, 4).map((bill) => {
            const today = new Date().getDate();
            const overdue = bill.dueDay < today;
            return (
              <div key={bill.id} className="flex items-center gap-3 px-3 py-2.5">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-[15px] shrink-0 ${
                    overdue ? 'bg-red-50' : 'bg-amber-50'
                  }`}
                >
                  {bill.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-black text-gray-900 truncate">{bill.name}</p>
                  <p
                    className={`text-[10px] font-bold ${
                      overdue ? 'text-red-500' : 'text-amber-500'
                    }`}
                  >
                    {overdue ? t('dashboard.bills.overdue') : t('dashboard.bills.monthlyDue').replace('{{day}}', bill.dueDay.toString())}
                  </p>
                </div>
                <p className="text-[12px] font-black text-gray-800 shrink-0 max-w-[85px] truncate sm:max-w-none">
                  {formatVND(bill.amount)}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
