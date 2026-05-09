'use client';

/**
 * BudgetFormModal — Form tạo / chỉnh sửa ngân sách
 * Multi-select danh mục, chọn kỳ hạn, ví áp dụng
 * Validation real-time với hint từng field
 */

import { useState, useEffect } from 'react';
import { X, Info, AlertCircle } from 'lucide-react';
import { useCategories } from '@/_lib/hooks/finance';
import { formatVND, Category } from '@finance/api-client';

type BudgetPeriod = 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

interface BudgetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BudgetFormData) => void;
  initialData?: any;
}

export interface BudgetFormData {
  name: string;
  targetAmount: string;
  periodType: BudgetPeriod;
  startDate: string;
  endDate: string;
  isAllCategories: boolean;
  categoryIds: number[];
  walletScope: 'all' | 'specific';
}

const PERIODS: { value: BudgetPeriod; label: string }[] = [
  { value: 'weekly', label: 'Tuần' },
  { value: 'monthly', label: 'Tháng' },
  { value: 'quarterly', label: 'Quý' },
  { value: 'yearly', label: 'Năm' },
  { value: 'custom', label: 'Tùy chỉnh' },
];

// ─── Category Chip ────────────────────────────────────────────────────────────
function CategoryChip({
  cat,
  selected,
  onClick,
}: {
  cat: Category;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-bold transition-all active:scale-95"
      style={
        selected
          ? {
              backgroundColor: 'rgba(67, 97, 238, 0.125)',
              color: 'rgb(67, 97, 238)',
              border: '2px solid rgba(67, 97, 238, 0.376)',
            }
          : {
              backgroundColor: 'rgb(249, 250, 251)',
              color: 'rgb(107, 114, 128)',
              border: '1px solid rgb(229, 231, 235)',
            }
      }
    >
      <span className="text-sm">{cat.icon || '📌'}</span>
      {cat.name}
    </button>
  );
}

// ─── Auto-calculate dates ─────────────────────────────────────────────────────
function getDefaultDates(period: BudgetPeriod): { start: string; end: string } {
  const today = new Date();
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
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const apiExpenseCategories = categories.filter((c: Category) => c.type === 'expense');

  // Fallback mock categories khi backend chưa chạy / chưa có data
  const MOCK_EXPENSE_CATEGORIES: Category[] = [
    { id: 101, name: 'Ăn uống', icon: '🍜', color: '#F59E0B', type: 'expense' },
    { id: 102, name: 'Đồ uống', icon: '🧃', color: '#3B82F6', type: 'expense' },
    { id: 103, name: 'Di chuyển', icon: '🚗', color: '#EAB308', type: 'expense' },
    { id: 104, name: 'Mua sắm', icon: '🛍️', color: '#EC4899', type: 'expense' },
    { id: 105, name: 'Sức khỏe', icon: '💊', color: '#10B981', type: 'expense' },
    { id: 106, name: 'Giải trí', icon: '🎬', color: '#8B5CF6', type: 'expense' },
    { id: 107, name: 'Hóa đơn', icon: '📄', color: '#6B7280', type: 'expense' },
    { id: 108, name: 'Nhà cửa', icon: '🏠', color: '#EF4444', type: 'expense' },
    { id: 109, name: 'Giáo dục', icon: '📚', color: '#6366F1', type: 'expense' },
    { id: 110, name: 'Tiện ích', icon: '⚡', color: '#F97316', type: 'expense' },
    { id: 111, name: 'Khác', icon: '💳', color: '#14B8A6', type: 'expense' },
  ];
  const EXPENSE_CATEGORIES = apiExpenseCategories.length > 0 ? apiExpenseCategories : MOCK_EXPENSE_CATEGORIES;

  const [name, setName] = useState('');
  const [limitInput, setLimitInput] = useState('');
  const [period, setPeriod] = useState<BudgetPeriod>('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isAllCategories, setIsAllCategories] = useState(false);
  const [selectedCats, setSelectedCats] = useState<number[]>([]);
  const [walletScope, setWalletScope] = useState<'all' | 'specific'>('all');
  const [showValidationHint, setShowValidationHint] = useState(false);

  // Điền dữ liệu khi edit
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setLimitInput((initialData.targetAmount || initialData.budget_limit || 0).toString());
      setPeriod(initialData.periodType || initialData.period_type || 'monthly');
      setStartDate(initialData.startDate || initialData.start_date || '');
      setEndDate(initialData.endDate || initialData.end_date || '');
      setIsAllCategories(initialData.isAllCategories || initialData.is_all_categories || false);
      const catIds = initialData.categories
        ? initialData.categories.map((c: any) => c.id)
        : (initialData.categoryIds || []);
      setSelectedCats(catIds);
      setWalletScope(initialData.walletScope || initialData.wallet_scope || 'all');
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
    setShowValidationHint(false);
  }, [initialData, isOpen]);

  // Auto update dates when period changes (non-custom)
  useEffect(() => {
    if (period !== 'custom' && !isEditing) {
      const dates = getDefaultDates(period);
      setStartDate(dates.start);
      setEndDate(dates.end);
    }
  }, [period, isEditing]);

  const toggleCat = (id: number) => {
    setSelectedCats((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
    setShowValidationHint(false);
  };

  const limitNumber = parseInt(limitInput.replace(/\D/g, '')) || 0;

  // Validation từng điều kiện riêng để hiển thị hint
  const hasName = name.trim().length > 0;
  const hasLimit = limitNumber > 0;
  const hasCategory = isAllCategories || selectedCats.length > 0;
  const isValid = hasName && hasLimit && hasCategory;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setShowValidationHint(true);
      return;
    }
    onSubmit({
      name: name.trim(),
      targetAmount: String(limitNumber),
      periodType: period,
      startDate,
      endDate,
      isAllCategories,
      categoryIds: selectedCats,
      walletScope,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full sm:max-w-[520px] bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[92vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
          <div>
            <h2 className="text-[17px] font-black text-gray-900">
              {isEditing ? 'Chỉnh Sửa Ngân Sách' : 'Tạo Ngân Sách Mới'}
            </h2>
            <p className="text-[12px] text-gray-500 mt-0.5">
              {isEditing ? 'Cập nhật thông tin ngân sách' : 'Thiết lập hạn mức chi tiêu theo danh mục'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-5">
          {/* Tên ngân sách */}
          <div>
            <label className="block text-[12px] font-bold text-gray-700 mb-1.5">
              Tên ngân sách <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setShowValidationHint(false); }}
              placeholder="VD: Ăn uống tháng này, Cà phê tuần này..."
              className={`w-full px-4 py-3 rounded-xl border text-[14px] font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all ${
                showValidationHint && !hasName ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
            {showValidationHint && !hasName && (
              <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                <AlertCircle size={11} /> Vui lòng nhập tên ngân sách
              </p>
            )}
          </div>

          {/* Hạn mức */}
          <div>
            <label className="block text-[12px] font-bold text-gray-700 mb-1.5">
              Hạn mức chi tiêu <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={limitInput ? parseInt(limitInput || '0').toLocaleString('vi-VN') : ''}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '');
                  setLimitInput(raw);
                  setShowValidationHint(false);
                }}
                placeholder="0"
                className={`w-full px-4 py-3 pr-10 rounded-xl border text-[14px] font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all ${
                  showValidationHint && !hasLimit ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-bold text-gray-400">₫</span>
            </div>
            {limitNumber > 0 && (
              <p className="text-[11px] font-semibold text-blue-600 mt-1">
                = {formatVND(limitNumber)}
              </p>
            )}
            {showValidationHint && !hasLimit && (
              <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                <AlertCircle size={11} /> Vui lòng nhập hạn mức lớn hơn 0
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
              <div className="flex items-center gap-1.5">
                <label className="text-[12px] font-bold text-gray-700">
                  Danh mục áp dụng <span className="text-red-400">*</span>
                </label>
                {!isAllCategories && selectedCats.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                    {selectedCats.length} đã chọn
                  </span>
                )}
              </div>
              {/* Toggle "Tất cả danh mục" */}
              <button
                type="button"
                onClick={() => {
                  const next = !isAllCategories;
                  setIsAllCategories(next);
                  if (next) setSelectedCats([]);
                  setShowValidationHint(false);
                }}
                className="flex items-center gap-2 cursor-pointer"
              >
                <div
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
                <span className="text-[11px] font-semibold text-gray-600">Tất cả</span>
              </button>
            </div>

            {/* Category chips */}
            {!isAllCategories && (
              <div>
                {EXPENSE_CATEGORIES.length === 0 ? (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <Info size={14} className={categoriesLoading ? "text-blue-400 animate-pulse" : "text-gray-400"} />
                    <p className="text-[12px] font-semibold text-gray-500">
                      {categoriesLoading ? 'Đang tải danh mục...' : 'Chưa có danh mục chi tiêu nào'}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {EXPENSE_CATEGORIES.map((cat: Category) => (
                        <CategoryChip
                          key={cat.id}
                          cat={cat}
                          selected={selectedCats.includes(cat.id)}
                          onClick={() => toggleCat(cat.id)}
                        />
                      ))}
                    </div>
                    {showValidationHint && !hasCategory && (
                      <div className="mt-2 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 border border-red-100">
                        <AlertCircle size={13} className="text-red-500 shrink-0" />
                        <p className="text-[12px] font-semibold text-red-600">
                          Hãy chọn ít nhất 1 danh mục, hoặc bật "Tất cả"
                        </p>
                      </div>
                    )}

                  </>
                )}
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



          {/* Submit */}
          <div className="flex gap-3 pt-2 pb-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-[14px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className={`flex-1 py-3 rounded-xl text-[14px] font-bold text-white transition-all ${
                isValid
                  ? 'hover:opacity-90 active:scale-95'
                  : 'opacity-60 cursor-not-allowed'
              }`}
              style={{ background: 'linear-gradient(135deg, #4361ee, #6366f1)' }}
            >
              {isEditing ? 'Cập nhật' : 'Tạo ngân sách'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
