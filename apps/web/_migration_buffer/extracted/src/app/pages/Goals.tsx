'use client';
import { useState } from 'react';
import { Plus, Calculator, X, Target, TrendingUp, Clock, CheckCircle2, PauseCircle } from "lucide-react";
import { mockGoals, formatVND } from "../data/mockData";
import { toast } from "sonner";

type GoalStatus = "active" | "completed" | "paused";

interface Goal {
  id: number;
  name: string;
  icon: string;
  current_saved: number;
  target_amount: number;
  monthly_contribution: number;
  status: GoalStatus;
  deadline: string;
}

const statusConfig: Record<GoalStatus, { label: string; color: string; bg: string; Icon: any }> = {
  active:    { label: "Đang thực hiện", color: "#10B981", bg: "#D1FAE5", Icon: TrendingUp },
  completed: { label: "Hoàn thành",     color: "#4361ee", bg: "#EEF2FF", Icon: CheckCircle2 },
  paused:    { label: "Tạm dừng",       color: "#94A3B8", bg: "#F1F5F9", Icon: PauseCircle },
};

const iconOptions = ["🎯", "📱", "✈️", "🏠", "💻", "🚗", "🎓", "💍", "🏖️", "🛡️", "🎮", "👶"];

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>(mockGoals);
  const [impactAmount, setImpactAmount] = useState("");
  const [impactResult, setImpactResult] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: "", icon: "🎯", target_amount: "", monthly_contribution: "" });

  const handleImpactCheck = () => {
    const amount = parseInt(impactAmount.replace(/\D/g, ""));
    if (!amount) return;
    const activeGoal = goals.find(g => g.status === "active");
    if (!activeGoal) return;
    const days = Math.round((amount / activeGoal.monthly_contribution) * 30);
    setImpactResult(`Nếu chi ${formatVND(amount)}, mục tiêu "${activeGoal.name}" sẽ chậm ~${days} ngày`);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const g: Goal = {
      id: Date.now(),
      name: newGoal.name,
      icon: newGoal.icon,
      current_saved: 0,
      target_amount: parseInt(newGoal.target_amount.replace(/\D/g, "")) || 0,
      monthly_contribution: parseInt(newGoal.monthly_contribution.replace(/\D/g, "")) || 0,
      status: "active",
      deadline: "12/2027",
    };
    setGoals(prev => [g, ...prev]);
    setShowModal(false);
    setNewGoal({ name: "", icon: "🎯", target_amount: "", monthly_contribution: "" });
    toast.success(`Đã tạo mục tiêu "${g.name}" 🎯`);
  };

  const toggleStatus = (id: number) => {
    setGoals(prev => prev.map(g =>
      g.id === id
        ? { ...g, status: g.status === "active" ? "paused" : g.status === "paused" ? "active" : g.status }
        : g
    ));
  };

  const totalSaved  = goals.reduce((s, g) => s + g.current_saved, 0);
  const totalTarget = goals.reduce((s, g) => s + g.target_amount, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-black text-gray-900">Mục Tiêu Tài Chính</h1>
          <p className="text-[12px] font-bold text-gray-400 mt-0.5">{goals.filter(g => g.status === 'active').length} mục tiêu đang thực hiện</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-[13px] font-black shadow-lg shadow-blue-300/40 transition-all hover:shadow-blue-400/50 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #4361ee, #6366f1)' }}
        >
          <Plus size={15} />
          Tạo mục tiêu
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Đang thực hiện", value: goals.filter(g => g.status === "active").length,    color: "#10B981", icon: "🎯" },
          { label: "Hoàn thành",     value: goals.filter(g => g.status === "completed").length,  color: "#4361ee", icon: "✅" },
          { label: "Đã tiết kiệm",   value: formatVND(totalSaved),                               color: "#8b5cf6", icon: "💰" },
          { label: "Cần đạt",        value: formatVND(totalTarget),                              color: "#f59e0b", icon: "🏆" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[16px]">{s.icon}</span>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wide">{s.label}</p>
            </div>
            <p className="text-[16px] font-black" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => {
          const percent = Math.min(Math.round((goal.current_saved / goal.target_amount) * 100), 100);
          const s = statusConfig[goal.status];
          const StatusIcon = s.Icon;
          const remaining  = goal.target_amount - goal.current_saved;
          const monthsLeft = goal.monthly_contribution > 0 ? Math.ceil(remaining / goal.monthly_contribution) : null;
          const barColor   = goal.status === "completed" ? "#4361ee" : goal.status === "paused" ? "#94a3b8" : "#10b981";

          return (
            <div
              key={goal.id}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-[24px] flex-shrink-0"
                    style={{ backgroundColor: s.bg }}>
                    {goal.icon}
                  </div>
                  <div>
                    <h3 className="font-black text-[14px] text-gray-900 leading-tight">{goal.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Clock size={10} className="text-gray-400" />
                      <p className="text-[10px] font-bold text-gray-400">Deadline: {goal.deadline}</p>
                    </div>
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

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[12px] font-black text-gray-900">{formatVND(goal.current_saved)}</span>
                  <span className="text-[11px] font-black" style={{ color: barColor }}>{percent}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${percent}%`, backgroundColor: barColor }}
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <p className="text-[10px] font-bold text-gray-400">Mục tiêu: {formatVND(goal.target_amount)}</p>
                  {monthsLeft !== null && goal.status === "active" && (
                    <p className="text-[10px] font-bold text-gray-400">~{monthsLeft} tháng nữa</p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <div>
                  <p className="text-[10px] font-bold text-gray-400">Mỗi tháng góp</p>
                  <p className="text-[13px] font-black text-gray-900">{formatVND(goal.monthly_contribution)}</p>
                </div>
                {goal.status !== "completed" ? (
                  <button
                    onClick={() => toggleStatus(goal.id)}
                    className="flex items-center gap-1.5 text-[12px] font-bold px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors"
                    style={{ color: goal.status === "active" ? "#f59e0b" : "#10b981" }}
                  >
                    {goal.status === "active" ? "⏸ Tạm dừng" : "▶ Tiếp tục"}
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 text-[12px] font-black text-blue-600">
                    <CheckCircle2 size={14} />
                    Hoàn thành!
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Impact Calculator */}
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
            onChange={e => setImpactAmount(e.target.value)}
            placeholder="Nhập số tiền muốn chi..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] font-bold outline-none focus:border-purple-400 bg-gray-50 text-gray-900"
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

      {/* Add Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-[17px] text-gray-900">Tạo Mục Tiêu Mới 🎯</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-[12px] font-black text-gray-600 mb-2 uppercase tracking-wide">Chọn Icon</label>
                <div className="flex flex-wrap gap-2">
                  {iconOptions.map(ic => (
                    <button key={ic} type="button"
                      onClick={() => setNewGoal({ ...newGoal, icon: ic })}
                      className={`w-10 h-10 rounded-xl text-[18px] border-2 transition-all ${newGoal.icon === ic ? 'border-blue-500 bg-blue-50 scale-110' : 'border-gray-200 hover:border-gray-300'}`}
                    >{ic}</button>
                  ))}
                </div>
              </div>
              {[
                { key: "name",                 label: "Tên mục tiêu",          placeholder: "Mua iPhone 16 Pro", type: "text" },
                { key: "target_amount",        label: "Số tiền mục tiêu (₫)",  placeholder: "25,000,000",        type: "text" },
                { key: "monthly_contribution", label: "Góp hàng tháng (₫)",    placeholder: "2,000,000",         type: "text" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-[12px] font-black text-gray-600 mb-1.5 uppercase tracking-wide">{f.label}</label>
                  <input
                    type={f.type}
                    value={newGoal[f.key as keyof typeof newGoal]}
                    onChange={e => setNewGoal({ ...newGoal, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[14px] font-bold outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 bg-gray-50 text-gray-900 transition-all"
                  />
                </div>
              ))}
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl text-white font-black text-[14px] shadow-lg shadow-blue-300/40 hover:shadow-blue-400/50 transition-all active:scale-[0.98]"
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
