'use client';

import { useState } from 'react';
import {
  Search,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Download,
  ReceiptText,
  Loader2,
} from 'lucide-react';
import { formatCurrency, Transaction } from '@finance/api-client';
import Decimal from 'decimal.js';

export type FilterType = 'all' | 'income' | 'expense';
export type SortOrder = 'newest' | 'oldest' | 'amount_desc' | 'amount_asc';

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'oldest', label: 'Cũ nhất' },
  { value: 'amount_desc', label: 'Cao → Thấp' },
  { value: 'amount_asc', label: 'Thấp → Cao' },
];

function SummaryBar({ txs }: { txs: Transaction[] }) {
  const income = txs
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc.plus(new Decimal(t.amount)), new Decimal(0));
  const expense = txs
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc.plus(new Decimal(t.amount)), new Decimal(0));
  const net = income.minus(expense);
  const isNetPositive = net.gte(0);

  return (
    <div className="grid grid-cols-3 gap-3">
      {/* Thu nhập */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3">
        <div className="flex items-center gap-1.5 mb-1">
          <TrendingUp size={12} className="text-emerald-600" />
          <p className="text-[10px] font-black text-emerald-700 uppercase tracking-wide">
            Thu nhập
          </p>
        </div>
        <p className="text-[18px] font-black text-emerald-700 leading-none">
          {formatCurrency(income.toNumber(), "vi-VN")}
        </p>
      </div>

      {/* Chi tiêu */}
      <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
        <div className="flex items-center gap-1.5 mb-1">
          <TrendingDown size={12} className="text-red-500" />
          <p className="text-[10px] font-black text-red-600 uppercase tracking-wide">
            Chi tiêu
          </p>
        </div>
        <p className="text-[18px] font-black text-red-600 leading-none">
          {formatCurrency(expense.toNumber(), "vi-VN")}
        </p>
      </div>

      {/* Chênh lệch */}
      <div
        className="rounded-2xl px-4 py-3 border"
        style={
          isNetPositive
            ? { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }
            : { backgroundColor: '#fef2f2', borderColor: '#fecaca' }
        }
      >
        <p
          className="text-[10px] font-black uppercase tracking-wide mb-1"
          style={{ color: isNetPositive ? '#2563eb' : '#dc2626' }}
        >
          {isNetPositive ? 'Dư ra' : 'Bội chi'}
        </p>
        <p
          className="text-[18px] font-black leading-none"
          style={{ color: isNetPositive ? '#2563eb' : '#dc2626' }}
        >
          {isNetPositive ? '+' : '−'}
          {formatCurrency(net.abs().toNumber(), "vi-VN")}
        </p>
      </div>
    </div>
  );
}

function CategoryBadge({ type }: { type: 'income' | 'expense' }) {
  return (
    <span
      className="inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full"
      style={
        type === 'income'
          ? { backgroundColor: '#d1fae5', color: '#065f46' }
          : { backgroundColor: '#fee2e2', color: '#991b1b' }
      }
    >
      {type === 'income' ? <TrendingUp size={8} /> : <TrendingDown size={8} />}
      {type === 'income' ? 'Thu nhập' : 'Chi tiêu'}
    </span>
  );
}

function TransactionRow({ tx }: { tx: Transaction }) {
  const isIncome = tx.type === 'income';
  const amountNum = new Decimal(tx.amount).abs().toNumber();
  const displayIcon = '💸';
  return (
    <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/80 cursor-pointer transition-colors group border-b border-gray-50 last:border-0">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-[18px] shrink-0"
        style={{ backgroundColor: isIncome ? '#ecfdf5' : '#fef2f2' }}
      >
        {displayIcon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-black text-gray-900 truncate">
          {tx.note || tx.categoryName}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <CategoryBadge type={tx.type as 'income' | 'expense'} />
          <span className="text-[10px] font-bold text-gray-400">
            {tx.categoryName}
          </span>
        </div>
      </div>

      <div className="hidden sm:block shrink-0 text-center">
        <p className="text-[11px] font-bold text-gray-500">
          {new Date(tx.date).toLocaleDateString('vi-VN')}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p
          className="text-[14px] font-black"
          style={{ color: isIncome ? '#059669' : '#dc2626' }}
        >
          {isIncome ? '+' : '−'}
          {formatCurrency(amountNum, "vi-VN")}
        </p>
      </div>
    </div>
  );
}

function DateGroupRow({ date, txs }: { date: string; txs: Transaction[] }) {
  const income = txs
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s.plus(new Decimal(t.amount)), new Decimal(0));
  const expense = txs
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s.plus(new Decimal(t.amount)), new Decimal(0));

  return (
    <div>
      <div className="flex items-center justify-between px-5 py-2 bg-gray-50/70">
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
          {new Date(date).toLocaleDateString('vi-VN', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
          })}
        </p>
        <div className="flex items-center gap-3">
          {income.gt(0) && (
            <span className="flex items-center gap-0.5 text-[10px] font-black text-emerald-600">
              <TrendingUp size={9} />+
              {formatCurrency(income.toNumber(), "vi-VN")}
            </span>
          )}
          {expense.gt(0) && (
            <span className="flex items-center gap-0.5 text-[10px] font-black text-red-500">
              <TrendingDown size={9} />−
              {formatCurrency(expense.toNumber(), "vi-VN")}
            </span>
          )}
        </div>
      </div>

      {txs.map((tx) => (
        <TransactionRow key={tx.id} tx={tx} />
      ))}
    </div>
  );
}

interface TransactionsViewProps {
  isLoading: boolean;
  totalTransactions: number;
  filteredTransactions: Transaction[];
  groupedTransactions: [string, Transaction[]][];
  search: string;
  onSearchChange: (val: string) => void;
  filter: FilterType;
  onFilterChange: (val: FilterType) => void;
  sortOrder: SortOrder;
  onSortChange: (val: SortOrder) => void;
}

export function TransactionsView({
  isLoading,
  totalTransactions,
  filteredTransactions,
  groupedTransactions,
  search,
  onSearchChange,
  filter,
  onFilterChange,
  sortOrder,
  onSortChange,
}: TransactionsViewProps) {
  const [showSort, setShowSort] = useState(false);

  return (
    <div className="p-4 md:p-6 pb-24 max-w-[960px] mx-auto space-y-5">
      {/* Page title */}
      <div>
        <h1 className="text-[20px] font-black text-gray-900">
          Lịch Sử Giao Dịch
        </h1>
        <p className="text-[12px] font-bold text-gray-400 mt-0.5">
          {isLoading ? 'Đang tải...' : `${totalTransactions} giao dịch gần đây`}
        </p>
      </div>

      {/* Summary bar */}
      <SummaryBar txs={filteredTransactions} />

      {/* Search + Filter row */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm giao dịch..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-[13px] font-bold text-gray-800 placeholder:font-normal placeholder:text-gray-400 bg-white shadow-sm transition-all"
          />
        </div>

        {/* Type filter tabs */}
        <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl">
          {(['all', 'income', 'expense'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => onFilterChange(f)}
              className="px-3.5 py-1.5 rounded-lg text-[11px] font-black transition-all duration-200 active:scale-95"
              style={
                filter === f
                  ? {
                      backgroundColor:
                        f === 'income'
                          ? '#059669'
                          : f === 'expense'
                            ? '#dc2626'
                            : '#4361ee',
                      color: '#fff',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                    }
                  : { backgroundColor: 'transparent', color: '#6b7280' }
              }
            >
              {f === 'all'
                ? 'Tất cả'
                : f === 'income'
                  ? 'Thu nhập'
                  : 'Chi tiêu'}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="relative">
          <button
            onClick={() => setShowSort((v) => !v)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-[11px] font-bold text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm"
          >
            <ArrowUpDown size={13} />
            {SORT_OPTIONS.find((s) => s.value === sortOrder)?.label}
          </button>
          {showSort && (
            <div className="absolute right-0 top-full mt-1.5 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1.5 min-w-[150px]">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onSortChange(opt.value);
                    setShowSort(false);
                  }}
                  className={`flex items-center w-full px-4 py-2.5 text-[12px] font-bold transition-colors ${
                    sortOrder === opt.value
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Export */}
        <button className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-[11px] font-bold text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm">
          <Download size={13} />
          Xuất CSV
        </button>
      </div>

      {/* Transaction list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-5 py-2.5 bg-gray-50 border-b border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider w-10">
            Icon
          </p>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
            Giao dịch
          </p>
          <p className="hidden sm:block text-[10px] font-black text-gray-400 uppercase tracking-wider">
            Ngày
          </p>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">
            Số tiền
          </p>
        </div>

        {isLoading ? (
          <div className="py-16 flex flex-col items-center gap-3 text-center">
            <Loader2 size={24} className="text-blue-400 animate-spin" />
            <p className="text-[13px] font-black text-gray-400">
              Đang tải dữ liệu...
            </p>
          </div>
        ) : groupedTransactions.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center">
              <ReceiptText size={24} className="text-gray-300" />
            </div>
            <p className="text-[13px] font-black text-gray-400">
              Không tìm thấy giao dịch
            </p>
            <p className="text-[11px] font-bold text-gray-300">
              Thử thay đổi bộ lọc hoặc từ khóa
            </p>
          </div>
        ) : (
          groupedTransactions.map(([date, txs]) => (
            <DateGroupRow key={date} date={date} txs={txs} />
          ))
        )}
      </div>

      {/* Footer */}
      {!isLoading && (
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold text-gray-400">
            Hiển thị {filteredTransactions.length} / {totalTransactions} giao
            dịch
          </p>
          {filteredTransactions.length < totalTransactions && (
            <button className="text-[11px] font-bold text-blue-600 hover:underline">
              Xem thêm
            </button>
          )}
        </div>
      )}
    </div>
  );
}
