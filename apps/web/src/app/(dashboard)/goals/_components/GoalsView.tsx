'use client';

import { Target, Plus, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/_components/ui/button';
import { Skeleton } from '@/_components/ui/skeleton';
import { EmptyState } from '@/_components/EmptyState';
import confetti from 'canvas-confetti';
import { formatCurrency, Goal } from '@finance/api-client';
import Decimal from 'decimal.js';

interface GoalsViewProps {
  isLoading: boolean;
  activeGoals: Goal[];
  completedGoals: Goal[];
  onGoalClick: (goal: Goal) => void;
  onAddGoal?: (data: Record<string, unknown>) => void;
  onContribute?: (goalId: string, amount: string) => void;
  isMutating?: boolean;
}

export function GoalsView({
  isLoading,
  activeGoals,
  completedGoals,
  onGoalClick,
  onAddGoal,
  onContribute,
  isMutating,
}: GoalsViewProps) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mục Tiêu Tiết Kiệm</h1>
          <p className="text-sm text-gray-600 mt-1">
            Lập kế hoạch và đạt mục tiêu tài chính
          </p>
        </div>
        <Button onClick={() => onAddGoal?.({})} disabled={isMutating}>
          <Plus size={16} className="mr-2" />
          Thêm Mục Tiêu
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-6 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full rounded-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Active Goals */}
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Đang thực hiện ({activeGoals.length})
            </h2>
            {activeGoals.length === 0 ? (
              <EmptyState
                icon={<Target size={28} />}
                title="Chưa có mục tiêu nào"
                description="Tạo mục tiêu tiết kiệm để theo dõi tiến độ đạt được ước mơ tài chính của bạn."
                action={
                  <Button onClick={() => onAddGoal?.({})} disabled={isMutating}>
                    <Plus size={14} className="mr-1.5" /> Thêm Mục Tiêu
                  </Button>
                }
              />
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeGoals.map((goal: Goal) => {
                const currentSaved = new Decimal(goal.currentSaved || 0).toNumber();
                const targetAmount = new Decimal(goal.targetAmount || 1).toNumber();
                const monthlyContribution = new Decimal(
                  goal.monthlyContribution || 0
                ).toNumber();
                const progress = Math.min((currentSaved / targetAmount) * 100, 100);

                return (
                  <motion.div
                    key={goal.id}
                    whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.08)' }}
                    onClick={() => onGoalClick(goal)}
                    className="bg-white rounded-xl border border-gray-200 p-6 cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{goal.icon || '🎯'}</span>
                        <div>
                          <h3 className="font-bold text-gray-800">{goal.name}</h3>
                          <p className="text-xs text-gray-500">
                            Mục tiêu: {formatCurrency(targetAmount, "vi-VN")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">
                          Tiến độ
                        </span>
                        <span className="text-sm font-bold text-blue-600">
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="h-full bg-linear-to-r from-blue-500 to-indigo-600"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Đã tiết kiệm</span>
                      <span className="font-bold text-gray-800">
                        {formatCurrency(currentSaved, "vi-VN")}
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <TrendingUp size={14} />
                        <span>
                          +{formatCurrency(monthlyContribution, "vi-VN")}/tháng
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const amt = goal.monthlyContribution || '100000';
                          onContribute?.(goal.id, amt);
                        }}
                        disabled={isMutating}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-md transition-colors"
                      >
                        + Đóng góp
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            )}
          </div>

          {/* Completed Goals */}
          {completedGoals.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-4 mt-8">
                Đã hoàn thành ({completedGoals.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedGoals.map((goal: Goal) => {
                  const targetAmount = new Decimal(goal.targetAmount || 0).toNumber();

                  return (
                    <div
                      key={goal.id}
                      className="bg-linear-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6 relative overflow-hidden"
                    >
                      <div className="absolute top-2 right-2 text-2xl">✅</div>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl opacity-70">
                          {goal.icon || '🏆'}
                        </span>
                        <div>
                          <h3 className="font-bold text-gray-800">{goal.name}</h3>
                          <p className="text-xs text-green-700">
                            Hoàn thành{' '}
                            {goal.deadline
                              ? new Date(goal.deadline).toLocaleDateString('vi-VN')
                              : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-700">
                        <p>
                          Mục tiêu:{' '}
                          <span className="font-bold">
                            {formatCurrency(targetAmount, "vi-VN")}
                          </span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
