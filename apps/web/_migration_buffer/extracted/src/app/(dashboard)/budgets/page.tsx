'use client';

/**
 * Budgets Page — Danh sách ngân sách
 * Budget-First: người dùng chủ động tạo và quản lý hạn mức
 */

import { useState } from 'react';
import { Plus, PiggyBank, Archive, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { BudgetCard } from '@/app/_components/budgets/BudgetCard';
import { BudgetFormModal, type BudgetFormData } from '@/app/_components/budgets/BudgetFormModal';
import { mockBudgets, mockBudgetSummary, formatVND, type MockBudget } from '@/app/data/mockData';
import { toast } from 'sonner';

// ─── Summary Strip ────────────────────────────────────────────────────────────
function SummaryStrip() {
  const { totalLimit, totalSpent, left, percent } = mockBudgetSummary;
  const isOver = percent >= 100;

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
            <Wallet size={16} className="text-blue-600" />
          </div>
          <p className="text-[12px] font-bold text-gray-500">Tổng hạn mức</p>
        </div>
        <p className="text-[20px] font-black text-gray-900">{formatVND(totalLimit)}</p>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
            <TrendingDown size={16} className="text-red-500" />
          </div>
          <p className="text-[12px] font-bold text-gray-500">Đã chi tiêu</p>
        </div>
        <p className="text-[20px] font-black text-gray-900">{formatVND(totalSpent)}</p>
        <p className="text-[11px] font-semibold text-gray-400 mt-0.5">{percent}% hạn mức</p>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isOver ? 'bg-red-50' : 'bg-emerald-50'}`}>
            <TrendingUp size={16} className={isOver ? 'text-red-500' : 'text-emerald-600'} />
          </div>
          <p className="text-[12px] font-bold text-gray-500">Còn lại</p>
        </div>
        <p className={`text-[20px] font-black ${isOver ? 'text-red-600' : 'text-emerald-600'}`}>
          {left < 0 ? '-' : ''}{formatVND(Math.abs(left))}
        </p>
        <p className="text-[11px] font-semibold text-gray-400 mt-0.5">
          {isOver ? 'Đã vượt ngân sách' : 'Tháng 4/2026'}
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<MockBudget[]>(mockBudgets);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<MockBudget | null>(null);
  const [showFinished, setShowFinished] = useState(false);

  const activeBudgets = budgets.filter((b) => b.status === 'active');
  const finishedBudgets = budgets.filter((b) => b.status === 'finished');

  const handleCreate = (data: BudgetFormData) => {
    const newBudget: MockBudget = {
      id: Date.now(),
      name: data.name,
      budget_limit: data.budget_limit,
      spent: 0,
      left: data.budget_limit,
      percent: 0,
      period_type: data.period_type,
      start_date: data.start_date,
      end_date: data.end_date,
      categories: data.category_ids.map((id) => {
        const cat = { 2: { id: 2, name: 'Ăn Uống', icon: '🍔' }, 3: { id: 3, name: 'Đồ Uống', icon: '🥤' }, 4: { id: 4, name: 'Di Chuyển', icon: '🚗' }, 5: { id: 5, name: 'Nhà Ở', icon: '🏠' }, 6: { id: 6, name: 'Tiết Kiệm', icon: '🏦' }, 7: { id: 7, name: 'Khác', icon: '📦' } }[id];
        return cat ?? { id, name: 'Danh mục', icon: '📦' };
      }),
      wallet_scope: data.wallet_scope,
      status: 'active',
      is_all_categories: data.is_all_categories,
    };
    setBudgets((prev) => [newBudget, ...prev]);
    toast.success(`Đã tạo ngân sách "${data.name}" 🎉`);
  };

  const handleEdit = (data: BudgetFormData) => {
    if (!editingBudget) return;
    setBudgets((prev) =>
      prev.map((b) =>
        b.id === editingBudget.id
          ? { ...b, name: data.name, budget_limit: data.budget_limit, left: data.budget_limit - b.spent, period_type: data.period_type, start_date: data.start_date, end_date: data.end_date, is_all_categories: data.is_all_categories, wallet_scope: data.wallet_scope }
          : b
      )
    );
    toast.success('Đã cập nhật ngân sách');
    setEditingBudget(null);
  };

  const handleDelete = (id: number) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
    toast.success('Đã xóa ngân sách');
  };

  const openEdit = (budget: MockBudget) => {
    setEditingBudget(budget);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingBudget(null);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-300/40">
              <PiggyBank size={18} className="text-white" />
            </div>
            <h1 className="text-[22px] font-black text-gray-900">Ngân Sách</h1>
          </div>
          <p className="text-[13px] font-medium text-gray-500">
            Quản lý hạn mức chi tiêu theo từng danh mục
          </p>
        </div>
        <button
          onClick={() => { setEditingBudget(null); setIsFormOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold text-white shadow-lg shadow-blue-300/40 hover:shadow-blue-400/50 transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #4361ee, #6366f1)' }}
        >
          <Plus size={16} />
          Tạo ngân sách
        </button>
      </div>

      {/* Summary */}
      <SummaryStrip />

      {/* Active Budgets */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-bold text-gray-900">
            Đang chạy
            <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold">
              {activeBudgets.length}
            </span>
          </h2>
        </div>

        {activeBudgets.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
            <PiggyBank size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-[14px] font-bold text-gray-400">Chưa có ngân sách nào</p>
            <p className="text-[12px] text-gray-400 mt-1 mb-4">Tạo ngân sách để theo dõi chi tiêu theo danh mục</p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #4361ee, #6366f1)' }}
            >
              <Plus size={14} />
              Tạo ngân sách đầu tiên
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {activeBudgets.map((budget, i) => (
              <BudgetCard key={budget.id} budget={budget} onEdit={openEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      {/* Finished Budgets */}
      {finishedBudgets.length > 0 && (
        <div>
          <button
            onClick={() => setShowFinished(!showFinished)}
            className="flex items-center gap-2 text-[13px] font-bold text-gray-500 hover:text-gray-700 transition-colors mb-4"
          >
            <Archive size={15} />
            Ngân sách đã kết thúc ({finishedBudgets.length})
            <span className={`transition-transform ${showFinished ? 'rotate-180' : ''}`}>▾</span>
          </button>
          {showFinished && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {finishedBudgets.map((budget) => (
                <BudgetCard key={budget.id} budget={budget} onEdit={openEdit} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Form Modal */}
      <BudgetFormModal
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={editingBudget ? handleEdit : handleCreate}
        initialData={editingBudget}
      />
    </div>
  );
}