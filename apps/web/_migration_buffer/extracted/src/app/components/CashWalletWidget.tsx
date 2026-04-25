import { useState } from "react";
import { Wallet, Zap, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { formatVND } from "../data/mockData";

interface CashWalletWidgetProps {
  currentBalance: number;
  onSync: (newBalance: number, spent: number) => void;
}

export default function CashWalletWidget({ currentBalance, onSync }: CashWalletWidgetProps) {
  const [isQuickSyncOpen, setIsQuickSyncOpen] = useState(false);
  const [inputBalance, setInputBalance] = useState("");

  const handleQuickSync = () => {
    const newBalance = parseInt(inputBalance.replace(/\D/g, ""));
    if (isNaN(newBalance)) return;

    const spent = currentBalance - newBalance;
    if (spent > 0) {
      onSync(newBalance, spent);
    } else if (spent < 0) {
      // User added cash
      onSync(newBalance, 0);
    } else {
      // No change
      onSync(newBalance, 0);
    }

    setInputBalance("");
    setIsQuickSyncOpen(false);
  };

  const formatNumber = (val: string) => {
    return val.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-7 border border-amber-200/50 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-gray-900">Ví Tiền Mặt</h3>
            <p className="text-[11px] text-gray-600">Số dư hiện tại</p>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-[32px] font-bold text-gray-900">
          {formatVND(currentBalance)}
        </div>
      </div>

      <div className="flex-1"></div>

      <button
        onClick={() => setIsQuickSyncOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-[13px] transition-all shadow-md hover:shadow-lg"
      >
        <Zap className="w-4 h-4" />
        Quick Sync
      </button>

      {/* Quick Sync Modal */}
      <AnimatePresence>
        {isQuickSyncOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsQuickSyncOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-[16px] font-bold text-gray-900">Quick Sync</h3>
                      <p className="text-[12px] text-gray-600">Cập nhật số dư ví</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsQuickSyncOpen(false)}
                    className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="mb-6">
                  <div className="p-4 rounded-xl bg-gray-50 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[13px] text-gray-600">Số dư trước:</span>
                      <span className="text-[15px] font-bold text-gray-900">
                        {formatVND(currentBalance)}
                      </span>
                    </div>
                    {inputBalance && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between pt-2 border-t border-gray-200"
                      >
                        <span className="text-[13px] text-gray-600">Số dư mới:</span>
                        <span className="text-[15px] font-bold text-blue-600">
                          {formatNumber(inputBalance)}đ
                        </span>
                      </motion.div>
                    )}
                    {inputBalance && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between pt-2 border-t border-gray-200 mt-2"
                      >
                        <span className="text-[13px] text-gray-600">Chi tiêu lặt vặt:</span>
                        <span className={`text-[15px] font-bold ${
                          currentBalance - parseInt(inputBalance.replace(/\D/g, "") || "0") > 0
                            ? "text-red-500"
                            : "text-green-500"
                        }`}>
                          {currentBalance - parseInt(inputBalance.replace(/\D/g, "") || "0") > 0 ? "-" : "+"}
                          {Math.abs(currentBalance - parseInt(inputBalance.replace(/\D/g, "") || "0")).toLocaleString("vi-VN")}đ
                        </span>
                      </motion.div>
                    )}
                  </div>

                  <label className="block text-[13px] font-medium text-gray-700 mb-2">
                    Trong ví hiện có bao nhiêu?
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formatNumber(inputBalance)}
                      onChange={(e) => setInputBalance(e.target.value.replace(/,/g, ""))}
                      placeholder="Nhập số tiền..."
                      className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 outline-none text-[15px] font-semibold transition-all"
                      autoFocus
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] font-medium text-gray-400">
                      đ
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-2">
                    💡 App sẽ tự động tạo giao dịch "Chi phí không tên" cho số tiền chênh lệch
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setIsQuickSyncOpen(false)}
                    className="flex-1 px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-[14px] transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleQuickSync}
                    disabled={!inputBalance}
                    className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold text-[14px] transition-all shadow-md hover:shadow-lg disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Xác Nhận
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}