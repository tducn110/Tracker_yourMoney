'use client';

import { useState } from 'react';
import {
  Bell,
  Calendar,
  Check,
  DollarSign,
  Loader2,
  Pencil,
  Plus,
  Save,
  Tags,
  Trash2,
  User,
  WalletCards,
  X,
} from 'lucide-react';
import { formatCurrency } from '@finance/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Category } from '@finance/api-client';

const CATEGORY_ICONS = ['🍔', '🚗', '🏠', '🎮', '📚', '💊', '👕', '🎬', '✈️', '💼', '🎁', '🐾', '📱', '💡', '🛒', '🏥', '🎓', '☕', '🎵', '💻'];
const CATEGORY_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#6b7280'];

interface SettingsViewProps {
  user: { fullName?: string; full_name?: string; email?: string };
  isLoading?: boolean;
  emergencyBuffer: number;
  setEmergencyBuffer: (val: number) => void;
  monthlyBudget: string;
  setMonthlyBudget: (val: string) => void;
  incomeDate: number;
  setIncomeDate: (val: number) => void;
  emailNotifications: boolean;
  setEmailNotifications: (val: boolean) => void;
  pushNotifications: boolean;
  setPushNotifications: (val: boolean) => void;
  onSave: () => void;
  isSaving?: boolean;
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


// ─── Reusable Settings Sections ───────────────────────────────────────────────

type SettingsTabId = 'profile' | 'finance' | 'categories' | 'notifications';

const SETTINGS_TABS: Array<{
  id: SettingsTabId;
  label: string;
  description: string;
  icon: typeof User;
}> = [
  { id: 'profile', label: 'Hồ sơ', description: 'Thông tin tài khoản', icon: User },
  { id: 'finance', label: 'Tài chính', description: 'Ngân sách và lương', icon: WalletCards },
  { id: 'categories', label: 'Danh mục', description: 'Thu nhập và chi tiêu', icon: Tags },
  { id: 'notifications', label: 'Thông báo', description: 'Email và push', icon: Bell },
];

function SettingsPanel({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof User;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="gap-0 rounded-xl border-gray-200 bg-white shadow-sm">
      <CardHeader className="border-b border-gray-100 pb-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Icon size={18} />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-gray-900">{title}</CardTitle>
            <CardDescription className="mt-1 text-sm text-gray-500">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 p-6">{children}</CardContent>
    </Card>
  );
}

function ProfilePanel({ user }: { user: SettingsViewProps['user'] }) {
  const displayName = user.fullName || user.full_name || 'Người dùng';

  return (
    <SettingsPanel icon={User} title="Thông tin tài khoản" description="Thông tin định danh đang dùng trong toàn bộ ứng dụng.">
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-indigo-600 text-3xl font-bold text-white">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <p className="font-bold text-gray-900">{displayName}</p>
          <p className="mt-1 break-all text-sm text-gray-500">{user.email}</p>
          <Button variant="outline" className="mt-4 w-full" type="button">
            Đổi ảnh đại diện
          </Button>
        </div>

        <div className="grid content-start gap-4">
          <label className="grid gap-2 text-sm font-medium text-gray-700">
            Họ và tên
            <input
              type="text"
              defaultValue={displayName}
              className="h-11 rounded-lg border border-gray-200 px-4 text-gray-900 outline-none transition-colors focus:border-blue-500"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-gray-700">
            Email
            <input
              type="email"
              defaultValue={user.email}
              className="h-11 rounded-lg border border-gray-200 px-4 text-gray-900 outline-none transition-colors focus:border-blue-500"
            />
          </label>
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Email dùng để đăng nhập và nhận các thông báo quan trọng từ hệ thống.
          </div>
        </div>
      </div>
    </SettingsPanel>
  );
}

function FinancialPanel({
  emergencyBuffer,
  setEmergencyBuffer,
  monthlyBudget,
  setMonthlyBudget,
  incomeDate,
  setIncomeDate,
}: Pick<
  SettingsViewProps,
  'emergencyBuffer' | 'setEmergencyBuffer' | 'monthlyBudget' | 'setMonthlyBudget' | 'incomeDate' | 'setIncomeDate'
>) {
  return (
    <SettingsPanel icon={DollarSign} title="Cài đặt tài chính" description="Các giá trị mặc định dùng cho ngân sách, dự báo và nhắc nhở.">
      <div className="grid gap-5 lg:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-gray-700">
          Ngân sách tháng
          <input
            type="text"
            value={monthlyBudget ? formatCurrency(monthlyBudget, 'vi-VN') : ''}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, '');
              setMonthlyBudget(digits || '0');
            }}
            placeholder="0"
            className="h-11 rounded-lg border border-gray-200 px-4 text-gray-900 outline-none transition-colors focus:border-blue-500"
          />
          <span className="text-xs font-normal text-gray-500">Hạn mức chi tiêu mặc định mỗi tháng.</span>
        </label>

        <label className="grid gap-2 text-sm font-medium text-gray-700">
          Quỹ dự phòng khẩn cấp
          <input
            type="text"
            value={emergencyBuffer ? formatCurrency(String(emergencyBuffer), 'vi-VN') : ''}
            onChange={(e) => {
              const val = parseInt(e.target.value.replace(/\D/g, '') || '0', 10);
              setEmergencyBuffer(val);
            }}
            placeholder="0"
            className="h-11 rounded-lg border border-gray-200 px-4 text-gray-900 outline-none transition-colors focus:border-blue-500"
          />
          <span className="text-xs font-normal text-gray-500">Khoản dự phòng được khuyến nghị giữ lại.</span>
        </label>

        <label className="grid gap-2 text-sm font-medium text-gray-700 lg:col-span-2">
          Ngày nhận lương
          <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 transition-colors focus-within:border-blue-500">
            <Calendar size={16} className="shrink-0 text-gray-400" />
            <select
              value={incomeDate}
              onChange={(e) => setIncomeDate(Number(e.target.value))}
              className="h-11 w-full bg-transparent text-gray-900 outline-none"
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <option key={day} value={day}>Ngày {day}</option>
              ))}
            </select>
          </div>
          <span className="text-xs font-normal text-gray-500">Dùng để tính chu kỳ thu nhập và nhắc nhở ngân sách.</span>
        </label>
      </div>
    </SettingsPanel>
  );
}

function NotificationRow({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-gray-100 p-4">
      <div>
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function NotificationsPanel({
  emailNotifications,
  setEmailNotifications,
  pushNotifications,
  setPushNotifications,
}: Pick<SettingsViewProps, 'emailNotifications' | 'setEmailNotifications' | 'pushNotifications' | 'setPushNotifications'>) {
  return (
    <SettingsPanel icon={Bell} title="Thông báo" description="Bật tắt các kênh nhắc nhở để tránh bỏ sót giao dịch và hoá đơn.">
      <div className="grid gap-3">
        <NotificationRow
          title="Email notifications"
          description="Nhận thông báo qua email cho hoá đơn, ngân sách và hoạt động quan trọng."
          checked={emailNotifications}
          onCheckedChange={setEmailNotifications}
        />
        <NotificationRow
          title="Push notifications"
          description="Nhận thông báo trên thiết bị khi có nhắc nhở hoặc cập nhật mới."
          checked={pushNotifications}
          onCheckedChange={setPushNotifications}
        />
      </div>
    </SettingsPanel>
  );
}

function SaveSettingsButton({ onSave, isLoading, isSaving }: Pick<SettingsViewProps, 'onSave' | 'isLoading' | 'isSaving'>) {
  return (
    <div className="flex justify-end border-t border-gray-100 pt-5">
      <Button onClick={onSave} disabled={isLoading || isSaving} className="w-full sm:w-auto">
        {isSaving ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" />}
        {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
      </Button>
    </div>
  );
}

// ─── Main Settings View ──────────────────────────────────────────────────────

export function SettingsView({
  user,
  isLoading,
  emergencyBuffer,
  setEmergencyBuffer,
  monthlyBudget,
  setMonthlyBudget,
  incomeDate,
  setIncomeDate,
  emailNotifications,
  setEmailNotifications,
  pushNotifications,
  setPushNotifications,
  onSave,
  isSaving,
  categories,
  categoriesLoading,
  isMutatingCategories,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
}: SettingsViewProps) {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt</h1>
        <p className="mt-1 text-sm text-gray-600">Quản lý tài khoản, ngân sách, danh mục và thông báo.</p>
      </div>

      <Tabs defaultValue="profile" className="gap-6">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1 lg:grid-cols-4">
          {SETTINGS_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="h-auto justify-start rounded-lg px-3 py-3 text-left data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Icon size={16} />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold">{tab.label}</span>
                  <span className="hidden truncate text-[11px] font-medium text-gray-500 sm:block">{tab.description}</span>
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="profile" className="space-y-5">
          <ProfilePanel user={user} />
          <SaveSettingsButton onSave={onSave} isLoading={isLoading} isSaving={isSaving} />
        </TabsContent>

        <TabsContent value="finance" className="space-y-5">
          <FinancialPanel
            emergencyBuffer={emergencyBuffer}
            setEmergencyBuffer={setEmergencyBuffer}
            monthlyBudget={monthlyBudget}
            setMonthlyBudget={setMonthlyBudget}
            incomeDate={incomeDate}
            setIncomeDate={setIncomeDate}
          />
          <SaveSettingsButton onSave={onSave} isLoading={isLoading} isSaving={isSaving} />
        </TabsContent>

        <TabsContent value="categories">
          <CategorySection
            categories={categories}
            isLoading={categoriesLoading}
            isMutating={isMutatingCategories}
            onCreate={onCreateCategory}
            onUpdate={onUpdateCategory}
            onDelete={onDeleteCategory}
          />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-5">
          <NotificationsPanel
            emailNotifications={emailNotifications}
            setEmailNotifications={setEmailNotifications}
            pushNotifications={pushNotifications}
            setPushNotifications={setPushNotifications}
          />
          <SaveSettingsButton onSave={onSave} isLoading={isLoading} isSaving={isSaving} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
