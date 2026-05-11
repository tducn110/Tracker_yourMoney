'use client';

/**
 * WalletContext — Real API-backed wallet state management
 * Uses TanStack Query hooks from @/_lib/hooks/finance for data fetching/mutations.
 */

import { createContext, useContext, ReactNode, useMemo, useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWallets } from '@/_lib/hooks/finance';
import { walletAPI, Wallet } from '@finance/api-client';
import { toast } from 'sonner';
import Decimal from 'decimal.js';

export type WalletType = Wallet['type'];

export const walletTypeLabel: Record<WalletType, string> = {
  cash: 'Tiền mặt',
  bank: 'Ngân hàng',
  credit: 'Thẻ tín dụng',
  e_wallet: 'Ví điện tử',
  investment: 'Đầu tư',
  other: 'Khác',
};

export type NewWalletInput = {
  name: string;
  type: Wallet['type'];
  balance: string;
  icon: string;
  color: string;
  accountNumber?: string;
  isDefault?: boolean;
};

interface WalletContextValue {
  wallets: Wallet[];
  totalBalance: string;
  defaultWallet: Wallet | null;
  isLoading: boolean;
  addWallet: (data: NewWalletInput) => Promise<Wallet>;
  updateWallet: (id: string, updates: Partial<Wallet>) => Promise<void>;
  deleteWallet: (id: string) => Promise<void>;
  setDefaultWallet: (id: string) => Promise<void>;
  refreshWallets: () => Promise<void>;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const queryClient = useQueryClient();
  const { data: walletsData, isLoading, refetch: refreshWallets } = useWallets();

  useEffect(() => {
    if (walletsData) {
      setWallets(walletsData);
    }
  }, [walletsData]);

  const totalBalance = useMemo(() => {
    return wallets.reduce((sum, wallet) => {
      return sum.plus(new Decimal(wallet.balance || '0'));
    }, new Decimal(0)).toFixed(2);
  }, [wallets]);

  const defaultWallet = useMemo(() => wallets.find((w) => w.isDefault) ?? wallets[0] ?? null, [wallets]);

  const addWallet = async (data: NewWalletInput): Promise<Wallet> => {
    try {
      const newWallet = await walletAPI.create({
        name: data.name,
        type: data.type,
        initialBalance: data.balance,
        icon: data.icon,
        color: data.color,
        accountNumber: data.accountNumber,
        isDefault: data.isDefault,
      });
      
      await refreshWallets();
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      toast.success('Đã thêm ví mới');
      return newWallet;
    } catch (error) {
      console.error('Error adding wallet:', error);
      toast.error('Không thể thêm ví mới');
      throw error;
    }
  };

  const updateWallet = async (id: string, updates: Partial<Wallet>) => {
    try {
      await walletAPI.update(id, updates);
      await refreshWallets();
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      toast.success('Đã cập nhật ví');
    } catch (error) {
      console.error('Error updating wallet:', error);
      toast.error('Không thể cập nhật ví');
      throw error;
    }
  };

  const deleteWallet = async (id: string) => {
    try {
      await walletAPI.delete(id);
      await refreshWallets();
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      toast.success('Đã xóa ví');
    } catch (error) {
      console.error('Error deleting wallet:', error);
      toast.error('Không thể xóa ví');
      throw error;
    }
  };

  const setDefaultWallet = async (id: string) => {
    try {
      // API might handle clearing other defaults, or we do it sequentially
      // For now, let's just update the target wallet and refresh
      await walletAPI.update(id, { isDefault: true });
      await refreshWallets();
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      toast.success('Đã đặt làm ví mặc định');
    } catch (error) {
      console.error('Error setting default wallet:', error);
      toast.error('Không thể đặt ví mặc định');
      throw error;
    }
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
        refreshWallets: async () => { await refreshWallets(); },
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
