/**
 * QuickInputBar — Finance Tracker V3
 * Thanh nhập liệu nhanh đặt Ở ĐẦU Dashboard.
 * Hỗ trợ: Chi tiêu | Thu nhập | Khoản nợ | Tiết kiệm
 */

import { useState } from "react";
import {
  Plus,
  TrendingDown,
  TrendingUp,
  ArrowLeftRight,
  PiggyBank,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type TxType = "expense" | "income" | "debt" | "saving";

const QUICK_CATS = [
  { id: "food",          label: "Ăn uống",    icon: "🍔" },
  { id: "drink",         label: "Đồ uống",    icon: "🥤" },
  { id: "transport",     label: "Di chuyển",  icon: "🚗" },
  { id: "shopping",      label: "Mua sắm",    icon: "🛍️" },
  { id: "health",        label: "Sức khỏe",   icon: "💊" },
  { id: "entertainment", label: "Giải trí",   icon: "🎮" },
  { id: "bill",          label: "Hóa đơn",    icon: "🧾" },
  { id: "other",         label: "Khác",        icon: "📦" },
];

const TYPE_CONFIG: Record<TxType, {
  label: string;
  icon: React.ReactNode;
  activeClass: string;
  btnColor: string;
}> = {
  expense: {
    label: "Chi tiêu",
    icon: <TrendingDown size={13} />,
    activeClass: "bg-red-500 text-white shadow-sm shadow-red-200",
    btnColor: "bg-red-500 hover:bg-red-600 shadow-red-200",
  },
  income: {
    label: "Thu nhập",
    icon: <TrendingUp size={13} />,
    activeClass: "bg-emerald-500 text-white shadow-sm shadow-emerald-200",
    btnColor: "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200",
  },
  debt: {
    label: "Khoản nợ",
    icon: <ArrowLeftRight size={13} />,
    activeClass: "bg-amber-500 text-white shadow-sm shadow-amber-200",
    btnColor: "bg-amber-500 hover:bg-amber-600 shadow-amber-200",
  },
  saving: {
    label: "Tiết kiệm",
    icon: <PiggyBank size={13} />,
    activeClass: "bg-indigo-500 text-white shadow-sm shadow-indigo-200",
    btnColor: "bg-indigo-500 hover:bg-indigo-600 shadow-indigo-200",
  },
};

const fmt = (v: string) =>
  v.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");

interface QuickInputBarProps {
  onAdd?: (tx: {
    type: TxType;
    amount: number;
    categoryId: string;
    note: string;
  }) => void;
}

export function QuickInputBar({ onAdd }: QuickInputBarProps) {
  const [type, setType] = useState<TxType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const rawAmount = parseInt(amount.replace(/,/g, "") || "0");
  const canSubmit = rawAmount > 0 && category !== "";

  const handleSubmit = () => {
    if (!canSubmit) return;
    onAdd?.({ type, amount: rawAmount, categoryId: category, note });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setAmount("");
      setNote("");
      setCategory("");
    }, 1400);
  };

  const cfg = TYPE_CONFIG[type];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-blue-50 flex items-center justify-center">
            <Plus size={15} className="text-blue-600" />
          </div>
          <span className="text-[13px] font-bold text-gray-800">Nhập Giao Dịch Mới</span>
        </div>

        {/* Type toggle */}
        <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
          {(Object.keys(TYPE_CONFIG) as TxType[]).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                type === t
                  ? TYPE_CONFIG[t].activeClass
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {TYPE_CONFIG[t].icon}
              <span className="hidden sm:inline">{TYPE_CONFIG[t].label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Input row ── */}
      <div className="px-5 py-4 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Amount */}
          <div className="relative w-full sm:w-[190px] flex-shrink-0">
            <input
              type="text"
              value={fmt(amount)}
              onChange={(e) => setAmount(e.target.value.replace(/,/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Số tiền..."
              className="w-full pl-4 pr-8 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none text-[15px] font-bold text-gray-900 bg-gray-50 focus:bg-white transition-all placeholder:text-gray-300 placeholder:font-normal"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-bold text-gray-400">
              ₫
            </span>
          </div>

          {/* Note */}
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Ghi chú (tùy chọn)..."
            className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none text-[13px] text-gray-700 bg-gray-50 focus:bg-white transition-all placeholder:text-gray-300"
          />

          {/* Submit */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`flex-shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all shadow-md ${
              submitted
                ? "bg-emerald-500 shadow-emerald-200"
                : canSubmit
                ? `${cfg.btnColor}`
                : "bg-gray-200 text-gray-400 shadow-none cursor-not-allowed"
            }`}
          >
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.span
                  key="check"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  className="flex items-center gap-1.5"
                >
                  <Check size={15} /> Đã lưu!
                </motion.span>
              ) : (
                <motion.span
                  key="add"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  className="flex items-center gap-1.5"
                >
                  <Plus size={15} /> Lưu
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* ── Category pills ── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
          {QUICK_CATS.map((cat) => (
            <motion.button
              key={cat.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCategory(cat.id === category ? "" : cat.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all whitespace-nowrap ${
                category === cat.id
                  ? "bg-blue-500 text-white border-blue-500 shadow-sm shadow-blue-200"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Validation hint */}
        {amount && !category && (
          <p className="text-[11px] text-amber-500 font-semibold flex items-center gap-1">
            ⚠️ Chọn danh mục để lưu giao dịch
          </p>
        )}
      </div>
    </div>
  );
}
