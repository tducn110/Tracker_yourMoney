import { useState } from "react";
import {
  Search, Trash2, Upload, Plus, ChevronLeft, ChevronRight,
  ArrowUpRight, ArrowDownRight, Filter, SlidersHorizontal,
} from "lucide-react";
import { mockTransactions, mockCategories, formatVND } from "../data/mockData";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

const months = [
  "Tháng 4/2026", "Tháng 3/2026", "Tháng 2/2026", "Tháng 1/2026",
  "Tháng 12/2025", "Tháng 11/2025",
];

const ITEMS_PER_PAGE = 8;

export default function Transactions() {
  const [transactions, setTransactions] = useState(mockTransactions);
  const [selectedMonth, setSelectedMonth] = useState("Tháng 4/2026");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);

  const filtered = transactions.filter((tx) => {
    const matchCat = selectedCategory === "Tất cả" || tx.category === selectedCategory;
    const matchSearch = tx.note.toLowerCase().includes(search.toLowerCase()) ||
      tx.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleDelete = (id: number) => {
    setTransactions(prev => prev.filter(tx => tx.id !== id));
    toast.success("Đã xóa giao dịch");
  };

  const totalIncome = filtered.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === "expense").reduce((s, t) => s + Math.abs(t.amount), 0);
  const netBalance = totalIncome - totalExpense;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-black text-gray-900">Giao Dịch</h1>
          <p className="text-[12px] font-bold text-gray-400 mt-0.5">{selectedMonth}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[13px] font-bold transition-colors ${filterOpen ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            <SlidersHorizontal size={14} />
            Lọc
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-colors">
            <Upload size={14} />
            <span className="hidden sm:inline">Import</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1">
            <ArrowUpRight size={14} className="text-emerald-500" />
            <p className="text-[11px] font-black text-gray-500 uppercase tracking-wide">Thu vào</p>
          </div>
          <p className="text-[18px] font-black text-emerald-600">+{formatVND(totalIncome)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1">
            <ArrowDownRight size={14} className="text-red-500" />
            <p className="text-[11px] font-black text-gray-500 uppercase tracking-wide">Chi ra</p>
          </div>
          <p className="text-[18px] font-black text-red-500">-{formatVND(totalExpense)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1">
            <Filter size={14} className="text-blue-500" />
            <p className="text-[11px] font-black text-gray-500 uppercase tracking-wide">Còn lại</p>
          </div>
          <p className={`text-[18px] font-black ${netBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {netBalance >= 0 ? '+' : '-'}{formatVND(Math.abs(netBalance))}
          </p>
        </div>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {filterOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="p-4 flex flex-col sm:flex-row gap-3">
              <select
                value={selectedMonth}
                onChange={e => { setSelectedMonth(e.target.value); setCurrentPage(1); }}
                className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-700 bg-gray-50 outline-none focus:border-blue-400"
              >
                {months.map(m => <option key={m}>{m}</option>)}
              </select>
              <select
                value={selectedCategory}
                onChange={e => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-700 bg-gray-50 outline-none focus:border-blue-400"
              >
                <option>Tất cả</option>
                {mockCategories.map(c => <option key={c.id}>{c.name}</option>)}
              </select>
              <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus-within:border-blue-400 transition-colors">
                <Search size={14} className="text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                  placeholder="Tìm kiếm..."
                  className="flex-1 bg-transparent outline-none text-[13px] font-medium text-gray-700"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transaction List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Search bar always visible */}
        {!filterOpen && (
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-50">
            <Search size={14} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Tìm kiếm giao dịch..."
              className="flex-1 bg-transparent outline-none text-[13px] font-medium text-gray-600 placeholder:text-gray-400"
            />
          </div>
        )}

        {paginated.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[40px] mb-3">🔍</p>
            <p className="text-[14px] font-black text-gray-400">Không tìm thấy giao dịch nào</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {paginated.map((tx, i) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50/80 transition-colors group"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[18px] flex-shrink-0 ${tx.type === 'income' ? 'bg-emerald-50' : 'bg-gray-50'}`}>
                  {tx.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-black text-gray-900 truncate">{tx.note}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold text-gray-400">{tx.date}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span className="text-[10px] font-bold text-gray-400">{tx.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      {tx.type === 'income'
                        ? <ArrowUpRight size={12} className="text-emerald-500" />
                        : <ArrowDownRight size={12} className="text-red-500" />
                      }
                      <span className={`text-[14px] font-black ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatVND(Math.abs(tx.amount))}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(tx.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-50">
            <p className="text-[12px] font-bold text-gray-400">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} / {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 text-gray-500 transition-colors"
              >
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className="w-7 h-7 rounded-lg text-[12px] font-black transition-colors"
                  style={{
                    background: currentPage === p ? '#4361ee' : 'transparent',
                    color: currentPage === p ? 'white' : '#64748b',
                  }}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 text-gray-500 transition-colors"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
