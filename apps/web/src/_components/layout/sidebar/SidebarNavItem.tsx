'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

interface SidebarNavItemProps {
  path: string;
  icon: LucideIcon;
  label: string;
  color: string;
  isActive: boolean;
  sidebarOpen: boolean;
}

export function SidebarNavItem({
  path,
  icon: Icon,
  label,
  color,
  isActive,
  sidebarOpen,
}: SidebarNavItemProps) {
  return (
    <Link
      href={path}
      className={`
        relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
        ${isActive ? 'text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}
      `}
      style={
        isActive
          ? { backgroundColor: `${color}20`, border: `1px solid ${color}30` }
          : { border: '1px solid transparent' }
      }
    >
      {/* Icon container */}
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
          isActive ? 'shadow-lg' : 'bg-white/5 group-hover:bg-white/10'
        }`}
        style={
          isActive
            ? { backgroundColor: color, boxShadow: `0 4px 12px ${color}50` }
            : {}
        }
      >
        <Icon size={16} className={isActive ? 'text-white' : ''} />
      </div>

      {/* Label — hidden when sidebar collapsed */}
      <span
        className="text-[13px] font-bold whitespace-nowrap overflow-hidden transition-all duration-300"
        style={{ opacity: sidebarOpen ? 1 : 0, maxWidth: sidebarOpen ? '160px' : '0' }}
      >
        {label}
      </span>
    </Link>
  );
}
