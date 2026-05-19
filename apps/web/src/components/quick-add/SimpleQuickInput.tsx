'use client';

/**
 * SimpleQuickInput — Fast transaction entry form
 * Types: Chi tiêu | Thu nhập only (no debt / saving).
 * Categories are SEPARATE for income vs expense.
 * No motion/react — pure CSS transitions.
 * Uses WalletContext for real-time wallet sync.
 */

import { useState } from 'react';
import {
  Plus, TrendingUp, TrendingDown,
  Coffee, Wine, Car, ShoppingBag, Heart, Film, Receipt, MoreHorizontal,
  Wallet as WalletIcon, Briefcase, TrendingUp as InvestIcon, Gift, Laptop,
  Handshake, ShoppingCart, Home, Book, Zap,
} from 'lucide-react';
import { formatVND } from '@finance/api-client';
import { useWallet } from '@/app/context/WalletContext';
import { useCreateTransaction, useCategories } from '@/_lib/hooks/finance';
import { resolveCategoryId } from '@/_lib/category-map';
import { CurrencyInput } from '@/components/ui/currency-input';
import { toast } from 'sonner';

// ─── Types ─────────────────────────────────────────────────────────────────────

type TransactionType = 'expense' | 'income';

interface CategoryItem {
  id: string;
  name: string;
  emoji: string;
  icon: React.ElementType;
  color: string;
}

// ─── Category Data ──────────────────────────────────────────────────────────────

const EXPENSE_CATEGORIES: CategoryItem[] = [
  { id: 'food',          name: 'Ăn uống',   emoji: '🍜', icon: Coffee,       color: '#f59e0b' },
  { id: 'drinks',        name: 'Đồ uống',   emoji: '🧃', icon: Wine,         color: '#3b82f6' },
  { id: 'transport',     name: 'Di chuyển', emoji: '🚗', icon: Car,          color: '#10b981' },
  { id: 'shopping',      name: 'Mua sắm',   emoji: '🛍️', icon: ShoppingBag,  color: '#ec4899' },
  { id: 'health',        name: 'Sức khỏe',  emoji: '💊', icon: Heart,        color: '#ef4444' },
  { id: 'entertainment', name: 'Giải trí',  emoji: '🎬', icon: Film,         color: '#8b5cf6' },
  { id: 'bills',         name: 'Hóa đơn',   emoji: '📄', icon: Receipt,      color: '#f97316' },
  { id: 'home',          name: 'Nhà cửa',   emoji: '🏠', icon: Home,         color: '#06b6d4' },
  { id: 'education',     name: 'Giáo dục',  emoji: '📚', icon: Book,         color: '#6366f1' },
  { id: 'utilities',     name: 'Tiện ích',  emoji: '⚡', icon: Zap,          color: '#84cc16' },
  { id: 'other',         name: 'Khác',       emoji: '💳', icon: MoreHorizontal, color: '#64748b' },
];

const INCOME_CATEGORIES: CategoryItem[] = [
  { id: 'salary',     name: 'Lương',         emoji: '💰', icon: Briefcase,   color: '#10b981' },
  { id: 'bonus',      name: 'Thưởng',        emoji: '🎁', icon: Gift,        color: '#f59e0b' },
  { id: 'freelance',  name: 'Freelance',     emoji: '💻', icon: Laptop,      color: '#6366f1' },
  { id: 'investment', name: 'Đầu tư',        emoji: '📈', icon: InvestIcon,  color: '#4361ee' },
  { id: 'business',   name: 'Kinh doanh',    emoji: '💼', icon: Briefcase,   color: '#8b5cf6' },
  { id: 'selling',    name: 'Bán hàng',      emoji: '🛒', icon: ShoppingCart, color: '#ec4899' },
  { id: 'loan_back',  name: 'Cho vay trả',   emoji: '🤝', icon: Handshake,   color: '#06b6d4' },
  { id: 'other_in',   name: 'Khác',          emoji: '💳', icon: MoreHorizontal, color: '#64748b' },
];

interface TypeConfig {
  type: TransactionType;
  label: string;
  icon: React.ElementType;
  colorActive: string;
  colorBg: string;
  colorText: string;
}

const TYPE_CONFIGS: TypeConfig[] = [
  {
    type: 'expense',
    label: 'Chi tiêu',
    icon: TrendingDown,
    colorActive: '#ef4444',
    colorBg: '#fee2e2',
    colorText: '#991b1b',
  },
  {
    type: 'income',
    label: 'Thu nhập',
    icon: TrendingUp,
    colorActive: '#10b981',
    colorBg: '#d1fae5',
    colorText: '#065f46',
  },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

interface TypeToggleProps {
  active: TransactionType;
  onChange: (t: TransactionType) => void;
}

function TypeToggle({ active, onChange }: TypeToggleProps) {
  return (
    <div className="flex items-center gap-2">
      {TYPE_CONFIGS.map(({ type, label, icon: Icon, colorActive, colorBg, colorText }) => {
        const isActive = active === type;
        return (
          <button
            key={type}
            onClick={() => onChange(type)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-black transition-all active:scale-95"
            style={{
              backgroundColor: isActive ? colorActive : '#ffffff',
              color: isActive ? '#ffffff' : colorText,
              border: isActive ? `1px solid ${colorActive}` : '1px solid #e5e7eb',
              boxShadow: isActive ? `0 4px 12px ${colorActive}40` : 'none',
            }}
          >
            <Icon size={14} />
            {label}
          </button>
        );
      })}
    </div>
  );
}

interface WalletSelectorProps {
  selectedId: string;
  onChange: (id: string) => void;
}

function WalletSelector({ selectedId, onChange }: WalletSelectorProps) {
  const { wallets } = useWallet();
  return (
    <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-white">
      <WalletIcon size={13} className="text-gray-400 shrink-0" />
      <div className="flex items-center gap-2 overflow-x-auto">
        {wallets.map((w) => {
          const isActive = selectedId === w.id;
          return (
            <button
              key={w.id}
              onClick={() => onChange(w.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold shrink-0 transition-all active:scale-95"
              style={{
                backgroundColor: isActive ? w.color : '#ffffff',
                color: isActive ? '#ffffff' : '#6b7280',
                border: isActive ? `1px solid ${w.color}` : '1px solid #e5e7eb',
                boxShadow: isActive ? `0 2px 8px ${w.color}40` : 'none',
              }}
            >
              <span>{w.icon}</span>
              {w.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface CategoryPillsProps {
  selected: string;
  onSelect: (id: string) => void;
  type: TransactionType;
}

function CategoryPills({ selected, onSelect, type }: CategoryPillsProps) {
  const cats = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  return (
    <div className="flex flex-wrap gap-2">
      {cats.map((cat) => {
        const isSelected = selected === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-bold transition-all active:scale-95"
            style={
              isSelected
                ? { backgroundColor: cat.color + '15', color: cat.color, border: `1.5px solid ${cat.color}80` }
                : { backgroundColor: '#ffffff', color: '#6b7280', border: '1px solid #e5e7eb' }
            }
          >
            <span className="text-sm">{cat.emoji}</span>
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}

interface TransactionPreviewProps {
  amount: string;
  typeConfig: TypeConfig;
  category: CategoryItem;
  walletName: string;
  walletIcon: string;
}

function TransactionPreview({ amount, typeConfig, category, walletName, walletIcon }: TransactionPreviewProps) {
  const numAmount = Number(amount || '0');
  if (!amount) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: typeConfig.colorActive }}
        >
          <typeConfig.icon size={14} className="text-white" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-gray-500">Sẽ tạo giao dịch</p>
          <p className="text-[13px] font-black text-gray-900">
            {category.emoji} {typeConfig.label} · {category.name}
          </p>
          <p className="text-[10px] font-bold text-gray-400">
            {walletIcon} {walletName}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[11px] font-bold text-gray-500">Số tiền</p>
        <p
          className="text-[17px] font-black"
          style={{ color: typeConfig.colorActive }}
        >
          {typeConfig.type === 'expense' ? '−' : '+'}{formatVND(numAmount)}
        </p>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function SimpleQuickInput() {
  const { wallets, defaultWallet } = useWallet();

  const [type, setType]                 = useState<TransactionType>('expense');
  const [amount, setAmount]             = useState('');
  const [note, setNote]                 = useState('');
  const [selectedExpCat, setExpCat]     = useState(EXPENSE_CATEGORIES[0].id);
  const [selectedIncCat, setIncCat]     = useState(INCOME_CATEGORIES[0].id);
  const [selectedWallet, setWallet]     = useState(defaultWallet?.id ?? wallets[0]?.id ?? '');
  const [isSubmitting, setSubmitting]   = useState(false);

  const selectedCategory = type === 'expense' ? selectedExpCat : selectedIncCat;
  const handleCategorySelect = (id: string) => {
    if (type === 'expense') setExpCat(id);
    else setIncCat(id);
  };

  const { mutateAsync: createTransaction } = useCreateTransaction();
  const { data: categories = [] } = useCategories();

  const activeType     = TYPE_CONFIGS.find((t) => t.type === type)!;
  const cats           = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const activeCategory = cats.find((c) => c.id === selectedCategory) ?? cats[0];
  const activeWallet   = wallets.find((w) => w.id === selectedWallet) ?? wallets[0];

  const handleTypeChange = (t: TransactionType) => {
    setType(t);
    // Don't reset category — keep per-type selection
  };

  const handleSubmit = async () => {
    const num = Number(amount || '0');
    if (isNaN(num) || num <= 0) {
      toast.error('Vui lòng nhập số tiền hợp lệ');
      return;
    }
    const walletId = selectedWallet || defaultWallet?.id || wallets[0]?.id;
    if (!walletId) {
      toast.error('Vui lòng tạo ví trước khi thêm giao dịch');
      return;
    }
    setSubmitting(true);
    try {
      const categoryId = resolveCategoryId(selectedCategory, type, categories);
      await createTransaction({
        walletId,
        categoryId,
        amount: String(num),
        type,
        note,
        displayDate: new Date().toISOString().split('T')[0],
        source: 'manual',
      });
      toast.success(
        `✅ ${activeType.label}: ${activeCategory.emoji} ${activeCategory.name}` +
          (note ? ` — ${note}` : '') +
          ` · ${formatVND(num)} · ${activeWallet?.icon ?? ''} ${activeWallet?.name ?? ''}`
      );
      setAmount('');
      setNote('');
    } catch {
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* ── Row 1: Header + Type Toggle ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <Plus size={16} className="text-blue-600" />
          </div>
          <h3 className="text-[13px] font-black text-gray-900">Nhập Giao Dịch Mới</h3>
        </div>
        <TypeToggle active={type} onChange={handleTypeChange} />
      </div>

      {/* ── Row 2: Wallet Selector ── */}
      <WalletSelector selectedId={selectedWallet} onChange={setWallet} />

      {/* ── Row 3: Amount + Note + Submit ── */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
        <div className="relative shrink-0 w-[180px]">
          <CurrencyInput
            value={amount}
            onValueChange={setAmount}
            placeholder="Số tiền..."
            suffix="₫"
            className="h-10 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-[13px] font-black text-gray-800 placeholder:text-gray-400 bg-white transition-all"
          />
        </div>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="Ghi chú (tùy chọn)..."
          className="flex-1 h-10 px-4 bg-white border border-gray-200 rounded-xl text-[13px] font-bold text-gray-800 placeholder:text-gray-400 outline-none focus:border-blue-400 transition-all"
        />
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !amount}
          className="h-10 px-6 rounded-xl font-black text-[13px] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 active:scale-95"
          style={{
            backgroundColor: amount ? activeType.colorActive : '#ffffff',
            color: amount ? '#ffffff' : '#9ca3af',
            border: amount ? `1px solid ${activeType.colorActive}` : '1px solid #e5e7eb',
            boxShadow: amount ? `0 4px 12px ${activeType.colorActive}40` : 'none',
          }}
        >
          <Plus size={15} />
          Lưu
        </button>
      </div>

      {/* ── Row 4: Category Pills (type-specific) ── */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-2.5">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
            Danh mục {type === 'expense' ? 'chi tiêu' : 'thu nhập'}
          </p>
        </div>
        <CategoryPills
          selected={selectedCategory}
          onSelect={handleCategorySelect}
          type={type}
        />
      </div>

      {/* ── Row 5: Transaction Preview ── */}
      {amount && activeWallet && (
        <div className="px-5 py-4">
          <TransactionPreview
            amount={amount}
            typeConfig={activeType}
            category={activeCategory}
            walletName={activeWallet.name}
            walletIcon={activeWallet.icon}
          />
        </div>
      )}
    </div>
  );
}
