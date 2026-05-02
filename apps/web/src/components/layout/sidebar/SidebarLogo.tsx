'use client';

import { Sparkles, ChevronLeft } from 'lucide-react';

interface SidebarLogoProps {
  open: boolean;
  onToggle: () => void;
}

export function SidebarLogo({ open, onToggle }: SidebarLogoProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-5 h-[72px] relative shrink-0">
      {/* App icon */}
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-linear-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/40 hover:scale-105 transition-transform active:scale-95 cursor-default">
        <Sparkles size={18} className="text-white" />
      </div>

      {/* App name — hidden when collapsed */}
      <div
        className="flex flex-col overflow-hidden transition-all duration-300"
        style={{ opacity: open ? 1 : 0, maxWidth: open ? '160px' : '0' }}
      >
        <p className="text-white font-black text-[15px] whitespace-nowrap leading-tight">
          S2S Finance
        </p>
        <p className="text-slate-400 text-[10px] font-bold whitespace-nowrap tracking-wider">
          Safe-to-Spend
        </p>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        aria-label={open ? 'Thu gọn sidebar' : 'Mở rộng sidebar'}
        className="absolute -right-3 top-6 bg-[#1e293b] border border-white/10 shadow-lg p-1.5 rounded-full text-slate-400 hover:text-white hover:border-blue-500/40 transition-all active:scale-95 z-10"
      >
        <ChevronLeft
          size={12}
          className={`transition-transform duration-300 ${open ? '' : 'rotate-180'}`}
        />
      </button>
    </div>
  );
}
