"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles, User, Wallet, BarChart3, ArrowRightToLine,
  Check, ChevronRight, ChevronLeft, ArrowRight, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  savePersonalInfo,
  setupWallet,
  saveBudget,
  saveTransaction,
  completeOnboarding,
} from "@/app/(auth)/onboarding/actions";
import { useAuth } from "@/app/context/AuthProvider";
import { toast } from "sonner";
import confetti from "canvas-confetti";

/* ── Step config ────────────────────────────────────────────────── */

interface StepConfig {
  id: number;
  title: string;
  subtitle: string;
  icon: typeof User;
}

const STEPS: StepConfig[] = [
  { id: 1, title: "Thông tin", subtitle: "Giới thiệu bản thân", icon: User },
  { id: 2, title: "Ví tiền", subtitle: "Tạo ví đầu tiên", icon: Wallet },
  { id: 3, title: "Ngân sách", subtitle: "Đặt hạn mức chi tiêu", icon: BarChart3 },
  { id: 4, title: "Giao dịch", subtitle: "Thêm giao dịch mẫu", icon: ArrowRightToLine },
];

/* ── Helpers ────────────────────────────────────────────────────── */

function ProgressBar({ current, total }: { current: number; total: number }) {
  const percent = (current / total) * 100;
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-sm text-slate-500 font-medium">
        <span>Bước {current}/{total}</span>
        <span>{Math.round(percent)}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function StepIndicator({ steps, current }: { steps: StepConfig[]; current: number }) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-3 mb-8">
      {steps.map((step, idx) => {
        const Icon = step.icon;
        const isActive = current === step.id;
        const isCompleted = current > step.id;
        return (
          <div key={step.id} className="flex items-center gap-1 sm:gap-3">
            <div className="flex flex-col items-center">
              <motion.div
                className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-all ${
                  isActive
                    ? "bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/25 scale-110"
                    : isCompleted
                      ? "bg-emerald-500 shadow-lg shadow-emerald-500/25"
                      : "bg-slate-200"
                }`}
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                ) : (
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? "text-white" : "text-slate-400"}`} />
                )}
              </motion.div>
              <span className={`text-[10px] sm:text-xs mt-1 font-medium hidden sm:block ${
                isActive ? "text-blue-600" : isCompleted ? "text-emerald-600" : "text-slate-400"
              }`}>
                {step.title}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`h-0.5 w-5 sm:w-12 lg:w-20 transition-colors duration-500 ${
                isCompleted ? "bg-emerald-400" : "bg-slate-200"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Step 1: Personal Info ──────────────────────────────────────── */

function StepPersonalInfo({ onNext }: { onNext: (data: { fullName: string }) => void }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await savePersonalInfo({ fullName: name.trim() });
      onNext({ fullName: name.trim() });
    } catch {
      toast.error("Không thể lưu thông tin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">
            Họ và tên <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập họ và tên của bạn"
              className="pl-10 h-12 text-base rounded-xl border-slate-200 bg-white/60 backdrop-blur-sm focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all"
              autoFocus
            />
          </div>
        </div>
        <Button
          type="submit"
          disabled={!name.trim() || loading}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold text-base shadow-lg shadow-blue-500/25 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Tiếp tục <ArrowRight className="w-5 h-5 ml-1" /></>}
        </Button>
      </form>
    </motion.div>
  );
}

/* ── Step 2: Wallet Setup ──────────────────────────────────────── */

const WALLET_PRESETS = [
  { name: "Ví Tiền Mặt", icon: "💵", type: "cash" as const, defaultBalance: 2_000_000 },
  { name: "Tài Khoản Ngân Hàng", icon: "🏦", type: "bank" as const, defaultBalance: 10_000_000 },
  { name: "Ví Điện Tử", icon: "📱", type: "e_wallet" as const, defaultBalance: 1_000_000 },
];

function StepWalletSetup({
  onNext,
  onBack,
}: {
  onNext: (data: { name: string; balance: number; walletId: string }) => void;
  onBack: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [customName, setCustomName] = useState("");
  const [balance, setBalance] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSelectPreset = async (idx: number) => {
    setSelected(idx);
    setLoading(true);
    try {
      const preset = WALLET_PRESETS[idx];
      const res = await setupWallet({ name: preset.name, balance: preset.defaultBalance, type: preset.type });
      onNext({ name: preset.name, balance: preset.defaultBalance, walletId: res.walletId ?? "dev-wallet-1" });
    } catch {
      toast.error("Không thể thiết lập ví.");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !balance) return;
    setLoading(true);
    try {
      const res = await setupWallet({ name: customName.trim(), balance: Number(balance) });
      onNext({ name: customName.trim(), balance: Number(balance), walletId: res.walletId ?? "dev-wallet-1" });
    } catch {
      toast.error("Không thể thiết lập ví.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-5"
    >
      <p className="text-sm text-slate-500">Chọn loại ví để bắt đầu quản lý tài chính</p>

      <div className="space-y-3">
        {WALLET_PRESETS.map((w, idx) => (
          <motion.button
            key={w.name}
            onClick={() => handleSelectPreset(idx)}
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              selected === idx
                ? "border-blue-500 bg-blue-50/60 shadow-md shadow-blue-100"
                : "border-slate-200 bg-white/60 hover:border-blue-300 hover:shadow-sm"
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">{w.icon}</span>
              <div className="flex-1">
                <p className="font-semibold text-slate-800">{w.name}</p>
                <p className="text-xs text-slate-400">
                  Số dư khởi tạo: <span className="font-semibold text-emerald-600">{w.defaultBalance.toLocaleString("vi-VN")}₫</span>
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300" />
            </div>
          </motion.button>
        ))}
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
        <div className="relative flex justify-center"><span className="bg-slate-50 px-3 text-xs text-slate-400 font-medium">HOẶC TẠO VÍ RIÊNG</span></div>
      </div>

      <form onSubmit={handleCustomSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Tên ví</label>
          <Input value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="VD: Ví chính, Tiết kiệm..." className="h-11 rounded-xl border-slate-200 bg-white/60" />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Số dư ban đầu</label>
          <Input type="number" value={balance} onChange={(e) => setBalance(e.target.value)} placeholder="0" className="h-11 rounded-xl border-slate-200 bg-white/60" />
        </div>
        <div className="flex gap-3 pt-1">
          <Button type="button" variant="outline" onClick={onBack} className="h-12 rounded-xl flex-1"><ChevronLeft className="w-5 h-5 mr-1" /> Quay lại</Button>
          <Button type="submit" disabled={!customName.trim() || !balance || loading}
            className="h-12 rounded-xl flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/25 disabled:opacity-50">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Tiếp tục <ArrowRight className="w-5 h-5 ml-1" /></>}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}

/* ── Step 3: Budget Setup ──────────────────────────────────────── */

const BUDGET_PRESETS = [
  { name: "Chi tiêu hàng tháng", icon: "📊", amount: 5_000_000, desc: "Hạn mức chi tiêu linh hoạt" },
  { name: "Tiết kiệm & Đầu tư", icon: "🏦", amount: 3_000_000, desc: "Dành dụm cho tương lai" },
  { name: "Ăn uống", icon: "🍜", amount: 2_000_000, desc: "Chi phí ăn uống mỗi tháng" },
  { name: "Mua sắm", icon: "🛍️", amount: 1_500_000, desc: "Chi tiêu cá nhân" },
];

function StepBudget({
  onNext,
  onBack,
}: {
  onNext: (data: { name: string; targetAmount: number }) => void;
  onBack: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [customName, setCustomName] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSelectPreset = async (idx: number) => {
    setSelected(idx);
    setLoading(true);
    try {
      const preset = BUDGET_PRESETS[idx];
      await saveBudget({ name: preset.name, targetAmount: preset.amount });
      onNext({ name: preset.name, targetAmount: preset.amount });
    } catch {
      toast.error("Không thể tạo ngân sách.");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customAmount) return;
    setLoading(true);
    try {
      await saveBudget({ name: customName.trim(), targetAmount: Number(customAmount) });
      onNext({ name: customName.trim(), targetAmount: Number(customAmount) });
    } catch {
      toast.error("Không thể tạo ngân sách.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-5"
    >
      <p className="text-sm text-slate-500">Đặt hạn mức chi tiêu hàng tháng để kiểm soát tài chính</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {BUDGET_PRESETS.map((b, idx) => (
          <motion.button
            key={b.name}
            onClick={() => handleSelectPreset(idx)}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`text-left p-4 rounded-xl border-2 transition-all ${
              selected === idx
                ? "border-blue-500 bg-blue-50/60 shadow-md shadow-blue-100"
                : "border-slate-200 bg-white/60 hover:border-blue-300 hover:shadow-sm"
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{b.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm">{b.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{b.desc}</p>
                <p className="text-sm font-bold text-blue-600 mt-1">{b.amount.toLocaleString("vi-VN")}₫ /tháng</p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
        <div className="relative flex justify-center"><span className="bg-slate-50 px-3 text-xs text-slate-400 font-medium">HOẶC TỰ NHẬP</span></div>
      </div>

      <form onSubmit={handleCustomSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Tên ngân sách</label>
          <Input value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="VD: Chi tiêu chung..." className="h-11 rounded-xl border-slate-200 bg-white/60" />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Hạn mức (₫/tháng)</label>
          <Input type="number" value={customAmount} onChange={(e) => setCustomAmount(e.target.value)} placeholder="5,000,000" className="h-11 rounded-xl border-slate-200 bg-white/60" />
        </div>
        <div className="flex gap-3 pt-1">
          <Button type="button" variant="outline" onClick={onBack} className="h-12 rounded-xl flex-1"><ChevronLeft className="w-5 h-5 mr-1" /> Quay lại</Button>
          <Button type="submit" disabled={!customName.trim() || !customAmount || loading}
            className="h-12 rounded-xl flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/25 disabled:opacity-50">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Tiếp tục <ArrowRight className="w-5 h-5 ml-1" /></>}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}

/* ── Step 4: Quick Transaction ─────────────────────────────────── */

const TRANSACTION_TEMPLATES = [
  { type: "income" as const, label: "Thu nhập", icon: "💰", note: "Lương tháng", amount: 10_000_000 },
  { type: "expense" as const, label: "Ăn uống", icon: "🍜", note: "Ăn trưa cùng đồng nghiệp", amount: 200_000 },
  { type: "expense" as const, label: "Di chuyển", icon: "🚗", note: "Đổ xăng", amount: 100_000 },
  { type: "expense" as const, label: "Mua sắm", icon: "🛍️", note: "Mua sắm cá nhân", amount: 500_000 },
  { type: "income" as const, label: "Thu nhập thêm", icon: "💼", note: "Thu nhập freelance", amount: 3_000_000 },
];

function StepTransaction({
  walletId,
  onNext,
  onBack,
}: {
  walletId: string;
  onNext: (data: { transactions: number }) => void;
  onBack: () => void;
}) {
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleTemplate = (idx: number) => {
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  };

  const handleSubmit = async () => {
    if (selected.length === 0) {
      // Allow skip — just proceed
      onNext({ transactions: 0 });
      return;
    }
    setLoading(true);
    try {
      await Promise.all(
        selected.map((idx) => {
          const t = TRANSACTION_TEMPLATES[idx];
          return saveTransaction({
            walletId,
            type: t.type,
            amount: t.amount,
            note: t.note,
          });
        }),
      );
      onNext({ transactions: selected.length });
    } catch {
      toast.error("Không thể thêm giao dịch.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-5"
    >
      <p className="text-sm text-slate-500">Thêm một vài giao dịch mẫu để dashboard có dữ liệu hiển thị</p>

      <div className="space-y-2">
        {TRANSACTION_TEMPLATES.map((t, idx) => {
          const isSelected = selected.includes(idx);
          return (
            <motion.button
              key={idx}
              onClick={() => toggleTemplate(idx)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-center gap-3 ${
                isSelected
                  ? t.type === "income"
                    ? "border-emerald-400 bg-emerald-50/60 shadow-sm"
                    : "border-rose-300 bg-rose-50/60 shadow-sm"
                  : "border-slate-200 bg-white/60 hover:border-slate-300"
              }`}
            >
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                isSelected
                  ? t.type === "income"
                    ? "border-emerald-500 bg-emerald-500"
                    : "border-rose-400 bg-rose-400"
                  : "border-slate-300"
              }`}>
                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
              </div>
              <span className="text-xl">{t.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 text-sm">{t.label}</p>
                <p className="text-xs text-slate-400 truncate">{t.note}</p>
              </div>
              <span className={`text-sm font-bold ${t.type === "income" ? "text-emerald-600" : "text-rose-500"}`}>
                {t.type === "income" ? "+" : "-"}{t.amount.toLocaleString("vi-VN")}₫
              </span>
            </motion.button>
          );
        })}
      </div>

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="outline" onClick={onBack} className="h-12 rounded-xl flex-1">
          <ChevronLeft className="w-5 h-5 mr-1" /> Quay lại
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="h-12 rounded-xl flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/25 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : selected.length === 0 ? (
            <>Bỏ qua <ArrowRight className="w-5 h-5 ml-1" /></>
          ) : (
            <>Hoàn tất ({selected.length}) <ArrowRight className="w-5 h-5 ml-1" /></>
          )}
        </Button>
      </div>
      {selected.length === 0 && (
        <p className="text-xs text-center text-slate-400">Bạn có thể bỏ qua bước này và thêm giao dịch sau</p>
      )}
    </motion.div>
  );
}

/* ── Completion ────────────────────────────────────────────────── */

function CompletionScreen() {
  const router = useRouter();
  const { markOnboarded } = useAuth();

  const handleGoToDashboard = () => {
    markOnboarded();
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ["#3B82F6", "#6366F1", "#10B981", "#F59E0B"] });
    setTimeout(() => router.push("/"), 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center justify-center py-8 space-y-6 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 10 }}
        className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-500/30"
      >
        <Check className="w-10 h-10 text-white" />
      </motion.div>

      <div className="space-y-2">
        <h2 className="text-2xl font-extrabold text-slate-800">Thiết lập hoàn tất! 🎉</h2>
        <p className="text-slate-500 max-w-sm">
          Bạn đã sẵn sàng quản lý tài chính cá nhân một cách thông minh.
          Hãy bắt đầu theo dõi thu chi và tiết kiệm ngay hôm nay!
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-xs space-y-3"
      >
        <Button
          onClick={handleGoToDashboard}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold text-base shadow-lg shadow-blue-500/25"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Bắt đầu quản lý tài chính
        </Button>
      </motion.div>
    </motion.div>
  );
}

/* ── Main Wizard ───────────────────────────────────────────────── */

export function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const [stepData, setStepData] = useState<{
    personalInfo: { fullName: string } | null;
    wallet: { name: string; balance: number; walletId: string } | null;
    budget: { name: string; targetAmount: number } | null;
    transaction: { transactions: number } | null;
  }>({
    personalInfo: null,
    wallet: null,
    budget: null,
    transaction: null,
  });

  const handleStep1 = useCallback((d: { fullName: string }) => {
    setStepData((p) => ({ ...p, personalInfo: d }));
    setStep(2);
  }, []);

  const handleStep2 = useCallback((d: { name: string; balance: number; walletId: string }) => {
    setStepData((p) => ({ ...p, wallet: d }));
    setStep(3);
  }, []);

  const handleStep3 = useCallback((d: { name: string; targetAmount: number }) => {
    setStepData((p) => ({ ...p, budget: d }));
    setStep(4);
  }, []);

  const handleStep4 = useCallback((d: { transactions: number }) => {
    setStepData((p) => ({ ...p, transaction: d }));
    setStep(5);
  }, []);

  const handleBack = useCallback(() => setStep((p) => Math.max(1, p - 1)), []);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 relative">
      <div className="absolute top-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/5 blur-[120px] pointer-events-none" />

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20"
          style={{ background: "linear-gradient(135deg, #3B82F6, #6366F1)" }}>
          <Sparkles size={20} className="text-white" />
        </div>
        <div>
          <h1 className="font-bold text-xl text-slate-800 tracking-tight">Thiết lập tài khoản</h1>
          <p className="text-xs text-slate-500">Hoàn tất 4 bước để bắt đầu</p>
        </div>
      </div>

      {step <= 4 && <ProgressBar current={step} total={4} />}

      {step <= 4 && (
        <div className="mt-8">
          <StepIndicator steps={STEPS} current={step} />
        </div>
      )}

      <div className="mt-6">
        <Card className="border-slate-200/80 bg-white/70 backdrop-blur-xl shadow-premium rounded-2xl overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <AnimatePresence mode="wait">
              {step === 1 && <StepPersonalInfo key="s1" onNext={handleStep1} />}
              {step === 2 && <StepWalletSetup key="s2" onNext={handleStep2} onBack={handleBack} />}
              {step === 3 && <StepBudget key="s3" onNext={handleStep3} onBack={handleBack} />}
              {step === 4 && <StepTransaction key="s4" walletId={stepData.wallet?.walletId ?? ""} onNext={handleStep4} onBack={handleBack} />}
              {step === 5 && <CompletionScreen key="done" />}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
