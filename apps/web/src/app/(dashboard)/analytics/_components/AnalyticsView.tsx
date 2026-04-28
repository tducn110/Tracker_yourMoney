'use client';

import { BarChart3, PieChart, TrendingUp } from 'lucide-react';
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
} from 'recharts';
import { formatCurrency } from '@finance/api-client';

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

const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f59e0b', '#10b981'];

export function AnalyticsView({
  totalIncome,
  totalExpense,
  savings,
  pieData,
  monthlyData,
}: AnalyticsViewProps) {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Phân Tích Chi Tiêu</h1>
        <p className="text-sm text-gray-600 mt-1">Thống kê và xu hướng tài chính</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="text-blue-600" />
            <span className="text-sm font-semibold text-blue-900">Tổng thu nhập (6 tháng)</span>
          </div>
          <p className="text-2xl font-bold text-blue-700">
            {formatCurrency(totalIncome.toString(), 'vi-VN')}
          </p>
        </div>
        <div className="bg-linear-to-br from-red-50 to-orange-50 rounded-xl border border-red-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={18} className="text-red-600" />
            <span className="text-sm font-semibold text-red-900">Tổng chi tiêu (6 tháng)</span>
          </div>
          <p className="text-2xl font-bold text-red-700">
            {formatCurrency(totalExpense.toString(), 'vi-VN')}
          </p>
        </div>
        <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <PieChart size={18} className="text-green-600" />
            <span className="text-sm font-semibold text-green-900">Tiết kiệm được</span>
          </div>
          <p className="text-2xl font-bold text-green-700">
            {formatCurrency(savings.toString(), 'vi-VN')}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-800 mb-4">Chi tiêu theo danh mục</h2>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPie>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(String(value), 'vi-VN')} />
            </RechartsPie>
          </ResponsiveContainer>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-800 mb-4">Xu hướng 6 tháng</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
              <Tooltip formatter={(value) => formatCurrency(String(value), 'vi-VN')} />
              <Bar dataKey="income" fill="#10b981" name="Thu nhập" />
              <Bar dataKey="expense" fill="#6b7280" name="Chi tiêu" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
