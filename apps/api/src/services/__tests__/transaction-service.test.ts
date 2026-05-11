import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransactionService } from '../transaction-service';
import type { ICache } from '@finance/cache';

describe('TransactionService (DI Skeleton Test)', () => {
  let service: TransactionService;
  let mockTransactionRepo: any;
  let mockCategoryRepo: any;
  let mockNLPAdapter: any;
  let mockCache: ICache;
  let mockAiService: any;

  beforeEach(() => {
    // 1. Create Mocks for all dependencies
    mockTransactionRepo = {
      findAll: vi.fn(),
      create: vi.fn(),
      findById: vi.fn(),
    };
    mockCategoryRepo = {
      findAll: vi.fn(),
    };
    mockNLPAdapter = {
      parse: vi.fn(),
    };
    mockAiService = {
      resolveOrCreateCategory: vi.fn().mockResolvedValue(1),
      resolveOrCreateWallet: vi.fn().mockResolvedValue("1"),
    };
    
    // 2. Mock the new ICache dependency (Null Object Pattern)
    mockCache = {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    };

    // 3. Inject mocks into the constructor
    service = new TransactionService(
      mockTransactionRepo,
      mockCategoryRepo,
      mockNLPAdapter,
      mockCache,
      mockAiService
    );
  });

  it('should be initialized with the new ICache dependency', () => {
    expect(service).toBeDefined();
    // Verify internal private property if necessary, otherwise just check successful instantiation
  });

  it('should call repository.findAll when getting all transactions', async () => {
    const userId = "1";
    mockTransactionRepo.findAll.mockResolvedValue([]);
    
    const result = await service.getAllTransactions(userId);
    
    expect(mockTransactionRepo.findAll).toHaveBeenCalledWith(userId);
    expect(result).toEqual([]);
  });

  it('should have a functional cache mock', async () => {
    const result = await mockCache.get('any-key');
    expect(result).toBeNull();
    expect(mockCache.get).toHaveBeenCalledWith('any-key');
  });
});
