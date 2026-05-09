'use client';

import { useState } from "react";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";

// Common emoji icons for categories
const ICON_PRESETS: Record<string, string[]> = {
  income: ["💰", "💵", "💴", "💶", "💷", "💸", "💳", "🏦"],
  expense: [
    "🍔", "🥤", "🍕", "🍜", "🍱", "🍰", "☕", "🍺",
    "🚗", "🚕", "🚙", "🚌", "🚎", "🏍️", "🚲", "⛽",
    "🏠", "🏡", "🏢", "🏨", "🏪", "🏬", "💡", "🔌",
    "👕", "👔", "👗", "👠", "👟", "🎽", "🧥", "👜",
    "📱", "💻", "⌨️", "🖥️", "📷", "🎮", "🎧", "📺",
    "📚", "📖", "✏️", "🖊️", "📝", "🎨", "🎭", "🎪",
    "🏥", "💊", "💉", "🩺", "🦷", "🧴", "💆", "💇",
    "✈️", "🏖️", "🎢", "🎡", "🎠", "🎟️", "🎫", "🗺️",
    "💪", "⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏋️",
    "🐕", "🐈", "🐦", "🐠", "🌱", "🌺", "🌻", "🌹",
    "🎁", "🎂", "🎉", "🎊", "🎈", "🍾", "🥂", "🎄",
    "📦", "🛒", "🛍️", "💳", "💰", "🏦", "📊", "📈"
  ],
};

// Color presets matching Tailwind palette
const COLOR_PRESETS = [
  { name: "Red", value: "#EF4444" },
  { name: "Orange", value: "#F97316" },
  { name: "Amber", value: "#F59E0B" },
  { name: "Yellow", value: "#EAB308" },
  { name: "Lime", value: "#84CC16" },
  { name: "Green", value: "#10B981" },
  { name: "Emerald", value: "#059669" },
  { name: "Teal", value: "#14B8A6" },
  { name: "Cyan", value: "#06B6D4" },
  { name: "Sky", value: "#0EA5E9" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Violet", value: "#8B5CF6" },
  { name: "Purple", value: "#A855F7" },
  { name: "Fuchsia", value: "#D946EF" },
  { name: "Pink", value: "#EC4899" },
  { name: "Gray", value: "#6B7280" },
];

interface Category {
  id: number;
  name: string;
  type: "income" | "expense";
  icon: string;
  color: string;
  is_system?: boolean;
}

interface CategoryManagerProps {
  categories: Category[];
  onAdd: (category: Omit<Category, "id">) => void;
  onEdit: (id: number, category: Partial<Category>) => void;
  onDelete: (id: number) => void;
}

export default function CategoryManager({
  categories,
  onAdd,
  onEdit,
  onDelete,
}: CategoryManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "expense" as "income" | "expense",
    icon: "📦",
    color: "#6B7280",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingId) {
      onEdit(editingId, formData);
    } else {
      onAdd(formData);
    }

    // Reset form
    setFormData({ name: "", type: "expense", icon: "📦", color: "#6B7280" });
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      type: category.type,
      icon: category.icon,
      color: category.color,
    });
    setEditingId(category.id);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setFormData({ name: "", type: "expense", icon: "📦", color: "#6B7280" });
    setEditingId(null);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[18px] font-semibold text-slate-900">
            Quản Lý Danh Mục
          </h3>
          <p className="text-[14px] mt-1 text-slate-500">
            Tùy chỉnh danh mục giao dịch của bạn
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[14px] font-medium text-white transition-transform active:scale-95 bg-blue-500 hover:bg-blue-600"
        >
          <Plus className="w-4 h-4" />
          Thêm Danh Mục
        </button>
      </div>

      {/* Categories List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between p-4 rounded-xl border bg-white border-slate-200 shadow-sm transition-all"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-[24px]"
                style={{ backgroundColor: `${category.color}15` }}
              >
                {category.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-medium text-slate-900">
                    {category.name}
                  </span>
                  {category.is_system && (
                    <span
                      className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-500"
                    >
                      Mặc định
                    </span>
                  )}
                </div>
                <span className="text-[13px] text-slate-500">
                  {category.type === "income" ? "Thu nhập" : "Chi tiêu"}
                </span>
              </div>
            </div>

            {!category.is_system && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="p-2 rounded-lg hover:bg-blue-50 transition-colors group"
                >
                  <Pencil className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Xóa danh mục "${category.name}"?`)) {
                      onDelete(category.id);
                    }
                  }}
                  className="p-2 rounded-lg hover:bg-red-50 transition-colors group"
                >
                  <Trash2 className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            onClick={handleCancel}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          />

          {/* Modal */}
          <div
            className="relative w-full max-w-2xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto bg-white shadow-2xl transition-all scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[20px] font-bold text-slate-900">
                {editingId ? "Chỉnh Sửa Danh Mục" : "Thêm Danh Mục Mới"}
              </h2>
              <button
                onClick={handleCancel}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-[14px] font-medium mb-2 text-slate-600">
                  Tên Danh Mục
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: Gym & Fitness, Pet Care..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  required
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-[14px] font-medium mb-2 text-slate-600">
                  Loại
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "income" })}
                    className={`flex-1 py-3 rounded-xl border-2 transition-all font-medium ${
                      formData.type === "income"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                        : "border-slate-200 bg-white text-slate-500"
                    }`}
                  >
                    💰 Thu Nhập
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "expense" })}
                    className={`flex-1 py-3 rounded-xl border-2 transition-all font-medium ${
                      formData.type === "expense"
                        ? "border-red-500 bg-red-50 text-red-600"
                        : "border-slate-200 bg-white text-slate-500"
                    }`}
                  >
                    💸 Chi Tiêu
                  </button>
                </div>
              </div>

              {/* Icon Picker */}
              <div>
                <label className="block text-[14px] font-medium mb-2 text-slate-600">
                  Icon
                </label>
                <div className="grid grid-cols-8 md:grid-cols-12 gap-2 max-h-48 overflow-y-auto p-3 rounded-xl bg-slate-50 border border-slate-100">
                  {ICON_PRESETS[formData.type].map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-[20px] transition-transform hover:scale-110 ${
                        formData.icon === icon
                          ? "ring-2 ring-blue-500 bg-white shadow-sm"
                          : "bg-white border border-slate-200"
                      }`}
                      style={{
                        backgroundColor: formData.icon === icon ? `${formData.color}30` : undefined,
                        borderColor: formData.icon === icon ? formData.color : undefined,
                      }}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-[14px] font-medium mb-2 text-slate-600">
                  Màu Sắc
                </label>
                <div className="grid grid-cols-6 md:grid-cols-9 gap-2">
                  {COLOR_PRESETS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className="relative w-full aspect-square rounded-lg transition-transform hover:scale-110 flex items-center justify-center"
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    >
                      {formData.color === color.value && (
                        <Check className="w-5 h-5 text-white drop-shadow-lg" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[14px] font-medium mb-2 text-slate-600">
                  Preview
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-[24px]"
                    style={{ backgroundColor: `${formData.color}15` }}
                  >
                    {formData.icon}
                  </div>
                  <div>
                    <div className="text-[15px] font-medium text-slate-900">
                      {formData.name || "Tên danh mục"}
                    </div>
                    <div className="text-[13px] text-slate-500">
                      {formData.type === "income" ? "Thu nhập" : "Chi tiêu"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 py-3 rounded-xl font-medium transition-all bg-slate-100 text-slate-600 hover:bg-slate-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl font-medium text-white transition-all bg-blue-500 hover:bg-blue-600 active:scale-[0.98]"
                >
                  {editingId ? "Lưu Thay Đổi" : "Thêm Danh Mục"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
