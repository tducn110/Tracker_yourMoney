'use client';

/**
 * Budgets Page — Danh sách ngân sách
 * Budget-First: người dùng chủ động tạo và quản lý hạn mức
 */

import { useState } from 'react';
import { Plus, PiggyBank, Archive, TrendingUp, TrendingDown, Wallet, Loader2 } from 'lucide-react';
import { BudgetCard } from '@/components/budgets/BudgetCard';
import { BudgetFormModal, type BudgetFormData } from '@/components/budgets/BudgetFormModal';
import { toast } from 'sonner';
import { useBudgets, useBudgetSummary, useCreateBudget, useUpdateBudget, useDeleteBudget } from '@/_lib/hooks/use-budgets';
import { formatCurrency, Budget } from '@finance/api-client';
import Decimal from 'decimal.js';

// ─── Summary Strip ────────────────────────────────────────────────────────────
function SummaryStrip() {
  const { data: summary, isLoading } = useBudgetSummary();
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm h-[100px] flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-gray-300 animate-spin" />
          </div>
        ))}
      </div>
    );
  }

  const totalLimit = new Decimal(summary?.totalLimit || 0);
  const totalSpent = new Decimal(summary?.totalSpent || 0);
  const left = totalLimit.minus(totalSpent);
  const isOver = left.isNegative();
  
  // Percent calculation
  let percent = 0;
  if (!totalLimit.isZero()) {
    percent = totalSpent.dividedBy(totalLimit).times(100).toDecimalPlaces(0).toNumber();
  } else if (!totalSpent.isZero()) {
    percent = 100;
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
            <Wallet size={16} className="text-blue-600" />
          </div>
          <p className="text-[12px] font-bold text-gray-500">Tổng hạn mức</p>
        </div>
        <p className="text-[20px] font-black text-gray-900">{formatCurrency(totalLimit)}</p>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
            <TrendingDown size={16} className="text-red-500" />
          </div>
          <p className="text-[12px] font-bold text-gray-500">Đã chi tiêu</p>
        </div>
        <p className="text-[20px] font-black text-gray-900">{formatCurrency(totalSpent)}</p>
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
          {isOver ? '-' : ''}{formatCurrency(left.absoluteValue())}
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
  const { data: budgets = [], isLoading } = useBudgets();
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const deleteBudget = useDeleteBudget();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [showFinished, setShowFinished] = useState(false);

  const activeBudgets = budgets.filter((b) => b.status === 'active');
  const finishedBudgets = budgets.filter((b) => b.status === 'completed');

  const handleCreate = (data: BudgetFormData) => {
    createBudget.mutate(data as any, {
      onSuccess: () => {
        toast.success(`Đã tạo ngân sách "${data.name}" 🎉`);
        setIsFormOpen(false);
      },
      onError: () => {
        toast.error('Lỗi khi tạo ngân sách');
      }
    });
  };

  const handleEdit = (data: BudgetFormData) => {
    if (!editingBudget) return;
    updateBudget.mutate({ id: editingBudget.id, data: data as any }, {
      onSuccess: () => {
        toast.success('Đã cập nhật ngân sách');
        setEditingBudget(null);
        setIsFormOpen(false);
      },
      onError: () => {
        toast.error('Lỗi khi cập nhật ngân sách');
      }
    });
  };

  const handleDelete = (id: string) => {
    deleteBudget.mutate(id, {
      onSuccess: () => {
        toast.success('Đã xóa ngân sách');
      },
      onError: () => {
        toast.error('Lỗi khi xóa ngân sách');
      }
    });
  };

  const openEdit = (budget: any) => {
    setEditingBudget(budget as Budget);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingBudget(null);
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-300/40">
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
            {activeBudgets.map((budget) => (
              <BudgetCard key={budget.id} budget={budget} onEdit={openEdit} onDelete={() => handleDelete(budget.id)} />
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
                <BudgetCard key={budget.id} budget={budget} onEdit={openEdit} onDelete={() => handleDelete(budget.id)} />
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