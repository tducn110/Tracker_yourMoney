'use client';
import { useState } from "react";
import { Plus, X, CheckCircle2, AlertTriangle, Clock, CalendarDays } from "lucide-react";
import { mockBills, formatVND } from "../data/mockData";
import { toast } from "sonner";

type BillStatus = "pending" | "paid" | "overdue";

interface Bill {
  id: number;
  name: string;
  icon: string;
  amount: number;
  due_day: number;
  status: BillStatus;
  category: string;
}

const statusConfig: Record<BillStatus, { label: string; color: string; bg: string; border: string }> = {
  pending: { label: "Chưa trả", color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  paid:    { label: "Đã trả",   color: "#10B981", bg: "#f0fdf4", border: "#bbf7d0" },
  overdue: { label: "Quá hạn", color: "#EF4444", bg: "#fef2f2", border: "#fecaca" },
};

const iconOptions = ["🏠", "💡", "📶", "🛡️", "🎵", "🎬", "📱", "💧", "🚗", "📺", "🏋️", "📦"];

const TODAY = 23; // April 23

export default function Bills() {
  const [bills, setBills] = useState<Bill[]>(mockBills);
  const [showModal, setShowModal] = useState(false);
  const [newBill, setNewBill] = useState({ name: "", icon: "📋", amount: "", due_day: "1", category: "Khác" });

  const unpaidTotal  = bills.filter(b => b.status !== "paid").reduce((s, b) => s + b.amount, 0);
  const paidTotal    = bills.filter(b => b.status === "paid").reduce((s, b) => s + b.amount, 0);
  const overdueCount = bills.filter(b => b.status === "overdue").length;

  const handleMarkPaid = (id: number) => {
    setBills(prev => prev.map(b => b.id === id ? { ...b, status: "paid" } : b));
    toast.success("Đã đánh dấu thanh toán ✅");
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const b: Bill = {
      id: Date.now(),
      name: newBill.name,
      icon: newBill.icon,
      amount: parseInt(newBill.amount.replace(/\D/g, "")) || 0,
      due_day: parseInt(newBill.due_day) || 1,
      status: "pending",
      category: newBill.category,
    };
    setBills(prev => [...prev, b]);
    setShowModal(false);
    setNewBill({ name: "", icon: "📋", amount: "", due_day: "1", category: "Khác" });
    toast.success(`Đã thêm hóa đơn "${b.name}"`);
  };

  const getDaysUntilDue = (day: number) => {
    const diff = day - TODAY;
    if (diff < 0)  return null;
    if (diff === 0) return "Hôm nay";
    return `${diff} ngày nữa`;
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-black text-gray-900">Hóa Đơn Định Kỳ</h1>
          <p className="text-[12px] font-bold text-gray-400 mt-0.5">Quản lý chi phí cố định hàng tháng</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-[13px] font-black shadow-lg shadow-amber-300/40 transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
        >
          <Plus size={15} />
          Thêm hóa đơn
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-amber-100 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Clock size={13} className="text-amber-500" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wide">Chưa thanh toán</p>
          </div>
          <p className="text-[18px] font-black text-amber-600">{formatVND(unpaidTotal)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-red-100 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1.5">
            <AlertTriangle size={13} className="text-red-500" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wide">Quá hạn</p>
          </div>
          <p className="text-[18px] font-black text-red-600">{overdueCount} hóa đơn</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1.5">
            <CheckCircle2 size={13} className="text-emerald-500" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wide">Đã thanh toán</p>
          </div>
          <p className="text-[18px] font-black text-emerald-600">{formatVND(paidTotal)}</p>
        </div>
      </div>

      {/* Bills */}
      <div className="space-y-2.5">
        {/* Overdue alert */}
        {overdueCount > 0 && (
          <div className="bg-red-50 rounded-xl px-4 py-2.5 border border-red-200 flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
            <p className="text-[12px] font-black text-red-700">{overdueCount} hóa đơn đã quá hạn thanh toán — cần xử lý ngay!</p>
          </div>
        )}

        {bills.map((bill) => {
          const s = statusConfig[bill.status];
          const daysUntil = getDaysUntilDue(bill.due_day);
          return (
            <div
              key={bill.id}
              className="bg-white rounded-2xl p-4 border shadow-sm hover:shadow-md transition-all"
              style={{ borderColor: bill.status === "overdue" ? "#fecaca" : "#f1f5f9" }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-[22px] flex-shrink-0"
                  style={{ backgroundColor: s.bg }}
                >
                  {bill.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-black text-[14px] text-gray-900">{bill.name}</h3>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${bill.status === 'overdue' ? 'animate-pulse' : ''}`}
                      style={{ backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}
                    >
                      {s.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400">
                      <CalendarDays size={10} />
                      Ngày {bill.due_day} hàng tháng
                    </div>
                    {bill.status !== 'paid' && daysUntil && (
                      <span className="text-[10px] font-black text-amber-600">· {daysUntil}</span>
                    )}
                    <span className="text-[10px] font-bold text-gray-300">· {bill.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <p className="text-[16px] font-black text-gray-900">{formatVND(bill.amount)}</p>
                  {bill.status !== "paid" ? (
                    <button
                      onClick={() => handleMarkPaid(bill.id)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-black transition-all hover:shadow-sm active:scale-95"
                      style={{ backgroundColor: "#d1fae5", color: "#059669" }}
                    >
                      <CheckCircle2 size={13} />
                      Đã trả
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 text-[12px] font-black text-emerald-600">
                      <CheckCircle2 size={14} />
                      Đã trả
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-[17px] text-gray-900">Thêm Hóa Đơn Mới 📋</h2>
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
                      onClick={() => setNewBill({ ...newBill, icon: ic })}
                      className={`w-10 h-10 rounded-xl text-[18px] border-2 transition-all ${newBill.icon === ic ? 'border-amber-400 bg-amber-50 scale-110' : 'border-gray-200 hover:border-gray-300'}`}
                    >{ic}</button>
                  ))}
                </div>
              </div>
              {[
                { key: "name",    label: "Tên hóa đơn",           placeholder: "Tiền điện, Internet..." },
                { key: "amount",  label: "Số tiền (₫)",            placeholder: "350,000" },
                { key: "due_day", label: "Ngày đến hạn (1-31)",   placeholder: "5" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-[12px] font-black text-gray-600 mb-1.5 uppercase tracking-wide">{f.label}</label>
                  <input
                    type="text"
                    value={newBill[f.key as keyof typeof newBill]}
                    onChange={e => setNewBill({ ...newBill, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[14px] font-bold outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 bg-gray-50 text-gray-900 transition-all"
                  />
                </div>
              ))}
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl text-white font-black text-[14px] shadow-lg shadow-amber-300/40 transition-all active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
              >
                Thêm Hóa Đơn
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
