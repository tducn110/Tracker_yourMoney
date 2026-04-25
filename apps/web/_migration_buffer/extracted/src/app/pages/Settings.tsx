/**
 * Settings — Finance Tracker V3
 * Sections:
 *  1. Profile card (banner)
 *  2. Thông Tin Cá Nhân
 *  3. Ví Của Tôi (wallet management — reorder, add, delete)
 *  4. Cấu Hình Tài Chính (income date, S2S budget)
 *  5. Bảo Mật
 *  6. Thông Báo
 *  7. Danh Mục
 *  8. Đăng Xuất
 *
 * No motion/react — pure CSS transitions.
 */

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
  User, Lock, LogOut, Save, Check, Tag, Bell, Shield, ChevronRight,
  Wallet, Calendar, GripVertical, Plus, Trash2, ArrowUpDown, Pencil, X,
} from 'lucide-react';
import {
  mockUser, mockCategories, mockWallets,
  type MockWallet, walletTypeLabel, formatVND,
} from '../data/mockData';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

type SectionKey = 'profile' | 'wallets' | 'finance' | 'security' | 'notifications' | 'categories';

interface SectionConfig {
  key: SectionKey;
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}

const SECTIONS: SectionConfig[] = [
  { key: 'profile',       label: 'Thông Tin Cá Nhân',   icon: User,     color: '#4361ee', bg: '#eef2ff' },
  { key: 'wallets',       label: 'Ví Của Tôi',           icon: Wallet,   color: '#10b981', bg: '#f0fdf4' },
  { key: 'finance',       label: 'Cấu Hình Tài Chính',  icon: Calendar, color: '#8b5cf6', bg: '#f5f3ff' },
  { key: 'security',      label: 'Bảo Mật',              icon: Lock,     color: '#f59e0b', bg: '#fffbeb' },
  { key: 'notifications', label: 'Thông Báo',            icon: Bell,     color: '#06b6d4', bg: '#ecfeff' },
  { key: 'categories',    label: 'Danh Mục',             icon: Tag,      color: '#ef4444', bg: '#fff1f2' },
];

// ─── Re-usable helpers ────────────────────────────────────────────────────────

function InputField({
  label, value, onChange, type = 'text', disabled = false, placeholder = '',
}: {
  label: string; value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string; disabled?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] font-black text-gray-500 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      <input
        type={type} value={value} onChange={onChange} disabled={disabled}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[14px] font-bold outline-none bg-gray-50 text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all"
      />
    </div>
  );
}

function SaveButton({
  sectionKey, saved, onClick, color = 'linear-gradient(135deg,#4361ee,#6366f1)', label = 'Lưu thông tin',
}: {
  sectionKey: string; saved: Record<string, boolean>;
  onClick: () => void; color?: string; label?: string;
}) {
  const done = saved[sectionKey];
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-[13px] font-black transition-all active:scale-95"
      style={{ background: done ? '#10b981' : color }}
    >
      {done ? <Check size={15} /> : <Save size={15} />}
      {done ? 'Đã lưu!' : label}
    </button>
  );
}

// ─── Collapsible Section Card ─────────────────────────────────────────────────

function SectionCard({
  section, defaultOpen = false, children,
}: {
  section: SectionConfig; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const Icon = section.icon;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: section.bg }}
          >
            <Icon size={17} style={{ color: section.color }} />
          </div>
          <span className="font-black text-[14px] text-gray-900">{section.label}</span>
        </div>
        <ChevronRight
          size={16}
          className="text-gray-400 transition-transform duration-200 flex-shrink-0"
          style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
        />
      </button>

      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? '2000px' : '0px' }}
      >
        <div className="px-5 pb-5 border-t border-gray-50">
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Wallet Management Section ────────────────────────────────────────────────

const WALLET_COLORS = ['#4361ee', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#e91e63', '#06b6d4', '#f97316'];
const WALLET_ICONS  = ['🏦', '💳', '💵', '📱', '🏧', '💰', '💼', '🪙'];
const WALLET_TYPES  = ['bank', 'ewallet', 'cash', 'savings'] as const;

function WalletManagement() {
  const [wallets, setWallets]       = useState<MockWallet[]>(mockWallets);
  const [reorderMode, setReorderMode] = useState(false);
  const [editId, setEditId]         = useState<string | null>(null);
  const [editName, setEditName]     = useState('');
  const [addOpen, setAddOpen]       = useState(false);
  const [newWallet, setNewWallet]   = useState({
    name: '', icon: '🏦', colorHex: '#4361ee', type: 'bank' as const, balance: '',
  });

  const dragRef = useRef<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  // Drag handlers
  const onDragStart = (id: string) => (e: React.DragEvent) => {
    dragRef.current = id;
    e.dataTransfer.effectAllowed = 'move';
  };
  const onDragOver = (id: string) => (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(id);
  };
  const onDrop = (targetId: string) => (e: React.DragEvent) => {
    e.preventDefault();
    const src = dragRef.current;
    if (!src || src === targetId) return;
    setWallets((prev) => {
      const arr = [...prev];
      const fi = arr.findIndex((w) => w.id === src);
      const ti = arr.findIndex((w) => w.id === targetId);
      const [item] = arr.splice(fi, 1);
      arr.splice(ti, 0, item);
      return arr;
    });
    setDragOver(null);
    dragRef.current = null;
  };
  const onDragEnd = () => { setDragOver(null); dragRef.current = null; };

  const handleDelete = (id: string) => {
    if (wallets.length <= 1) { toast.error('Cần có ít nhất 1 ví'); return; }
    setWallets((prev) => prev.filter((w) => w.id !== id));
    toast.success('Đã xóa ví');
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) return;
    setWallets((prev) => prev.map((w) => w.id === id ? { ...w, name: editName } : w));
    setEditId(null);
    toast.success('Đã cập nhật tên ví');
  };

  const handleSetDefault = (id: string) => {
    setWallets((prev) => prev.map((w) => ({ ...w, isDefault: w.id === id })));
    toast.success('Đã đặt ví mặc định');
  };

  const handleAddWallet = () => {
    if (!newWallet.name.trim()) { toast.error('Nhập tên ví'); return; }
    const bal = parseFloat(newWallet.balance.replace(/\D/g, '')) || 0;
    const wallet: MockWallet = {
      id: `wallet-${Date.now()}`,
      name: newWallet.name,
      icon: newWallet.icon,
      colorHex: newWallet.colorHex,
      type: newWallet.type,
      balance: bal,
      isDefault: false,
      lastSynced: new Date().toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
    };
    setWallets((prev) => [...prev, wallet]);
    setNewWallet({ name: '', icon: '🏦', colorHex: '#4361ee', type: 'bank', balance: '' });
    setAddOpen(false);
    toast.success(`Đã thêm ví "${wallet.name}"`);
  };

  return (
    <div className="space-y-3 pt-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-bold text-gray-500">{wallets.length} ví đang quản lý</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setReorderMode((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all active:scale-95 ${
              reorderMode ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600'
            }`}
          >
            <ArrowUpDown size={11} />
            {reorderMode ? 'Xong' : 'Sắp xếp'}
          </button>
          <button
            onClick={() => setAddOpen(!addOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-green-50 text-green-700 hover:bg-green-100 transition-all active:scale-95"
          >
            <Plus size={11} />
            Thêm ví
          </button>
        </div>
      </div>

      {/* Reorder hint */}
      {reorderMode && (
        <div className="px-3 py-2 bg-green-50 rounded-xl border border-green-100">
          <p className="text-[11px] font-bold text-green-700 text-center">
            ✋ Kéo thả để thay đổi thứ tự ví
          </p>
        </div>
      )}

      {/* Wallet list */}
      <div className={`space-y-2 ${reorderMode ? 'select-none' : ''}`}>
        {wallets.map((wallet) => (
          <div
            key={wallet.id}
            draggable={reorderMode}
            onDragStart={onDragStart(wallet.id)}
            onDragOver={onDragOver(wallet.id)}
            onDrop={onDrop(wallet.id)}
            onDragEnd={onDragEnd}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
              dragOver === wallet.id
                ? 'border-green-300 bg-green-50 scale-[1.02]'
                : 'border-gray-100 bg-gray-50/40 hover:bg-white hover:border-gray-200'
            } ${reorderMode ? 'cursor-grab active:cursor-grabbing' : ''}`}
          >
            {/* Drag handle */}
            {reorderMode && (
              <GripVertical size={14} className="text-gray-400 flex-shrink-0" />
            )}

            {/* Icon */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-[18px] flex-shrink-0"
              style={{ backgroundColor: `${wallet.colorHex}20` }}
            >
              {wallet.icon}
            </div>

            {/* Info / Edit */}
            <div className="flex-1 min-w-0">
              {editId === wallet.id ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(wallet.id)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-blue-300 text-[13px] font-bold outline-none focus:ring-2 focus:ring-blue-100 bg-white text-gray-900"
                  />
                  <button onClick={() => handleSaveEdit(wallet.id)}
                    className="p-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 active:scale-95 transition-all">
                    <Check size={13} />
                  </button>
                  <button onClick={() => setEditId(null)}
                    className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 active:scale-95 transition-all">
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-1.5">
                    <p className="text-[13px] font-black text-gray-900 truncate">{wallet.name}</p>
                    {wallet.isDefault && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600">
                        Mặc định
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-bold text-gray-400">
                    {walletTypeLabel[wallet.type]} · {formatVND(wallet.balance)}
                  </p>
                </>
              )}
            </div>

            {/* Actions */}
            {!reorderMode && editId !== wallet.id && (
              <div className="flex items-center gap-1 flex-shrink-0">
                {!wallet.isDefault && (
                  <button
                    onClick={() => handleSetDefault(wallet.id)}
                    className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-600 hover:bg-amber-100 transition-all active:scale-95"
                  >
                    Mặc định
                  </button>
                )}
                <button
                  onClick={() => { setEditId(wallet.id); setEditName(wallet.name); }}
                  className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all active:scale-95"
                >
                  <Pencil size={12} />
                </button>
                <button
                  onClick={() => handleDelete(wallet.id)}
                  className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all active:scale-95"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add wallet form */}
      {addOpen && (
        <div className="p-4 rounded-2xl border-2 border-dashed border-green-200 bg-green-50/30 space-y-3">
          <p className="text-[12px] font-black text-gray-700">Thêm ví mới</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wide mb-1">Tên ví</label>
              <input
                value={newWallet.name}
                onChange={(e) => setNewWallet({ ...newWallet, name: e.target.value })}
                placeholder="VD: VPBank"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-[13px] font-bold outline-none focus:border-green-400 bg-white text-gray-900"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wide mb-1">Loại ví</label>
              <select
                value={newWallet.type}
                onChange={(e) => setNewWallet({ ...newWallet, type: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-[13px] font-bold outline-none focus:border-green-400 bg-white text-gray-900"
              >
                {WALLET_TYPES.map((t) => (
                  <option key={t} value={t}>{walletTypeLabel[t]}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wide mb-1">Số dư ban đầu (₫)</label>
            <input
              value={newWallet.balance}
              onChange={(e) => setNewWallet({ ...newWallet, balance: e.target.value })}
              placeholder="0"
              inputMode="numeric"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-[13px] font-bold outline-none focus:border-green-400 bg-white text-gray-900"
            />
          </div>

          {/* Icon selector */}
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wide mb-1.5">Icon</label>
            <div className="flex gap-2 flex-wrap">
              {WALLET_ICONS.map((ic) => (
                <button
                  key={ic}
                  onClick={() => setNewWallet({ ...newWallet, icon: ic })}
                  className={`w-9 h-9 rounded-xl text-[18px] flex items-center justify-center transition-all active:scale-95 ${
                    newWallet.icon === ic
                      ? 'bg-green-100 ring-2 ring-green-400'
                      : 'bg-white border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wide mb-1.5">Màu sắc</label>
            <div className="flex gap-2 flex-wrap">
              {WALLET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setNewWallet({ ...newWallet, colorHex: c })}
                  className={`w-7 h-7 rounded-full transition-all active:scale-95 ${
                    newWallet.colorHex === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleAddWallet}
              className="flex-1 py-2.5 rounded-xl text-white text-[13px] font-black transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}
            >
              <Plus size={14} className="inline mr-1" />
              Thêm ví
            </button>
            <button
              onClick={() => setAddOpen(false)}
              className="px-4 py-2.5 rounded-xl text-gray-600 text-[13px] font-bold bg-gray-100 hover:bg-gray-200 transition-all active:scale-95"
            >
              Hủy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Settings() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ ...mockUser, email: mockUser.email });
  const [finance, setFinance] = useState({ emergency_buffer: '1500000', income_date: '5', monthly_budget: '10000000' });
  const [security, setSecurity] = useState({ current: '', newPass: '', confirm: '' });
  const [notifications, setNotifications] = useState({
    billReminder: true, budgetAlert: true, goalUpdate: false, weeklyReport: true,
  });
  const [categories, setCategories] = useState(mockCategories);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('📦');
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const iconOptions = ['💰', '🍔', '🥤', '🚗', '🏠', '🏦', '📦', '🎬', '🎮', '✈️', '💊', '👕'];

  const handleSave = (key: string, msg: string) => {
    setSaved((prev) => ({ ...prev, [key]: true }));
    toast.success(msg);
    setTimeout(() => setSaved((prev) => ({ ...prev, [key]: false })), 2000);
  };

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Page title */}
      <div>
        <h1 className="text-[20px] font-black text-gray-900">Cài Đặt</h1>
        <p className="text-[12px] font-bold text-gray-400 mt-0.5">Quản lý tài khoản & cấu hình</p>
      </div>

      {/* Profile banner */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white text-[18px] font-black">
            {mockUser.avatar}
          </div>
          <div>
            <p className="font-black text-[17px]">{profile.full_name}</p>
            <p className="text-blue-200 text-[12px] font-bold">@{profile.username}</p>
            <p className="text-blue-200 text-[11px] font-bold">{profile.email}</p>
          </div>
        </div>
      </div>

      {/* ── Section 1: Profile ── */}
      <SectionCard section={SECTIONS[0]}>
        <div className="space-y-4 pt-4">
          <InputField label="Tên đăng nhập" value={profile.username} disabled />
          <InputField label="Họ và tên" value={profile.full_name}
            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
          <InputField label="Email" value={profile.email} type="email"
            onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
          <SaveButton sectionKey="profile" saved={saved}
            onClick={() => handleSave('profile', 'Đã lưu thông tin cá nhân')} />
        </div>
      </SectionCard>

      {/* ── Section 2: Wallets ── */}
      <SectionCard section={SECTIONS[1]}>
        <WalletManagement />
      </SectionCard>

      {/* ── Section 3: Finance config ── */}
      <SectionCard section={SECTIONS[2]}>
        <div className="space-y-4 pt-4">
          <div>
            <label className="block text-[11px] font-black text-gray-500 uppercase tracking-wide mb-1.5">
              Ngày Nhận Lương
            </label>
            <select
              value={finance.income_date}
              onChange={(e) => setFinance({ ...finance, income_date: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[14px] font-bold outline-none bg-gray-50 text-gray-900 focus:border-purple-400 transition-all"
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={String(d)}>Ngày {d} hàng tháng</option>
              ))}
            </select>
          </div>
          <InputField label="Ngân Sách S2S Tháng (₫)" value={finance.monthly_budget}
            onChange={(e) => setFinance({ ...finance, monthly_budget: e.target.value })}
            placeholder="10,000,000" />
          <InputField label="Quỹ Khẩn Cấp (₫)" value={finance.emergency_buffer}
            onChange={(e) => setFinance({ ...finance, emergency_buffer: e.target.value })}
            placeholder="1,500,000" />
          <SaveButton sectionKey="finance" saved={saved}
            onClick={() => handleSave('finance', 'Đã cập nhật cấu hình tài chính')}
            color="linear-gradient(135deg,#8b5cf6,#7c3aed)" label="Cập nhật" />
        </div>
      </SectionCard>

      {/* ── Section 4: Security ── */}
      <SectionCard section={SECTIONS[3]}>
        <div className="space-y-4 pt-4">
          {[
            { key: 'current',  label: 'Mật khẩu hiện tại' },
            { key: 'newPass',  label: 'Mật khẩu mới' },
            { key: 'confirm',  label: 'Xác nhận mật khẩu mới' },
          ].map((f) => (
            <InputField key={f.key} label={f.label} type="password"
              value={security[f.key as keyof typeof security]}
              onChange={(e) => setSecurity({ ...security, [f.key]: e.target.value })}
              placeholder="••••••••" />
          ))}
          <button
            onClick={() => handleSave('security', 'Đã cập nhật mật khẩu')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-[13px] font-black transition-all active:scale-95"
            style={{ background: saved.security ? '#10b981' : 'linear-gradient(135deg,#f59e0b,#d97706)' }}
          >
            {saved.security ? <Check size={15} /> : <Shield size={15} />}
            {saved.security ? 'Đã cập nhật!' : 'Đổi mật khẩu'}
          </button>
        </div>
      </SectionCard>

      {/* ── Section 5: Notifications ── */}
      <SectionCard section={SECTIONS[4]}>
        <div className="space-y-3 pt-4">
          {[
            { key: 'billReminder', label: 'Nhắc hóa đơn đến hạn',   desc: 'Thông báo trước 3 ngày' },
            { key: 'budgetAlert',  label: 'Cảnh báo ngân sách',      desc: 'Khi chi tiêu vượt 80%' },
            { key: 'goalUpdate',   label: 'Cập nhật mục tiêu',       desc: 'Tiến độ tiết kiệm hàng tuần' },
            { key: 'weeklyReport', label: 'Báo cáo tuần',            desc: 'Tóm tắt thu chi mỗi thứ 2' },
          ].map((n) => (
            <div key={n.key} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-[13px] font-black text-gray-900">{n.label}</p>
                <p className="text-[11px] font-bold text-gray-400">{n.desc}</p>
              </div>
              <button
                onClick={() =>
                  setNotifications((prev) => ({ ...prev, [n.key]: !prev[n.key as keyof typeof prev] }))
                }
                className={`relative w-11 h-6 rounded-full transition-all duration-200 ${
                  notifications[n.key as keyof typeof notifications] ? 'bg-cyan-500' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200 ${
                    notifications[n.key as keyof typeof notifications] ? 'left-5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Section 6: Categories ── */}
      <SectionCard section={SECTIONS[5]}>
        <div className="space-y-3 pt-4">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-[17px]"
                style={{ backgroundColor: cat.color + '20' }}
              >
                {cat.icon}
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-black text-gray-900">{cat.name}</p>
              </div>
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
            </div>
          ))}

          {/* Add new category */}
          <div className="flex items-center gap-2 pt-2">
            <select
              value={newCatIcon}
              onChange={(e) => setNewCatIcon(e.target.value)}
              className="w-12 h-9 rounded-xl border border-gray-200 text-center text-[16px] outline-none bg-gray-50"
            >
              {iconOptions.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
            </select>
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Tên danh mục mới"
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-[13px] font-bold outline-none focus:border-red-400 bg-gray-50 text-gray-900"
            />
            <button
              onClick={() => {
                if (!newCatName.trim()) return;
                setCategories((prev) => [...prev, { id: Date.now(), name: newCatName, icon: newCatIcon, color: '#6b7280' }]);
                setNewCatName('');
                toast.success(`Đã thêm danh mục "${newCatName}"`);
              }}
              className="px-3 py-2 rounded-xl text-white text-[13px] font-black transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}
            >
              Thêm
            </button>
          </div>
        </div>
      </SectionCard>

      {/* ── Logout ── */}
      <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
        <button
          onClick={() => { toast.error('Đã đăng xuất'); setTimeout(() => navigate('/login'), 800); }}
          className="w-full flex items-center gap-3 px-5 py-4 text-red-600 hover:bg-red-50 transition-colors active:scale-[0.99]"
        >
          <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
            <LogOut size={16} className="text-red-500" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-black text-[14px]">Đăng Xuất</p>
            <p className="text-[11px] font-bold text-red-400">Thoát khỏi tài khoản S2S Finance</p>
          </div>
          <ChevronRight size={16} className="text-red-300" />
        </button>
      </div>

      <div className="h-4" />
    </div>
  );
}
