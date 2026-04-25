'use client';

/**
 * RecentTransactionsCard — Giao dịch gần đây
 * - Filter tabs: Tất cả / Thu nhập / Chi tiêu
 * - Date grouping with income/expense sub-totals
 * - No motion/react — pure CSS transitions
 */

import { useState } from 'react';
import { ArrowRight, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router';
import { mockTransactions, formatVND } from '@/app/data/mockData';

type FilterType = 'all' | 'income' | 'expense';
type Transaction = (typeof mockTransactions)[0];

// ─── Filter Tab ───────────────────────────────────────────────────────────────

const FILTERS: { key: FilterType; label: string; activeColor: string }[] = [
  { key: 'all',     label: 'Tất cả',    activeColor: '#4361ee' },
  { key: 'income',  label: 'Thu nhập',  activeColor: '#059669' },
  { key: 'expense', label: 'Chi tiêu',  activeColor: '#dc2626' },
];

function FilterTabs({ active, onChange }: { active: FilterType; onChange: (f: FilterType) => void }) {
  return (
    <div className="flex gap-1.5">
      {FILTERS.map(({ key, label, activeColor }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className="px-3 py-1.5 rounded-xl text-[11px] font-black transition-all duration-200 active:scale-95"
          style={
            active === key
              ? { backgroundColor: activeColor, color: '#fff' }
              : { backgroundColor: '#f3f4f6', color: '#6b7280' }
          }
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── Transaction Row ──────────────────────────────────────────────────────────

function TransactionRow({ tx }: { tx: Transaction }) {
  const isIncome = tx.type === 'income';
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group">
      {/* Icon */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
        style={{ backgroundColor: isIncome ? '#ecfdf5' : '#fef2f2' }}
      >
        {tx.icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-black text-gray-900 truncate leading-tight">{tx.note}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span
            className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
            style={
              isIncome
                ? { backgroundColor: '#ecfdf5', color: '#059669' }
                : { backgroundColor: '#fef2f2', color: '#dc2626' }
            }
          >
            {isIncome ? '↑ Thu nhập' : '↓ Chi tiêu'}
          </span>
          <p className="text-[10px] font-bold text-gray-400">
            {tx.category} · {tx.date}
          </p>
        </div>
      </div>

      {/* Amount */}
      <p
        className="text-[13px] font-black flex-shrink-0"
        style={{ color: isIncome ? '#059669' : '#dc2626' }}
      >
        {isIncome ? '+' : '−'}
        {formatVND(Math.abs(tx.amount))}
      </p>
    </div>
  );
}

// ─── Date Group Header ────────────────────────────────────────────────────────

function DateGroupHeader({ date, txs }: { date: string; txs: Transaction[] }) {
  const income  = txs.filter((t) => t.type === 'income').reduce((s, t) => s + Math.abs(t.amount), 0);
  const expense = txs.filter((t) => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <div className="flex items-center justify-between px-4 py-2">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{date}</p>
      <div className="flex items-center gap-3">
        {income > 0 && (
          <span className="flex items-center gap-0.5 text-[10px] font-black text-emerald-600">
            <TrendingUp size={9} />
            +{formatVND(income)}
          </span>
        )}
        {expense > 0 && (
          <span className="flex items-center gap-0.5 text-[10px] font-black text-red-500">
            <TrendingDown size={9} />
            −{formatVND(expense)}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

const DISPLAY_LIMIT = 10;

export function RecentTransactionsCard() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>('all');

  const filtered = mockTransactions
    .filter((tx) => filter === 'all' || tx.type === filter)
    .slice(0, DISPLAY_LIMIT);

  // Group by date
  const grouped = filtered.reduce<Record<string, Transaction[]>>((acc, tx) => {
    (acc[tx.date] ??= []).push(tx);
    return acc;
  }, {});
  const groupedEntries = Object.entries(grouped);

  // Summary counts
  const totalIncome  = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + Math.abs(t.amount), 0);
  const totalExpense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
            <BarChart3 size={14} className="text-blue-600" />
          </div>
          <h3 className="text-[13px] font-black text-gray-900">Giao dịch gần đây</h3>
        </div>
        <button
          onClick={() => navigate('/transactions')}
          className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
        >
          Tất cả <ArrowRight size={12} />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50 bg-gray-50/50">
        <FilterTabs active={filter} onChange={setFilter} />

        {/* Mini summary */}
        {filter === 'all' && (
          <div className="flex items-center gap-3 text-[10px] font-bold">
            <span className="text-emerald-600">+{formatVND(totalIncome)}</span>
            <span className="text-red-500">−{formatVND(totalExpense)}</span>
          </div>
        )}
      </div>

      {/* Transaction list */}
      <div className="p-2">
        {groupedEntries.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-[13px] font-bold text-gray-400">Không có giao dịch nào</p>
          </div>
        ) : (
          groupedEntries.map(([date, txs]) => (
            <div key={date}>
              <DateGroupHeader date={date} txs={txs} />
              {txs.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
