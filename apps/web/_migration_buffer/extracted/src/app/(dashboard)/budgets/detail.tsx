'use client';

/**
 * BudgetDetailPage — Chi tiết ngân sách
 * Hiển thị: progress, recommended daily, projected spending, line chart, transactions
 */

import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft,
  CalendarDays,
  Wallet,
  TrendingUp,
  TrendingDown,
  Calculator,
  BarChart3,
  AlertTriangle,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  mockBudgets,
  mockTransactions,
  mockBudgetDailySpend,
  formatVND,
} from '@/app/data/mockData';

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

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-lg p-3 min-w-[150px]">
      <p className="text-[11px] font-bold text-gray-500 mb-2">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-[12px] font-semibold text-gray-600">
            {entry.name === 'actual' ? 'Thực tế' : 'Kế hoạch'}:{' '}
            <span className="font-bold text-gray-900">{formatVND(entry.value)}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BudgetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const budget = mockBudgets.find((b) => b.id === Number(id));

  if (!budget) {
    return (
      <div className="p-8 text-center">
        <p className="text-[16px] font-bold text-gray-400">Không tìm thấy ngân sách</p>
        <button
          onClick={() => navigate('/budgets')}
          className="mt-4 text-blue-600 text-[14px] font-semibold hover:underline"
        >
          ← Quay lại
        </button>
      </div>
    );
  }

  const {
    name, budget_limit, spent, left, percent,
    categories, period_type, start_date, end_date,
    wallet_scope, is_all_categories,
  } = budget;

  // ── Time calculations ──
  const today = new Date('2026-04-22');
  const startD = new Date(start_date);
  const endD = new Date(end_date);
  const totalDays = Math.ceil((endD.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const daysElapsed = Math.ceil((today.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, Math.ceil((endD.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  const recommendedDaily = daysRemaining > 0 ? Math.round((budget_limit - spent) / daysRemaining) : 0;
  const projectedSpending = daysElapsed > 0 ? Math.round((spent / daysElapsed) * totalDays) : 0;
  const projectedPercent = Math.round((projectedSpending / budget_limit) * 100);

  const isOver = percent >= 100;
  const progressColor = isOver ? '#ef4444' : percent >= 80 ? '#f59e0b' : '#4361ee';

  // ── Lọc giao dịch thuộc budget ──
  const relevantCategoryNames = is_all_categories
    ? null
    : categories.map((c) => c.name);

  const budgetTransactions = mockTransactions.filter((tx) => {
    if (tx.type === 'income') return false;
    if (relevantCategoryNames === null) return true;
    return relevantCategoryNames.includes(tx.category);
  }).slice(0, 10);

  const periodLabel: Record<string, string> = {
    weekly: 'Tuần', monthly: 'Tháng', quarterly: 'Quý', yearly: 'Năm', custom: 'Tùy chỉnh',
  };

  return (
    <div className="p-6 md:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Back Button + Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => navigate('/budgets')}
          className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-all flex-shrink-0 mt-0.5"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[22px]">
              {is_all_categories ? '📊' : categories[0]?.icon ?? '💼'}
            </span>
            <h1 className="text-[22px] font-black text-gray-900">{name}</h1>
          </div>
          <div className="flex items-center gap-3 text-[12px] font-semibold text-gray-400">
            <span className="flex items-center gap-1">
              <CalendarDays size={12} />
              {periodLabel[period_type]} • {start_date} → {end_date}
            </span>
            <span className="flex items-center gap-1">
              <Wallet size={12} />
              {wallet_scope === 'all' ? 'Tất cả ví' : 'Ví cụ thể'}
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
              {left < 0 ? '-' : ''}{formatVND(Math.abs(left))}
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
          <span>Đã chi: <span className="text-gray-800 font-bold">{formatVND(spent)}</span></span>
          <span>Hạn mức: <span className="text-gray-800 font-bold">{formatVND(budget_limit)}</span></span>
        </div>

        {/* Over budget warning */}
        {isOver && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200">
            <AlertTriangle size={14} className="text-red-500" />
            <p className="text-[12px] font-semibold text-red-700">
              Đã vượt {formatVND(Math.abs(left))} — hãy điều chỉnh chi tiêu!
            </p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBox
          label="Chi phí/ngày đề xuất"
          value={recommendedDaily > 0 ? formatVND(recommendedDaily) : '—'}
          sub={`Còn ${daysRemaining} ngày`}
          icon={Calculator}
          accent
        />
        <StatBox
          label="Dự phóng chi tiêu"
          value={formatVND(projectedSpending)}
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
          value={daysElapsed > 0 ? formatVND(Math.round(spent / daysElapsed)) : '—'}
          sub="Trung bình"
          icon={BarChart3}
        />
      </div>

      {/* Line Chart */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <h3 className="text-[14px] font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 size={16} className="text-blue-600" />
          Chi tiêu theo ngày
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={mockBudgetDailySpend} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={recommendedDaily}
              stroke="#4361ee"
              strokeDasharray="4 4"
              label={{ value: 'Kế hoạch/ngày', position: 'right', fontSize: 10, fill: '#4361ee' }}
            />
            <Line
              type="monotone"
              dataKey="actual"
              name="actual"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#10b981' }}
            />
            <Line
              type="monotone"
              dataKey="planned"
              name="planned"
              stroke="#4361ee"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-3 justify-center">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-emerald-500 rounded" />
            <span className="text-[11px] font-semibold text-gray-500">Thực tế</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-blue-600 rounded border-dashed border" />
            <span className="text-[11px] font-semibold text-gray-500">Kế hoạch</span>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-50">
          <h3 className="text-[14px] font-bold text-gray-900">Giao dịch thuộc ngân sách</h3>
          <span className="text-[11px] font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
            {budgetTransactions.length} giao dịch
          </span>
        </div>

        {budgetTransactions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[13px] font-semibold text-gray-400">Chưa có giao dịch nào</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {budgetTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-[16px]">
                    {tx.icon}
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-gray-900">{tx.note}</p>
                    <p className="text-[11px] font-semibold text-gray-400">{tx.category} • {tx.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-[14px] font-black text-gray-800">-{formatVND(Math.abs(tx.amount))}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}