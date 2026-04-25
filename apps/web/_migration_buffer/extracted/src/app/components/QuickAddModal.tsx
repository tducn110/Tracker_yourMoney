import { useState, useEffect, useRef } from "react";
import { X, Sparkles, Send, Tag } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { mockCategories } from "../data/mockData";

interface QuickAddModalProps {
  open: boolean;
  onClose: () => void;
}

export function QuickAddModal({ open, onClose }: QuickAddModalProps) {
  const [input, setInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  if (!open) return null;

  const handleSave = () => {
    if (!input.trim()) return;
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setInput("");
      setSelectedCategory(null);
      onClose();
    }, 1200);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-white/95 backdrop-blur-2xl rounded-[28px] shadow-[0_20px_70px_-15px_rgba(0,0,0,0.2),0_8px_30px_-8px_rgba(0,0,0,0.1)] border border-gray-100/50 w-full max-w-lg overflow-hidden flex flex-col"
          >
            {/* Gradient overlay top */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-50/60 via-purple-50/30 to-transparent pointer-events-none"></div>
            
            {/* Header */}
            <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-gray-100/60 bg-white/80 backdrop-blur-sm relative z-10">
              <div className="flex items-center gap-3">
                <motion.div 
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30"
                >
                  <Sparkles size={20} className="text-white" />
                </motion.div>
                <div>
                  <h2 className="font-bold text-[18px] text-gray-900 tracking-tight leading-tight">Thêm Nhanh</h2>
                  <p className="text-[12px] text-gray-500 font-semibold">AI sẽ tự phân loại giao dịch</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-gray-100/80 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-200/80 transition-colors shadow-sm"
              >
                <X size={16} />
              </motion.button>
            </div>

            <div className="p-6 bg-gradient-to-br from-gray-50/50 via-blue-50/20 to-purple-50/20 relative z-10">
              {/* Input Area */}
              <div className="relative mb-6">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ví dụ: 50k ăn trưa, đổ xăng 60k..."
                  className="w-full pl-5 pr-14 py-4 rounded-2xl border-0 outline-none text-[16px] bg-white/90 backdrop-blur-sm shadow-[0_2px_20px_rgba(0,0,0,0.04)] ring-2 ring-gray-200/50 focus:ring-blue-400 focus:ring-4 focus:shadow-[0_4px_30px_rgba(59,130,246,0.15)] transition-all text-gray-900 placeholder:text-gray-400 font-medium"
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                />
                <motion.button 
                  onClick={handleSave}
                  disabled={!input.trim()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center disabled:opacity-0 transition-opacity duration-200 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
                >
                  <Send size={16} className="ml-0.5" />
                </motion.button>
              </div>

              {/* Suggestions / Categories */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Tag size={14} className="text-gray-500" />
                  <p className="text-[13px] font-bold text-gray-600">Hoặc chọn nhanh danh mục:</p>
                </div>
                <div className="grid grid-cols-4 gap-2.5">
                  {mockCategories.slice(0, 8).map((cat) => (
                    <motion.button
                      key={cat.id}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-[18px] transition-all duration-200 border bg-white/90 backdrop-blur-sm ${
                        selectedCategory === cat.id
                          ? "border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.15),0_4px_20px_rgba(59,130,246,0.2)] ring-2 ring-blue-100"
                          : "border-gray-200/60 shadow-sm hover:border-blue-300 hover:shadow-md"
                      }`}
                    >
                      <span className="text-[22px] block leading-none">{cat.icon}</span>
                      <span
                        className={`text-[11px] font-bold leading-tight text-center ${
                          selectedCategory === cat.id ? "text-blue-600" : "text-gray-600"
                        }`}
                      >
                        {cat.name}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-white/80 backdrop-blur-sm border-t border-gray-100/60 flex gap-3 relative z-10">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="flex-1 py-3.5 rounded-xl text-gray-600 font-bold text-[14px] bg-gray-100/80 hover:bg-gray-200/80 transition-colors"
              >
                Hủy
              </motion.button>
              <motion.button
                whileHover={{ scale: saved ? 1 : 1.02, y: saved ? 0 : -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={!input.trim() && !selectedCategory}
                className={`flex-[2] py-3.5 rounded-xl text-white font-bold text-[14px] transition-all ${
                  saved
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30"
                    : !input.trim() && !selectedCategory
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
                }`}
              >
                {saved ? (
                  <span className="flex items-center justify-center gap-2">
                    ✅ Đã lưu thành công!
                  </span>
                ) : (
                  "Lưu giao dịch"
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}