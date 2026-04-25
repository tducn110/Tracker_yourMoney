'use client';

/**
 * WalletSyncModal — Update wallet balance (quick sync)
 * Pure CSS transitions, no motion/react dependency
 */

import { useState } from 'react';
import { X, Check, AlertCircle, TrendingUp } from 'lucide-react';
import { MockWallet, formatVND } from '@/app/data/mockData';

// ─── Types ───────────────────────────────────────────────────────────────────

interface WalletSyncModalProps {
  wallet: MockWallet;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (walletId: string, newBalance: number) => void;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DiffHint({ diff, walletColor }: { diff: number; walletColor: string }) {
  const isDecrease = diff > 0;
  return (
    <div
      className="p-3 rounded-xl border"
      style={{
        backgroundColor: isDecrease ? '#fff7ed' : '#f0fdf4',
        borderColor: isDecrease ? '#fed7aa' : '#bbf7d0',
      }}
    >
      <div className="flex items-start gap-2">
        {isDecrease ? (
          <AlertCircle size={14} className="text-orange-500 flex-shrink-0 mt-0.5" />
        ) : (
          <TrendingUp size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
        )}
        <div>
          <p className="text-[12px] font-bold text-gray-800">
            {isDecrease
              ? `Chi tiêu không ghi nhận: ${formatVND(diff)}`
              : `Số dư tăng thêm: ${formatVND(Math.abs(diff))}`}
          </p>
          <p className="text-[10px] font-medium text-gray-500 mt-0.5">
            {isDecrease
              ? 'Sẽ tạo giao dịch chi tiêu không tên'
              : 'Không tạo giao dịch mới'}
          </p>
        </div>
      </div>
    </div>
  );
}

function SuccessState({ walletName, newBalance }: { walletName: string; newBalance: number }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 gap-4">
      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
        <Check size={28} className="text-emerald-600" />
      </div>
      <div className="text-center">
        <p className="text-[16px] font-black text-gray-900">Đồng bộ thành công!</p>
        <p className="text-[13px] font-bold text-gray-400 mt-1">
          {walletName}: {formatVND(newBalance)}
        </p>
      </div>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function WalletSyncModal({ wallet, isOpen, onClose, onConfirm }: WalletSyncModalProps) {
  const [inputVal, setInputVal] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  // ── Helpers ──
  const formatInput = (v: string) =>
    v.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const rawInput = parseInt(inputVal.replace(/,/g, '') || '0', 10);
  const diff = wallet.balance - rawInput;
  const isValid = inputVal.length > 0 && !isNaN(rawInput) && rawInput !== wallet.balance;

  // ── Handlers ──
  const handleConfirm = () => {
    if (!isValid) return;
    setIsSuccess(true);
    setTimeout(() => {
      onConfirm(wallet.id, rawInput);
      setIsSuccess(false);
      setInputVal('');
      onClose();
    }, 1200);
  };

  const handleClose = () => {
    setInputVal('');
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal card */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b border-gray-100"
          style={{ borderBottom: `2px solid ${wallet.colorHex}22` }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
              style={{ backgroundColor: `${wallet.colorHex}20` }}
            >
              {wallet.icon}
            </div>
            <div>
              <h3 className="text-[14px] font-black text-gray-900 leading-tight">
                Cập nhật số dư
              </h3>
              <p className="text-[11px] font-bold text-gray-400">{wallet.name}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        {isSuccess ? (
          <SuccessState walletName={wallet.name} newBalance={rawInput} />
        ) : (
          <div className="p-6 space-y-4">
            {/* Current balance display */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-[12px] font-bold text-gray-500">Số dư hiện tại</span>
              <span
                className="text-[15px] font-black"
                style={{ color: wallet.colorHex }}
              >
                {formatVND(wallet.balance)}
              </span>
            </div>

            {/* New balance input */}
            <div>
              <label className="block text-[12px] font-bold text-gray-700 mb-2">
                Số dư thực tế trong ví
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={inputVal}
                onChange={(e) => setInputVal(formatInput(e.target.value))}
                placeholder="0"
                autoFocus
                className="w-full px-4 py-3 text-[18px] font-black text-gray-900 rounded-xl border-2 outline-none transition-colors"
                style={{
                  borderColor: inputVal ? wallet.colorHex : '#e5e7eb',
                }}
              />
            </div>

            {/* Difference hint */}
            {isValid && <DiffHint diff={diff} walletColor={wallet.colorHex} />}

            {/* Action buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleClose}
                className="flex-1 h-10 rounded-xl border-2 border-gray-200 text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirm}
                disabled={!isValid}
                className="flex-1 h-10 rounded-xl text-[13px] font-black text-white flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                style={{ backgroundColor: wallet.colorHex }}
              >
                <Check size={14} />
                Xác nhận
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
