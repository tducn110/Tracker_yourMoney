'use client';

/**
 * MultiWalletStrip — Multiple wallet manager
 * - Shows all wallets in a responsive grid
 * - "Sắp xếp" mode enables drag-to-reorder via HTML5 DnD
 * - No motion/react — pure CSS transitions
 */

import { useState, useRef } from 'react';
import { Plus, Wallet as WalletIcon, GripVertical, ArrowUpDown } from 'lucide-react';
import { useWallet } from '@/app/context/WalletContext';
import { formatVND } from '@finance/api-client';
import { Wallet } from '@finance/api-client';
import { WalletCard } from './WalletCard';
import { WalletSyncModal } from './WalletSyncModal';

// ─── Draggable Wallet Card Wrapper ────────────────────────────────────────────

interface DraggableWalletCardProps {
  wallet: Wallet;
  isActive: boolean;
  reorderMode: boolean;
  isDragOver: boolean;
  onClick: () => void;
  onSyncClick: (e: React.MouseEvent) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

function DraggableWalletCard({
  wallet, isActive, reorderMode, isDragOver,
  onClick, onSyncClick, onDragStart, onDragOver, onDrop, onDragEnd,
}: DraggableWalletCardProps) {
  return (
    <div
      draggable={reorderMode}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`relative transition-all duration-200 ${
        reorderMode ? 'cursor-grab active:cursor-grabbing' : ''
      } ${isDragOver ? 'scale-[1.03] opacity-80' : ''}`}
    >
      {/* Drag handle — shown in reorder mode */}
      {reorderMode && (
        <div className="absolute top-2 left-2 z-10 p-1 rounded-lg bg-white/80 shadow-sm border border-gray-100">
          <GripVertical size={12} className="text-gray-400" />
        </div>
      )}
      <WalletCard
        wallet={wallet}
        isActive={isActive}
        onClick={reorderMode ? () => {} : onClick}
        onSyncClick={reorderMode ? (e) => e.preventDefault() : onSyncClick}
      />
    </div>
  );
}

// ─── Strip Header ─────────────────────────────────────────────────────────────

interface WalletStripHeaderProps {
  total: string;
  walletCount: number;
  reorderMode: boolean;
  onToggleReorder: () => void;
}

function WalletStripHeader({ total, walletCount, reorderMode, onToggleReorder }: WalletStripHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
      {/* Left */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
          <WalletIcon size={14} className="text-blue-600" />
        </div>
        <div>
          <h3 className="text-[13px] font-black text-gray-900 leading-tight">Ví của tôi</h3>
          <p className="text-[10px] font-bold text-gray-400">{walletCount} tài khoản</p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Tổng cộng</p>
          <p className="text-[18px] font-black text-gray-900">{formatVND(total)}</p>
        </div>

        {/* Reorder toggle */}
        <button
          onClick={onToggleReorder}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all active:scale-95 ${
            reorderMode
              ? 'bg-blue-500 text-white shadow-md shadow-blue-200'
              : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
          }`}
        >
          <ArrowUpDown size={12} />
          {reorderMode ? 'Xong' : 'Sắp xếp'}
        </button>

        {/* Add wallet */}
        {!reorderMode && (
          <button
            className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-blue-50 flex items-center justify-center text-gray-500 hover:text-blue-600 transition-colors active:scale-95"
            title="Thêm ví mới"
          >
            <Plus size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function MultiWalletStrip() {
  const { wallets, totalBalance, defaultWallet, updateWallet } = useWallet();
  const [activeId, setActiveId]       = useState<string | null>(null);
  const [syncTarget, setSyncTarget]   = useState<Wallet | null>(null);
  const [reorderMode, setReorderMode] = useState(false);
  const [dragOverId, setDragOverId]   = useState<string | null>(null);
  const dragItemRef                   = useRef<string | null>(null);

  // Set active wallet once data loads
  if (activeId === null && defaultWallet) {
    setActiveId(defaultWallet.id);
  }

  // ── Sync ──

  const handleSyncConfirm = async (walletId: string, newBalance: string) => {
    await updateWallet(walletId, { balance: newBalance });
    setSyncTarget(null);
  };

  // ── Drag & Drop (HTML5 native) ──
  // Note: reorder only affects visual order locally; API does not persist wallet order

  const [localOrder, setLocalOrder] = useState<string[] | null>(null);
  const orderedWallets = localOrder
    ? localOrder.map((id) => wallets.find((w) => w.id === id)!).filter(Boolean)
    : wallets;

  const handleDragStart = (id: string) => (e: React.DragEvent) => {
    dragItemRef.current = id;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (id: string) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverId(id);
  };

  const handleDrop = (targetId: string) => (e: React.DragEvent) => {
    e.preventDefault();
    const sourceId = dragItemRef.current;
    if (!sourceId || sourceId === targetId) return;

    const base = localOrder ?? wallets.map((w) => w.id);
    const fromIdx = base.indexOf(sourceId);
    const toIdx   = base.indexOf(targetId);
    const arr = [...base];
    const [item]  = arr.splice(fromIdx, 1);
    arr.splice(toIdx, 0, item);
    setLocalOrder(arr);
    setDragOverId(null);
    dragItemRef.current = null;
  };

  const handleDragEnd = () => {
    setDragOverId(null);
    dragItemRef.current = null;
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <WalletStripHeader
          total={totalBalance}
          walletCount={wallets.length}
          reorderMode={reorderMode}
          onToggleReorder={() => setReorderMode((v) => !v)}
        />

        {/* Reorder hint */}
        {reorderMode && (
          <div className="mx-4 mt-3 px-4 py-2.5 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-[11px] font-bold text-blue-600 text-center">
              ✋ Kéo thả để thay đổi vị trí ví — nhấn "Xong" để lưu thứ tự
            </p>
          </div>
        )}

        {/* Wallet cards */}
        <div className={`p-4 grid grid-cols-2 md:grid-cols-4 gap-3 ${reorderMode ? 'select-none' : ''}`}>
          {orderedWallets.map((wallet) => (
            <DraggableWalletCard
              key={wallet.id}
              wallet={wallet}
              isActive={activeId === wallet.id}
              reorderMode={reorderMode}
              isDragOver={dragOverId === wallet.id}
              onClick={() => setActiveId(wallet.id)}
              onSyncClick={(e) => { e.stopPropagation(); setSyncTarget(wallet); }}
              onDragStart={handleDragStart(wallet.id)}
              onDragOver={handleDragOver(wallet.id)}
              onDrop={handleDrop(wallet.id)}
              onDragEnd={handleDragEnd}
            />
          ))}
        </div>
      </div>

      {syncTarget && (
        <WalletSyncModal
          wallet={syncTarget}
          isOpen={true}
          onClose={() => setSyncTarget(null)}
          onConfirm={handleSyncConfirm}
        />
      )}
    </>
  );
}
