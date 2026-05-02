'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, Plus, Search, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@finance/api-client';
import { toast } from 'sonner';

interface QuickInputBarProps {
  onSubmit: (data: any) => Promise<void>;
  placeholder?: string;
}

export function QuickInputBar({ onSubmit, placeholder = "Nhập nhanh: ăn sáng 30k..." }: QuickInputBarProps) {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  const handleSend = async () => {
    if (!value.trim()) return;
    setIsParsing(true);
    
    // Simulate AI parsing
    try {
      // Mock logic: extract number
      const amount = parseInt(value.match(/\d+/)?.[0] || '0') * (value.includes('k') ? 1000 : 1);
      const note = value.replace(/\d+k?/, '').trim() || 'Chi tiêu nhanh';
      
      await onSubmit({
        amount,
        note,
        type: 'expense',
        category: 'other',
        date: new Date().toISOString().split('T')[0]
      });
      
      toast.success(`Đã ghi nhận: ${note} ${formatCurrency(amount)}`, {
        icon: <Sparkles className="text-blue-500" />
      });
      setValue('');
    } catch (error) {
      toast.error('Không thể xử lý dữ liệu.');
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="relative group w-full">
      {/* Background Glow */}
      <div className={`
        absolute -inset-1 rounded-[24px] blur-lg transition-all duration-500 opacity-20
        ${isFocused ? 'bg-blue-400 opacity-40' : 'bg-gray-200 opacity-0'}
      `} />

      <motion.div 
        layout
        className={`
          relative flex items-center gap-2 p-2 rounded-[20px] bg-white border-2 transition-all duration-300
          ${isFocused ? 'border-blue-400 shadow-2xl' : 'border-gray-100 shadow-sm'}
        `}
      >
        <div className={`
          flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300
          ${isFocused ? 'bg-blue-500 text-white rotate-90' : 'bg-gray-50 text-gray-400'}
        `}>
          <Sparkles size={18} />
        </div>

        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-none outline-none text-[15px] font-semibold text-gray-800 placeholder:text-gray-400 py-2 px-1"
        />

        <AnimatePresence mode="wait">
          {value.length > 0 ? (
            <motion.button
              key="send"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={handleSend}
              disabled={isParsing}
              className={`
                flex items-center justify-center w-10 h-10 rounded-xl transition-all
                ${isParsing ? 'bg-gray-100 text-gray-400' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20'}
              `}
            >
              <Send size={18} className={isParsing ? 'animate-pulse' : ''} />
            </motion.button>
          ) : (
            <motion.div
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-gray-400 text-[11px] font-bold"
            >
              <span>NHẬP ĐỂ AI PARSE</span>
              <ChevronRight size={12} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Suggested Hints (Mobile friendly) */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-3 flex flex-wrap gap-2 z-10"
          >
            {['ăn sáng 35k', 'đổ xăng 50k', 'cafe 25k', 'đi chợ 200k'].map((hint) => (
              <Badge 
                key={hint} 
                variant="secondary" 
                className="cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors py-1.5 px-3 border border-gray-100 bg-white/90 backdrop-blur-sm text-gray-500 font-bold"
                onClick={() => setValue(hint)}
              >
                {hint}
              </Badge>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
