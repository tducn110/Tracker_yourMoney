'use client';

import { useState } from 'react';
import { Plus, X, CheckCircle2, AlertTriangle, Clock, CalendarDays, Receipt } from 'lucide-react';
import { motion } from 'motion/react';
import Decimal from 'decimal.js';
import { formatVND } from '@finance/api-client';
import type { Bill as BillType } from '@finance/api-client';

// ── Types ──────────────────────────────────────────────────────────────
export type PaymentStatus = 'paid' | 'partial' | 'pending' | 'overdue';

interface BillsViewProps {
  isLoading: boolean;
  bills: BillType[];
  totalMonthly: Decimal;
  unpaidTotal: Decimal;
  paidTotal: Decimal;
  overdueCount: number;
  onAddBill?: (data: Record<string, unknown>) => Promise<void>;
  onPayBill?: (billId: string, amount: string) => void;
  isMutating?: boolean;
}

// ── Constants ───────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  paid:    { label: 'Đã trả',   color: '#10B981', bg: '#f0fdf4', border: '#bbf7d0' },
  partial: { label: 'Trả một phần', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
  pending: { label: 'Chưa trả', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  overdue: { label: 'Quá hạn', color: '#EF4444', bg: '#fef2f2', border: '#fecaca' },
};

const ICON_OPTIONS = ['🏠', '💡', '📶', '🛡️', '🎵', '🎬', '📱', '💧', '🚗', '📺', '🏋️', '📦', '💊', '🎓', '🏦'];

const TODAY = new Date().getDate();

// ── Helpers ─────────────────────────────────────────────────────────────
function getDaysUntilDue(dueDay: number): string | null {
  const diff = dueDay - TODAY;
  if (diff < 0) return null;
  if (diff === 0) return 'Hôm nay';
  return `${diff} ngày nữa`;
}

function determineBillStatus(bill: BillType): PaymentStatus {
  // If paymentStatus from API is 'paid' or 'partial', use it
  if (bill.paymentStatus === 'paid') return 'paid';
  if (bill.paymentStatus === 'partial') return 'partial';
  // If due day has passed this month, it's overdue
  if (bill.dueDay < TODAY) return 'overdue';
  // Otherwise pending
  if (bill.paymentStatus === 'pending') return 'pending';
  return 'pending';
}

// ── Component ───────────────────────────────────────────────────────────
export function BillsView({
  isLoading,
  bills,
  totalMonthly,
  unpaidTotal,
  paidTotal,
  overdueCount,
  onAddBill,
  onPayBill,
  isMutating,
}: BillsViewProps) {
  const [showModal, setShowModal] = useState(false);
  const [newBill, setNewBill] = useState({
    name: '',
    icon: '📄',
    amount: '',
    categoryId: '1',
    dueDay: '1',
    frequency: 'monthly' as 'monthly' | 'quarterly' | 'yearly',
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddBill) return;
    await onAddBill({
      name: newBill.name,
      icon: newBill.icon,
      amount: newBill.amount.replace(/\D/g, '') || '0',
      categoryId: parseInt(newBill.categoryId) || 1,
      dueDay: parseInt(newBill.dueDay) || 1,
      frequency: newBill.frequency,
    });
    setShowModal(false);
    setNewBill({ name: '', icon: '📄', amount: '', categoryId: '1', dueDay: '1', frequency: 'monthly' });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-5 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded-xl" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-100 rounded-2xl" />
          ))}
        </div>
        <div className="space-y-2.5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-gray-100 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-6">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-black text-gray-900">Hóa Đơn Định Kỳ</h1>
          <p className="text-[12px] font-bold text-gray-400 mt-0.5">
            Quản lý chi phí cố định hàng tháng
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          disabled={isMutating}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-[13px] font-black shadow-lg shadow-amber-300/40 transition-all active:scale-95 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
        >
          <Plus size={15} />
          Thêm hóa đơn
        </button>
      </div>

      {/* ── Summary Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-amber-100 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Clock size={13} className="text-amber-500" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wide">Chưa thanh toán</p>
          </div>
          <p className="text-[18px] font-black text-amber-600">{formatVND(unpaidTotal)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-red-100 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1.5">
            <AlertTriangle size={13} className="text-red-500" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wide">Quá hạn</p>
          </div>
          <p className="text-[18px] font-black text-red-600">{overdueCount} hóa đơn</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1.5">
            <CheckCircle2 size={13} className="text-emerald-500" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wide">Đã thanh toán</p>
          </div>
          <p className="text-[18px] font-black text-emerald-600">{formatVND(paidTotal)}</p>
        </div>
      </div>

      {/* ── Overdue Alert ────────────────────────────────────────── */}
      {overdueCount > 0 && (
        <div className="bg-red-50 rounded-xl px-4 py-2.5 border border-red-200 flex items-center gap-2">
          <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
          <p className="text-[12px] font-black text-red-700">
            {overdueCount} hóa đơn đã quá hạn thanh toán — cần xử lý ngay!
          </p>
        </div>
      )}

      {/* ── Bills List ───────────────────────────────────────────── */}
      <div className="space-y-2.5">
        {bills.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <Receipt size={40} className="text-gray-300 mx-auto mb-3" />
            <h3 className="font-black text-[15px] text-gray-500 mb-1">Chưa có hóa đơn nào</h3>
            <p className="text-[12px] font-bold text-gray-400">
              Thêm hóa đơn định kỳ để bắt đầu theo dõi
            </p>
          </div>
        ) : (
          bills.map((bill: BillType) => {
            const status = determineBillStatus(bill);
            const s = STATUS_CONFIG[status];
            const daysUntil = getDaysUntilDue(bill.dueDay);
            const isPaid = status === 'paid';

            return (
              <motion.div
                key={bill.id}
                whileHover={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                className="bg-white rounded-2xl p-4 border shadow-sm transition-all"
                style={{ borderColor: status === 'overdue' ? '#fecaca' : '#f1f5f9' }}
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-[22px] flex-shrink-0"
                    style={{ backgroundColor: s.bg }}
                  >
                    {bill.icon || '📄'}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-black text-[14px] text-gray-900 truncate">{bill.name}</h3>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${status === 'overdue' ? 'animate-pulse' : ''}`}
                        style={{ backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}
                      >
                        {s.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400">
                        <CalendarDays size={10} />
                        Ngày {bill.dueDay} hàng tháng
                      </div>
                      {!isPaid && daysUntil && (
                        <span className="text-[10px] font-black text-amber-600">· {daysUntil}</span>
                      )}
                      <span className="text-[10px] font-bold text-gray-300">
                        · {bill.frequency === 'monthly' ? 'Hàng tháng' : bill.frequency === 'quarterly' ? 'Hàng quý' : 'Hàng năm'}
                      </span>
                      {bill.totalPaid && !isPaid && new Decimal(bill.totalPaid).gt(0) && (
                        <span className="text-[10px] font-bold text-blue-500">
                          · Đã trả {formatVND(bill.totalPaid)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Amount + Action */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <p className="text-[16px] font-black text-gray-900">
                      {formatVND(bill.amount)}
                    </p>
                    {!isPaid ? (
                      <button
                        onClick={() => onPayBill?.(bill.id, bill.amount)}
                        disabled={isMutating}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-black transition-all hover:shadow-sm active:scale-95 disabled:opacity-50"
                        style={{ backgroundColor: '#d1fae5', color: '#059669' }}
                      >
                        <CheckCircle2 size={13} />
                        Đã trả
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 text-[12px] font-black text-emerald-600">
                        <CheckCircle2 size={14} />
                        Đã trả
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* ── Add Modal ────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-[17px] text-gray-900">Thêm Hóa Đơn Mới 📋</h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              {/* Icon Picker */}
              <div>
                <label className="block text-[12px] font-black text-gray-600 mb-2 uppercase tracking-wide">
                  Chọn Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {ICON_OPTIONS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setNewBill({ ...newBill, icon: ic })}
                      className={`w-10 h-10 rounded-xl text-[18px] border-2 transition-all ${
                        newBill.icon === ic
                          ? 'border-amber-400 bg-amber-50 scale-110'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-[12px] font-black text-gray-600 mb-1.5 uppercase tracking-wide">
                  Tên hóa đơn
                </label>
                <input
                  type="text"
                  value={newBill.name}
                  onChange={(e) => setNewBill({ ...newBill, name: e.target.value })}
                  placeholder="Tiền điện, Internet..."
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[14px] font-bold outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 bg-gray-50 text-gray-900 transition-all"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-[12px] font-black text-gray-600 mb-1.5 uppercase tracking-wide">
                  Số tiền (₫)
                </label>
                <input
                  type="text"
                  value={newBill.amount}
                  onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
                  placeholder="350,000"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[14px] font-bold outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 bg-gray-50 text-gray-900 transition-all"
                />
              </div>

              {/* Due Day */}
              <div>
                <label className="block text-[12px] font-black text-gray-600 mb-1.5 uppercase tracking-wide">
                  Ngày đến hạn (1-31)
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={newBill.dueDay}
                  onChange={(e) => setNewBill({ ...newBill, dueDay: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[14px] font-bold outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 bg-gray-50 text-gray-900 transition-all"
                />
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-[12px] font-black text-gray-600 mb-1.5 uppercase tracking-wide">
                  Tần suất
                </label>
                <div className="flex gap-2">
                  {(['monthly', 'quarterly', 'yearly'] as const).map((freq) => (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => setNewBill({ ...newBill, frequency: freq })}
                      className={`flex-1 py-2.5 rounded-xl text-[12px] font-black border-2 transition-all ${
                        newBill.frequency === freq
                          ? 'border-amber-400 bg-amber-50 text-amber-700'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {freq === 'monthly' ? 'Hàng tháng' : freq === 'quarterly' ? 'Hàng quý' : 'Hàng năm'}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isMutating}
                className="w-full py-3.5 rounded-xl text-white font-black text-[14px] shadow-lg shadow-amber-300/40 transition-all active:scale-[0.98] disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
              >
                Thêm Hóa Đơn
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
