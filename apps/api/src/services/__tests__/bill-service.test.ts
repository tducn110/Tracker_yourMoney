import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BillService } from '../bill-service';
import type { TransactionRepository } from '@finance/db/src/repositories/transaction.repo';
import type { BillRepository } from '@finance/db/src/repositories/bill.repo';

// Mock @finance/db for db.transaction()
vi.mock('@finance/db', () => {
  const mockDb = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockImplementation(() => Promise.resolve([{ id: 'wallet-1', balance: '10000000', version: 1 }])),
    transaction: vi.fn((fn: any) => {
      const txMock = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockImplementation(() => Promise.resolve([{ id: 'tx-1' }])),
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        limit: vi.fn().mockImplementation(() => Promise.resolve([{ id: 'wallet-1', balance: '10000000', version: 1 }])),
        where: vi.fn(),
      };
      txMock.where.mockImplementation(() => {
        const p = Promise.resolve({ rowCount: 1 });
        (p as any).limit = txMock.limit;
        return p;
      });
      return fn(txMock);
    }),
  };
  return {
    db: mockDb,
    wallets: { id: 'wallets' },
    walletLogs: { id: 'walletLogs' },
    transactions: { id: 'transactions' },
    and: vi.fn(),
    eq: vi.fn(),
    sql: vi.fn(),
  };
});

describe('BillService', () => {
  let service: BillService;
  let mockBillRepo: BillRepository;
  let mockTxRepo: TransactionRepository;

  beforeEach(() => {
    mockBillRepo = {
      findAll: vi.fn().mockResolvedValue([]),
      findActive: vi.fn().mockResolvedValue([]),
      findById: vi.fn().mockResolvedValue({
        id: 'bill-1',
        userId: 'user-1',
        name: 'Điện',
        amount: '500000',
        categoryId: 2,
        isActive: 1,
      }),
      findByIdempotencyKey: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findPayments: vi.fn(),
      sumPayments: vi.fn().mockResolvedValue('0'),
      createPayment: vi.fn().mockResolvedValue({
        id: 'payment-1',
        billId: 'bill-1',
        userId: 'user-1',
        amountPaid: '500000',
        periodMonth: '2026-05',
      }),
      findPaymentByIdempotencyKey: vi.fn(),
    } as any;

    mockTxRepo = {
      create: vi.fn().mockResolvedValue({ id: 'tx-1' }),
    } as any;

    service = new BillService(mockBillRepo, mockTxRepo);
  });

  describe('getBillPaymentStatus', () => {
    it('should return "pending" when no payments made', async () => {
      const result = await service.getBillPaymentStatus('user-1', 'bill-1', '2026-05');
      expect(result.status).toBe('pending');
      expect(result.totalPaid).toBe('0.00');
    });

    it('should return "partial" when partially paid', async () => {
      (mockBillRepo.sumPayments as any).mockResolvedValue('200000');
      const result = await service.getBillPaymentStatus('user-1', 'bill-1', '2026-05');
      expect(result.status).toBe('partial');
    });

    it('should return "paid" when fully paid', async () => {
      (mockBillRepo.sumPayments as any).mockResolvedValue('500000');
      const result = await service.getBillPaymentStatus('user-1', 'bill-1', '2026-05');
      expect(result.status).toBe('paid');
    });

    it('should return "paid" when overpaid', async () => {
      (mockBillRepo.sumPayments as any).mockResolvedValue('600000');
      const result = await service.getBillPaymentStatus('user-1', 'bill-1', '2026-05');
      expect(result.status).toBe('paid');
    });

    it('should throw NOT_FOUND for missing bill', async () => {
      (mockBillRepo.findById as any).mockResolvedValue(undefined);
      await expect(
        service.getBillPaymentStatus('user-1', 'nonexistent', '2026-05')
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });
  });

  describe('payBill', () => {
    const payInput = {
      billId: 'bill-1',
      walletId: 'wallet-1',
      periodMonth: '2026-05',
      amountPaid: '500000',
      idempotencyKey: 'idem-123',
    };

    it('should throw NOT_FOUND for missing bill', async () => {
      (mockBillRepo.findById as any).mockResolvedValue(undefined);
      await expect(
        service.payBill('user-1', payInput)
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('should throw ALREADY_PAID when bill period is fully paid', async () => {
      (mockBillRepo.sumPayments as any).mockResolvedValue('500000');
      await expect(
        service.payBill('user-1', payInput)
      ).rejects.toMatchObject({ code: 'ALREADY_PAID' });
    });

    it('should create payment and transaction on success', async () => {
      const result = await service.payBill('user-1', payInput);
      expect(result).toBeDefined();
      expect(result.id).toBe('payment-1');
    });
  });

  describe('createBill', () => {
    it('should create a bill', async () => {
      (mockBillRepo.create as any).mockResolvedValue({
        id: 'new-bill',
        name: 'Internet',
        amount: '300000',
      });
      const bill = await service.createBill('user-1', {
        name: 'Internet',
        amount: '300000',
        categoryId: 3,
        isActive: 1,
        period: 'monthly',
        dueDay: 15,
      } as any);
      expect(bill.name).toBe('Internet');
    });
  });
});
