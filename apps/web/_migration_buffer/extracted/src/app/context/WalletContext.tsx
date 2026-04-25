'use client';

/**
 * WalletContext — Global wallet state management
 * Supports: list / add / update / delete / set default
 * No external state library — pure React Context.
 */

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  MockWallet,
  mockWallets,
  getTotalWalletBalance,
  getDefaultWallet,
  WalletType,
  walletTypeLabel,
  formatVND,
} from '@/app/data/mockData';

// ─── Types ────────────────────────────────────────────────────────────────────

export type { WalletType };
export { walletTypeLabel, formatVND };

export type NewWalletInput = Omit<MockWallet, 'id' | 'lastSynced'>;

interface WalletContextValue {
  wallets: MockWallet[];
  totalBalance: number;
  defaultWallet: MockWallet;
  addWallet: (data: NewWalletInput) => MockWallet;
  updateWallet: (id: string, updates: Partial<MockWallet>) => void;
  deleteWallet: (id: string) => void;
  setDefaultWallet: (id: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const WalletContext = createContext<WalletContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallets, setWallets] = useState<MockWallet[]>(mockWallets);

  const addWallet = useCallback((data: NewWalletInput): MockWallet => {
    const newWallet: MockWallet = {
      ...data,
      id: `wallet-${Date.now()}`,
      lastSynced: new Date().toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).replace(',', ''),
      // If first wallet or explicitly set as default, mark it
      isDefault: data.isDefault,
    };
    setWallets((prev) => {
      // If new wallet is default, remove default from others
      const updated = data.isDefault
        ? prev.map((w) => ({ ...w, isDefault: false }))
        : prev;
      return [...updated, newWallet];
    });
    return newWallet;
  }, []);

  const updateWallet = useCallback((id: string, updates: Partial<MockWallet>) => {
    setWallets((prev) => prev.map((w) => (w.id === id ? { ...w, ...updates } : w)));
  }, []);

  const deleteWallet = useCallback((id: string) => {
    setWallets((prev) => {
      const filtered = prev.filter((w) => w.id !== id);
      // If deleted wallet was default, assign default to first remaining
      const wasDefault = prev.find((w) => w.id === id)?.isDefault;
      if (wasDefault && filtered.length > 0) {
        filtered[0] = { ...filtered[0], isDefault: true };
      }
      return filtered;
    });
  }, []);

  const setDefaultWallet = useCallback((id: string) => {
    setWallets((prev) => prev.map((w) => ({ ...w, isDefault: w.id === id })));
  }, []);

  const totalBalance = getTotalWalletBalance(wallets);
  const defaultWallet = getDefaultWallet(wallets);

  return (
    <WalletContext.Provider
      value={{
        wallets,
        totalBalance,
        defaultWallet,
        addWallet,
        updateWallet,
        deleteWallet,
        setDefaultWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside <WalletProvider>');
  return ctx;
}
