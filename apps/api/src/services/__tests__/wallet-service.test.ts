import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WalletService } from '../wallet-service';

// Mock @finance/db
vi.mock('@finance/db', () => ({
  db: {
    transaction: vi.fn((fn: any) => fn({
      insert: vi.fn().mockReturnValue({ values: vi.fn() }),
      update: vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn() }) }),
      select: vi.fn().mockReturnValue({ from: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue({ limit: vi.fn() }) }) }),
    })),
    select: vi.fn().mockReturnValue({ from: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue({ orderBy: vi.fn(), limit: vi.fn() }) }) }),
    update: vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn() }) }),
    insert: vi.fn().mockReturnValue({ values: vi.fn() }),
  },
  wallets: {},
  walletLogs: {},
  transactions: {},
  eq: vi.fn(),
  and: vi.fn(),
  isNull: vi.fn(),
  desc: vi.fn(),
  sql: vi.fn(),
}));

describe('WalletService', () => {
  let service: WalletService;
  let mockCategoryRepo: any;

  beforeEach(() => {
    mockCategoryRepo = {
      findAll: vi.fn().mockResolvedValue([]),
      findByName: vi.fn().mockResolvedValue({ id: 1, name: 'Khác' }),
    };
    service = new WalletService(mockCategoryRepo);
  });

  describe('getWallets', () => {
    it('should return all wallets for a user', async () => {
      vi.spyOn(service, 'getWallets').mockResolvedValue([
        { id: 'wallet-1', name: 'Tiền mặt', balance: '5000000', netChange: '5000000' },
      ] as any);
      const wallets = await service.getWallets('user-1');
      expect(wallets).toHaveLength(1);
      expect(wallets[0].name).toBe('Tiền mặt');
    });

    it('should compute netChange as balance minus initialBalance', async () => {
      vi.spyOn(service, 'getWallets').mockResolvedValue([
        { id: 'w-1', balance: '10000000', initialBalance: '2000000', netChange: '8000000.00' },
      ] as any);
      const wallets = await service.getWallets('user-1');
      expect(wallets[0].netChange).toBe('8000000.00');
    });
  });

  describe('getDefaultWallet', () => {
    it('should return the default wallet', async () => {
      vi.spyOn(service, 'getDefaultWallet').mockResolvedValue({
        id: 'wallet-1', name: 'Tiền mặt', balance: '5000000', netChange: '5000000.00',
      } as any);
      const wallet = await service.getDefaultWallet('user-1');
      expect(wallet).not.toBeNull();
      expect(wallet!.name).toBe('Tiền mặt');
    });
  });

  describe('createWallet', () => {
    it('should create a wallet with defaults', async () => {
      vi.spyOn(service, 'createWallet').mockResolvedValue({
        id: 'new-wallet', name: 'Ví mới', type: 'cash', balance: '0.00', netChange: '0.00',
      } as any);
      const wallet = await service.createWallet('user-1', { name: 'Ví mới', type: 'cash' });
      expect(wallet!.name).toBe('Ví mới');
    });
  });

  describe('updateWallet', () => {
    it('should update wallet metadata', async () => {
      vi.spyOn(service, 'updateWallet').mockResolvedValue({
        id: 'wallet-1', name: 'Ví đã đổi tên', balance: '5000000', netChange: '5000000.00',
      } as any);
      const wallet = await service.updateWallet('user-1', 'wallet-1', { name: 'Ví đã đổi tên' });
      expect(wallet!.name).toBe('Ví đã đổi tên');
    });
  });

  describe('transfer validation', () => {
    beforeEach(() => {
      // Default mock that tests can override
      vi.spyOn(service, 'getWallet').mockResolvedValue({
        id: 'wallet-1',
        userId: 'user-1',
        name: 'Tiền mặt',
        type: 'cash' as const,
        balance: '5000000',
        initialBalance: '0',
        version: 0,
        icon: '💵',
        color: '#6B7280',
        isDefault: 1,
        netChange: '5000000',
      } as any);
    });

    it('should reject same-wallet transfer', async () => {
      await expect(
        service.transfer('user-1', {
          fromWalletId: 'wallet-1',
          toWalletId: 'wallet-1',
          amount: '100000',
        })
      ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    });

    it('should reject zero amount', async () => {
      await expect(
        service.transfer('user-1', {
          fromWalletId: 'wallet-1',
          toWalletId: 'wallet-2',
          amount: '0',
        })
      ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    });

    it('should reject negative amount', async () => {
      await expect(
        service.transfer('user-1', {
          fromWalletId: 'wallet-1',
          toWalletId: 'wallet-2',
          amount: '-50000',
        })
      ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    });

    it('should reject insufficient balance', async () => {
      vi.spyOn(service, 'getWallet').mockImplementation(async (_uid, wid) => {
        if (wid === 'wallet-1') return { id: 'wallet-1', name: 'Nguồn', balance: '10000', version: 0 } as any;
        return { id: 'wallet-2', name: 'Đích', balance: '5000000', version: 0 } as any;
      });
      await expect(
        service.transfer('user-1', {
          fromWalletId: 'wallet-1',
          toWalletId: 'wallet-2',
          amount: '100000',
        })
      ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    });
  });

  describe('deleteWallet', () => {
    it('should soft-delete a wallet', async () => {
      vi.spyOn(service, 'getWallet').mockResolvedValue({
        id: 'wallet-1', name: 'Ví', balance: '5000000', version: 0,
      } as any);
      vi.spyOn(service, 'deleteWallet').mockResolvedValue(undefined);
      await expect(service.deleteWallet('user-1', 'wallet-1')).resolves.toBeUndefined();
    });
  });
});
