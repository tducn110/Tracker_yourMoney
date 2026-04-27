import { db } from "@finance/db";
import { 
  TransactionRepository, 
  AnalyticsRepository, 
  CategoryRepository,
  BillRepository,
  GoalRepository
} from "@finance/db/src/repositories";
import { getCache, type ICache } from "@finance/cache";
import { CategoryService } from "./category-service";
import { TransactionService } from "./transaction-service";
import { RegexNLPAdapter } from "./adapters/nlp-adapter";
import { BudgetService } from "./budget-service";
import { AIService } from "./ai-service";
import { WalletService } from "./wallet-service";
import { AnalyticsService } from "./analytics-service";
import { BillService } from "./bill-service";
import { GoalService } from "./goal-service";

/**
 * Enterprise Service Container
 * Supports dynamic re-initialization for "Transaction-per-Test" isolation.
 * Standard Path: Uses DI and avoids global state pollution.
 */
export class Container {
  private _categoryRepo!: CategoryRepository;
  private _transactionRepo!: TransactionRepository;
  private _analyticsRepo!: AnalyticsRepository;
  private _billRepo!: BillRepository;
  private _goalRepo!: GoalRepository;
  private _cache!: ICache;
  private _nlpAdapter!: RegexNLPAdapter;
  private _categoryService!: CategoryService;
  private _transactionService!: TransactionService;
  private _budgetService!: BudgetService;
  private _aiService!: AIService;
  private _walletService!: WalletService;
  private _analyticsService!: AnalyticsService;
  private _billService!: BillService;
  private _goalService!: GoalService;

  constructor() {
    this.initialize(db);
  }

  public initialize(dbInstance: any) {
    this._categoryRepo = new CategoryRepository(dbInstance);
    this._transactionRepo = new TransactionRepository(dbInstance);
    this._analyticsRepo = new AnalyticsRepository(dbInstance);
    this._billRepo = new BillRepository(dbInstance);
    this._goalRepo = new GoalRepository(dbInstance);
    this._cache = getCache();
    this._nlpAdapter = new RegexNLPAdapter();

    this._categoryService = new CategoryService(this._categoryRepo);
    this._transactionService = new TransactionService(
      this._transactionRepo,
      this._categoryRepo,
      this._nlpAdapter,
      this._cache
    );
    this._budgetService = new BudgetService();
    this._aiService = new AIService(this._nlpAdapter);
    this._walletService = new WalletService(this._categoryRepo);
    this._analyticsService = new AnalyticsService();
    this._billService = new BillService(this._billRepo, this._transactionRepo);
    this._goalService = new GoalService(this._goalRepo, this._transactionRepo, this._categoryRepo);
  }

  get categoryService() { return this._categoryService; }
  get transactionService() { return this._transactionService; }
  get budgetService() { return this._budgetService; }
  get aiService() { return this._aiService; }
  get walletService() { return this._walletService; }
  get analyticsService() { return this._analyticsService; }
  get billService() { return this._billService; }
  get goalService() { return this._goalService; }
  get cache() { return this._cache; }
  
  // Repositories
  get transactionRepo() { return this._transactionRepo; }
  get analyticsRepo() { return this._analyticsRepo; }
  get categoryRepo() { return this._categoryRepo; }
  get billRepo() { return this._billRepo; }
  get goalRepo() { return this._goalRepo; }
}

export const container = new Container();

/**
 * Dynamic Service Proxy
 * Allows routes to use 'service' imports while still benefiting from 
 * runtime re-initialization (e.g. during integration tests).
 */
function createServiceProxy<T extends object>(getService: () => T): T {
  return new Proxy({} as T, {
    get: (_, prop) => {
      const service = getService();
      const val = (service as any)[prop];
      if (typeof val === 'function') {
        return val.bind(service);
      }
      return val;
    }
  });
}

export const categoryService = createServiceProxy(() => container.categoryService);
export const transactionService = createServiceProxy(() => container.transactionService);
export const budgetService = createServiceProxy(() => container.budgetService);
export const aiService = createServiceProxy(() => container.aiService);
export const walletService = createServiceProxy(() => container.walletService);
export const analyticsService = createServiceProxy(() => container.analyticsService);
export const billService = createServiceProxy(() => container.billService);
export const goalService = createServiceProxy(() => container.goalService);
export const cache = createServiceProxy(() => container.cache);

// Export repositories too
export const transactionRepo = createServiceProxy(() => container.transactionRepo);
export const analyticsRepo = createServiceProxy(() => container.analyticsRepo);
export const categoryRepo = createServiceProxy(() => container.categoryRepo);
export const billRepo = createServiceProxy(() => container.billRepo);
export const goalRepo = createServiceProxy(() => container.goalRepo);

