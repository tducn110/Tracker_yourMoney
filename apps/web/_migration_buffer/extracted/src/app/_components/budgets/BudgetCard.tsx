'use client';

/**
 * BudgetCard — Single budget card
 * Progress bar 4-color, vibrant text, no motion/react.
 */

import { MoreHorizontal, Pencil, Trash2, CalendarDays, GripVertical } from 'lucide-react';
import { useState } from 'react';
import { type MockBudget, formatVND } from '@/app/data/mockData';
import { useNavigate } from 'react-router';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getProgressColor(percent: number): string {
  if (percent >= 100) return '#ef4444';
  if (percent >= 80)  return '#f59e0b';
  if (percent >= 20)  return '#4361ee';
  return '#9ca3af';
}

function getStatusBadge(percent: number): { text: string; bg: string; textColor: string } {
  if (percent >= 100) return { text: 'Vượt ngân sách', bg: '#fee2e2', textColor: '#dc2626' };
  if (percent >= 80)  return { text: 'Gần hết',         bg: '#fef3c7', textColor: '#d97706' };
  if (percent >= 20)  return { text: 'Đang chạy',        bg: '#eff6ff', textColor: '#2563eb' };
  return                     { text: 'Mới bắt đầu',     bg: '#f3f4f6', textColor: '#6b7280' };
}

const periodLabel: Record<string, string> = {
  weekly: 'Tuần', monthly: 'Tháng', quarterly: 'Quý', yearly: 'Năm', custom: 'Tùy chỉnh',
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface BudgetCardProps {
  budget: MockBudget;
  reorderMode?: boolean;
  isDragOver?: boolean;
  onEdit?: (budget: MockBudget) => void;
  onDelete?: (id: number) => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BudgetCard({
  budget,
  reorderMode = false,
  isDragOver = false,
  onEdit,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: BudgetCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const {
    name, budget_limit, spent, left, percent,
    categories, period_type, end_date, is_all_categories,
  } = budget;

  const clamped       = Math.min(percent, 100);
  const progressColor = getProgressColor(percent);
  const status        = getStatusBadge(percent);

  const endDate  = new Date(end_date);
  const today    = new Date('2026-04-23');
  const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / 86_400_000));

  const amountColor = percent >= 100 ? '#dc2626' : percent >= 80 ? '#d97706' : '#111827';

  return (
    <div
      draggable={reorderMode}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onClick={() => !reorderMode && navigate(`/budgets/${budget.id}`)}
      className={`
        bg-white rounded-2xl p-5 border shadow-sm cursor-pointer relative transition-all duration-200
        ${isDragOver ? 'scale-[1.03] border-blue-300 shadow-blue-100' : 'border-gray-100 hover:border-gray-200 hover:shadow-md'}
        ${reorderMode ? 'cursor-grab active:cursor-grabbing select-none' : 'hover:-translate-y-0.5'}
      `}
    >
      {/* Drag handle */}
      {reorderMode && (
        <div className="absolute top-3 left-3 p-1 rounded-lg bg-gray-50 border border-gray-100">
          <GripVertical size={14} className="text-gray-400" />
        </div>
      )}

      {/* Top row */}
      <div className={`flex items-start justify-between mb-3 ${reorderMode ? 'pl-6' : ''}`}>
        <div className="flex-1 min-w-0">
          {/* Category icons */}
          <div className="flex items-center gap-1 mb-1.5">
            {is_all_categories ? (
              <span className="text-[16px]">📊</span>
            ) : (
              categories.slice(0, 3).map((cat) => (
                <span key={cat.id} className="text-[16px]">{cat.icon}</span>
              ))
            )}
            {categories.length > 3 && (
              <span className="text-[11px] font-bold text-gray-400">+{categories.length - 3}</span>
            )}
          </div>

          {/* Budget name — bold, prominent */}
          <h3
            className="text-[15px] font-black truncate"
            style={{ color: percent >= 100 ? '#dc2626' : '#111827' }}
          >
            {name}
          </h3>

          <div className="flex items-center gap-2 mt-1">
            <span
              className="text-[10px] font-black px-2 py-0.5 rounded-full"
              style={{ backgroundColor: status.bg, color: status.textColor }}
            >
              {status.text}
            </span>
            <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
              <CalendarDays size={10} />
              {periodLabel[period_type]}
            </span>
          </div>
        </div>

        {/* Context menu */}
        {!reorderMode && (
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            <MoreHorizontal size={16} />
          </button>
        )}

        {menuOpen && (
          <div
            className="absolute top-12 right-4 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1.5 min-w-[140px]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => { onEdit?.(budget); setMenuOpen(false); }}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[13px] font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              <Pencil size={14} /> Chỉnh sửa
            </button>
            <button
              onClick={() => { onDelete?.(budget.id); setMenuOpen(false); }}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[13px] font-semibold text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} /> Xóa ngân sách
            </button>
          </div>
        )}
      </div>

      {/* Amount remaining — vibrant */}
      <div className="mb-3">
        <div className="flex items-baseline gap-1 mb-0.5">
          <span
            className="text-[24px] font-black leading-none"
            style={{ color: amountColor }}
          >
            {left < 0 ? '−' : ''}{formatVND(Math.abs(left))}
          </span>
          <span className="text-[12px] font-bold text-gray-400">còn lại</span>
        </div>
        <p className="text-[12px] font-bold text-gray-500">
          <span style={{ color: progressColor }}>{formatVND(spent)}</span>
          {' '}/ {formatVND(budget_limit)}
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[11px] font-black" style={{ color: progressColor }}>
            {percent}%
          </span>
          <span className="text-[11px] font-bold text-gray-400">
            Còn {daysLeft} ngày
          </span>
        </div>
        <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${clamped}%`, backgroundColor: progressColor }}
          />
        </div>
      </div>

      {/* Category tags */}
      {!is_all_categories && categories.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {categories.map((cat) => (
            <span
              key={cat.id}
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}
            >
              {cat.name}
            </span>
          ))}
        </div>
      )}
      {is_all_categories && (
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: '#ede9fe', color: '#7c3aed' }}
        >
          Tất cả danh mục
        </span>
      )}
    </div>
  );
}
