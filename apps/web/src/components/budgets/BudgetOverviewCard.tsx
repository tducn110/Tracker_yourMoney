'use client';

/**
 * BudgetOverviewCard — Premium Dashboard Hero
 * Inspired by Supabase/Firebase aesthetics.
 * Uses motion/react for smooth animations and Tailwind v4 linear-to-br.
 */

import { TrendingUp, TrendingDown, ArrowRight, PiggyBank, Loader2, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useBudgetSummary } from '@/_lib/hooks/use-budgets';
import { formatVND, BudgetSummary } from '@finance/api-client';
import { motion, AnimatePresence } from 'motion/react';
import Decimal from 'decimal.js';

// ─── Progress Bar (Premium) ──────────────────────────────────────────────────
function BudgetProgressBar({ percent }: { percent: number }) {
  const clamped = Math.min(percent, 100);
  
  // Color logic based on status
  const getGradient = () => {
    if (percent >= 100) return 'from-red-500 to-rose-600';
    if (percent >= 80) return 'from-amber-400 to-orange-500';
    return 'from-emerald-400 to-teal-500';
  };

  return (
    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden p-[2px] backdrop-blur-sm border border-white/5">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
        className={`h-full rounded-full bg-linear-to-r ${getGradient()} shadow-[0_0_12px_rgba(16,185,129,0.3)]`}
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface BudgetOverviewCardProps {
  data?: BudgetSummary;
}

export function BudgetOverviewCard({ data: propData }: BudgetOverviewCardProps) {
  const router = useRouter();
  const { data: apiData, isLoading } = useBudgetSummary();
  
  const data = propData || apiData;

  if (isLoading && !propData) {
    return (
      <div className="rounded-3xl p-8 bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center min-h-[220px] shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-transparent pointer-events-none" />
        <Loader2 size={32} className="text-blue-500 animate-spin mb-4" />
        <p className="text-[14px] font-black text-zinc-500 tracking-tight">Đang tải ngân sách...</p>
      </div>
    );
  }

  if (!data) return null;

  const percent = data.percent || 0;
  const isOverBudget = percent >= 100;
  const left = new Decimal(data.left || 0).toNumber();
  const totalLimit = new Decimal(data.totalLimit || 0).toNumber();
  const totalSpent = new Decimal(data.totalSpent || 0).toNumber();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative rounded-3xl p-6 bg-zinc-950 border border-white/10 shadow-2xl overflow-hidden"
    >
      {/* Premium Background Effects */}
      <div className="absolute inset-0 bg-linear-to-br from-zinc-900 to-black pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-blue-600/20 transition-all duration-700" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md shadow-inner">
              <PiggyBank size={18} className="text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
            </div>
            <div>
              <h3 className="font-black text-[14px] text-white tracking-tight">Tổng ngân sách</h3>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Hạn mức tháng này</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/budgets')}
            className="group/btn flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[12px] font-black text-zinc-300 hover:text-white hover:bg-white/10 hover:border-white/10 transition-all active:scale-95"
          >
            Chi tiết 
            <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Amount Section */}
        <div className="space-y-6">
          <div>
            <div className="flex items-baseline gap-2 mb-2">
              <motion.h2
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`text-[42px] font-black leading-none tracking-tighter ${
                  isOverBudget ? 'text-red-500' : 'text-emerald-400'
                }`}
                style={{ textShadow: isOverBudget ? '0 0 20px rgba(239,68,68,0.2)' : '0 0 20px rgba(52,211,153,0.2)' }}
              >
                {left < 0 ? '-' : ''}{formatVND(Math.abs(left))}
              </motion.h2>
              <span className="text-[14px] font-bold text-zinc-500 lowercase">còn lại</span>
            </div>

            <BudgetProgressBar percent={percent} />

            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center gap-2 text-zinc-400">
                <span className="text-[13px] font-black">{formatVND(totalSpent)}</span>
                <span className="text-[11px] font-bold text-zinc-600">/ {formatVND(totalLimit)}</span>
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-black shadow-lg ${
                  percent >= 100 ? 'bg-red-500/20 text-red-500 border border-red-500/20'
                  : percent >= 80 ? 'bg-amber-500/20 text-amber-500 border border-amber-500/20'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                }`}
              >
                <Sparkles size={12} />
                {percent}%
              </motion.div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
            <div className={`flex items-center gap-2 text-[12px] font-black ${
              isOverBudget ? 'text-red-400' : 'text-emerald-400'
            }`}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                isOverBudget ? 'bg-red-500' : 'bg-emerald-500'
              }`} />
              {isOverBudget ? 'Vượt hạn mức chi tiêu' : 'Ngân sách đang an toàn'}
            </div>
            <div className="text-[11px] font-bold text-zinc-500">
              Cập nhật 1 phút trước
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}


