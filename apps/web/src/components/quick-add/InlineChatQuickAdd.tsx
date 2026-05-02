'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  CheckCircle2,
  Trash2,
  Zap,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Coffee,
  Car,
  Home,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatCurrency } from '@finance/api-client';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
  data?: ParsedTransaction;
  confirmed?: boolean;
}

interface ParsedTransaction {
  amount: number;
  note: string;
  type: 'income' | 'expense';
  category: string;
  date: string;
  emoji: string;
}

const QUICK_CHIPS = [
  { label: 'ăn sáng 35k', icon: Coffee },
  { label: 'đổ xăng 50k', icon: Car },
  { label: 'đi chợ 200k', icon: ShoppingCart },
  { label: 'nhận lương 10tr', icon: TrendingUp },
  { label: 'thuê nhà 5tr', icon: Home },
  { label: 'freelance 2tr', icon: Zap },
];

const CATEGORY_MAP: Record<string, { emoji: string; label: string }> = {
  food: { emoji: '🍜', label: 'Ăn uống' },
  transport: { emoji: '🚗', label: 'Di chuyển' },
  shopping: { emoji: '🛒', label: 'Mua sắm' },
  income: { emoji: '💰', label: 'Thu nhập' },
  bills: { emoji: '🏠', label: 'Hóa đơn' },
  other: { emoji: '💳', label: 'Khác' },
};

function parseMockTransaction(input: string): ParsedTransaction {
  const lower = input.toLowerCase();

  // Detect amount
  let amount = 0;
  const trMatch = input.match(/(\d+(?:[.,]\d+)?)\s*tr(?:iệu)?/i);
  const kMatch = input.match(/(\d+(?:[.,]\d+)?)\s*k/i);
  const rawMatch = input.match(/(\d{4,})/);

  if (trMatch) {
    amount = parseFloat(trMatch[1].replace(',', '.')) * 1_000_000;
  } else if (kMatch) {
    amount = parseFloat(kMatch[1].replace(',', '.')) * 1_000;
  } else if (rawMatch) {
    amount = parseInt(rawMatch[1]);
  }

  // Detect type
  const incomeKeywords = ['lương', 'nhận', 'thu', 'freelance', 'bán', 'hoàn tiền', 'income', 'thưởng'];
  const type: 'income' | 'expense' = incomeKeywords.some(k => lower.includes(k)) ? 'income' : 'expense';

  // Detect category
  let category = 'other';
  if (/ăn|cơm|sáng|trưa|tối|cafe|coffee|bún|phở|pizza|bánh|uống/.test(lower)) category = 'food';
  else if (/xăng|taxi|xe|grab|bus|xe ôm|di chuyển/.test(lower)) category = 'transport';
  else if (/mua|chợ|shopping|quần|áo|giày|sách|điện thoại/.test(lower)) category = 'shopping';
  else if (/lương|freelance|thưởng|nhận/.test(lower)) category = 'income';
  else if (/thuê|nhà|điện|nước|internet|bill/.test(lower)) category = 'bills';

  const catInfo = CATEGORY_MAP[category] || CATEGORY_MAP['other'];

  // Note = remove amount tokens
  const note = input
    .replace(/\d+(?:[.,]\d+)?\s*(?:tr(?:iệu)?|k)/gi, '')
    .replace(/\d{4,}/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    || 'Giao dịch nhanh';

  return {
    amount,
    note: note.charAt(0).toUpperCase() + note.slice(1),
    type,
    category,
    date: new Date().toISOString().split('T')[0],
    emoji: catInfo.emoji,
  };
}

interface InlineChatQuickAddProps {
  onSubmit?: (data: ParsedTransaction) => Promise<void>;
}

export function InlineChatQuickAdd({ onSubmit }: InlineChatQuickAddProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'bot',
      content: 'Xin chào! Mình là **Finny** 🤖 — trợ lý tài chính của bạn.\n\nHãy nhập giao dịch bằng tiếng Việt tự nhiên, ví dụ:\n• _"ăn sáng 35k"_\n• _"lương tháng 4 nhận 20 triệu"_\n• _"đổ xăng 50k"_',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (text?: string) => {
    const rawInput = (text ?? inputValue).trim();
    if (!rawInput) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: rawInput,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    await new Promise(r => setTimeout(r, 800 + Math.random() * 400));

    const parsed = parseMockTransaction(rawInput);
    const typeLabel = parsed.type === 'expense' ? 'chi tiêu' : 'thu nhập';
    const catInfo = CATEGORY_MAP[parsed.category] || CATEGORY_MAP['other'];

    const botMsg: Message = {
      id: `bot-${Date.now()}`,
      role: 'bot',
      content: `Mình đã hiểu! Đây là **${typeLabel}** ${parsed.emoji}\n\n**${parsed.note}** — **${formatCurrency(parsed.amount)}**\nDanh mục: ${catInfo.emoji} ${catInfo.label}`,
      timestamp: new Date(),
      data: parsed,
    };
    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
  };

  const handleConfirm = async (msg: Message) => {
    if (!msg.data) return;
    try {
      await (onSubmit?.(msg.data) ?? Promise.resolve());
      setMessages(prev =>
        prev.map(m => m.id === msg.id ? { ...m, confirmed: true } : m)
      );
      const confirmMsg: Message = {
        id: `confirm-${Date.now()}`,
        role: 'bot',
        content: `✅ Đã lưu **${msg.data!.note}** — **${formatCurrency(msg.data!.amount)}** vào danh sách giao dịch!`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, confirmMsg]);
      toast.success(`Đã ghi nhận: ${msg.data!.note}`, {
        icon: <Sparkles className="text-blue-500" />,
      });
    } catch {
      toast.error('Có lỗi xảy ra khi lưu giao dịch.');
    }
  };

  const handleDiscard = (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  function renderContent(content: string) {
    const html = content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-gray-900">$1</strong>')
      .replace(/_(.*?)_/g, '<em class="not-italic text-blue-600 font-semibold">$1</em>')
      .replace(/\n/g, '<br/>');
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
      
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-linear-to-r from-blue-600 to-indigo-600">
        <div className="relative">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white shadow-lg">
            <Bot size={20} />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-blue-600" />
        </div>
        <div>
          <h3 className="text-[15px] font-black text-white">Finny AI</h3>
          <p className="text-[11px] font-bold text-blue-200">Nhập liệu tự nhiên • Online</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full">
          <Sparkles size={12} className="text-yellow-300" />
          <span className="text-[11px] font-black text-white">AI Parse</span>
        </div>
      </div>

      {/* ── Messages ── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-gray-50/40"
        style={{ minHeight: 0 }}
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className={`
                w-7 h-7 rounded-xl shrink-0 flex items-center justify-center mt-0.5
                ${msg.role === 'user'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white border border-blue-100 text-blue-500 shadow-sm'}
              `}>
                {msg.role === 'user' ? <User size={13} /> : <Bot size={13} />}
              </div>

              {/* Bubble + actions */}
              <div className={`flex flex-col gap-1.5 max-w-[78%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`
                  px-4 py-3 rounded-2xl text-[13.5px] leading-relaxed shadow-sm
                  ${msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-sm font-medium'
                    : 'bg-white text-gray-700 rounded-tl-sm border border-gray-100/80 font-medium'}
                `}>
                  {msg.role === 'user'
                    ? <span>{msg.content}</span>
                    : renderContent(msg.content)
                  }
                </div>

                {/* Confirm/Discard actions for parsed transactions */}
                {msg.data && !msg.confirmed && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex gap-1.5"
                  >
                    <button
                      onClick={() => handleConfirm(msg)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[12px] font-black shadow-md shadow-emerald-500/20 transition-all hover:scale-105"
                    >
                      <CheckCircle2 size={13} />
                      Lưu ngay
                    </button>
                    <button
                      onClick={() => handleDiscard(msg.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 border border-gray-100 rounded-xl text-[12px] font-black transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </motion.div>
                )}

                {msg.confirmed && (
                  <span className="flex items-center gap-1 text-[11px] font-black text-emerald-600">
                    <CheckCircle2 size={11} />
                    Đã lưu
                  </span>
                )}

                <span className="text-[10px] text-gray-400 font-semibold px-0.5">
                  {msg.timestamp.toLocaleTimeString('vi', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="flex gap-2.5"
            >
              <div className="w-7 h-7 rounded-xl bg-white border border-blue-100 text-blue-500 shadow-sm flex items-center justify-center animate-pulse">
                <Bot size={13} />
              </div>
              <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
                {[0, 0.2, 0.4].map((delay, i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay }}
                    className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Quick Chips ── */}
      <div className="px-4 pt-3 pb-1 bg-white border-t border-gray-50">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {QUICK_CHIPS.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => handleSend(label)}
              disabled={isTyping}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full text-[12px] font-black transition-all hover:scale-105 disabled:opacity-40"
            >
              <Icon size={11} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Input ── */}
      <div className="px-4 pb-4 pt-2 bg-white">
        <div className={`
          flex items-center gap-2 px-4 py-2 rounded-[16px] border-2 transition-all duration-200 bg-gray-50
          focus-within:border-blue-400 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-blue-500/10
          border-gray-100
        `}>
          <input
            ref={inputRef}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !isTyping) handleSend(); }}
            placeholder="Nhập giao dịch... vd: cafe 35k"
            disabled={isTyping}
            className="flex-1 bg-transparent border-none outline-none text-[14px] font-semibold text-gray-800 placeholder:text-gray-400 py-1.5 disabled:opacity-50"
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSend()}
            disabled={!inputValue.trim() || isTyping}
            className={`
              w-9 h-9 flex items-center justify-center rounded-[10px] transition-all
              ${inputValue.trim() && !isTyping
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
            `}
          >
            <Send size={16} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
