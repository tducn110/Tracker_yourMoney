'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Receipt, Plus, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@finance/api-client';
import { toast } from 'sonner';
import { motion } from 'motion/react';

type TransactionType = 'income' | 'expense' | 'bill';

interface QuickInputFormProps {
  onSubmit?: (data: {
    type: TransactionType;
    amount: number;
    note: string;
    category?: string;
    date: string;
  }) => Promise<void>;
}

interface FormState {
  amount: string;
  note: string;
}

const cols = [
  {
    type: 'income' as const,
    label: 'Thu nhập',
    Icon: TrendingUp,
    accent: '#10b981',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    inputBorder: 'border-emerald-200 focus:border-emerald-400',
    btnClass: 'bg-emerald-500 hover:bg-emerald-600',
  },
  {
    type: 'expense' as const,
    label: 'Chi tiêu',
    Icon: TrendingDown,
    accent: '#ef4444',
    bg: '#fef2f2',
    border: '#fecaca',
    inputBorder: 'border-red-200 focus:border-red-400',
    btnClass: 'bg-red-500 hover:bg-red-600',
  },
  {
    type: 'bill' as const,
    label: 'Hóa đơn',
    Icon: Receipt,
    accent: '#f59e0b',
    bg: '#fffbeb',
    border: '#fde68a',
    inputBorder: 'border-amber-200 focus:border-amber-400',
    btnClass: 'bg-amber-500 hover:bg-amber-600',
  },
];

export function QuickInputForm({ onSubmit }: QuickInputFormProps) {
  const [forms, setForms] = useState<Record<TransactionType, FormState>>({
    income: { amount: '', note: '' },
    expense: { amount: '', note: '' },
    bill: { amount: '', note: '' },
  });
  const [submitting, setSubmitting] = useState<TransactionType | null>(null);

  const update = (type: TransactionType, field: keyof FormState, value: string) => {
    setForms(prev => ({ ...prev, [type]: { ...prev[type], [field]: value } }));
  };

  const handleSubmit = async (type: TransactionType) => {
    const form = forms[type];
    if (!form.amount || !form.note) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    const numAmount = parseFloat(form.amount.replace(/[^\d.]/g, ''));
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Số tiền không hợp lệ');
      return;
    }
    setSubmitting(type);
    try {
      await (onSubmit?.({ type, amount: numAmount, note: form.note, date: new Date().toISOString() }) ?? Promise.resolve());
      const label = type === 'income' ? 'Thu nhập' : type === 'bill' ? 'Hóa đơn' : 'Chi tiêu';
      toast.success(`✅ Thêm ${label}: ${form.note} — ${formatCurrency(numAmount)}`);
      setForms(prev => ({ ...prev, [type]: { amount: '', note: '' } }));
    } catch {
      toast.error('Có lỗi xảy ra');
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-50">
        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
          <Zap size={14} className="text-blue-600" />
        </div>
        <h3 className="text-[13px] font-black text-gray-900">Nhập nhanh</h3>
        <span className="text-[11px] font-bold text-gray-400 ml-1">— Thu nhập · Chi tiêu · Hóa đơn</span>
      </div>

      {/* 3-column input grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
        {cols.map(({ type, label, Icon, accent, bg, border, inputBorder, btnClass }) => (
          <motion.div
            key={type}
            whileFocus-within={{ scale: 1.01 }}
            className="p-4"
            style={{ backgroundColor: bg }}
          >
            {/* Col Header */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md flex items-center justify-center"
                style={{ backgroundColor: accent }}>
                <Icon size={12} className="text-white" />
              </div>
              <span className="text-[12px] font-black" style={{ color: accent }}>{label}</span>
            </div>

            {/* Inputs */}
            <div className="space-y-2 mb-3">
              <Input
                type="text"
                inputMode="numeric"
                value={forms[type].amount}
                onChange={e => update(type, 'amount', e.target.value)}
                placeholder="Số tiền (₫)"
                className={`h-9 text-[13px] bg-white ${inputBorder}`}
                onKeyDown={e => e.key === 'Enter' && handleSubmit(type)}
              />
              <Input
                type="text"
                value={forms[type].note}
                onChange={e => update(type, 'note', e.target.value)}
                placeholder="Ghi chú..."
                className={`h-9 text-[13px] bg-white ${inputBorder}`}
                onKeyDown={e => e.key === 'Enter' && handleSubmit(type)}
              />
            </div>

            {/* Button */}
            <button
              onClick={() => handleSubmit(type)}
              disabled={submitting === type}
              className={`w-full h-8 rounded-lg text-white text-[12px] font-black flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-60 ${btnClass}`}
            >
              {submitting === type ? (
                <span className="animate-pulse">Đang thêm...</span>
              ) : (
                <>
                  <Plus size={13} />
                  Thêm {label}
                </>
              )}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
