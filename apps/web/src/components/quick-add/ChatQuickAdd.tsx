'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  CheckCircle2, 
  AlertCircle,
  X,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatVND } from '@finance/api-client';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
  data?: any;
}

interface ChatQuickAddProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export function ChatQuickAdd({ isOpen, onClose, onSubmit }: ChatQuickAddProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'bot',
      content: 'Chào bạn! Mình là AI Assistant. Bạn muốn ghi chép giao dịch gì nào? Ví dụ: "ăn sáng 35k" hoặc "lương tháng 4 20 triệu"',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI parsing
    setTimeout(async () => {
      // Logic parsing đơn giản để mô phỏng
      const amountMatch = inputValue.match(/\d+k?|triệu/i);
      let amount = 0;
      if (amountMatch) {
        let valStr = amountMatch[0].toLowerCase();
        if (valStr.includes('triệu')) {
          amount = parseFloat(valStr.replace('triệu', '')) * 1000000;
        } else {
          amount = parseInt(valStr.replace('k', '')) * (valStr.includes('k') ? 1000 : 1);
        }
      }
      
      const note = inputValue.replace(/\d+k?|triệu/i, '').trim() || 'Giao dịch qua chat';
      const type = (inputValue.toLowerCase().includes('lương') || inputValue.toLowerCase().includes('nhận')) ? 'income' : 'expense';

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: `Mình đã hiểu! Bạn muốn ghi nhận **${type === 'expense' ? 'chi tiêu' : 'thu nhập'}** cho "**${note}**" với số tiền **${formatVND(amount)}**. Mình lưu nhé?`,
        timestamp: new Date(),
        data: { amount, note, type, category: 'other', date: new Date().toISOString().split('T')[0] }
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleConfirm = async (data: any) => {
    try {
      await onSubmit(data);
      toast.success('Đã lưu giao dịch qua chat!', {
        icon: <CheckCircle2 className="text-emerald-500" />
      });
      onClose();
      // Reset chat
      setMessages([messages[0]]);
    } catch (error) {
      toast.error('Có lỗi xảy ra.');
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="sm:max-w-[450px] p-0 flex flex-col border-none shadow-2xl overflow-hidden bg-gray-50/50">
        
        {/* Header Overlay */}
        <div className="bg-white p-6 border-b border-gray-100/80 shadow-sm relative z-10">
          <SheetHeader className="text-left">
            <SheetTitle className="flex items-center gap-3 text-[18px] font-black text-gray-900">
              <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <MessageCircle size={20} />
              </div>
              AI Chat Quick-Add
            </SheetTitle>
            <SheetDescription className="text-[12px] font-bold text-blue-600/70">
              Tích hợp Natural Language Processing (NLP)
            </SheetDescription>
          </SheetHeader>
        </div>

        {/* Chat Area */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6" ref={scrollRef}>
            {messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`
                    w-8 h-8 rounded-xl flex items-center justify-center shrink-0
                    ${msg.role === 'user' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white text-blue-500 border border-blue-100 shadow-sm'}
                  `}>
                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  
                  <div className="space-y-2">
                    <div className={`
                      p-4 rounded-2xl text-[14px] leading-relaxed shadow-sm
                      ${msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none font-medium' 
                        : 'bg-white text-gray-800 rounded-tl-none font-medium border border-gray-100'}
                    `}>
                      <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<b class="font-black text-blue-600">$1</b>') }} />
                    </div>

                    {msg.data && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-1 rounded-xl bg-white border border-emerald-100 flex gap-1 mt-2 shadow-sm"
                      >
                        <Button 
                          size="sm" 
                          onClick={() => handleConfirm(msg.data)}
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg h-9 font-bold text-[12px]"
                        >
                          <CheckCircle2 size={14} className="mr-1.5" />
                          Xác nhận & Lưu
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => setMessages(prev => prev.filter(m => m.id !== msg.id))}
                          className="px-3 rounded-lg h-9 text-gray-400 hover:text-red-500 hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </motion.div>
                    )}
                    
                    <span className="text-[10px] text-gray-400 font-bold px-1 uppercase tracking-widest">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white text-blue-500 border border-blue-100 flex items-center justify-center animate-pulse">
                    <Bot size={14} />
                  </div>
                  <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-blue-300 rounded-full" />
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-blue-300 rounded-full" />
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-blue-300 rounded-full" />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Footer Input */}
        <div className="p-6 bg-white border-t border-gray-100/80 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] relative z-10">
          <div className="flex items-center gap-3 p-1.5 bg-gray-50 border border-gray-100 rounded-[20px] focus-within:border-blue-300 transition-all duration-300">
            <Input 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Nhập giao dịch của bạn..."
              className="flex-1 bg-transparent border-none focus-visible:ring-0 text-[14px] font-bold text-gray-800 placeholder:text-gray-400 py-6"
            />
            <Button 
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              className="w-12 h-12 rounded-[14px] bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
            >
              <Send size={18} />
            </Button>
          </div>
          <div className="mt-3 flex gap-2">
             <button onClick={() => setInputValue('ăn sáng 35k')} className="text-[11px] font-black text-blue-500/70 hover:text-blue-600">#ăn_sáng_35k</button>
             <button onClick={() => setInputValue('đổ xăng 50k')} className="text-[11px] font-black text-blue-500/70 hover:text-blue-600">#đổ_xăng_50k</button>
             <button onClick={() => setInputValue('nhận lương 10tr')} className="text-[11px] font-black text-blue-500/70 hover:text-blue-600">#lương_10tr</button>
          </div>
        </div>

      </SheetContent>
    </Sheet>
  );
}
