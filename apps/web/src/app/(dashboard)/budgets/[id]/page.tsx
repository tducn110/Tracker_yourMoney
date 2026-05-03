'use client';

/**
 * BudgetDetailPage — Chi tiết ngân sách (wired to real API)
 * Hiển thị: progress, recommended daily, projected spending, line chart, transactions
 */

import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CalendarDays,
  Wallet,
  TrendingUp,
  TrendingDown,
  Calculator,
  BarChart3,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { formatCurrency } from '@finance/api-client';
import { useBudgetDetail } from '@/_lib/hooks/use-budgets';
import Decimal from 'decimal.js';

const BudgetChart = dynamic(() => import('./_components/BudgetChart'), {
  ssr: false,
  loading: () => (
    <div className="py-10 flex items-center justify-center">
      <Loader2 className="w-5 h-5 text-gray-300 animate-spin" />
    </div>
  ),
});

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function DetailProgressBar({ percent }: { percent: number }) {
  const clamped = Math.min(percent, 100);
  const color =
    percent >= 100 ? '#ef4444' : percent >= 80 ? '#f59e0b' : percent >= 20 ? '#4361ee' : '#9ca3af';

  return (
    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full relative transition-all duration-700"
        style={{ width: `${clamped}%`, backgroundColor: color }}
      >
        <div className="absolute inset-0 bg-white/20 rounded-full" />
      </div>
    </div>
  );
}

// ─── Stat Box ─────────────────────────────────────────────────────────────────
function StatBox({ label, value, sub, icon: Icon, accent }: any) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
          <Icon size={15} className="text-blue-600" />
        </div>
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">{label}</p>
      </div>
      <p className={`text-[18px] font-black ${accent ? 'text-blue-700' : 'text-gray-900'}`}>{value}</p>
      {sub && <p className="text-[11px] font-semibold text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Compute daily spend from transactions ─────────────────────────────────────
function computeDailySpend(txs: any[], startDate: string, endDate: string, recommendedDaily: number) {
  const dailyMap = new Map<string, number>();

  // Fill all days in range with 0
  const start = new Date(startDate);
  const end = new Date(endDate);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    dailyMap.set(key, 0);
  }

  // Sum amounts per day
  for (const tx of txs) {
    const day = (tx.displayDate || '').slice(0, 10);
    if (day && dailyMap.has(day)) {
      dailyMap.set(day, (dailyMap.get(day) || 0) + parseFloat(tx.amount));
    }
  }

  // Convert to chart format
  return Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({
      day: date.slice(8),
      actual: Math.round(amount),
      planned: Math.round(recommendedDaily),
    }));
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BudgetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: budget, isLoading, error } = useBudgetDetail(id);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error || !budget) {
    return (
      <div className="p-8 text-center">
        <p className="text-[16px] font-bold text-gray-400">Không tìm thấy ngân sách</p>
        <button
          onClick={() => router.push('/budgets')}
          className="mt-4 text-blue-600 text-[14px] font-semibold hover:underline"
        >
          ← Quay lại
        </button>
      </div>
    );
  }

  const {
    name, targetAmount, spent, left, percent,
    categories: budgetCats, periodType, startDate, endDate,
    walletScope, isAllCategories, icon,
  } = budget;

  const numericLeft = parseFloat(left || '0');
  const numericSpent = parseFloat(spent || '0');
  const numericTarget = parseFloat(targetAmount);

  // ── Time calculations ──
  const today = new Date();
  const startD = new Date(startDate);
  const endD = new Date(endDate);
  const totalDays = Math.ceil((endD.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const daysElapsed = Math.max(1, Math.ceil((today.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24)));
  const daysRemaining = Math.max(0, Math.ceil((endD.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  const recommendedDaily = budget.recommendedDaily ?? (daysRemaining > 0
    ? Math.round((numericTarget - numericSpent) / daysRemaining)
    : 0);
  const projectedSpending = budget.projectedSpending ?? (daysElapsed > 0
    ? Math.round((numericSpent / daysElapsed) * totalDays)
    : 0);
  const projectedPercent = numericTarget > 0 ? Math.round((projectedSpending / numericTarget) * 100) : 0;

  const isOver = percent >= 100;
  const progressColor = isOver ? '#ef4444' : percent >= 80 ? '#f59e0b' : '#4361ee';

  const periodLabel: Record<string, string> = {
    weekly: 'Tuần', monthly: 'Tháng', quarterly: 'Quý', yearly: 'Năm', custom: 'Tùy chỉnh',
  };

  // Transactions from API
  const transactions = budget.transactions || [];
  const chartData = computeDailySpend(transactions, startDate, endDate, recommendedDaily);

  return (
    <div className="p-6 md:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Back Button + Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => router.push('/budgets')}
          className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-all shrink-0 mt-0.5"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[22px]">
              {isAllCategories ? '📊' : (budgetCats?.[0]?.icon ?? icon ?? '💼')}
            </span>
            <h1 className="text-[22px] font-black text-gray-900">{name}</h1>
          </div>
          <div className="flex items-center gap-3 text-[12px] font-semibold text-gray-400">
            <span className="flex items-center gap-1">
              <CalendarDays size={12} />
              {periodLabel[periodType]} • {startDate} → {endDate}
            </span>
            <span className="flex items-center gap-1">
              <Wallet size={12} />
              {walletScope === 'all' ? 'Tất cả ví' : 'Ví cụ thể'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Progress Card */}
      <div
        className="rounded-2xl p-6 border"
        style={{
          background: 'linear-gradient(135deg, #f0f4ff 0%, #e8eeff 100%)',
          borderColor: 'rgba(67,97,238,0.15)',
        }}
      >
        {/* Big Amount */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-[12px] font-bold text-blue-600/70 mb-1">Còn lại để chi tiêu</p>
            <p
              className="text-[36px] font-black leading-none"
              style={{ color: isOver ? '#ef4444' : '#10b981' }}
            >
              {numericLeft < 0 ? '-' : ''}{formatCurrency(String(Math.abs(numericLeft)), "vi-VN")}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[28px] font-black" style={{ color: progressColor }}>{percent}%</p>
            <p className="text-[11px] font-semibold text-gray-500">đã sử dụng</p>
          </div>
        </div>

        {/* Progress Bar */}
        <DetailProgressBar percent={percent} />

        {/* Stats Row */}
        <div className="flex justify-between mt-3 text-[12px] font-semibold text-gray-500">
          <span>Đã chi: <span className="text-gray-800 font-bold">{formatCurrency(spent, "vi-VN")}</span></span>
          <span>Hạn mức: <span className="text-gray-800 font-bold">{formatCurrency(targetAmount, "vi-VN")}</span></span>
        </div>

        {/* Over budget warning */}
        {isOver && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200">
            <AlertTriangle size={14} className="text-red-500" />
            <p className="text-[12px] font-semibold text-red-700">
              Đã vượt {formatCurrency(String(Math.abs(numericLeft)), "vi-VN")} — hãy điều chỉnh chi tiêu!
            </p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBox
          label="Chi phí/ngày đề xuất"
          value={recommendedDaily > 0 ? formatCurrency(String(recommendedDaily), "vi-VN") : '—'}
          sub={`Còn ${daysRemaining} ngày`}
          icon={Calculator}
          accent
        />
        <StatBox
          label="Dự phóng chi tiêu"
          value={formatCurrency(String(projectedSpending), "vi-VN")}
          sub={`${projectedPercent}% hạn mức`}
          icon={TrendingUp}
        />
        <StatBox
          label="Số ngày đã qua"
          value={`${daysElapsed} ngày`}
          sub={`/ ${totalDays} ngày tổng`}
          icon={CalendarDays}
        />
        <StatBox
          label="Chi/ngày thực tế"
          value={daysElapsed > 0 ? formatCurrency(String(Math.round(numericSpent / daysElapsed)), "vi-VN") : '—'}
          sub="Trung bình"
          icon={BarChart3}
        />
      </div>

      {/* Line Chart — dynamically imported (~200KB saved from main bundle) */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <h3 className="text-[14px] font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 size={16} className="text-blue-600" />
          Chi tiêu theo ngày
        </h3>
        <BudgetChart data={chartData} recommendedDaily={recommendedDaily} />
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-50">
          <h3 className="text-[14px] font-bold text-gray-900">Giao dịch thuộc ngân sách</h3>
          <span className="text-[11px] font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
            {transactions.length} giao dịch
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[13px] font-semibold text-gray-400">Chưa có giao dịch nào</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {transactions.slice(0, 20).map((tx: any) => (
              <div
                key={tx.id}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-[16px]">
                    {tx.icon ?? tx.category?.icon ?? '💸'}
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-gray-900">{tx.note ?? tx.category?.name ?? 'Không ghi chú'}</p>
                    <p className="text-[11px] font-semibold text-gray-400">
                      {tx.category?.name ?? tx.categoryName ?? ''} • {new Date(tx.displayDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-[14px] font-black text-gray-800">
                    -{formatCurrency(String(Math.abs(parseFloat(tx.amount))), "vi-VN")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
