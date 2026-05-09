'use client';

import { useState } from 'react';
import { Plus, Calculator, X, Target, TrendingUp, Clock, CheckCircle2, PauseCircle } from 'lucide-react';
import { motion } from 'motion/react';
import Decimal from 'decimal.js';
import { formatVND } from '@finance/api-client';
import type { Goal as GoalType } from '@finance/api-client';

// ── Types ──────────────────────────────────────────────────────────────
export type GoalStatus = 'active' | 'completed' | 'paused' | 'cancelled';

interface GoalWithMeta extends GoalType {
  status: GoalStatus;
}

interface GoalsViewProps {
  isLoading: boolean;
  goals: GoalWithMeta[];
  activeCount: number;
  completedCount: number;
  totalSaved: Decimal;
  totalTarget: Decimal;
  onToggleStatus?: (goalId: string, newStatus: GoalStatus) => void;
  onAddGoal?: (data: Record<string, unknown>) => Promise<void>;
  onContribute?: (goalId: string, amount: string) => void;
  isMutating?: boolean;
}

// ── Constants ───────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<GoalStatus, { label: string; color: string; bg: string; Icon: any }> = {
  active:    { label: 'Đang thực hiện', color: '#10B981', bg: '#D1FAE5', Icon: TrendingUp },
  completed: { label: 'Hoàn thành',     color: '#4361ee', bg: '#EEF2FF', Icon: CheckCircle2 },
  paused:    { label: 'Tạm dừng',       color: '#94A3B8', bg: '#F1F5F9', Icon: PauseCircle },
  cancelled: { label: 'Đã hủy',         color: '#EF4444', bg: '#FEF2F2', Icon: X },
};

const ICON_OPTIONS = ['🎯', '📱', '✈️', '🏠', '💻', '🚗', '🎓', '💍', '🏖️', '🛡️', '🎮', '👶', '💎', '🏦', '🎸'];

// ── Component ───────────────────────────────────────────────────────────
export function GoalsView({
  isLoading,
  goals,
  activeCount,
  completedCount,
  totalSaved,
  totalTarget,
  onToggleStatus,
  onAddGoal,
  onContribute,
  isMutating,
}: GoalsViewProps) {
  const [showModal, setShowModal] = useState(false);
  const [impactAmount, setImpactAmount] = useState('');
  const [impactResult, setImpactResult] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState({
    name: '',
    icon: '🎯',
    targetAmount: '',
    monthlyContribution: '',
  });

  const activeGoals = goals.filter((g) => g.status === 'active');
  const completedGoals = goals.filter((g) => g.status === 'completed');

  // ── Impact Calculator ──────────────────────────────────────────
  const handleImpactCheck = () => {
    const amount = parseInt(impactAmount.replace(/\D/g, ''));
    if (!amount) return;
    const activeGoal = activeGoals[0];
    if (!activeGoal) {
      setImpactResult('Bạn chưa có mục tiêu nào đang thực hiện.');
      return;
    }
    const contribution = new Decimal(activeGoal.monthlyContribution || '0');
    if (contribution.eq(0)) {
      setImpactResult('Mục tiêu hiện tại chưa có kế hoạch góp hàng tháng.');
      return;
    }
    const days = Math.round((amount / contribution.toNumber()) * 30);
    setImpactResult(`Nếu chi ${formatVND(amount)}, mục tiêu "${activeGoal.name}" sẽ chậm ~${days} ngày`);
  };

  // ── Add Goal Handler ───────────────────────────────────────────
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddGoal) return;
    await onAddGoal({
      name: newGoal.name,
      icon: newGoal.icon,
      targetAmount: newGoal.targetAmount.replace(/\D/g, '') || '0',
      monthlyContribution: newGoal.monthlyContribution.replace(/\D/g, '') || '0',
    });
    setShowModal(false);
    setNewGoal({ name: '', icon: '🎯', targetAmount: '', monthlyContribution: '' });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-5 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded-xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-56 bg-gray-100 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-6">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-black text-gray-900">Mục Tiêu Tài Chính</h1>
          <p className="text-[12px] font-bold text-gray-400 mt-0.5">
            {activeCount} mục tiêu đang thực hiện
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          disabled={isMutating}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-[13px] font-black shadow-lg shadow-blue-300/40 transition-all hover:shadow-blue-400/50 active:scale-95 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #4361ee, #6366f1)' }}
        >
          <Plus size={15} />
          Tạo mục tiêu
        </button>
      </div>

      {/* ── Stats Row ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Đang thực hiện', value: activeCount,           color: '#10B981', icon: '🎯' },
          { label: 'Hoàn thành',     value: completedCount,         color: '#4361ee', icon: '✅' },
          { label: 'Đã tiết kiệm',   value: formatVND(totalSaved),  color: '#8b5cf6', icon: '💰' },
          { label: 'Cần đạt',        value: formatVND(totalTarget), color: '#f59e0b', icon: '🏆' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[16px]">{s.icon}</span>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wide">{s.label}</p>
            </div>
            <p className="text-[16px] font-black" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Goals Grid ───────────────────────────────────────────── */}
      {activeGoals.length > 0 && (
        <div>
          <h2 className="text-[14px] font-black text-gray-600 uppercase tracking-wide mb-3">
            Đang thực hiện ({activeGoals.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeGoals.map((goal) => {
              const currentSaved = new Decimal(goal.currentSaved || 0).toNumber();
              const targetAmount = new Decimal(goal.targetAmount || 1).toNumber();
              const monthlyContribution = new Decimal(goal.monthlyContribution || 0).toNumber();
              const percent = Math.min(Math.round((currentSaved / targetAmount) * 100), 100);
              const remaining = targetAmount - currentSaved;
              const monthsLeft = monthlyContribution > 0 ? Math.ceil(remaining / monthlyContribution) : null;
              const s = STATUS_CONFIG[goal.status as GoalStatus] || STATUS_CONFIG.active;
              const StatusIcon = s.Icon;
              const barColor = '#10b981';

              return (
                <motion.div
                  key={goal.id}
                  whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm transition-all"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-[24px] flex-shrink-0"
                        style={{ backgroundColor: s.bg }}
                      >
                        {goal.icon || '🎯'}
                      </div>
                      <div>
                        <h3 className="font-black text-[14px] text-gray-900 leading-tight">{goal.name}</h3>
                        {goal.deadline && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Clock size={10} className="text-gray-400" />
                            <p className="text-[10px] font-bold text-gray-400">
                              Deadline: {new Date(goal.deadline).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-black"
                      style={{ backgroundColor: s.bg, color: s.color }}
                    >
                      <StatusIcon size={10} />
                      {s.label}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[12px] font-black text-gray-900">{formatVND(goal.currentSaved || '0')}</span>
                      <span className="text-[11px] font-black" style={{ color: barColor }}>{percent}%</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                        style={{ backgroundColor: barColor }}
                      />
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <p className="text-[10px] font-bold text-gray-400">Mục tiêu: {formatVND(goal.targetAmount || '0')}</p>
                      {monthsLeft !== null && monthsLeft > 0 && (
                        <p className="text-[10px] font-bold text-gray-400">~{monthsLeft} tháng nữa</p>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400">Mỗi tháng góp</p>
                      <p className="text-[13px] font-black text-gray-900">{formatVND(goal.monthlyContribution || '0')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Contribute Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const amt = monthlyContribution > 0 ? String(monthlyContribution) : '100000';
                          onContribute?.(goal.id, amt);
                        }}
                        disabled={isMutating}
                        className="text-[11px] font-black text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                      >
                        + Góp
                      </button>
                      {/* Toggle Status */}
                      <button
                        onClick={() => onToggleStatus?.(goal.id, 'paused')}
                        className="flex items-center gap-1 text-[11px] font-bold px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors text-amber-600"
                      >
                        ⏸ Tạm dừng
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Paused Goals */}
      {goals.filter(g => g.status === 'paused').length > 0 && (
        <div>
          <h2 className="text-[14px] font-black text-gray-400 uppercase tracking-wide mb-3">
            Tạm dừng
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.filter(g => g.status === 'paused').map((goal) => {
              const currentSaved = new Decimal(goal.currentSaved || 0).toNumber();
              const targetAmount = new Decimal(goal.targetAmount || 1).toNumber();
              const percent = Math.min(Math.round((currentSaved / targetAmount) * 100), 100);
              const s = STATUS_CONFIG.paused;
              const StatusIcon = s.Icon;

              return (
                <div
                  key={goal.id}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm opacity-75"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-[24px] flex-shrink-0"
                        style={{ backgroundColor: s.bg }}
                      >
                        {goal.icon || '🎯'}
                      </div>
                      <div>
                        <h3 className="font-black text-[14px] text-gray-900 leading-tight">{goal.name}</h3>
                      </div>
                    </div>
                    <div
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-black"
                      style={{ backgroundColor: s.bg, color: s.color }}
                    >
                      <StatusIcon size={10} />
                      {s.label}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[12px] font-black text-gray-500">{formatVND(goal.currentSaved || '0')}</span>
                      <span className="text-[11px] font-black text-gray-400">{percent}%</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${percent}%`, backgroundColor: '#94a3b8' }}
                      />
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <p className="text-[10px] font-bold text-gray-400">Mục tiêu: {formatVND(goal.targetAmount || '0')}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <p className="text-[13px] font-black text-gray-500">{formatVND(goal.monthlyContribution || '0')}/tháng</p>
                    <button
                      onClick={() => onToggleStatus?.(goal.id, 'active')}
                      className="flex items-center gap-1 text-[11px] font-bold px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors text-emerald-600"
                    >
                      ▶ Tiếp tục
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div>
          <h2 className="text-[14px] font-black text-emerald-600 uppercase tracking-wide mb-3">
            Hoàn thành ({completedGoals.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedGoals.map((goal) => {
              const targetAmount = new Decimal(goal.targetAmount || 0).toNumber();

              return (
                <div
                  key={goal.id}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-200 relative overflow-hidden"
                >
                  <div className="absolute top-2 right-2 text-2xl">✅</div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl opacity-70">{goal.icon || '🏆'}</span>
                    <div>
                      <h3 className="font-black text-[14px] text-gray-800">{goal.name}</h3>
                      <p className="text-[10px] font-bold text-green-700">
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
                      <span className="font-black">{formatVND(targetAmount)}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {goals.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Target size={40} className="text-gray-300 mx-auto mb-3" />
          <h3 className="font-black text-[15px] text-gray-500 mb-1">Chưa có mục tiêu nào</h3>
          <p className="text-[12px] font-bold text-gray-400">
            Tạo mục tiêu tiết kiệm để theo dõi tiến độ
          </p>
        </div>
      )}

      {/* ── Impact Calculator ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
            <Calculator size={15} className="text-purple-600" />
          </div>
          <div>
            <h3 className="font-black text-[14px] text-gray-900">Máy Tính Tác Động</h3>
            <p className="text-[11px] font-bold text-gray-400">Chi thêm sẽ ảnh hưởng mục tiêu thế nào?</p>
          </div>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            value={impactAmount}
            onChange={(e) => setImpactAmount(e.target.value)}
            placeholder="Nhập số tiền muốn chi..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] font-bold outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 bg-gray-50 text-gray-900 transition-all"
          />
          <button
            onClick={handleImpactCheck}
            className="px-5 py-2.5 rounded-xl text-white font-black text-[13px] hover:shadow-md transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}
          >
            Kiểm tra
          </button>
        </div>
        {impactResult && (
          <div className="mt-3 p-3.5 rounded-xl bg-purple-50 border border-purple-100">
            <p className="text-[13px] font-bold text-purple-800">💡 {impactResult}</p>
          </div>
        )}
      </div>

      {/* ── Add Goal Modal ───────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-[17px] text-gray-900">Tạo Mục Tiêu Mới 🎯</h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              {/* Icon Picker */}
              <div>
                <label className="block text-[12px] font-black text-gray-600 mb-2 uppercase tracking-wide">
                  Chọn Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {ICON_OPTIONS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setNewGoal({ ...newGoal, icon: ic })}
                      className={`w-10 h-10 rounded-xl text-[18px] border-2 transition-all ${
                        newGoal.icon === ic
                          ? 'border-blue-500 bg-blue-50 scale-110'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-[12px] font-black text-gray-600 mb-1.5 uppercase tracking-wide">
                  Tên mục tiêu
                </label>
                <input
                  type="text"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  placeholder="Mua iPhone 16 Pro"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[14px] font-bold outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 bg-gray-50 text-gray-900 transition-all"
                />
              </div>

              {/* Target Amount */}
              <div>
                <label className="block text-[12px] font-black text-gray-600 mb-1.5 uppercase tracking-wide">
                  Số tiền mục tiêu (₫)
                </label>
                <input
                  type="text"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                  placeholder="25,000,000"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[14px] font-bold outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 bg-gray-50 text-gray-900 transition-all"
                />
              </div>

              {/* Monthly Contribution */}
              <div>
                <label className="block text-[12px] font-black text-gray-600 mb-1.5 uppercase tracking-wide">
                  Góp hàng tháng (₫)
                </label>
                <input
                  type="text"
                  value={newGoal.monthlyContribution}
                  onChange={(e) => setNewGoal({ ...newGoal, monthlyContribution: e.target.value })}
                  placeholder="2,000,000"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[14px] font-bold outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 bg-gray-50 text-gray-900 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isMutating}
                className="w-full py-3.5 rounded-xl text-white font-black text-[14px] shadow-lg shadow-blue-300/40 hover:shadow-blue-400/50 transition-all active:scale-[0.98] disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #4361ee, #6366f1)' }}
              >
                Tạo Mục Tiêu
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
