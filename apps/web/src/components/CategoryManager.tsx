import { useState } from "react";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Common emoji icons for categories
const ICON_PRESETS = {
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
          <h3 className="text-[18px] font-semibold" style={{ color: "#1E293B" }}>
            Quản Lý Danh Mục
          </h3>
          <p className="text-[14px] mt-1" style={{ color: "#64748B" }}>
            Tùy chỉnh danh mục giao dịch của bạn
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[14px] font-medium text-white"
          style={{ backgroundColor: "#3B82F6" }}
        >
          <Plus className="w-4 h-4" />
          Thêm Danh Mục
        </motion.button>
      </div>

      {/* Categories List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {categories.map((category) => (
          <motion.div
            key={category.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center justify-between p-4 rounded-xl border"
            style={{
              backgroundColor: "white",
              borderColor: "#E2E8F0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
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
                  <span className="text-[15px] font-medium" style={{ color: "#1E293B" }}>
                    {category.name}
                  </span>
                  {category.is_system && (
                    <span
                      className="px-2 py-0.5 rounded-md text-[11px] font-medium"
                      style={{ backgroundColor: "#F1F5F9", color: "#64748B" }}
                    >
                      Mặc định
                    </span>
                  )}
                </div>
                <span className="text-[13px]" style={{ color: "#64748B" }}>
                  {category.type === "income" ? "Thu nhập" : "Chi tiêu"}
                </span>
              </div>
            </div>

            {!category.is_system && (
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleEdit(category)}
                  className="p-2 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <Pencil className="w-4 h-4" style={{ color: "#3B82F6" }} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    if (confirm(`Xóa danh mục "${category.name}"?`)) {
                      onDelete(category.id);
                    }
                  }}
                  className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" style={{ color: "#EF4444" }} />
                </motion.button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancel}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="w-full max-w-2xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
                style={{ backgroundColor: "white" }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[20px] font-bold" style={{ color: "#1E293B" }}>
                    {editingId ? "Chỉnh Sửa Danh Mục" : "Thêm Danh Mục Mới"}
                  </h2>
                  <button
                    onClick={handleCancel}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5" style={{ color: "#64748B" }} />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="block text-[14px] font-medium mb-2" style={{ color: "#475569" }}>
                      Tên Danh Mục
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="VD: Gym & Fitness, Pet Care..."
                      className="w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 transition-all"
                      style={{
                        borderColor: "#E2E8F0",
                        backgroundColor: "#F8FAFC",
                      }}
                      required
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-[14px] font-medium mb-2" style={{ color: "#475569" }}>
                      Loại
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: "income" })}
                        className="flex-1 py-3 rounded-xl border-2 transition-all"
                        style={{
                          borderColor: formData.type === "income" ? "#10B981" : "#E2E8F0",
                          backgroundColor: formData.type === "income" ? "#10B98115" : "white",
                          color: formData.type === "income" ? "#10B981" : "#64748B",
                        }}
                      >
                        <span className="font-medium">💰 Thu Nhập</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: "expense" })}
                        className="flex-1 py-3 rounded-xl border-2 transition-all"
                        style={{
                          borderColor: formData.type === "expense" ? "#EF4444" : "#E2E8F0",
                          backgroundColor: formData.type === "expense" ? "#EF444415" : "white",
                          color: formData.type === "expense" ? "#EF4444" : "#64748B",
                        }}
                      >
                        <span className="font-medium">💸 Chi Tiêu</span>
                      </button>
                    </div>
                  </div>

                  {/* Icon Picker */}
                  <div>
                    <label className="block text-[14px] font-medium mb-2" style={{ color: "#475569" }}>
                      Icon
                    </label>
                    <div className="grid grid-cols-8 md:grid-cols-12 gap-2 max-h-48 overflow-y-auto p-3 rounded-xl" style={{ backgroundColor: "#F8FAFC" }}>
                      {ICON_PRESETS[formData.type].map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => setFormData({ ...formData, icon })}
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-[20px] hover:scale-110 transition-transform"
                          style={{
                            backgroundColor: formData.icon === icon ? `${formData.color}30` : "white",
                            border: formData.icon === icon ? `2px solid ${formData.color}` : "1px solid #E2E8F0",
                          }}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Picker */}
                  <div>
                    <label className="block text-[14px] font-medium mb-2" style={{ color: "#475569" }}>
                      Màu Sắc
                    </label>
                    <div className="grid grid-cols-6 md:grid-cols-9 gap-2">
                      {COLOR_PRESETS.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, color: color.value })}
                          className="relative w-full aspect-square rounded-lg transition-transform hover:scale-110"
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        >
                          {formData.color === color.value && (
                            <Check className="absolute inset-0 m-auto w-5 h-5 text-white drop-shadow-lg" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="p-4 rounded-xl" style={{ backgroundColor: "#F8FAFC" }}>
                    <p className="text-[14px] font-medium mb-2" style={{ color: "#475569" }}>
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
                        <div className="text-[15px] font-medium" style={{ color: "#1E293B" }}>
                          {formData.name || "Tên danh mục"}
                        </div>
                        <div className="text-[13px]" style={{ color: "#64748B" }}>
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
                      className="flex-1 py-3 rounded-xl font-medium transition-all hover:bg-gray-100"
                      style={{ backgroundColor: "#F1F5F9", color: "#64748B" }}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 rounded-xl font-medium text-white transition-all hover:opacity-90"
                      style={{ backgroundColor: "#3B82F6" }}
                    >
                      {editingId ? "Lưu Thay Đổi" : "Thêm Danh Mục"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
