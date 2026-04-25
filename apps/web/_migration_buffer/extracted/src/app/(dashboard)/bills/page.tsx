'use client';

import { useState } from 'react';
import { Receipt, Plus, Calendar, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { formatVND, mockBills } from '../../data/mockData';
import { Button } from '../../_components/ui/button';

export default function BillsPage() {
  const activeBills = mockBills.filter((b) => b.isActive);
  const totalMonthly = activeBills
    .filter((b) => b.frequency === 'monthly')
    .reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hóa Đơn Định Kỳ</h1>
          <p className="text-sm text-gray-600 mt-1">Quản lý các khoản chi cố định hàng tháng</p>
        </div>
        <Button>
          <Plus size={16} className="mr-2" />
          Thêm Hóa Đơn
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Receipt size={18} className="text-amber-600" />
            <span className="text-sm font-semibold text-amber-900">Tổng hóa đơn/tháng</span>
          </div>
          <p className="text-2xl font-bold text-amber-700">{formatVND(totalMonthly)}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={18} className="text-blue-600" />
            <span className="text-sm font-semibold text-blue-900">Hóa đơn đang hoạt động</span>
          </div>
          <p className="text-2xl font-bold text-blue-700">{activeBills.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Check size={18} className="text-green-600" />
            <span className="text-sm font-semibold text-green-900">Đã thanh toán tháng này</span>
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
          {activeBills.map((bill) => (
            <motion.div
              key={bill.id}
              whileHover={{ backgroundColor: '#f9fafb' }}
              className="p-5 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Receipt size={20} className="text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{bill.name}</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-gray-500">
                      Ngày {bill.dueDay} hàng tháng
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">
                      {bill.frequency === 'monthly' ? 'Hàng tháng' : bill.frequency === 'quarterly' ? 'Hàng quý' : 'Hàng năm'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-800">{formatVND(bill.amount)}</p>
                <Button size="sm" variant="outline" className="mt-2">
                  Đánh dấu đã thanh toán
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
