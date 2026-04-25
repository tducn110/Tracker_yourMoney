'use client';

/**
 * TopGoalCard — Top active savings goal (dashboard widget)
 * Section header "Mục tiêu" + one prominent goal card.
 * No motion/react — CSS transitions only.
 */

import { ChevronRight, Target, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router';
import { mockGoals, formatVND } from '@/app/data/mockData';

export function TopGoalCard() {
  const navigate = useNavigate();
  const topGoal = mockGoals.find((g) => g.status === 'active');

  if (!topGoal) return null;

  const percent = Math.min(
    100,
    Math.round((topGoal.current_saved / topGoal.target_amount) * 100)
  );
  const remaining = topGoal.target_amount - topGoal.current_saved;

  return (
    <section>
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
            <Target size={14} className="text-purple-600" />
          </div>
          <h2 className="text-[14px] font-black text-gray-900">Mục tiêu</h2>
        </div>
        <button
          onClick={() => navigate('/goals')}
          className="flex items-center gap-1 text-[12px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
        >
          Tất cả <ChevronRight size={14} />
        </button>
      </div>

      {/* Goal card */}
      <div
        className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 cursor-pointer p-5"
        onClick={() => navigate('/goals')}
      >
        {/* Top row */}
        <div className="flex items-start gap-4 mb-4">
          {/* Goal icon */}
          <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-[28px] flex-shrink-0">
            {topGoal.icon}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-[16px] font-black text-gray-900 truncate leading-tight">
              {topGoal.name}
            </h3>
            <p className="text-[12px] font-bold text-gray-400 mt-0.5">
              Deadline: {topGoal.deadline}
            </p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <TrendingUp size={11} className="text-purple-500" />
              <span className="text-[11px] font-bold text-purple-600">
                +{formatVND(topGoal.monthly_contribution)}/tháng
              </span>
            </div>
          </div>

          {/* Percentage */}
          <div className="flex-shrink-0 text-right">
            <p className="text-[28px] font-black text-purple-600 leading-none">{percent}%</p>
            <p className="text-[10px] font-bold text-gray-400 mt-0.5">hoàn thành</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-700"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Amount row */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-400 mb-0.5">Đã tiết kiệm</p>
            <p className="text-[18px] font-black text-gray-900 leading-none">
              {formatVND(topGoal.current_saved)}
            </p>
          </div>
          <div className="w-px h-8 bg-gray-100 flex-shrink-0" />
          <div className="text-center">
            <p className="text-[11px] font-bold text-gray-400 mb-0.5">Mục tiêu</p>
            <p className="text-[18px] font-black text-gray-700 leading-none">
              {formatVND(topGoal.target_amount)}
            </p>
          </div>
          <div className="w-px h-8 bg-gray-100 flex-shrink-0" />
          <div className="text-right">
            <p className="text-[11px] font-bold text-gray-400 mb-0.5">Còn thiếu</p>
            <p className="text-[18px] font-black text-purple-600 leading-none">
              {formatVND(remaining)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
