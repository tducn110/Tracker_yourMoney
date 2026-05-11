'use client';

/**
 * WalletCard — Single wallet display card
 * Follows 8px grid system, no motion/react dependency
 */

import { RefreshCw, Star } from 'lucide-react';
import { useWallet, walletTypeLabel } from '@/app/context/WalletContext';
import { formatVND, Wallet } from '@finance/api-client';

// ─── Props ───────────────────────────────────────────────────────────────────

interface WalletCardProps {
  wallet: Wallet;
  isActive: boolean;
  onClick: () => void;
  onSyncClick: (e: React.MouseEvent) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function WalletCard({ wallet, isActive, onClick, onSyncClick }: WalletCardProps) {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className="relative p-4 rounded-2xl cursor-pointer select-none transition-all duration-200 outline-none"
      style={{
        background: isActive
          ? `linear-gradient(135deg, ${wallet.color}22, ${wallet.color}0d)`
          : 'white',
        boxShadow: isActive
          ? `0 0 0 2px ${wallet.color}, 0 8px 24px ${wallet.color}22`
          : '0 0 0 1px #e5e7eb',
        transform: isActive ? 'scale(1.02)' : 'scale(1)',
      }}
    >
      {/* Default star badge */}
      {wallet.isDefault && (
        <div className="absolute top-3 right-3">
          <Star size={12} className="text-amber-400 fill-amber-400" />
        </div>
      )}

      {/* Icon + Name */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0"
          style={{ backgroundColor: `${wallet.color}20` }}
        >
          {wallet.icon}
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-black text-gray-900 truncate leading-tight">
            {wallet.name}
          </p>
          <p className="text-[10px] font-bold text-gray-400 leading-tight">
            {walletTypeLabel[wallet.type as any] || wallet.type}
          </p>
        </div>
      </div>

      {/* Balance */}
      <p
        className="text-[17px] font-black leading-none mb-1 truncate"
        style={{ color: wallet.color }}
      >
        {formatVND(wallet.balance)}
      </p>

      {/* Account number (bank wallets only) */}
      <p className="text-[10px] font-bold text-gray-400 mb-3 h-4">
        {(wallet as any).accountNumber ?? ''}
      </p>

      {/* Footer: synced time + sync button */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-medium text-gray-400 truncate flex-1">
          {wallet.lastSyncedAt || 'Chưa đồng bộ'}
        </p>
        <button
          onClick={onSyncClick}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all shrink-0"
        >
          <RefreshCw size={10} />
          Sync
        </button>
      </div>
    </div>
  );
}
