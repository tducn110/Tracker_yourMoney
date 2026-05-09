'use client';

/**
 * CashWalletWidget — Premium Quick Sync
 * Refactored for Antigravity V1.2
 * connect directly to WalletContext
 */

import { useState } from 'react';
import { Wallet, Zap, Check, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useMounted } from '@/_lib/hooks/use-mounted';
import { formatCurrency } from '@finance/api-client';
import { useWallet } from '@/app/context/WalletContext';

export function CashWalletWidget() {
  const isMounted = useMounted();
  const { wallets, updateWallet } = useWallet();
  const [isQuickSyncOpen, setIsQuickSyncOpen] = useState(false);
  const [syncValue, setSyncValue] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Find the first cash wallet
  const cashWallet = wallets.find(w => w.type === 'cash');
  const balance = cashWallet?.balance ?? 0;

  const handleSync = async () => {
    if (!cashWallet || !syncValue) return;
    setIsSyncing(true);
    
    try {
      const newBalance = parseInt(syncValue.replace(/\D/g, '') || '0');
      await updateWallet(cashWallet.id, { balance: newBalance });
      setIsSyncing(false);
      setIsQuickSyncOpen(false);
      setSyncValue('');
    } catch (error) {
      console.error('Failed to sync wallet:', error);
      setIsSyncing(false);
    }
  };

  const formatInput = (v: string) => {
    const numeric = v.replace(/\D/g, '');
    return numeric.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  if (!cashWallet) return null;

  return (
    <div className="relative group h-full">
      {/* ── Main Card ── */}
      <motion.div
        whileHover={{ y: -4 }}
        className="p-6 rounded-[32px] overflow-hidden relative shadow-xl shadow-amber-900/5 border border-amber-100 h-full flex flex-col"
        style={{
          background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
        }}
      >
        {/* Background Decorative Circles */}
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-400/10 rounded-full blur-2xl" />
        <div className="absolute -left-2 -bottom-2 w-16 h-16 bg-orange-400/10 rounded-full blur-xl" />

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[14px] font-black text-amber-900 leading-tight uppercase tracking-tight">Ví Tiền Mặt</p>
              <p className="text-[10px] font-bold text-amber-600/80">Số dư hiện tại</p>
            </div>
          </div>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsQuickSyncOpen(true)}
            className="w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-amber-600 shadow-sm border border-amber-200 transition-colors"
          >
            <Zap className="w-4 h-4" />
          </motion.button>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <div className="text-[36px] font-black text-gray-900 tracking-tighter leading-none mb-1">
            {isMounted ? formatCurrency(String(balance), "vi-VN") : '...'}
          </div>
          <p className="text-[10px] font-black text-amber-600/60 uppercase tracking-widest">VNĐ</p>
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-amber-200/50 flex items-center justify-between">
          <p className="text-[10px] font-bold text-amber-800/70 flex items-center gap-1.5">
            <AlertCircle className="w-3 h-3" />
            Cập nhật: {isMounted ? cashWallet.lastSynced : '...'}
          </p>
        </div>
      </motion.div>

      {/* ── Quick Sync Overlay ── */}
      <AnimatePresence>
        {isQuickSyncOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 bg-amber-50/95 backdrop-blur-md rounded-[32px] p-6 flex flex-col justify-center border border-amber-200 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-[13px] font-black text-amber-900 uppercase tracking-tight">Đồng bộ ví thực tế</p>
              <button onClick={() => setIsQuickSyncOpen(false)} className="text-amber-400 hover:text-amber-600 transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="relative mb-6">
              <input
                autoFocus
                type="text"
                value={syncValue}
                onChange={(e) => setSyncValue(formatInput(e.target.value))}
                placeholder="Nhập số dư..."
                className="w-full bg-white border-2 border-amber-200 rounded-2xl px-4 py-4 text-[24px] font-black text-amber-700 placeholder:text-amber-200 focus:border-amber-400 outline-none transition-all text-center"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-black text-amber-300 uppercase">đ</div>
            </div>

            <div className="flex gap-3">
              <button
                disabled={!syncValue || isSyncing}
                onClick={handleSync}
                className="flex-1 py-4 rounded-2xl bg-amber-600 text-white text-[13px] font-black shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                {isSyncing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  >
                    <Zap size={14} />
                  </motion.div>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Xác nhận
                  </>
                )}
              </button>
            </div>
            
            <p className="mt-4 text-[10px] font-bold text-amber-600/70 text-center italic px-4">
              💡 Hệ thống sẽ tự tạo giao dịch điều chỉnh số dư cho bạn.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
