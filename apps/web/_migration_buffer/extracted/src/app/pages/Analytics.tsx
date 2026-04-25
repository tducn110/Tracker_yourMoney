import { motion } from "motion/react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, Area, AreaChart,
} from "recharts";
import { TrendingUp, PieChart as PieChartIcon, BarChart3, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatVND, mockCategorySpending, mockMonthlyTrend, mockS2SData } from "../data/mockData";

const BarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 text-[12px] min-w-[140px]">
      <p className="font-black text-gray-700 mb-2 pb-1.5 border-b border-gray-100">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex justify-between items-center gap-4 mb-1">
          <span className="font-bold text-gray-500">{p.name === "income" ? "Thu nhập" : "Chi tiêu"}</span>
          <span className="font-black" style={{ color: p.color }}>{formatVND(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-2.5 text-[12px]">
      <p className="font-black text-gray-700">{payload[0].name}</p>
      <p className="font-black" style={{ color: payload[0].payload.color }}>{formatVND(payload[0].value)}</p>
    </div>
  );
};

const avgExpense = Math.round(mockMonthlyTrend.reduce((s, m) => s + m.expense, 0) / mockMonthlyTrend.length);
const totalSavings = mockMonthlyTrend.reduce((s, m) => s + (m.income - m.expense), 0);
const topCat = mockCategorySpending.reduce((max, c) => c.value > max.value ? c : max, mockCategorySpending[0]);

export default function Analytics() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 24 } },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-5 pb-8">

      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-[20px] font-black text-gray-900">Phân Tích Chi Tiêu</h1>
        <p className="text-[12px] font-bold text-gray-400 mt-0.5">Biểu đồ & insight dòng tiền của bạn</p>
      </motion.div>

      {/* Quick KPIs */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Thu nhập tháng", value: formatVND(mockS2SData.monthlyIncome), icon: <ArrowUpRight size={14} className="text-emerald-500" />, color: "#10b981", bg: "#f0fdf4" },
          { label: "Chi tiêu tháng", value: formatVND(mockS2SData.s2sSpent + mockS2SData.fixedExpenses.total), icon: <ArrowDownRight size={14} className="text-red-500" />, color: "#ef4444", bg: "#fef2f2" },
          { label: "Trung bình/tháng", value: formatVND(avgExpense), icon: <BarChart3 size={14} className="text-blue-500" />, color: "#4361ee", bg: "#eef2ff" },
          { label: "Tiết kiệm 6T", value: formatVND(totalSavings), icon: <TrendingUp size={14} className="text-purple-500" />, color: "#8b5cf6", bg: "#f5f3ff" },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: k.bg }}>
                {k.icon}
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wide">{k.label}</p>
            </div>
            <p className="text-[15px] font-black" style={{ color: k.color }}>{k.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Cash Flow Bar Chart */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-black text-[14px] text-gray-900 flex items-center gap-2">
              <BarChart3 size={16} className="text-blue-500" /> Dòng Tiền 6 Tháng
            </h3>
            <p className="text-[11px] font-bold text-gray-400 mt-0.5">Thu nhập vs Chi tiêu theo tháng</p>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-bold">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Thu nhập</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-400" /> Chi tiêu</div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={mockMonthlyTrend} barSize={14} barGap={6}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }} axisLine={false} tickLine={false} dy={8} />
            <YAxis tick={{ fontSize: 10, fill: "#cbd5e1" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000000).toFixed(0)}tr`} dx={-5} />
            <Tooltip cursor={{ fill: '#f8fafc' }} content={<BarTooltip />} />
            <Bar dataKey="income" name="income" fill="#10B981" radius={[5, 5, 0, 0]} isAnimationActive={false} />
            <Bar dataKey="expense" name="expense" fill="#F87171" radius={[5, 5, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Pie + Trend side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Spending Structure Pie */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon size={16} className="text-purple-500" />
            <div>
              <h3 className="font-black text-[14px] text-gray-900">Cơ Cấu Chi Tiêu</h3>
              <p className="text-[11px] font-bold text-gray-400">Phân bố theo danh mục</p>
            </div>
          </div>
          <div className="relative flex justify-center items-center h-[200px]">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={mockCategorySpending} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={3} dataKey="value" stroke="none" isAnimationActive={false}>
                  {mockCategorySpending.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-bold text-gray-400">Tổng chi</span>
              <span className="text-[15px] font-black text-gray-900">
                {formatVND(mockCategorySpending.reduce((s, c) => s + c.value, 0))}
              </span>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {mockCategorySpending.map(cat => (
              <div key={cat.name} className="flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-[11px] font-black text-gray-700">{cat.name}</span>
                </div>
                <span className="text-[11px] font-black text-gray-500">{formatVND(cat.value)}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Spending Trend Area Chart */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-orange-500" />
            <div>
              <h3 className="font-black text-[14px] text-gray-900">Xu Hướng Chi Tiêu</h3>
              <p className="text-[11px] font-bold text-gray-400">Biến động theo thời gian</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={mockMonthlyTrend}>
              <defs>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F87171" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#F87171" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#cbd5e1" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000000).toFixed(0)}tr`} />
              <Tooltip />
              <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fill="url(#incGrad)" dot={false} isAnimationActive={false} />
              <Area type="monotone" dataKey="expense" stroke="#F87171" strokeWidth={2} fill="url(#expGrad)" dot={false} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>

          {/* Insights */}
          <div className="mt-4 pt-3 border-t border-gray-50 grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-wide mb-1">Chi nhiều nhất</p>
              <p className="text-[13px] font-black text-blue-900">{topCat.name}</p>
              <p className="text-[11px] font-bold text-blue-600">{formatVND(topCat.value)}</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-wide mb-1">Tiết kiệm 6T</p>
              <p className="text-[13px] font-black text-emerald-900">{formatVND(totalSavings)}</p>
              <p className="text-[11px] font-bold text-emerald-600">/{mockMonthlyTrend.length} tháng</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Insights Banner */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { bg: "from-blue-500 to-indigo-600", title: "Mức Chi TB", value: formatVND(avgExpense), sub: "/ tháng trong 6 tháng qua", icon: "📊" },
          { bg: "from-purple-500 to-pink-500", title: "Danh Mục Lớn Nhất", value: topCat.name, sub: formatVND(topCat.value), icon: "🏆" },
          { bg: "from-emerald-500 to-teal-500", title: "Tổng Tiết Kiệm", value: formatVND(totalSavings), sub: "trong 6 tháng qua", icon: "💰" },
        ].map(ins => (
          <div key={ins.title} className={`bg-gradient-to-br ${ins.bg} rounded-2xl p-5 text-white`}>
            <div className="text-[24px] mb-2">{ins.icon}</div>
            <p className="text-[11px] font-black text-white/70 uppercase tracking-wide mb-1">{ins.title}</p>
            <p className="text-[18px] font-black">{ins.value}</p>
            <p className="text-[11px] font-bold text-white/70 mt-0.5">{ins.sub}</p>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
