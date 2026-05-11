'use client';

/**
 * MoneyLoverQuickInput — Full-card quick entry (gradient style)
 * - Separate categories for income vs expense
 * - No motion/react — CSS transitions only
 */

import { useState } from 'react';
import {
  ShoppingBag, Coffee, Car, Film, MoreHorizontal,
  Home, Zap, Heart, Book, Phone, TrendingUp, TrendingDown, Plus,
  Briefcase, Gift, Laptop, Handshake, ShoppingCart,
} from 'lucide-react';
import { formatVND } from '@finance/api-client';
import { toast } from 'sonner';

type TransactionType = 'expense' | 'income';

interface Category {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
}

const expenseCategories: Category[] = [
  { id: 'food',          name: 'Ăn uống',   icon: Coffee,        color: '#f59e0b' },
  { id: 'shopping',      name: 'Mua sắm',   icon: ShoppingBag,   color: '#ec4899' },
  { id: 'transport',     name: 'Di chuyển', icon: Car,           color: '#3b82f6' },
  { id: 'entertainment', name: 'Giải trí',  icon: Film,          color: '#8b5cf6' },
  { id: 'home',          name: 'Nhà cửa',   icon: Home,          color: '#06b6d4' },
  { id: 'utilities',     name: 'Tiện ích',  icon: Zap,           color: '#f97316' },
  { id: 'health',        name: 'Sức khoẻ',  icon: Heart,         color: '#ef4444' },
  { id: 'education',     name: 'Giáo dục',  icon: Book,          color: '#6366f1' },
  { id: 'phone',         name: 'Điện thoại', icon: Phone,        color: '#14b8a6' },
  { id: 'other',         name: 'Khác',      icon: MoreHorizontal, color: '#64748b' },
];

const incomeCategories: Category[] = [
  { id: 'salary',     name: 'Lương',       icon: Briefcase,     color: '#10b981' },
  { id: 'bonus',      name: 'Thưởng',      icon: Gift,          color: '#f59e0b' },
  { id: 'freelance',  name: 'Freelance',   icon: Laptop,        color: '#6366f1' },
  { id: 'investment', name: 'Đầu tư',      icon: TrendingUp,    color: '#4361ee' },
  { id: 'business',   name: 'Kinh doanh',  icon: Briefcase,     color: '#8b5cf6' },
  { id: 'selling',    name: 'Bán hàng',    icon: ShoppingCart,  color: '#ec4899' },
  { id: 'loan_back',  name: 'Cho vay trả', icon: Handshake,     color: '#06b6d4' },
  { id: 'other_in',   name: 'Khác',        icon: MoreHorizontal, color: '#64748b' },
];

const quickAmounts = [500_000, 1_000_000, 5_000_000];

export function MoneyLoverQuickInput() {
  const [type, setType]                 = useState<TransactionType>('expense');
  const [amount, setAmount]             = useState('');
  const [selectedExpCat, setExpCat]     = useState(expenseCategories[0].id);
  const [selectedIncCat, setIncCat]     = useState(incomeCategories[0].id);
  const [note, setNote]                 = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cats            = type === 'expense' ? expenseCategories : incomeCategories;
  const selectedCatId   = type === 'expense' ? selectedExpCat : selectedIncCat;
  const setSelectedCat  = type === 'expense' ? setExpCat : setIncCat;
  const selectedCat     = cats.find((c) => c.id === selectedCatId) ?? cats[0];

  const formatNumberInput = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';
    return new Intl.NumberFormat('vi-VN').format(parseInt(numbers, 10));
  };

  const handleAmountChange = (value: string) => {
    setAmount(formatNumberInput(value));
  };

  const handleQuickAmount = (value: number) => {
    setAmount(new Intl.NumberFormat('vi-VN').format(value));
  };

  const handleTypeChange = (t: TransactionType) => {
    setType(t);
    // Keep per-type category selection — no reset
  };

  const handleSubmit = async () => {
    const numAmount = parseFloat(amount.replace(/\./g, ''));
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Vui lòng nhập số tiền hợp lệ');
      return;
    }

    setIsSubmitting(true);
    try {
      const typeLabel = type === 'income' ? 'Thu nhập' : 'Chi tiêu';
      toast.success(
        `✅ Đã thêm ${typeLabel}: ${selectedCat.name}` +
          (note ? ` - ${note}` : '') +
          ` — ${formatVND(numAmount)}`
      );
      setAmount('');
      setNote('');
    } catch {
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-linear-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-xl overflow-hidden">
      {/* Type Toggle */}
      <div className="p-6 pb-0">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => handleTypeChange('expense')}
            className="flex-1 h-11 rounded-xl font-bold text-sm transition-all active:scale-95"
            style={
              type === 'expense'
                ? { backgroundColor: 'white', color: '#4f46e5' }
                : { backgroundColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)' }
            }
          >
            <TrendingDown size={16} className="inline mr-2" />
            Chi tiêu
          </button>
          <button
            onClick={() => handleTypeChange('income')}
            className="flex-1 h-11 rounded-xl font-bold text-sm transition-all active:scale-95"
            style={
              type === 'income'
                ? { backgroundColor: 'white', color: '#4f46e5' }
                : { backgroundColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)' }
            }
          >
            <TrendingUp size={16} className="inline mr-2" />
            Thu nhập
          </button>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4">
          {cats.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCatId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95"
                style={
                  isSelected
                    ? { backgroundColor: 'white', color: '#111827' }
                    : { backgroundColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.8)' }
                }
              >
                <Icon size={14} />
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Amount Input */}
      <div className="px-6 py-8 bg-linear-to-b from-transparent to-black/10">
        <div className="text-center mb-3">
          <input
            type="text"
            inputMode="numeric"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="0"
            className="w-full bg-transparent text-center text-5xl font-bold text-white placeholder:text-white/30 outline-none"
          />
          <div className="text-white/60 text-lg font-semibold mt-1">₫</div>
        </div>

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {quickAmounts.map((value) => (
            <button
              key={value}
              onClick={() => handleQuickAmount(value)}
              className="h-10 backdrop-blur-sm rounded-xl text-white text-sm font-bold transition-all active:scale-95 hover:opacity-90"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              {formatCurrency(value).replace('₫', '')}
            </button>
          ))}
        </div>

        {/* Note Input */}
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Thêm ghi chú..."
          className="w-full h-12 px-4 backdrop-blur-sm rounded-xl text-white placeholder:text-white/50 outline-none text-sm transition-all"
          style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            border: '2px solid rgba(255,255,255,0.3)',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.6)')}
          onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.3)')}
        />
      </div>

      {/* Submit Button */}
      <div className="p-6 pt-0">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !amount}
          className="w-full h-14 bg-white text-indigo-600 rounded-2xl font-black text-base shadow-2xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          {isSubmitting ? (
            <span className="animate-pulse">Đang xử lý...</span>
          ) : (
            <>
              <Plus size={20} />
              Tạo giao dịch mới
            </>
          )}
        </button>
      </div>

      {/* Selected Category Indicator */}
      {selectedCat && (
        <div className="px-6 pb-6 pt-0">
          <div className="flex items-center justify-center gap-2 text-white/80 text-sm">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedCat.color }} />
            <span>Danh mục: {selectedCat.name}</span>
          </div>
        </div>
      )}
    </div>
  );
}
