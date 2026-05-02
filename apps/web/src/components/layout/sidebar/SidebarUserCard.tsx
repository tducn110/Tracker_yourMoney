'use client';

import { LogOut } from 'lucide-react';
import { useAuth } from '@/app/context/AuthProvider';

interface SidebarUserCardProps {
  open: boolean;
}

export function SidebarUserCard({ open }: SidebarUserCardProps) {
  const { user, logout } = useAuth();

  const displayName = user?.fullName ?? 'Người dùng';
  const email = user?.email ?? '';
  const avatar = user?.avatarUrl ? (
    <img src={user.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
  ) : (
    displayName.charAt(0).toUpperCase()
  );

  return (
    <div className="p-2 border-t border-white/5 shrink-0">
      {/* User mini card */}
      <div
        className="mx-1 mb-2 rounded-xl bg-white/5 border border-white/5 overflow-hidden transition-all duration-300"
        style={{
          opacity: open ? 1 : 0,
          maxHeight: open ? '80px' : '0px',
          padding: open ? '12px' : '0px',
          marginBottom: open ? '8px' : '0px',
          borderWidth: open ? '1px' : '0px',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[11px] font-black shrink-0 overflow-hidden">
            {avatar}
          </div>
          <div className="min-w-0">
            <p className="text-white text-[12px] font-black truncate">{displayName}</p>
            <p className="text-slate-400 text-[10px] font-bold truncate">{email}</p>
          </div>
        </div>
      </div>

      {/* Logout button */}
      <button
        onClick={logout}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all w-full active:scale-95"
      >
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
          <LogOut size={16} />
        </div>
        <span
          className="text-[13px] font-bold whitespace-nowrap overflow-hidden transition-all duration-300"
          style={{ opacity: open ? 1 : 0, maxWidth: open ? '160px' : '0px' }}
        >
          Đăng Xuất
        </span>
      </button>
    </div>
  );
}
