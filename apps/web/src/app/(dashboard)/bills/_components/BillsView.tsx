'use client';

import { Receipt, Plus, Calendar, Check, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/_components/ui/button';
import { formatCurrency, Bill } from '@finance/api-client';
import Decimal from 'decimal.js';

interface BillsViewProps {
  isLoading: boolean;
  activeBills: Bill[];
  totalMonthly: Decimal;
  onAddBill?: (data: Record<string, unknown>) => void;
  onPayBill?: (billId: string, amount: string) => void;
  isMutating?: boolean;
}

export function BillsView({ isLoading, activeBills, totalMonthly, onAddBill, onPayBill, isMutating }: BillsViewProps) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hóa Đơn Định Kỳ</h1>
          <p className="text-sm text-gray-600 mt-1">
            Quản lý các khoản chi cố định hàng tháng
          </p>
        </div>
        <Button
          onClick={() => onAddBill?.({})}
          disabled={isMutating}
          className="bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 hover:border-blue-300 shadow-sm rounded-xl font-black text-[13px] px-5 transition-all"
        >
          <Plus size={16} className="mr-2 text-blue-600" />
          Thêm Hóa Đơn
        </Button>
      </div>

      {isLoading ? (
        <div className="py-16 flex flex-col items-center gap-3 text-center">
          <Loader2 size={24} className="text-blue-400 animate-spin" />
          <p className="text-[13px] font-black text-gray-400">
            Đang tải dữ liệu...
          </p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-linear-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Receipt size={18} className="text-amber-600" />
                <span className="text-sm font-semibold text-amber-900">
                  Tổng hóa đơn/tháng
                </span>
              </div>
              <p className="text-2xl font-bold text-amber-700">
                {formatCurrency(totalMonthly.toNumber(), "vi-VN")}
              </p>
            </div>
            <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={18} className="text-blue-600" />
                <span className="text-sm font-semibold text-blue-900">
                  Hóa đơn đang hoạt động
                </span>
              </div>
              <p className="text-2xl font-bold text-blue-700">
                {activeBills.length}
              </p>
            </div>
            <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Check size={18} className="text-green-600" />
                <span className="text-sm font-semibold text-green-900">
                  Đã thanh toán tháng này
                </span>
              </div>
              <p className="text-2xl font-bold text-green-700">0</p>
            </div>
          </div>

          {/* Bills List */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-bold text-gray-800">Danh sách hóa đơn</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {activeBills.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">
                  Chưa có hóa đơn nào đang hoạt động.
                </div>
              ) : (
                activeBills.map((bill: Bill) => {
                  const amount = new Decimal(bill.amount || 0).toNumber();
                  return (
                    <motion.div
                      key={bill.id}
                      whileHover={{ backgroundColor: '#f9fafb' }}
                      className="p-5 flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-xl">
                          {bill.icon || (
                            <Receipt size={20} className="text-amber-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {bill.name}
                          </h3>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-gray-500">
                              Ngày {bill.dueDay} hàng tháng
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-medium capitalize">
                              {bill.frequency === 'monthly'
                                ? 'Hàng tháng'
                                : bill.frequency}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-800">
                          {formatCurrency(amount, "vi-VN")}
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={isMutating}
                          onClick={(e) => {
                            e.stopPropagation();
                            onPayBill?.(bill.id, bill.amount);
                          }}
                          className="mt-2 h-8 rounded-lg bg-emerald-50/50 text-emerald-600 border border-emerald-100/50 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 shadow-xs transition-all font-black text-[11px] uppercase tracking-tight group"
                        >
                          <Check
                            size={12}
                            className="mr-1 group-hover:scale-110 transition-transform"
                          />
                          Đánh dấu đã thanh toán
                        </Button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
