'use client';

import { useState } from 'react';
import { Target, Plus, TrendingUp, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/_components/ui/button';
import confetti from 'canvas-confetti';
import { useGoals } from '@/_lib/hooks/finance';
import { formatCurrency, Goal } from '@finance/api-client';
import Decimal from 'decimal.js';

export default function GoalsPage() {
  const { data: apiGoals = [], isLoading } = useGoals();
  
  const activeGoals = apiGoals.filter((g: Goal) => g.status === 'active');
  const completedGoals = apiGoals.filter((g: Goal) => g.status === 'completed');

  const handleGoalClick = (goal: Goal) => {
    const currentSaved = new Decimal(goal.currentSaved || 0).toNumber();
    const targetAmount = new Decimal(goal.targetAmount || 1).toNumber();
    const progress = (currentSaved / targetAmount) * 100;
    
    if (progress >= 100) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mục Tiêu Tiết Kiệm</h1>
          <p className="text-sm text-gray-600 mt-1">Lập kế hoạch và đạt mục tiêu tài chính</p>
        </div>
        <Button>
          <Plus size={16} className="mr-2" />
          Thêm Mục Tiêu
        </Button>
      </div>

      {isLoading ? (
        <div className="py-16 flex flex-col items-center gap-3 text-center">
          <Loader2 size={24} className="text-blue-400 animate-spin" />
          <p className="text-[13px] font-black text-gray-400">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <>
          {/* Active Goals */}
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">Đang thực hiện ({activeGoals.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeGoals.map((goal: Goal) => {
                const currentSaved = new Decimal(goal.currentSaved || 0).toNumber();
                const targetAmount = new Decimal(goal.targetAmount || 1).toNumber();
                const monthlyContribution = new Decimal(goal.monthlyContribution || 0).toNumber();
                const progress = Math.min((currentSaved / targetAmount) * 100, 100);
                
                return (
                  <motion.div
                    key={goal.id}
                    whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.08)' }}
                    onClick={() => handleGoalClick(goal)}
                    className="bg-white rounded-xl border border-gray-200 p-6 cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{goal.icon || '🎯'}</span>
                        <div>
                          <h3 className="font-bold text-gray-800">{goal.name}</h3>
                          <p className="text-xs text-gray-500">Mục tiêu: {formatCurrency(targetAmount)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Tiến độ</span>
                        <span className="text-sm font-bold text-blue-600">{Math.round(progress)}%</span>
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
                      <span className="font-bold text-gray-800">{formatCurrency(currentSaved)}</span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <TrendingUp size={14} />
                        <span>+{formatCurrency(monthlyContribution)}/tháng</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Completed Goals */}
          {completedGoals.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-4 mt-8">Đã hoàn thành ({completedGoals.length})</h2>
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
                        <span className="text-3xl opacity-70">{goal.icon || '🏆'}</span>
                        <div>
                          <h3 className="font-bold text-gray-800">{goal.name}</h3>
                          <p className="text-xs text-green-700">Hoàn thành {goal.deadline ? new Date(goal.deadline).toLocaleDateString('vi-VN') : ''}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-700">
                        <p>Mục tiêu: <span className="font-bold">{formatCurrency(targetAmount)}</span></p>
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
