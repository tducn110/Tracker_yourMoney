'use client';

/**
 * BudgetChart — Daily spending line chart
 * Dynamically imported to keep ~200KB recharts out of main bundle.
 */

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
import { formatCurrency } from '@finance/api-client';
import { BarChart3 } from 'lucide-react';

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-lg p-3 min-w-[150px]">
      <p className="text-[11px] font-bold text-gray-500 mb-2">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-[12px] font-semibold text-gray-600">
            {entry.name === 'actual' ? 'Thực tế' : 'Kế hoạch'}:{' '}
            <span className="font-bold text-gray-900">{formatCurrency(String(entry.value), "vi-VN")}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface BudgetChartProps {
  data: { day: string; actual: number; planned: number }[];
  recommendedDaily: number;
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function BudgetChart({ data, recommendedDaily }: BudgetChartProps) {
  if (data.length === 0) {
    return (
      <div className="py-10 text-center">
        <BarChart3 size={28} className="text-gray-200 mx-auto mb-2" />
        <p className="text-[12px] font-bold text-gray-400">Chưa có dữ liệu chi tiêu</p>
      </div>
    );
  }

  return (
    <>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip content={<ChartTooltip />} />
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
    </>
  );
}
