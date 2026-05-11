'use client';

/**
 * Cash Wallet Strip — Antigravity V1.2
 * Migrated to Next.js App Router
 */

import { useState } from 'react';
import { Wallet, Zap, Check, X, RefreshCw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatVND } from '@finance/api-client';

import Decimal from 'decimal.js';

const mockCashWallet = {
  balance: '1500000',
  lastSynced: "01/04/2026 08:30"
};
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface CashWalletStripProps {
  balance?: string;
  lastSynced?: string;
  onSync?: (newBalance: string, spent: string) => void;
}

export function CashWalletStrip({
  balance: initialBalance = mockCashWallet.balance,
  lastSynced = mockCashWallet.lastSynced,
  onSync,
}: CashWalletStripProps) {
  const [balance, setBalance] = useState(initialBalance);
  const [syncedAt, setSyncedAt] = useState(lastSynced);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const fmt = (v: string) =>
    v.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const rawInputStr = inputVal.replace(/,/g, '') || '0';
  const rawInput = new Decimal(rawInputStr);
  const currentBalance = new Decimal(balance);
  const diff = currentBalance.minus(rawInput);

  const handleSync = () => {
    if (!inputVal || rawInput.isNaN()) return;
    const spent = Decimal.max(0, diff).toFixed(2);
    const newBalance = rawInput.toFixed(2);
    setBalance(newBalance);
    setSyncedAt(new Date().toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }));
    onSync?.(newBalance, spent);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setIsModalOpen(false);
      setInputVal('');
    }, 1200);
  };

  return (
    <>
      {/* ── Strip ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 px-5 py-3.5 rounded-2xl"
        style={{
          background: 'linear-gradient(90deg, #fffbeb 0%, #fef3c7 100%)',
          border: '1.5px solid #fde68a',
        }}
      >
        {/* Icon + Label */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
            <Wallet className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-gray-800 leading-tight">Ví Tiền Mặt</p>
            <p className="text-[10px] font-semibold text-amber-600/80">Cập nhật: {syncedAt}</p>
          </div>
        </div>

        {/* Separator */}
        <div className="w-px h-8 bg-amber-200/60 shrink-0" />

        {/* Balance */}
        <div className="flex-1">
          <motion.p
            key={balance}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[22px] font-black text-amber-700 leading-none"
          >
            {formatVND(balance)}
          </motion.p>
        </div>

        {/* Badge */}
        <div className="px-3 py-1.5 rounded-lg bg-white/60 border border-amber-300/40">
          <span className="text-[11px] font-bold text-amber-700">Không tính vào ngân sách</span>
        </div>

        {/* Quick Sync Button */}
        <Button
          onClick={() => setIsModalOpen(true)}
          size="sm"
          className="gap-1.5 bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
        >
          <Zap className="w-3.5 h-3.5" />
          <span className="text-[12px] font-semibold">Quick Sync</span>
        </Button>
      </motion.div>

      {/* ── Modal ── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-amber-600" />
              Quick Sync Ví Tiền Mặt
            </DialogTitle>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4 pt-2"
              >
                <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <span className="text-sm font-medium text-gray-700">Số dư hiện tại</span>
                  <span className="text-lg font-bold text-amber-700">{formatVND(balance)}</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số dư thực tế trong ví
                  </label>
                  <input
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(fmt(e.target.value))}
                    placeholder="0"
                    className="w-full px-4 py-3 text-lg font-bold text-amber-700 rounded-lg border-2 border-amber-200 focus:border-amber-400 outline-none transition-colors"
                    autoFocus
                  />
                </div>

                {inputVal && !rawInput.isNaN() && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-blue-50 border border-blue-200"
                  >
                    {diff.gt(0) ? (
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                        <div className="text-sm text-blue-900">
                          <p className="font-semibold">Chi phí không tên sẽ được tạo</p>
                          <p className="text-xs text-blue-700 mt-1">
                            Số tiền: <strong>{formatVND(diff)}</strong> (vì số dư giảm)
                          </p>
                        </div>
                      </div>
                    ) : diff < 0 ? (
                      <div className="flex items-start gap-2">
                        <RefreshCw className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                        <div className="text-sm text-green-900">
                          <p className="font-semibold">Số dư tăng {formatVND(Math.abs(diff))}</p>
                          <p className="text-xs text-green-700 mt-1">Không tạo giao dịch</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">Không có thay đổi</p>
                    )}
                  </motion.div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsModalOpen(false);
                      setInputVal('');
                    }}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Hủy
                  </Button>
                  <Button
                    onClick={handleSync}
                    disabled={!inputVal || isNaN(rawInput) || rawInput === balance}
                    className="flex-1 bg-amber-600 hover:bg-amber-700"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Xác nhận
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4"
                >
                  <Check className="w-8 h-8 text-green-600" />
                </motion.div>
                <p className="text-lg font-bold text-gray-800">Đồng bộ thành công!</p>
                <p className="text-sm text-gray-600 mt-1">Số dư: {formatVND(rawInput)}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
}