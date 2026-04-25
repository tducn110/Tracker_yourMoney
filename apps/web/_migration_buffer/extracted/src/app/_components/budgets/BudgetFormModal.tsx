'use client';

/**
 * BudgetFormModal — Form tạo / chỉnh sửa ngân sách
 * Multi-select danh mục, chọn kỳ hạn, ví áp dụng
 */

import { useState, useEffect } from 'react';
import { X, Check, Info } from 'lucide-react';
import { mockCategories, formatVND, type MockBudget, type BudgetPeriod } from '@/app/data/mockData';

interface BudgetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BudgetFormData) => void;
  initialData?: MockBudget | null;
}

export interface BudgetFormData {
  name: string;
  budget_limit: number;
  period_type: BudgetPeriod;
  start_date: string;
  end_date: string;
  is_all_categories: boolean;
  category_ids: number[];
  wallet_scope: 'all' | 'specific';
}

const PERIODS: { value: BudgetPeriod; label: string }[] = [
  { value: 'weekly', label: 'Tuần' },
  { value: 'monthly', label: 'Tháng' },
  { value: 'quarterly', label: 'Quý' },
  { value: 'yearly', label: 'Năm' },
  { value: 'custom', label: 'Tùy chỉnh' },
];

const EXPENSE_CATEGORIES = mockCategories.filter((c) => c.id !== 1); // Bỏ "Thu Nhập"

// ─── Category Chip ────────────────────────────────────────────────────────────
function CategoryChip({
  cat,
  selected,
  onClick,
}: {
  cat: typeof mockCategories[0];
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12px] font-semibold transition-all ${
        selected
          ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200'
          : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
      }`}
    >
      <span>{cat.icon}</span>
      <span>{cat.name}</span>
      {selected && <Check size={11} />}
    </button>
  );
}

// ─── Auto-calculate dates ─────────────────────────────────────────────────────
function getDefaultDates(period: BudgetPeriod): { start: string; end: string } {
  const today = new Date('2026-04-22');
  const start = today.toISOString().split('T')[0];
  let end = new Date(today);
  if (period === 'weekly') end.setDate(end.getDate() + 6);
  else if (period === 'monthly') end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  else if (period === 'quarterly') end = new Date(today.getFullYear(), today.getMonth() + 3, 0);
  else if (period === 'yearly') end = new Date(today.getFullYear(), 11, 31);
  else end.setDate(end.getDate() + 29);
  return { start, end: end.toISOString().split('T')[0] };
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function BudgetFormModal({ isOpen, onClose, onSubmit, initialData }: BudgetFormModalProps) {
  const isEditing = !!initialData;

  const [name, setName] = useState('');
  const [limitInput, setLimitInput] = useState('');
  const [period, setPeriod] = useState<BudgetPeriod>('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isAllCategories, setIsAllCategories] = useState(false);
  const [selectedCats, setSelectedCats] = useState<number[]>([]);
  const [walletScope, setWalletScope] = useState<'all' | 'specific'>('all');

  // Điền dữ liệu khi edit
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setLimitInput(initialData.budget_limit.toString());
      setPeriod(initialData.period_type);
      setStartDate(initialData.start_date);
      setEndDate(initialData.end_date);
      setIsAllCategories(initialData.is_all_categories);
      setSelectedCats(initialData.categories.map((c) => c.id));
      setWalletScope(initialData.wallet_scope);
    } else {
      setName('');
      setLimitInput('');
      setPeriod('monthly');
      const dates = getDefaultDates('monthly');
      setStartDate(dates.start);
      setEndDate(dates.end);
      setIsAllCategories(false);
      setSelectedCats([]);
      setWalletScope('all');
    }
  }, [initialData, isOpen]);

  // Auto update dates when period changes (non-custom)
  useEffect(() => {
    if (period !== 'custom') {
      const dates = getDefaultDates(period);
      setStartDate(dates.start);
      setEndDate(dates.end);
    }
  }, [period]);

  const toggleCat = (id: number) => {
    setSelectedCats((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const limitNumber = parseInt(limitInput.replace(/\D/g, '')) || 0;
  const isValid = name.trim() && limitNumber > 0 && (isAllCategories || selectedCats.length > 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onSubmit({
      name: name.trim(),
      budget_limit: limitNumber,
      period_type: period,
      start_date: startDate,
      end_date: endDate,
      is_all_categories: isAllCategories,
      category_ids: selectedCats,
      wallet_scope: walletScope,
    });
    onClose();
  };

  return (
    <>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[520px] max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div>
                  <h2 className="text-[17px] font-black text-gray-900">
                    {isEditing ? 'Chỉnh Sửa Ngân Sách' : 'Tạo Ngân Sách Mới'}
                  </h2>
                  <p className="text-[12px] text-gray-500 mt-0.5">
                    {isEditing ? 'Cập nhật thông tin ngân sách' : 'Thiết lập hạn mức chi tiêu cho danh mục'}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Tên ngân sách */}
                <div>
                  <label className="block text-[12px] font-bold text-gray-700 mb-1.5">
                    Tên ngân sách
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: Ăn uống tháng 4, Cà phê tuần này..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[14px] font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  />
                </div>

                {/* Hạn mức */}
                <div>
                  <label className="block text-[12px] font-bold text-gray-700 mb-1.5">
                    Hạn mức chi tiêu
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={limitInput ? parseInt(limitInput.replace(/\D/g, '') || '0').toLocaleString('vi-VN') : ''}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '');
                        setLimitInput(raw);
                      }}
                      placeholder="0"
                      className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 text-[14px] font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-bold text-gray-400">₫</span>
                  </div>
                  {limitNumber > 0 && (
                    <p className="text-[11px] font-semibold text-blue-600 mt-1">
                      = {formatVND(limitNumber)}
                    </p>
                  )}
                </div>

                {/* Kỳ hạn */}
                <div>
                  <label className="block text-[12px] font-bold text-gray-700 mb-1.5">
                    Kỳ hạn
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {PERIODS.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setPeriod(p.value)}
                        className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all ${
                          period === p.value
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ngày bắt đầu / kết thúc */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-bold text-gray-700 mb-1.5">
                      Ngày bắt đầu
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-[13px] font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-gray-700 mb-1.5">
                      Ngày kết thúc
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-[13px] font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Danh mục */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[12px] font-bold text-gray-700">
                      Danh mục áp dụng
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div
                        onClick={() => {
                          setIsAllCategories(!isAllCategories);
                          if (!isAllCategories) setSelectedCats([]);
                        }}
                        className={`w-9 h-5 rounded-full relative transition-colors ${
                          isAllCategories ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                            isAllCategories ? 'translate-x-4' : ''
                          }`}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-gray-600">Tất cả danh mục</span>
                    </label>
                  </div>

                  {!isAllCategories && (
                    <div className="flex flex-wrap gap-2">
                      {EXPENSE_CATEGORIES.map((cat) => (
                        <CategoryChip
                          key={cat.id}
                          cat={cat}
                          selected={selectedCats.includes(cat.id)}
                          onClick={() => toggleCat(cat.id)}
                        />
                      ))}
                    </div>
                  )}

                  {isAllCategories && (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-blue-50 border border-blue-100">
                      <Info size={14} className="text-blue-500" />
                      <p className="text-[12px] font-semibold text-blue-700">
                        Ngân sách tổng — áp dụng cho tất cả giao dịch chi tiêu
                      </p>
                    </div>
                  )}
                </div>

                {/* Ví áp dụng */}
                <div>
                  <label className="block text-[12px] font-bold text-gray-700 mb-1.5">
                    Ví áp dụng
                  </label>
                  <div className="flex gap-2">
                    {(['all', 'specific'] as const).map((scope) => (
                      <button
                        key={scope}
                        type="button"
                        onClick={() => setWalletScope(scope)}
                        className={`flex-1 py-2.5 rounded-xl text-[12px] font-semibold border transition-all ${
                          walletScope === scope
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        {scope === 'all' ? 'Tất cả ví' : 'Ví cụ thể'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl border border-gray-200 text-[14px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={!isValid}
                    className="flex-1 py-3 rounded-xl text-[14px] font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: isValid ? 'linear-gradient(135deg, #4361ee, #6366f1)' : '#9ca3af' }}
                  >
                    {isEditing ? 'Cập nhật' : 'Tạo ngân sách'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}