'use client';

/**
 * QuickAddModal — Popup transaction entry
 * - No motion/react — CSS transitions only
 * - Separate categories for income vs expense
 * - Uses WalletContext
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus, Coffee, ShoppingCart, Car, Home, Utensils, Zap,
  MoreHorizontal, Check, Briefcase, Gift, Laptop, TrendingUp,
  Handshake, ShoppingBag, Heart, Film, Book, Phone,
} from 'lucide-react';
import { formatCurrency } from '@finance/api-client';
import { useWallet } from '@/app/context/WalletContext';
import { toast } from 'sonner';

interface CreateTransactionDTO {
  amount: number;
  type: 'income' | 'expense';
  category: string;
  walletId: string;
  note: string;
  date: string;
}

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTransactionDTO) => Promise<void>;
}

// ─── Category Lists ────────────────────────────────────────────────────────────

const EXPENSE_CATEGORIES = [
  { id: 'food',          label: 'Ăn uống',   icon: Utensils,     color: 'emerald' },
  { id: 'shopping',      label: 'Mua sắm',   icon: ShoppingBag,  color: 'pink' },
  { id: 'transport',     label: 'Di chuyển', icon: Car,          color: 'amber' },
  { id: 'home',          label: 'Nhà cửa',   icon: Home,         color: 'purple' },
  { id: 'bills',         label: 'Hóa đơn',   icon: Zap,          color: 'red' },
  { id: 'health',        label: 'Sức khỏe',  icon: Heart,        color: 'rose' },
  { id: 'entertainment', label: 'Giải trí',  icon: Film,         color: 'indigo' },
  { id: 'education',     label: 'Giáo dục',  icon: Book,         color: 'blue' },
  { id: 'other',         label: 'Khác',      icon: MoreHorizontal, color: 'gray' },
];

const INCOME_CATEGORIES = [
  { id: 'salary',     label: 'Lương',       icon: Briefcase,     color: 'emerald' },
  { id: 'bonus',      label: 'Thưởng',      icon: Gift,          color: 'amber' },
  { id: 'freelance',  label: 'Freelance',   icon: Laptop,        color: 'indigo' },
  { id: 'investment', label: 'Đầu tư',      icon: TrendingUp,    color: 'blue' },
  { id: 'business',   label: 'Kinh doanh',  icon: Coffee,        color: 'purple' },
  { id: 'selling',    label: 'Bán hàng',    icon: ShoppingCart,  color: 'pink' },
  { id: 'loan_back',  label: 'Cho vay trả', icon: Handshake,     color: 'cyan' },
  { id: 'other_in',   label: 'Khác',        icon: MoreHorizontal, color: 'gray' },
];

// Map color name → hex for active state
const COLOR_MAP: Record<string, string> = {
  emerald: '#10b981', pink: '#ec4899', amber: '#f59e0b', purple: '#8b5cf6',
  red: '#ef4444', rose: '#f43f5e', indigo: '#6366f1', blue: '#3b82f6',
  gray: '#6b7280', cyan: '#06b6d4',
};

// ─── Component ────────────────────────────────────────────────────────────────

export function QuickAddModal({ isOpen, onClose, onSubmit }: QuickAddModalProps) {
  const { wallets, defaultWallet } = useWallet();
  const [type, setType]                 = useState<'expense' | 'income'>('expense');
  const [selectedExpCat, setExpCat]     = useState('food');
  const [selectedIncCat, setIncCat]     = useState('salary');
  const [selectedWallet, setWallet]     = useState(defaultWallet?.id ?? wallets[0]?.id ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cats         = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const selectedCat  = type === 'expense' ? selectedExpCat : selectedIncCat;
  const setSelectedCat = type === 'expense' ? setExpCat : setIncCat;

  const { register, handleSubmit, reset, watch } = useForm<CreateTransactionDTO>({
    defaultValues: {
      type: 'expense',
      category: 'food',
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      note: '',
    },
  });

  const amountValue = watch('amount');

  const onFormSubmit = async (data: CreateTransactionDTO) => {
    setIsSubmitting(true);
    try {
      await onSubmit({ ...data, type, category: selectedCat, walletId: selectedWallet });
      toast.success('Đã thêm giao dịch thành công!');
      reset();
      onClose();
    } catch {
      toast.error('Có lỗi xảy ra khi thêm giao dịch.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTypeChange = (v: string) => {
    setType(v as 'expense' | 'income');
    // Keep per-type selection, no category reset
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-[20px] font-bold text-gray-900 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Plus size={18} />
            </div>
            Thêm Giao Dịch Nhanh
          </DialogTitle>
          <DialogDescription className="text-[12px] mt-1">
            Ghi lại thu nhập hoặc chi tiêu ngay lập tức.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 pt-4 space-y-5">
          {/* Type Selector */}
          <Tabs value={type} onValueChange={handleTypeChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 p-1 bg-gray-100 rounded-xl">
              <TabsTrigger
                value="expense"
                className="rounded-lg text-[13px] font-bold data-[state=active]:bg-white data-[state=active]:text-red-500 data-[state=active]:shadow-sm"
              >
                Chi tiêu
              </TabsTrigger>
              <TabsTrigger
                value="income"
                className="rounded-lg text-[13px] font-bold data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm"
              >
                Thu nhập
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Amount Input */}
          <div className="space-y-2 text-center">
            <Label htmlFor="amount" className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Số tiền
            </Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                {...register('amount', { required: true, min: 0 })}
                className="text-center text-[32px] font-black h-16 border-none focus-visible:ring-0 bg-transparent text-gray-900 placeholder:text-gray-200"
                placeholder="0"
                autoFocus
              />
              <div className="absolute inset-x-0 bottom-0 h-0.5 rounded-full"
                style={{ backgroundColor: type === 'expense' ? '#ef4444' : '#10b981' }}
              />
            </div>
            <p className="text-[14px] font-bold text-gray-400 mt-1">
              {formatCurrency(amountValue || 0)}
            </p>
          </div>

          {/* Wallet Selector */}
          {wallets.length > 1 && (
            <div className="space-y-2">
              <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Ví</Label>
              <div className="flex flex-wrap gap-2">
                {wallets.map((w) => {
                  const isActive = selectedWallet === w.id;
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setWallet(w.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                      style={{
                        backgroundColor: isActive ? w.colorHex : '#f3f4f6',
                        color: isActive ? '#fff' : '#6b7280',
                      }}
                    >
                      <span>{w.icon}</span> {w.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Category Grid */}
          <div className="space-y-3">
            <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Danh mục {type === 'expense' ? 'chi tiêu' : 'thu nhập'}
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {cats.map((cat) => {
                const isActive = selectedCat === cat.id;
                const hexColor = COLOR_MAP[cat.color] ?? '#6b7280';
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCat(cat.id)}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all"
                    style={
                      isActive
                        ? { borderColor: hexColor, backgroundColor: hexColor + '15', color: hexColor }
                        : { borderColor: '#f1f5f9', backgroundColor: '#fff', color: '#9ca3af' }
                    }
                  >
                    <cat.icon size={20} />
                    <span className="text-[11px] font-bold">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note Input */}
          <div className="space-y-2">
            <Label htmlFor="note" className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Ghi chú
            </Label>
            <Input
              id="note"
              {...register('note')}
              placeholder="VD: Ăn sáng phở bò..."
              className="rounded-xl border-gray-100 focus:border-blue-200 focus:ring-4 focus:ring-blue-50/50 text-[14px]"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || !amountValue}
            className="w-full h-12 rounded-xl text-[15px] font-black shadow-lg transition-all"
            style={{
              backgroundColor: type === 'expense' ? '#ef4444' : '#10b981',
              color: '#fff',
            }}
          >
            {isSubmitting ? 'Đang lưu...' : 'Lưu Giao Dịch'}
            <Check size={18} className="ml-2" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
