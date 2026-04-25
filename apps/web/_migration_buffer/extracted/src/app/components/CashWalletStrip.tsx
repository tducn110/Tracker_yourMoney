/**
 * Cash Wallet Strip — Antigravity V1.2
 * Ví tiền mặt được CÔ LẬP thành dải ngang riêng biệt (không phải card).
 * Không nằm cùng column với Bills hay bất kỳ widget nào khác.
 * Rõ ràng thông báo: KHÔNG TÍNH VÀO S2S
 *
 * Concern note: Cash flows không qua bank → không xuất hiện trong transaction feed.
 * Quick Sync tạo "Chi phí không tên" khi số dư giảm.
 */

import { useState } from "react";
import { Wallet, Zap, Check, X, RefreshCw, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { formatVND, mockCashWallet } from "../data/mockData";

interface CashWalletStripProps {
  balance?: number;
  lastSynced?: string;
  onSync?: (newBalance: number, spent: number) => void;
}

export function CashWalletStrip({
  balance: initialBalance = mockCashWallet.balance,
  lastSynced = mockCashWallet.lastSynced,
  onSync,
}: CashWalletStripProps) {
  const [balance, setBalance] = useState(initialBalance);
  const [syncedAt, setSyncedAt] = useState(lastSynced);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const fmt = (v: string) =>
    v.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const rawInput = parseInt(inputVal.replace(/,/g, "") || "0");
  const diff = balance - rawInput;

  const handleSync = () => {
    if (!inputVal || isNaN(rawInput)) return;
    const spent = Math.max(0, diff);
    setBalance(rawInput);
    setSyncedAt(new Date().toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" }));
    onSync?.(rawInput, spent);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setIsModalOpen(false);
      setInputVal("");
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
          background: "linear-gradient(90deg, #fffbeb 0%, #fef3c7 100%)",
          border: "1.5px solid #fde68a",
        }}
      >
        {/* Icon + Label */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
            style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
            <Wallet className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-gray-800 leading-tight">Ví Tiền Mặt</p>
            <p className="text-[10px] font-semibold text-amber-600/80">Cập nhật: {syncedAt}</p>
          </div>
        </div>

        {/* Separator */}
        <div className="w-px h-8 bg-amber-200/60 flex-shrink-0" />

        {/* Balance */}
        <motion.p
          key={balance}
          initial={{ opacity: 0.6, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-[22px] font-black text-gray-900 tracking-tight"
        >
          {formatVND(balance)}
        </motion.p>

        {/* Spacer */}
        <div className="flex-1" />

        {/* NOT S2S badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg flex-shrink-0"
          style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)" }}>
          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          <span className="text-[11px] font-bold text-amber-700">Không tính vào S2S</span>
        </div>

        {/* Quick Sync button */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-bold text-[12px] shadow-md flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
        >
          <Zap className="w-3.5 h-3.5" />
          Quick Sync
        </motion.button>
      </motion.div>

      {/* ── Quick Sync Modal ── */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsModalOpen(false); setInputVal(""); }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
                      <Wallet className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-gray-900">Quick Sync</p>
                      <p className="text-[11px] text-gray-500">Ví tiền mặt — không tính vào S2S</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setIsModalOpen(false); setInputVal(""); }}
                    className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                {/* Body */}
                <div className="p-5">
                  {/* Before/after preview */}
                  <div className="rounded-xl p-4 mb-4 space-y-2.5"
                    style={{ background: "#f9fafb", border: "1px solid #f3f4f6" }}>
                    <div className="flex justify-between items-center">
                      <span className="text-[12px] text-gray-500">Số dư trước:</span>
                      <span className="text-[14px] font-bold text-gray-900">{formatVND(balance)}</span>
                    </div>
                    <AnimatePresence>
                      {inputVal && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2"
                        >
                          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                            <span className="text-[12px] text-gray-500">Số dư mới:</span>
                            <span className="text-[14px] font-bold text-blue-600">{fmt(inputVal)}đ</span>
                          </div>
                          {diff !== 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-[12px] text-gray-500">
                                {diff > 0 ? "Chi tiêu lặt vặt:" : "Nạp thêm tiền:"}
                              </span>
                              <span className={`text-[14px] font-bold ${diff > 0 ? "text-red-500" : "text-emerald-500"}`}>
                                {diff > 0 ? "−" : "+"}{new Intl.NumberFormat("vi-VN").format(Math.abs(diff))}đ
                              </span>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <label className="block text-[12px] font-semibold text-gray-700 mb-2">
                    Trong ví hiện có bao nhiêu?
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={fmt(inputVal)}
                      onChange={(e) => setInputVal(e.target.value.replace(/,/g, ""))}
                      onKeyDown={(e) => e.key === "Enter" && handleSync()}
                      placeholder="0"
                      autoFocus
                      className="w-full px-4 py-3 pr-12 rounded-xl border-2 outline-none text-[15px] font-bold transition-all"
                      style={{ borderColor: inputVal ? "#f59e0b" : "#e5e7eb" }}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-gray-400">₫</span>
                  </div>
                  {diff > 0 && inputVal && (
                    <p className="text-[11px] text-amber-600 mt-2 flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" />
                      App sẽ tạo giao dịch "Chi phí không tên" (−{new Intl.NumberFormat("vi-VN").format(diff)}₫)
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-5 pb-5">
                  <button
                    onClick={() => { setIsModalOpen(false); setInputVal(""); }}
                    className="flex-1 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-[13px] transition-colors"
                  >
                    Hủy
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSync}
                    disabled={!inputVal || isNaN(rawInput)}
                    className="flex-1 py-3 rounded-xl text-white font-bold text-[13px] transition-all flex items-center justify-center gap-2 shadow-md"
                    style={{
                      background: isSuccess
                        ? "linear-gradient(135deg, #10b981, #059669)"
                        : !inputVal
                        ? "#e5e7eb"
                        : "linear-gradient(135deg, #f59e0b, #d97706)",
                      color: !inputVal ? "#9ca3af" : "white",
                    }}
                  >
                    {isSuccess ? (
                      <><Check className="w-4 h-4" /> Đã lưu!</>
                    ) : (
                      <><Zap className="w-4 h-4" /> Xác nhận</>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
