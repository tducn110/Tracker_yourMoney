'use client';

/**
 * WalletsPage — Quản lý ví / tài khoản
 * - Danh sách tất cả ví
 * - Thêm ví mới (inline modal)
 * - Xóa ví / đặt ví mặc định
 * - Không dùng motion/react — CSS transitions thuần
 */

import { useState } from 'react';
import {
  Plus, Star, Trash2, Pencil, Wallet as WalletIcon,
  CreditCard, Banknote, PiggyBank, CheckCircle2, X, RefreshCw,
  ArrowLeftRight,
} from 'lucide-react';
import { useWallet, WalletType, walletTypeLabel, MockWallet } from '@/app/context/WalletContext';
import { useTransfer } from '@/_lib/hooks/finance';
import { formatCurrency } from '@finance/api-client';
import { toast } from 'sonner';

// ─── Colour palette for wallet cards ──────────────────────────────────────────

const PRESET_COLORS = [
  '#4361ee', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#e91e63', '#06b6d4', '#f97316', '#84cc16', '#6366f1',
];

const WALLET_TYPE_ICONS: Record<WalletType, React.ElementType> = {
  bank:    CreditCard,
  cash:    Banknote,
  ewallet: WalletIcon,
  savings: PiggyBank,
};

const WALLET_EMOJIS = ['🏦', '💳', '💵', '📱', '💰', '🏧', '💎', '🎯', '🌟', '⚡'];

// ─── Add/Edit Modal ───────────────────────────────────────────────────────────

interface WalletFormData {
  name: string;
  type: WalletType;
  balance: string;
  icon: string;
  colorHex: string;
  accountNumber: string;
  isDefault: boolean;
}

const defaultForm: WalletFormData = {
  name: '',
  type: 'bank',
  balance: '',
  icon: '🏦',
  colorHex: '#4361ee',
  accountNumber: '',
  isDefault: false,
};

interface AddWalletModalProps {
  isOpen: boolean;
  editWallet?: MockWallet | null;
  onClose: () => void;
  onSave: (data: WalletFormData) => void;
}

function AddWalletModal({ isOpen, editWallet, onClose, onSave }: AddWalletModalProps) {
  const [form, setForm] = useState<WalletFormData>(
    editWallet
      ? {
          name: editWallet.name,
          type: editWallet.type,
          balance: String(editWallet.balance),
          icon: editWallet.icon,
          colorHex: editWallet.colorHex,
          accountNumber: editWallet.accountNumber ?? '',
          isDefault: editWallet.isDefault,
        }
      : defaultForm
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Vui lòng nhập tên ví');
      return;
    }
    const balNum = parseFloat(form.balance.replace(/\./g, '').replace(/,/g, ''));
    if (isNaN(balNum) || balNum < 0) {
      toast.error('Số dư không hợp lệ');
      return;
    }
    onSave(form);
  };

  const formatBalanceInput = (val: string) => {
    const digits = val.replace(/\D/g, '');
    if (!digits) return '';
    return new Intl.NumberFormat('vi-VN').format(parseInt(digits, 10));
  };

  const TypeIcon = WALLET_TYPE_ICONS[form.type];

  return (
    <div className="fixed inset-0 z-60 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[480px] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
              style={{ backgroundColor: form.colorHex + '20' }}
            >
              {form.icon}
            </div>
            <div>
              <h2 className="text-[15px] font-black text-gray-900">
                {editWallet ? 'Chỉnh Sửa Ví' : 'Thêm Ví Mới'}
              </h2>
              <p className="text-[11px] font-bold text-gray-400">Điền thông tin tài khoản</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
              Tên ví *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="VD: MB Bank, Ví MoMo..."
              className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-[13px] font-bold text-gray-800 placeholder:font-normal placeholder:text-gray-400 bg-gray-50 focus:bg-white transition-all"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
              Loại tài khoản
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(walletTypeLabel) as WalletType[]).map((t) => {
                const Icon = WALLET_TYPE_ICONS[t];
                const isActive = form.type === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, type: t }))}
                    className="flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all text-[10px] font-black"
                    style={
                      isActive
                        ? { borderColor: form.colorHex, backgroundColor: form.colorHex + '15', color: form.colorHex }
                        : { borderColor: '#e5e7eb', backgroundColor: '#f9fafb', color: '#6b7280' }
                    }
                  >
                    <Icon size={16} />
                    {walletTypeLabel[t]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Balance */}
          <div>
            <label className="block text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
              Số dư hiện tại
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={form.balance}
                onChange={(e) => setForm((f) => ({ ...f, balance: formatBalanceInput(e.target.value) }))}
                placeholder="0"
                className="w-full h-11 pl-4 pr-9 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-[13px] font-black text-gray-800 placeholder:font-normal placeholder:text-gray-400 bg-gray-50 focus:bg-white transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-bold text-gray-400">₫</span>
            </div>
          </div>

          {/* Account number (optional) */}
          <div>
            <label className="block text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
              Số tài khoản <span className="font-normal normal-case">(tuỳ chọn)</span>
            </label>
            <input
              type="text"
              value={form.accountNumber}
              onChange={(e) => setForm((f) => ({ ...f, accountNumber: e.target.value }))}
              placeholder="VD: ****1234"
              className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-[13px] font-bold text-gray-800 placeholder:font-normal placeholder:text-gray-400 bg-gray-50 focus:bg-white transition-all"
            />
          </div>

          {/* Icon picker */}
          <div>
            <label className="block text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
              Biểu tượng
            </label>
            <div className="flex flex-wrap gap-2">
              {WALLET_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, icon: emoji }))}
                  className="w-10 h-10 rounded-xl text-xl flex items-center justify-center border-2 transition-all"
                  style={
                    form.icon === emoji
                      ? { borderColor: form.colorHex, backgroundColor: form.colorHex + '20' }
                      : { borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }
                  }
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
              Màu sắc
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, colorHex: color }))}
                  className="w-9 h-9 rounded-xl border-[3px] transition-all"
                  style={{
                    backgroundColor: color,
                    borderColor: form.colorHex === color ? '#fff' : color,
                    boxShadow: form.colorHex === color ? `0 0 0 3px ${color}` : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Default toggle */}
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
            <div
              className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${
                form.isDefault ? 'bg-amber-400' : 'bg-gray-200'
              }`}
              onClick={() => setForm((f) => ({ ...f, isDefault: !f.isDefault }))}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  form.isDefault ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
            <div>
              <p className="text-[13px] font-black text-gray-800 flex items-center gap-1">
                <Star size={12} className="text-amber-400" /> Ví mặc định
              </p>
              <p className="text-[11px] font-bold text-gray-400">
                Dùng làm ví chính khi nhập giao dịch
              </p>
            </div>
          </label>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-gray-200 text-[13px] font-black text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Huỷ
            </button>
            <button
              type="submit"
              className="flex-1 h-11 rounded-xl text-[13px] font-black text-white transition-all active:scale-95"
              style={{ backgroundColor: form.colorHex, boxShadow: `0 4px 14px ${form.colorHex}40` }}
            >
              {editWallet ? 'Cập nhật' : 'Thêm ví'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Transfer Modal ────────────────────────────────────────────────────────────

interface TransferModalProps {
  isOpen: boolean;
  wallets: MockWallet[];
  onClose: () => void;
  onTransfer: (fromId: string, toId: string, amount: string, note?: string) => void;
}

function TransferModal({ isOpen, wallets, onClose, onTransfer }: TransferModalProps) {
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const formatAmount = (val: string) => {
    const digits = val.replace(/\D/g, '');
    if (!digits) return '';
    return new Intl.NumberFormat('vi-VN').format(parseInt(digits, 10));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromId || !toId) {
      toast.error('Vui lòng chọn ví nguồn và ví đích');
      return;
    }
    if (fromId === toId) {
      toast.error('Không thể chuyển vào cùng một ví');
      return;
    }
    const raw = parseInt(amount.replace(/\./g, '').replace(/,/g, ''), 10);
    if (!raw || raw <= 0) {
      toast.error('Số tiền không hợp lệ');
      return;
    }
    onTransfer(fromId, toId, String(raw), note || undefined);
  };

  const fromWallet = wallets.find((w) => w.id === fromId);
  const filteredTo = wallets.filter((w) => w.id !== fromId);

  return (
    <div className="fixed inset-0 z-60 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[420px] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
              <ArrowLeftRight size={16} className="text-violet-600" />
            </div>
            <div>
              <h2 className="text-[15px] font-black text-gray-900">Chuyển Tiền</h2>
              <p className="text-[11px] font-bold text-gray-400">Giữa các ví</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* From wallet */}
          <div>
            <label className="block text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
              Ví nguồn
            </label>
            <select
              value={fromId}
              onChange={(e) => { setFromId(e.target.value); setToId(''); }}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-violet-400 outline-none text-[13px] font-bold text-gray-800 bg-gray-50 focus:bg-white transition-all"
            >
              <option value="">-- Chọn ví --</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>{w.icon} {w.name} ({formatCurrency(String(w.balance), "vi-VN")})</option>
              ))}
            </select>
          </div>

          {/* To wallet */}
          <div>
            <label className="block text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
              Ví đích
            </label>
            <select
              value={toId}
              onChange={(e) => setToId(e.target.value)}
              disabled={!fromId}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-violet-400 outline-none text-[13px] font-bold text-gray-800 bg-gray-50 focus:bg-white transition-all disabled:opacity-40"
            >
              <option value="">-- Chọn ví --</option>
              {filteredTo.map((w) => (
                <option key={w.id} value={w.id}>{w.icon} {w.name} ({formatCurrency(String(w.balance), "vi-VN")})</option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
              Số tiền
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(formatAmount(e.target.value))}
                placeholder="0"
                className="w-full h-11 pl-4 pr-9 rounded-xl border border-gray-200 focus:border-violet-400 outline-none text-[15px] font-black text-gray-800 placeholder:font-normal placeholder:text-gray-400 bg-gray-50 focus:bg-white transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-bold text-gray-400">₫</span>
            </div>
            {fromWallet && amount && (
              <p className="text-[10px] font-bold text-gray-400 mt-1">
                Số dư ví nguồn: {formatCurrency(String(fromWallet.balance), "vi-VN")}
              </p>
            )}
          </div>

          {/* Note */}
          <div>
            <label className="block text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
              Ghi chú <span className="font-normal normal-case">(tuỳ chọn)</span>
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Chuyển tiền tiết kiệm"
              className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-violet-400 outline-none text-[13px] font-bold text-gray-800 placeholder:font-normal placeholder:text-gray-400 bg-gray-50 focus:bg-white transition-all"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-gray-200 text-[13px] font-black text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Huỷ
            </button>
            <button
              type="submit"
              className="flex-1 h-11 rounded-xl text-[13px] font-black text-white bg-violet-500 hover:bg-violet-600 transition-all active:scale-95"
              style={{ boxShadow: '0 4px 14px #8b5cf640' }}
            >
              Chuyển tiền
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Wallet Card ──────────────────────────────────────────────────────────────

interface WalletItemCardProps {
  wallet: MockWallet;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}

function WalletItemCard({ wallet, onEdit, onDelete, onSetDefault }: WalletItemCardProps) {
  const TypeIcon = WALLET_TYPE_ICONS[wallet.type];

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all duration-200"
      style={{ borderLeftWidth: 4, borderLeftColor: wallet.colorHex }}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: icon + info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
            style={{ backgroundColor: wallet.colorHex + '18' }}
          >
            {wallet.icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
              <p className="text-[14px] font-black text-gray-900 truncate">{wallet.name}</p>
              {wallet.isDefault && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 shrink-0">
                  <Star size={8} className="fill-amber-400" /> Mặc định
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                <TypeIcon size={10} /> {walletTypeLabel[wallet.type]}
              </span>
              {wallet.accountNumber && (
                <span className="text-[10px] font-bold text-gray-400">{wallet.accountNumber}</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: balance + actions */}
        <div className="text-right shrink-0">
          <p
            className="text-[17px] font-black leading-none mb-1"
            style={{ color: wallet.colorHex }}
          >
            {formatCurrency(String(wallet.balance), "vi-VN")}
          </p>
          <div className="flex items-center gap-1.5 justify-end mt-2">
            {!wallet.isDefault && (
              <button
                onClick={onSetDefault}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black text-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors"
              >
                <Star size={10} /> Đặt mặc định
              </button>
            )}
            <button
              onClick={onEdit}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={onDelete}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 bg-gray-50 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Last synced */}
      <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-1 text-gray-400">
        <RefreshCw size={9} />
        <span className="text-[10px] font-bold">Cập nhật: {wallet.lastSynced}</span>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WalletsPage() {
  const { wallets, totalBalance, addWallet, updateWallet, deleteWallet, setDefaultWallet, isLoading } = useWallet();
  const transferMutation = useTransfer();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editWallet, setEditWallet] = useState<MockWallet | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  const handleSave = async (data: {
    name: string; type: WalletType; balance: string; icon: string;
    colorHex: string; accountNumber: string; isDefault: boolean;
  }) => {
    const bal = parseFloat(data.balance.replace(/\./g, '').replace(/,/g, '')) || 0;
    setIsMutating(true);
    try {
      if (editWallet) {
        await updateWallet(editWallet.id, {
          name: data.name,
          type: data.type,
          balance: bal,
          icon: data.icon,
          colorHex: data.colorHex,
          accountNumber: data.accountNumber || undefined,
          isDefault: data.isDefault,
        });
        if (data.isDefault) await setDefaultWallet(editWallet.id);
        toast.success(`Đã cập nhật ví "${data.name}"`);
        setEditWallet(null);
      } else {
        await addWallet({
          name: data.name,
          type: data.type,
          balance: bal,
          icon: data.icon,
          colorHex: data.colorHex,
          accountNumber: data.accountNumber || undefined,
          isDefault: data.isDefault,
        });
        toast.success(`Đã thêm ví "${data.name}"`);
        setIsAddOpen(false);
      }
    } catch (e: any) {
      toast.error('Lỗi: ' + (e?.message || 'Không thể lưu ví'));
    } finally {
      setIsMutating(false);
    }
  };

  const handleDelete = async (id: string) => {
    const w = wallets.find((x) => x.id === id);
    if (!w) return;
    if (wallets.length <= 1) {
      toast.error('Phải có ít nhất 1 ví');
      return;
    }
    try {
      await deleteWallet(id);
      toast.success(`Đã xoá ví "${w.name}"`);
    } catch (e: any) {
      toast.error('Lỗi: ' + (e?.message || 'Không thể xoá ví'));
    }
    setConfirmDeleteId(null);
  };

  const handleTransfer = async (fromId: string, toId: string, amount: string, note?: string) => {
    try {
      await transferMutation.mutateAsync({ fromWalletId: fromId, toWalletId: toId, amount, note });
      toast.success('Chuyển tiền thành công!');
      setIsTransferOpen(false);
    } catch (e: any) {
      toast.error('Lỗi: ' + (e?.message || 'Không thể chuyển tiền'));
    }
  };

  // Group by type
  const byType = (Object.keys(walletTypeLabel) as WalletType[]).reduce<Record<WalletType, MockWallet[]>>(
    (acc, t) => {
      acc[t] = wallets.filter((w) => w.type === t);
      return acc;
    },
    { bank: [], cash: [], ewallet: [], savings: [] }
  );

  return (
    <>
      <div className="p-4 md:p-6 pb-24 max-w-[800px] mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-[22px] font-black text-gray-900">Ví & Tài Khoản</h1>
            <p className="text-[12px] font-bold text-gray-400 mt-0.5">
              {wallets.length} tài khoản · Tổng:{' '}
              <span className="text-blue-600">{formatCurrency(String(totalBalance), "vi-VN")}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {wallets.length >= 2 && (
              <button
                onClick={() => setIsTransferOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-black text-violet-600 bg-violet-50 hover:bg-violet-100 transition-all active:scale-95"
              >
                <ArrowLeftRight size={15} /> Chuyển tiền
              </button>
            )}
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-black text-white transition-all active:scale-95"
              style={{ backgroundColor: '#4361ee', boxShadow: '0 4px 12px #4361ee40' }}
            >
              <Plus size={15} /> Thêm ví
            </button>
          </div>
        </div>

        {/* Total balance card */}
        <div
          className="rounded-2xl p-5 text-white"
          style={{ background: 'linear-gradient(135deg, #4361ee, #7c3aed)' }}
        >
          <p className="text-[11px] font-black uppercase tracking-widest text-white/70 mb-2">
            Tổng tài sản
          </p>
          <p className="text-[34px] font-black leading-none mb-1">{formatCurrency(String(totalBalance), "vi-VN")}</p>
          <p className="text-[11px] font-bold text-white/60">{wallets.length} tài khoản đang theo dõi</p>

          {/* Mini wallet list */}
          <div className="mt-4 flex flex-wrap gap-2">
            {wallets.map((w) => (
              <div
                key={w.id}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/20 text-[11px] font-bold"
              >
                <span>{w.icon}</span>
                <span className="text-white/90">{w.name}</span>
                <span className="text-white/60">{formatCurrency(String(w.balance), "vi-VN")}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Grouped wallet lists */}
        {(Object.entries(byType) as [WalletType, MockWallet[]][]).map(([type, list]) => {
          if (list.length === 0) return null;
          const Icon = WALLET_TYPE_ICONS[type];
          const typeTotal = list.reduce((s, w) => s + w.balance, 0);
          return (
            <div key={type}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Icon size={12} className="text-gray-600" />
                  </div>
                  <span className="text-[12px] font-black text-gray-700 uppercase tracking-wide">
                    {walletTypeLabel[type]}
                  </span>
                  <span className="text-[11px] font-bold text-gray-400">
                    ({list.length})
                  </span>
                </div>
                <span className="text-[12px] font-black text-gray-600">{formatCurrency(String(typeTotal), "vi-VN")}</span>
              </div>
              <div className="space-y-3">
                {list.map((wallet) => (
                  <WalletItemCard
                    key={wallet.id}
                    wallet={wallet}
                    onEdit={() => setEditWallet(wallet)}
                    onDelete={() => setConfirmDeleteId(wallet.id)}
                    onSetDefault={async () => {
                      await setDefaultWallet(wallet.id);
                      toast.success(`Đã đặt "${wallet.name}" làm ví mặc định`);
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* Add first wallet CTA if empty */}
        {wallets.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
              <WalletIcon size={28} className="text-blue-400" />
            </div>
            <div>
              <p className="text-[14px] font-black text-gray-700">Chưa có ví nào</p>
              <p className="text-[12px] font-bold text-gray-400 mt-1">Thêm ví đầu tiên để bắt đầu theo dõi</p>
            </div>
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-[13px] font-black text-white"
              style={{ backgroundColor: '#4361ee' }}
            >
              <Plus size={15} /> Thêm ví đầu tiên
            </button>
          </div>
        )}
      </div>

      {/* Add Wallet Modal */}
      <AddWalletModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={handleSave}
      />

      {/* Edit Wallet Modal */}
      {editWallet && (
        <AddWalletModal
          isOpen={true}
          editWallet={editWallet}
          onClose={() => setEditWallet(null)}
          onSave={(data) => {
            handleSave(data);
            setEditWallet(null);
          }}
        />
      )}

      {/* Transfer Modal */}
      <TransferModal
        isOpen={isTransferOpen}
        wallets={wallets}
        onClose={() => setIsTransferOpen(false)}
        onTransfer={handleTransfer}
      />

      {/* Delete Confirm */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmDeleteId(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-[340px] text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3 className="text-[15px] font-black text-gray-900 mb-2">Xoá ví này?</h3>
            <p className="text-[12px] font-bold text-gray-500 mb-5">
              Ví "{wallets.find((w) => w.id === confirmDeleteId)?.name}" sẽ bị xoá vĩnh viễn.
              Dữ liệu giao dịch không bị ảnh hưởng.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 h-11 rounded-xl border border-gray-200 text-[13px] font-black text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Huỷ
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="flex-1 h-11 rounded-xl bg-red-500 text-[13px] font-black text-white hover:bg-red-600 transition-colors"
              >
                Xoá ví
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
