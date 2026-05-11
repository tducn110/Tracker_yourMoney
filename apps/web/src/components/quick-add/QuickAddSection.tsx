'use client';

import { useState } from 'react';
import { Bot, Pencil } from 'lucide-react';
import { InlineChatQuickAdd } from './InlineChatQuickAdd';
import { SimpleQuickInput } from './SimpleQuickInput';

type Mode = 'ai' | 'manual';

export function QuickAddSection() {
  const [mode, setMode] = useState<Mode>('ai');

  return (
    <div className="space-y-4">
      {/* ── Tab bar ── */}
      <div className="flex items-center gap-1 p-1 bg-gray-100/80 rounded-2xl w-fit">
        <button
          onClick={() => setMode('ai')}
          className={`flex items-center gap-2 px-5 py-3 text-[13px] font-black transition-all rounded-xl ${
            mode === 'ai'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Bot size={16} />
          AI Chat
        </button>
        <button
          onClick={() => setMode('manual')}
          className={`flex items-center gap-2 px-5 py-3 text-[13px] font-black transition-all rounded-xl ${
            mode === 'manual'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Pencil size={16} />
          Nhập tay
        </button>
      </div>

      {/* ── Content ── */}
      {mode === 'ai' ? <InlineChatQuickAdd /> : <SimpleQuickInput />}
    </div>
  );
}
