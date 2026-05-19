'use client';

import {
  Activity,
  CalendarDays,
  PieChart,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatVND } from '@finance/api-client';

interface PieDataPoint {
  name: string;
  value: number;
}

interface MonthlyDataPoint {
  month: string;
  income: number;
  expense: number;
}

interface AnalyticsViewProps {
  totalIncome: number;
  totalExpense: number;
  savings: number;
  pieData: PieDataPoint[];
  monthlyData: MonthlyDataPoint[];
  selectedDate: string;
  selectedDateLabel: string;
  trendMonths: number;
  hasStats: boolean;
  hasPendingFilter: boolean;
  onDateChange: (date: string) => void;
  onApplyFilter: () => void;
  onTrendMonthsChange: (months: number) => void;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white/95 p-3 shadow-xl backdrop-blur-md">
        <p className="mb-1 text-[11px] font-black uppercase text-gray-400">
          {payload[0].payload.name || payload[0].payload.month}
        </p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-[13px] font-bold" style={{ color: p.color || p.fill }}>
            {p.name}: {formatVND(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: number;
  tone: 'emerald' | 'red' | 'blue';
}) {
  const toneClass = {
    emerald: 'bg-emerald-100 text-emerald-600',
    red: 'bg-red-100 text-red-600',
    blue: 'bg-blue-100 text-blue-600',
  }[tone];
  const valueClass = {
    emerald: 'text-emerald-600',
    red: 'text-red-600',
    blue: 'text-blue-600',
  }[tone];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-transform hover:scale-[1.01]">
      <div className="mb-3 flex items-center gap-2">
        <div className={'flex h-8 w-8 items-center justify-center rounded-full ' + toneClass}>
          <Icon size={16} />
        </div>
        <span className="text-[12px] font-bold uppercase text-gray-500">{label}</span>
      </div>
      <p className={'text-[22px] font-black leading-none ' + valueClass}>{formatVND(value)}</p>
    </div>
  );
}

function NoDataState({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-[240px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-center">
      <Activity size={28} className="mb-3 text-gray-300" />
      <p className="text-sm font-bold text-gray-600">Chưa có dữ liệu</p>
      <p className="mt-1 max-w-xs text-xs text-gray-400">{label}</p>
    </div>
  );
}

export function AnalyticsView({
  totalIncome,
  totalExpense,
  savings,
  pieData,
  monthlyData,
  selectedDate,
  selectedDateLabel,
  trendMonths,
  hasStats,
  hasPendingFilter,
  onDateChange,
  onApplyFilter,
  onTrendMonthsChange,
}: AnalyticsViewProps) {
  const hasPieData = pieData.length > 0;
  const hasTrendData = monthlyData.some((item) => item.income > 0 || item.expense > 0);
  const savingsRate = totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0;

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 p-4 pb-24 md:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-[24px] font-black tracking-normal text-gray-900">Phân tích tài chính</h1>
          <p className="mt-0.5 text-[13px] font-bold text-gray-500">
            Xem thu chi trong ngày đã áp dụng và xu hướng quanh ngày mốc
          </p>
        </div>

        <div className="grid gap-2 rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:grid-cols-[1fr_auto_auto] sm:items-end">
          <label className="grid gap-1 text-[11px] font-black uppercase text-gray-500">
            Ngày mốc
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => onDateChange(event.target.value)}
              className="h-10 rounded-lg border border-gray-200 px-3 text-sm font-bold text-gray-800 outline-none focus:border-blue-500"
            />
          </label>
          <label className="grid gap-1 text-[11px] font-black uppercase text-gray-500">
            Xu hướng
            <select
              value={trendMonths}
              onChange={(event) => onTrendMonthsChange(Number(event.target.value))}
              className="h-10 rounded-lg border border-gray-200 px-3 text-sm font-bold text-gray-800 outline-none focus:border-blue-500"
            >
              <option value={3}>3 tháng</option>
              <option value={6}>6 tháng</option>
              <option value={12}>12 tháng</option>
              <option value={24}>24 tháng</option>
            </select>
          </label>
          <button
            type="button"
            onClick={onApplyFilter}
            className={
              'flex h-10 items-center gap-2 rounded-lg border px-3 transition-colors ' +
              (hasPendingFilter
                ? 'border-blue-500 bg-blue-600 text-white hover:bg-blue-700'
                : 'border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100')
            }
          >
            <CalendarDays size={14} />
            <span className="text-[12px] font-black">Theo bộ lọc</span>
          </button>
        </div>
      </div>

      {hasStats ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard icon={TrendingUp} label="Tổng thu nhập" value={totalIncome} tone="emerald" />
          <StatCard icon={TrendingDown} label="Tổng chi tiêu" value={totalExpense} tone="red" />
          <StatCard icon={PieChart} label="Tiết kiệm" value={savings} tone="blue" />
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
          <Activity size={32} className="mx-auto mb-3 text-gray-300" />
          <p className="text-[15px] font-bold text-gray-500">Chưa có dữ liệu cho {selectedDateLabel}</p>
          <p className="mt-1 text-[12px] text-gray-400">Chọn ngày khác hoặc thêm giao dịch để xem phân tích.</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-[11px] font-black uppercase text-gray-400">Kỳ phân tích</p>
          <p className="mt-1 text-sm font-bold text-gray-900">{selectedDateLabel}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-[11px] font-black uppercase text-gray-400">Tỷ lệ tiết kiệm</p>
          <p className="mt-1 text-sm font-bold text-gray-900">{savingsRate}% trên tổng thu nhập</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-[11px] font-black uppercase text-gray-400">Biến động</p>
          <p className="mt-1 text-sm font-bold text-gray-900">{trendMonths} tháng kết thúc tại {selectedDateLabel}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-black uppercase text-gray-800">Phân bổ chi tiêu</h2>
              <p className="mt-1 text-xs font-semibold text-gray-400">Theo danh mục trong ngày {selectedDateLabel}</p>
            </div>
            <div className="rounded bg-gray-100 px-2 py-1 text-[10px] font-black text-gray-500">DANH MỤC</div>
          </div>
          <div className="h-[320px]">
            {hasPieData ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={900}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={'cell-' + index} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="text-[11px] font-bold text-gray-600">{value}</span>}
                  />
                </RechartsPie>
              </ResponsiveContainer>
            ) : (
              <NoDataState label="Chưa có giao dịch chi tiêu trong ngày được chọn." />
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-black uppercase text-gray-800">Xu hướng thu chi</h2>
              <p className="mt-1 text-xs font-semibold text-gray-400">Khoảng {trendMonths} tháng theo ngày mốc</p>
            </div>
            <div className="rounded bg-gray-100 px-2 py-1 text-[10px] font-black text-gray-500">{trendMonths} THÁNG</div>
          </div>
          <div className="h-[320px]">
            {hasTrendData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fontWeight: 700, fill: '#9ca3af' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
                    tickFormatter={(value) => String(Number(value) / 1000000) + 'M'}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    height={36}
                    formatter={(value) => <span className="text-[11px] font-bold text-gray-600">{value}</span>}
                  />
                  <Bar dataKey="expense" fill="#ef4444" name="Chi tiêu" radius={[4, 4, 0, 0]} barSize={12} />
                  <Bar dataKey="income" fill="#10b981" name="Thu nhập" radius={[4, 4, 0, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <NoDataState label="Chưa có giao dịch thu hoặc chi trong khoảng thời gian được chọn." />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
