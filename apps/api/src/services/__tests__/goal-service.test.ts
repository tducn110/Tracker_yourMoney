import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GoalService } from '../goal-service';
import type { TransactionRepository } from '@finance/db/src/repositories/transaction.repo';
import type { CategoryRepository } from '@finance/db/src/repositories/category-repository';

// Mock @finance/db for db.transaction() and notifications
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
    notifications: { id: 'notifications' },
    wallets: { id: 'wallets' },
    walletLogs: { id: 'walletLogs' },
    transactions: { id: 'transactions' },
    and: vi.fn(),
    eq: vi.fn(),
    sql: vi.fn(),
    SYSTEM_CATEGORY_NAMES: {
      SAVINGS: "Tiết Kiệm",
      INCOME: "Thu Nhập",
      FOOD: "Ăn Uống",
      BILLS: "Hóa Đơn",
    },
    SAVINGS_CATEGORY_DEFAULTS: {
      name: "Tiết Kiệm",
      type: "both",
      icon: "🎯",
      color: "#10B981",
      isDefault: false,
      sortOrder: 99,
    },
  };
});

describe('GoalService', () => {
  let service: GoalService;
  let mockGoalRepo: any;
  let mockTxRepo: TransactionRepository;
  let mockCatRepo: CategoryRepository;

  const mockGoal = {
    id: 'goal-1',
    userId: 'user-1',
    name: 'Du lịch Đà Lạt',
    icon: '✈️',
    targetAmount: '10000000',
    currentSaved: '3000000',
    monthlyContribution: '1000000',
    status: 'active',
    deadline: '2026-12-31',
    priority: 2,
  };

  beforeEach(() => {
    mockGoalRepo = {
      findAll: vi.fn().mockResolvedValue([mockGoal]),
      findActive: vi.fn().mockResolvedValue([mockGoal]),
      findById: vi.fn().mockResolvedValue(mockGoal),
      findByIdempotencyKey: vi.fn(),
      create: vi.fn().mockResolvedValue({ ...mockGoal, id: 'new-goal' }),
      update: vi.fn().mockResolvedValue({ ...mockGoal, currentSaved: '5000000' }),
      delete: vi.fn(),
    };

    mockTxRepo = {
      create: vi.fn().mockResolvedValue({ id: 'tx-1' }),
    } as any;

    mockCatRepo = {
      findByName: vi.fn().mockResolvedValue({ id: 5, name: 'Tiết Kiệm' }),
    } as any;

    service = new GoalService(mockGoalRepo, mockTxRepo, mockCatRepo);
  });

  describe('getActiveGoals', () => {
    it('should return active goals', async () => {
      const goals = await service.getActiveGoals('user-1');
      expect(goals).toHaveLength(1);
      expect(goals[0].status).toBe('active');
    });
  });

  describe('createGoal', () => {
    it('should create a goal with status active', async () => {
      const goal = await service.createGoal('user-1', {
        name: 'Xe máy mới',
        targetAmount: '50000000',
        priority: 1,
        monthlyContribution: '2000000',
        icon: '🏍️',
        idempotencyKey: 'idem-1',
      } as any);
      expect(goal.name).toBe('Du lịch Đà Lạt');
    });
  });

  describe('contributeToGoal', () => {
    it('should throw NOT_FOUND for missing goal', async () => {
      mockGoalRepo.findById.mockResolvedValue(undefined);
      await expect(
        service.contributeToGoal('user-1', 'nonexistent', {
          walletId: 'wallet-1',
          amount: '1000000',
        })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('should reject contribution to completed goal', async () => {
      mockGoalRepo.findById.mockResolvedValue({ ...mockGoal, status: 'completed' });
      await expect(
        service.contributeToGoal('user-1', 'goal-1', {
          walletId: 'wallet-1',
          amount: '1000000',
        })
      ).rejects.toMatchObject({ code: 'GOAL_INACTIVE' });
    });

    it('should reject contribution to cancelled goal', async () => {
      mockGoalRepo.findById.mockResolvedValue({ ...mockGoal, status: 'cancelled' });
      await expect(
        service.contributeToGoal('user-1', 'goal-1', {
          walletId: 'wallet-1',
          amount: '500000',
        })
      ).rejects.toMatchObject({ code: 'GOAL_INACTIVE' });
    });

    it('should contribute and update currentSaved', async () => {
      const result = await service.contributeToGoal('user-1', 'goal-1', {
        walletId: 'wallet-1',
        amount: '2000000',
        idempotencyKey: 'idem-2',
      });
      expect(result).toBeDefined();
      expect(result.currentSaved).toBe('5000000');
    });
  });

  describe('updateGoal', () => {
    it('should update a goal', async () => {
      mockGoalRepo.update.mockResolvedValue({ ...mockGoal, name: 'Du lịch Nha Trang' });
      const result = await service.updateGoal('user-1', 'goal-1', { name: 'Du lịch Nha Trang' });
      expect(result.name).toBe('Du lịch Nha Trang');
    });

    it('should throw NOT_FOUND for missing goal', async () => {
      mockGoalRepo.findById.mockResolvedValue(undefined);
      await expect(
        service.updateGoal('user-1', 'nonexistent', { name: 'Test' })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });
  });
});
