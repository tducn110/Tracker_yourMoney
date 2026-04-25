import { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, TrendingUp, TrendingDown, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ParsedTransaction {
  amount: number;
  category: string;
  note: string;
  type: "income" | "expense";
  icon: string;
  color: string;
}

// Smart parser - parse natural language input
function parseInput(input: string): ParsedTransaction | null {
  const text = input.toLowerCase().trim();
  
  // Extract amount (support formats: 30k, 30000, 30.000)
  const amountMatch = text.match(/(\d+(?:[.,]\d+)*)\s*k?(?:đ|vnd)?/i);
  if (!amountMatch) return null;
  
  let amount = parseFloat(amountMatch[1].replace(/[.,]/g, ""));
  // If ends with 'k', multiply by 1000
  if (text.includes("k")) amount *= 1000;
  
  // Category detection with keywords
  const categories = [
    { keywords: ["ăn", "cơm", "phở", "bún", "cafe", "cà phê", "trà", "quán", "nhậu", "buffet", "lẩu", "bánh", "kem"], name: "Ăn Uống", icon: "🍔", color: "#F59E0B" },
    { keywords: ["grab", "xe", "taxi", "xăng", "gas", "bus", "tàu", "máy bay", "vé"], name: "Di Chuyển", icon: "🚗", color: "#EAB308" },
    { keywords: ["shop", "mua", "áo", "quần", "giày", "đồ"], name: "Mua Sắm", icon: "🛍️", color: "#EC4899" },
    { keywords: ["điện", "nước", "net", "wifi", "thuê", "nhà"], name: "Hóa Đơn", icon: "💡", color: "#8B5CF6" },
    { keywords: ["lương", "thưởng", "thu", "nhận", "salary"], name: "Thu Nhập", icon: "💰", color: "#10B981" },
    { keywords: ["gym", "thể thao", "yoga", "fitness"], name: "Sức Khỏe", icon: "💪", color: "#EF4444" },
    { keywords: ["phim", "game", "vui", "party"], name: "Giải Trí", icon: "🎮", color: "#3B82F6" },
  ];
  
  // Find matching category
  let matchedCategory = categories.find(cat => 
    cat.keywords.some(keyword => text.includes(keyword))
  );
  
  // Detect income vs expense
  const isIncome = text.includes("lương") || text.includes("thưởng") || text.includes("thu") || text.includes("nhận");
  
  // Default category
  if (!matchedCategory) {
    matchedCategory = isIncome 
      ? { name: "Thu Nhập", icon: "💰", color: "#10B981", keywords: [] }
      : { name: "Khác", icon: "📦", color: "#6B7280", keywords: [] };
  }
  
  // Extract note (everything except amount and category keywords)
  let note = text;
  categories.forEach(cat => {
    cat.keywords.forEach(kw => {
      note = note.replace(new RegExp(kw, "gi"), "");
    });
  });
  note = note.replace(/(\d+(?:[.,]\d+)*)\s*k?(?:đ|vnd)?/gi, "").trim();
  if (!note) note = matchedCategory.name;
  
  return {
    amount,
    category: matchedCategory.name,
    note: note.charAt(0).toUpperCase() + note.slice(1),
    type: isIncome ? "income" : "expense",
    icon: matchedCategory.icon,
    color: matchedCategory.color,
  };
}

interface ChatQuickAddProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (transaction: ParsedTransaction) => void;
}

export default function ChatQuickAdd({ isOpen, onClose, onAdd }: ChatQuickAddProps) {
  const [input, setInput] = useState("");
  const [parsed, setParsed] = useState<ParsedTransaction | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = [
    "Ăn sáng 30k",
    "Grab về nhà 45k",
    "Cafe 25k",
    "Nhận lương 15000k",
    "Mua áo 250k",
    "Xăng xe 200k",
  ];

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (input.trim()) {
      const result = parseInput(input);
      setParsed(result);
      setShowSuggestions(false);
    } else {
      setParsed(null);
      setShowSuggestions(true);
    }
  }, [input]);

  const handleSubmit = () => {
    if (parsed) {
      onAdd(parsed);
      setInput("");
      setParsed(null);
      onClose();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50"
          />

          {/* Chat Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="relative px-6 py-5 bg-gradient-to-r from-blue-500 to-indigo-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-[16px] font-bold text-white">Nhập Nhanh</h3>
                      <p className="text-[12px] text-white/80">Gõ tự nhiên, để AI hiểu</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
                {/* Suggestions */}
                {showSuggestions && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[13px] text-gray-500">
                      <Sparkles className="w-4 h-4" />
                      <span>Thử các mẫu này:</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="px-4 py-3 rounded-xl bg-gray-50 hover:bg-blue-50 hover:border-blue-200 border border-gray-100 text-[13px] text-gray-700 hover:text-blue-600 transition-all text-left font-medium"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preview Parsed Result */}
                {parsed && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl border-2 border-dashed"
                    style={{ 
                      borderColor: `${parsed.color}40`,
                      backgroundColor: `${parsed.color}08`
                    }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      <span className="text-[12px] font-semibold text-gray-600">
                        AI đã hiểu:
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-[24px]"
                        style={{ backgroundColor: `${parsed.color}20` }}
                      >
                        {parsed.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[15px] font-bold text-gray-900">
                            {parsed.note}
                          </span>
                          {parsed.type === "income" ? (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        <div className="text-[13px] text-gray-600 mb-2">
                          Danh mục: <span className="font-medium">{parsed.category}</span>
                        </div>
                        <div className="text-[20px] font-bold" style={{ color: parsed.color }}>
                          {parsed.type === "income" ? "+" : "-"}
                          {parsed.amount.toLocaleString("vi-VN")}đ
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Help Text */}
                {!showSuggestions && !parsed && (
                  <div className="text-center py-8 text-gray-400 text-[13px]">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    Nhập số tiền và mô tả...
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="px-6 pb-6">
                <div className="flex gap-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                    placeholder='VD: "Ăn sáng 30k" hoặc "Nhận lương 15tr"'
                    className="flex-1 px-5 py-4 rounded-2xl border-2 border-gray-200 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all text-[15px] font-medium"
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={!parsed}
                    className="px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold transition-all shadow-lg hover:shadow-xl disabled:shadow-none disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Thêm
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
