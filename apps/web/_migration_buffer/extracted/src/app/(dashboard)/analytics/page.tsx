'use client';

import { BarChart3, PieChart, TrendingUp } from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mockTransactions, formatVND } from '../../data/mockData';

export default function AnalyticsPage() {
  // Calculate category spending
  const categoryData = mockTransactions
    .filter((tx) => tx.type === 'expense')
    .reduce((acc, tx) => {
      const cat = tx.categoryName || 'Khác';
      acc[cat] = (acc[cat] || 0) + tx.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));

  const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f59e0b', '#10b981'];

  // Monthly trend data
  const monthlyData = [
    { month: 'T10', income: 22000000, expense: 15000000 },
    { month: 'T11', income: 25000000, expense: 18000000 },
    { month: 'T12', income: 23000000, expense: 16000000 },
    { month: 'T1', income: 25000000, expense: 17000000 },
    { month: 'T2', income: 24000000, expense: 15500000 },
    { month: 'T3', income: 25000000, expense: 16800000 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Phân Tích Chi Tiêu</h1>
        <p className="text-sm text-gray-600 mt-1">Thống kê và xu hướng tài chính</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="text-blue-600" />
            <span className="text-sm font-semibold text-blue-900">Tổng thu nhập (6 tháng)</span>
          </div>
          <p className="text-2xl font-bold text-blue-700">{formatVND(144000000)}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={18} className="text-red-600" />
            <span className="text-sm font-semibold text-red-900">Tổng chi tiêu (6 tháng)</span>
          </div>
          <p className="text-2xl font-bold text-red-700">{formatVND(98300000)}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <PieChart size={18} className="text-green-600" />
            <span className="text-sm font-semibold text-green-900">Tiết kiệm được</span>
          </div>
          <p className="text-2xl font-bold text-green-700">{formatVND(45700000)}</p>
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
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatVND(value as number)} />
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
              <Tooltip formatter={(value) => formatVND(value as number)} />
              <Bar dataKey="income" fill="#10b981" name="Thu nhập" />
              <Bar dataKey="expense" fill="#6b7280" name="Chi tiêu" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
