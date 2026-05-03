'use client';

/**
 * WalletContext — Real API-backed wallet state management
 * Uses TanStack Query hooks from @/_lib/hooks/finance for data fetching/mutations.
 */

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWallets } from '@/_lib/hooks/finance';
import { walletAPI } from '@finance/api-client';
import { toast } from 'sonner';

export type WalletType = 'cash' | 'bank' | 'ewallet' | 'savings';

export interface MockWallet {
  id: string;
  name: string;
  icon: string;
  balance: number;
  type: WalletType;
  colorHex: string;
  accountNumber?: string;
  isDefault: boolean;
  lastSynced: string;
}

export const walletTypeLabel: Record<WalletType, string> = {
  cash: 'Tiền mặt',
  bank: 'Ngân hàng',
  ewallet: 'Ví điện tử',
  savings: 'Tiết kiệm',
};

// Map API wallet type to frontend WalletType
const mapApiType = (t: string): WalletType => {
  if (t === 'e_wallet') return 'ewallet';
  if (t === 'bank') return 'bank';
  if (t === 'cash') return 'cash';
  return 'savings';
};

const mapApiWallet = (w: any): MockWallet => ({
  id: String(w.id),
  name: w.name,
  icon: w.icon || '💵',
  balance: parseFloat(w.balance) || 0,
  type: mapApiType(w.type),
  colorHex: w.color || '#4361ee',
  accountNumber: w.accountNumber,
  isDefault: w.isDefault === 1 || w.isDefault === true,
  lastSynced: w.lastSyncedAt
    ? new Date(w.lastSyncedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', '')
    : 'Chưa đồng bộ',
});

export const getTotalWalletBalance = (wallets: MockWallet[]): number =>
  wallets.reduce((sum, w) => sum + w.balance, 0);

export const getDefaultWallet = (wallets: MockWallet[]): MockWallet =>
  wallets.find((w) => w.isDefault) ?? wallets[0];

export type NewWalletInput = Omit<MockWallet, 'id' | 'lastSynced'>;

interface WalletContextValue {
  wallets: MockWallet[];
  totalBalance: number;
  defaultWallet: MockWallet | null;
  isLoading: boolean;
  addWallet: (data: NewWalletInput) => Promise<MockWallet>;
  updateWallet: (id: string, updates: Partial<MockWallet>) => Promise<void>;
  deleteWallet: (id: string) => Promise<void>;
  setDefaultWallet: (id: string) => Promise<void>;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { data: apiWallets = [], isLoading, refetch } = useWallets();
  const queryClient = useQueryClient();

  const wallets: MockWallet[] = useMemo(() => apiWallets.map(mapApiWallet), [apiWallets]);
  const totalBalance = useMemo(() => getTotalWalletBalance(wallets), [wallets]);
  const defaultWallet = useMemo(() => getDefaultWallet(wallets), [wallets]);

  const addWallet = async (data: NewWalletInput): Promise<MockWallet> => {
    const typeMap: Record<string, string> = { ewallet: 'e_wallet', bank: 'bank', cash: 'cash', savings: 'other' };
    const newWallet = await walletAPI.create({
      name: data.name,
      type: typeMap[data.type] || 'other',
      initialBalance: String(data.balance),
      icon: data.icon,
      color: data.colorHex,
      isDefault: data.isDefault ? 1 : 0,
    });
    queryClient.invalidateQueries({ queryKey: ['wallets'] });
    return mapApiWallet(newWallet);
  };

  const updateWallet = async (id: string, updates: Partial<MockWallet>) => {
    const payload: Record<string, unknown> = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.icon !== undefined) payload.icon = updates.icon;
    if (updates.colorHex !== undefined) payload.color = updates.colorHex;
    if (updates.isDefault !== undefined) payload.isDefault = updates.isDefault ? 1 : 0;
    await walletAPI.update(id, payload);
    queryClient.invalidateQueries({ queryKey: ['wallets'] });
  };

  const deleteWallet = async (id: string) => {
    await walletAPI.delete(id);
    queryClient.invalidateQueries({ queryKey: ['wallets'] });
  };

  const setDefaultWallet = async (id: string) => {
    const promises = apiWallets.map((w: any) => {
      if (String(w.id) === id) return walletAPI.update(id, { isDefault: true });
      if (w.isDefault) return walletAPI.update(String(w.id), { isDefault: false });
      return Promise.resolve();
    });
    await Promise.all(promises);
    queryClient.invalidateQueries({ queryKey: ['wallets'] });
  };

  return (
    <WalletContext.Provider
      value={{
        wallets,
        totalBalance,
        defaultWallet: defaultWallet || null,
        isLoading,
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

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside <WalletProvider>');
  return ctx;
}
