'use client';

import { useState } from 'react';
import { User, Bell, DollarSign, Save, Tags, Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { formatCurrency } from '@finance/api-client';
import { Button } from '@/_components/ui/button';
import type { Category } from '@finance/api-client';

const CATEGORY_ICONS = ['🍔', '🚗', '🏠', '🎮', '📚', '💊', '👕', '🎬', '✈️', '💼', '🎁', '🐾', '📱', '💡', '🛒', '🏥', '🎓', '☕', '🎵', '💻'];
const CATEGORY_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#6b7280'];

interface SettingsViewProps {
  user: { fullName?: string; full_name?: string; email?: string };
  isLoading?: boolean;
  emergencyBuffer: number;
  setEmergencyBuffer: (val: number) => void;
  emailNotifications: boolean;
  setEmailNotifications: (val: boolean) => void;
  pushNotifications: boolean;
  setPushNotifications: (val: boolean) => void;
  onSave: () => void;
  categories: Category[];
  categoriesLoading: boolean;
  isMutatingCategories: boolean;
  onCreateCategory: (data: { name: string; type: string; icon?: string; color?: string }) => void;
  onUpdateCategory: (id: number, data: { name?: string; type?: string; icon?: string; color?: string }) => void;
  onDeleteCategory: (id: number) => void;
}

// ─── Category Form (inline add/edit) ──────────────────────────────────────────

interface CategoryFormData { name: string; type: 'income' | 'expense'; icon: string; color: string; }

function CategoryForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Category;
  onSave: (data: CategoryFormData) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [type, setType] = useState<'income' | 'expense'>((initial?.type as 'income' | 'expense') ?? 'expense');
  const [icon, setIcon] = useState(initial?.icon ?? '📦');
  const [color, setColor] = useState(initial?.color ?? '#6b7280');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), type, icon, color });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50/30 space-y-3">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tên danh mục"
          autoFocus
          className="flex-1 h-10 px-3 rounded-lg border border-gray-200 focus:border-blue-400 outline-none text-[13px] font-bold text-gray-800 bg-white"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as 'income' | 'expense')}
          className="h-10 px-3 rounded-lg border border-gray-200 focus:border-blue-400 outline-none text-[13px] font-bold text-gray-800 bg-white"
        >
          <option value="expense">Chi tiêu</option>
          <option value="income">Thu nhập</option>
        </select>
      </div>

      {/* Icon picker */}
      <div>
        <p className="text-[10px] font-bold text-gray-400 mb-1.5">Biểu tượng</p>
        <div className="flex flex-wrap gap-1">
          {CATEGORY_ICONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setIcon(emoji)}
              className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-all ${
                icon === emoji ? 'bg-white border-2 border-blue-400 scale-110' : 'hover:bg-white/60 border-2 border-transparent'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Color picker */}
      <div>
        <p className="text-[10px] font-bold text-gray-400 mb-1.5">Màu sắc</p>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORY_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="w-7 h-7 rounded-full border-[3px] transition-all"
              style={{
                backgroundColor: c,
                borderColor: color === c ? '#fff' : c,
                boxShadow: color === c ? `0 0 0 3px ${c}40` : 'none',
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onCancel} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold text-gray-500 hover:bg-gray-100">
          <X size={12} /> Huỷ
        </button>
        <button type="submit" className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white bg-blue-500 hover:bg-blue-600">
          <Check size={12} /> {initial ? 'Cập nhật' : 'Thêm'}
        </button>
      </div>
    </form>
  );
}

// ─── Category Row ─────────────────────────────────────────────────────────────

function CategoryRow({
  category,
  onUpdate,
  onDelete,
}: {
  category: Category;
  onUpdate: (id: number, data: { name?: string; type?: string; icon?: string; color?: string }) => void;
  onDelete: (id: number) => void;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <CategoryForm
        initial={category}
        onSave={(data) => { onUpdate(category.id, data); setEditing(false); }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group">
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
          style={{ backgroundColor: category.color + '20' }}
        >
          {category.icon || '📦'}
        </div>
        <div>
          <p className="text-[13px] font-bold text-gray-800">{category.name}</p>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
            category.type === 'income'
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-orange-50 text-orange-600'
          }`}>
            {category.type === 'income' ? 'Thu nhập' : 'Chi tiêu'}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setEditing(true)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50"
        >
          <Pencil size={12} />
        </button>
        <button
          onClick={() => onDelete(category.id)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

// ─── Category Management Section ──────────────────────────────────────────────

function CategorySection({
  categories,
  isLoading,
  isMutating,
  onCreate,
  onUpdate,
  onDelete,
}: {
  categories: Category[];
  isLoading: boolean;
  isMutating: boolean;
  onCreate: (data: { name: string; type: string; icon?: string; color?: string }) => void;
  onUpdate: (id: number, data: { name?: string; type?: string; icon?: string; color?: string }) => void;
  onDelete: (id: number) => void;
}) {
  const [showForm, setShowForm] = useState(false);

  const incomeCats = categories.filter((c) => c.type === 'income');
  const expenseCats = categories.filter((c) => c.type === 'expense');

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Tags size={20} className="text-gray-600" />
          <h2 className="font-bold text-gray-800">Danh mục</h2>
          {!isLoading && (
            <span className="text-[11px] font-bold text-gray-400">({categories.length})</span>
          )}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          disabled={isMutating}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors disabled:opacity-50"
        >
          <Plus size={13} /> Thêm danh mục
        </button>
      </div>

      {showForm && (
        <div className="mb-4">
          <CategoryForm
            onSave={(data) => { onCreate(data); setShowForm(false); }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {isLoading ? (
        <p className="text-[12px] text-gray-400 py-4 text-center">Đang tải...</p>
      ) : categories.length === 0 ? (
        <p className="text-[12px] text-gray-400 py-4 text-center">Chưa có danh mục nào. Thêm danh mục đầu tiên!</p>
      ) : (
        <div className="space-y-4">
          {expenseCats.length > 0 && (
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Chi tiêu</p>
              <div className="divide-y divide-gray-50">
                {expenseCats.map((cat) => (
                  <CategoryRow key={cat.id} category={cat} onUpdate={onUpdate} onDelete={onDelete} />
                ))}
              </div>
            </div>
          )}
          {incomeCats.length > 0 && (
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Thu nhập</p>
              <div className="divide-y divide-gray-50">
                {incomeCats.map((cat) => (
                  <CategoryRow key={cat.id} category={cat} onUpdate={onUpdate} onDelete={onDelete} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Settings View ──────────────────────────────────────────────────────

export function SettingsView({
  user,
  isLoading,
  emergencyBuffer,
  setEmergencyBuffer,
  emailNotifications,
  setEmailNotifications,
  pushNotifications,
  setPushNotifications,
  onSave,
  categories,
  categoriesLoading,
  isMutatingCategories,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
}: SettingsViewProps) {

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cài Đặt</h1>
        <p className="text-sm text-gray-600 mt-1">
          Quản lý tài khoản và tùy chỉnh ứng dụng
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl mb-4">
                {(user.fullName || user.full_name || '?').charAt(0)}
              </div>
              <h3 className="font-bold text-gray-800">{user.fullName || user.full_name || ''}</h3>
              <p className="text-sm text-gray-600 mt-1">{user.email}</p>
              <Button variant="outline" className="mt-4 w-full">
                Đổi Ảnh Đại Diện
              </Button>
            </div>
          </div>
        </div>

        {/* Settings Panels */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <User size={20} className="text-gray-600" />
              <h2 className="font-bold text-gray-800">Thông tin tài khoản</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên
                </label>
                <input
                  type="text"
                  defaultValue={user.fullName || user.full_name || ''}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue={user.email}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Category Management */}
          <CategorySection
            categories={categories}
            isLoading={categoriesLoading}
            isMutating={isMutatingCategories}
            onCreate={onCreateCategory}
            onUpdate={onUpdateCategory}
            onDelete={onDeleteCategory}
          />

          {/* Financial Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign size={20} className="text-gray-600" />
              <h2 className="font-bold text-gray-800">Cài đặt tài chính</h2>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quỹ dự phòng khẩn cấp
              </label>
              <input
                type="text"
                value={formatCurrency(emergencyBuffer.toString(), 'vi-VN')}
                onChange={(e) => {
                  const val = parseInt(
                    e.target.value.replace(/\D/g, '') || '0'
                  );
                  setEmergencyBuffer(val);
                }}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Số tiền dự phòng sẽ được trừ vào S2S
              </p>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell size={20} className="text-gray-600" />
              <h2 className="font-bold text-gray-800">Thông báo</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">
                    Email notifications
                  </p>
                  <p className="text-sm text-gray-600">
                    Nhận thông báo qua email
                  </p>
                </div>
                <button
                  onClick={() => setEmailNotifications(!emailNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">
                    Push notifications
                  </p>
                  <p className="text-sm text-gray-600">
                    Nhận thông báo trên thiết bị
                  </p>
                </div>
                <button
                  onClick={() => setPushNotifications(!pushNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    pushNotifications ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      pushNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <Button onClick={onSave} className="w-full" disabled={isLoading}>
            <Save size={16} className="mr-2" />
            Lưu Thay Đổi
          </Button>
        </div>
      </div>
    </div>
  );
}
