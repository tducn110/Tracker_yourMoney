'use client';

import { BarChart3, PieChart, TrendingUp, DollarSign } from 'lucide-react';
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
}

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md border border-gray-100 p-3 rounded-xl shadow-xl">
        <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-1">
          {payload[0].name || payload[0].payload.name || payload[0].payload.month}
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

export function AnalyticsView({
  totalIncome,
  totalExpense,
  savings,
  pieData,
  monthlyData,
}: AnalyticsViewProps) {
  return (
    <div className="p-4 md:p-6 pb-24 max-w-[1200px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-black text-gray-900 tracking-tight">
            Phân Tích Tài Chính
          </h1>
          <p className="text-[13px] font-bold text-gray-400 mt-0.5">
            Thống kê và xu hướng trong 6 tháng gần nhất
          </p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
          <DollarSign size={14} className="text-blue-600" />
          <span className="text-[12px] font-black text-blue-700">Tự động cập nhật</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/40 backdrop-blur-md border border-white/50 p-5 rounded-2xl shadow-sm hover:scale-[1.01] transition-transform">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <TrendingUp size={16} />
            </div>
            <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Tổng thu nhập</span>
          </div>
          <p className="text-[22px] font-black text-emerald-600 leading-none">
            {formatVND(totalIncome)}
          </p>
        </div>

        <div className="bg-white/40 backdrop-blur-md border border-white/50 p-5 rounded-2xl shadow-sm hover:scale-[1.01] transition-transform">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <BarChart3 size={16} />
            </div>
            <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Tổng chi tiêu</span>
          </div>
          <p className="text-[22px] font-black text-red-600 leading-none">
            {formatVND(totalExpense)}
          </p>
        </div>

        <div className="bg-white/40 backdrop-blur-md border border-white/50 p-5 rounded-2xl shadow-sm hover:scale-[1.01] transition-transform">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <PieChart size={16} />
            </div>
            <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Tiết kiệm</span>
          </div>
          <p className="text-[22px] font-black text-blue-600 leading-none">
            {formatVND(savings)}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[15px] font-black text-gray-800 uppercase tracking-wide">Phân bổ chi tiêu</h2>
            <div className="px-2 py-1 bg-gray-100 rounded text-[10px] font-black text-gray-500">DANH MỤC</div>
          </div>
          <div className="h-[320px]">
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
                  animationDuration={1500}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
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
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[15px] font-black text-gray-800 uppercase tracking-wide">Xu hướng thu chi</h2>
            <div className="px-2 py-1 bg-gray-100 rounded text-[10px] font-black text-gray-500">6 THÁNG</div>
          </div>
          <div className="h-[320px]">
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
                  tickFormatter={(value) => `${value / 1000000}M`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
                <Legend 
                  verticalAlign="top" 
                  align="right"
                  height={36}
                  formatter={(value) => <span className="text-[11px] font-bold text-gray-600">{value}</span>}
                />
                <Bar 
                  dataKey="income" 
                  fill="#10b981" 
                  name="Thu nhập" 
                  radius={[4, 4, 0, 0]} 
                  barSize={12}
                />
                <Bar 
                  dataKey="expense" 
                  fill="#ef4444" 
                  name="Chi tiêu" 
                  radius={[4, 4, 0, 0]} 
                  barSize={12}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
