import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Decimal from 'decimal.js';
import { toast } from 'sonner';
import { 
  transactionsAPI, 
  goalsAPI, 
  billsAPI, 
  walletAPI, 
  analyticsAPI, 
  authAPI,
  categoriesAPI,
  LoginCredentials,
  RegisterData,
  CategorySpending,
  MonthlyTrend,
  Transaction,
  Bill,
  Category
} from '@finance/api-client';

import { 
  MOCK_TRANSACTIONS, 
  MOCK_BILLS, 
  MOCK_GOALS, 
  MOCK_CASH_WALLET,
  MOCK_CATEGORY_SPENDING,
  MOCK_MONTHLY_TREND,
  MOCK_USER
} from '../mock-data';

/**
 * Hook: Transactions List
 */
export function useTransactions(params?: { limit?: number; offset?: number; categoryId?: number; type?: string }) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: async () => {
      // const response = await transactionsAPI.list(params);
      // const txs = response.transactions || response;
      // return txs || [];
      await new Promise(r => setTimeout(r, 600));
      return MOCK_TRANSACTIONS;
    },
    retry: (failureCount, error: any) => {
      // Don't retry on unauthorized errors
      if (error?.status === 401) return false;
      return failureCount < 3;
    },
  });
}

/**
 * Hook: Quick Add Transaction
 */
export function useQuickAdd() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (text: string) => {
      // Generate idempotency key for this specific action
      const idempotencyKey = crypto.randomUUID();
      // return transactionsAPI.quickAdd(text, { idempotencyKey });
      await new Promise(r => setTimeout(r, 1000));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budgets', 'summary'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'cash'] });
    },
  });
}

/**
 * Hook: Categories List
 */
export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      // return categoriesAPI.list();
      return [
        { id: 1, name: 'Ăn uống', icon: '🍜', color: '#f87171', type: 'expense' },
        { id: 2, name: 'Thu nhập', icon: '💰', color: '#34d399', type: 'income' },
        { id: 3, name: 'Di chuyển', icon: '🚗', color: '#60a5fa', type: 'expense' },
        { id: 4, name: 'Tiền ích', icon: '⚡', color: '#fbbf24', type: 'expense' },
        { id: 5, name: 'Mua sắm', icon: '🛍️', color: '#f472b6', type: 'expense' },
      ] as Category[];
    },
  });
}

/**
 * Mutation: Create Transaction
 */
export function useCreateTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const idempotencyKey = crypto.randomUUID();
      // return transactionsAPI.create(data, idempotencyKey);
      await new Promise(r => setTimeout(r, 800));
      return { success: true };
    },
    // ⚡ OPTIMISTIC UI: Update cache immediately
    onMutate: async (newTx) => {
      // Cancel outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['transactions'] });

      // Snapshot the previous value
      const previousTransactions = queryClient.getQueryData(['transactions']);

      // Optimistically update to the new value
      queryClient.setQueryData(['transactions'], (old: any) => {
        const optimisticTx = {
          id: `temp-${Date.now()}`,
          ...newTx,
          amount: String(newTx.amount),
          createdAt: new Date().toISOString(),
          isOptimistic: true, // Tag for UI to show "pending" state
        };
        return Array.isArray(old) ? [optimisticTx, ...old] : [optimisticTx];
      });

      // Return a context object with the snapshotted value
      return { previousTransactions };
    },
    // 🛡️ ROLLBACK: If mutation fails, use the context returned from onMutate
    onError: (err: any, newTx, context) => {
      if (context?.previousTransactions) {
        queryClient.setQueryData(['transactions'], context.previousTransactions);
      }
      
      const correlationId = err.data?.error?.correlationId;
      toast.error(
        <div className="flex flex-col gap-1">
          <span className="font-semibold">Giao dịch thất bại</span>
          <span className="text-xs opacity-80">Mã tham chiếu: {correlationId || 'N/A'}</span>
        </div>
      );
    },
    // 🔄 SYNC: Always refetch after error or success to ensure server sync
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budgets', 'summary'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'cash'] });
    },
  });
}

/**
 * Mutation: Update Transaction
 */
export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      // return transactionsAPI.update(id, data);
      await new Promise(r => setTimeout(r, 800));
      return { success: true };
    },
    
    // ⚡ OPTIMISTIC UI
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['transactions'] });
      const previousTransactions = queryClient.getQueryData(['transactions']);

      queryClient.setQueryData(['transactions'], (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.map((tx: any) => 
          tx.id === id ? { ...tx, ...data, isOptimistic: true } : tx
        );
      });

      return { previousTransactions };
    },
    // 🛡️ ROLLBACK
    onError: (err: any, variables, context) => {
      if (context?.previousTransactions) {
        queryClient.setQueryData(['transactions'], context.previousTransactions);
      }
      const correlationId = err.data?.error?.correlationId;
      toast.error(
        <div className="flex flex-col gap-1">
          <span className="font-semibold">Cập nhật thất bại</span>
          <span className="text-xs opacity-80">Mã tham chiếu: {correlationId || 'N/A'}</span>
        </div>
      );
    },
    // 🔄 SYNC
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budgets', 'summary'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'cash'] });
    },
  });
}

/**
 * Mutation: Delete Transaction
 */
export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // return transactionsAPI.delete(id);
      await new Promise(r => setTimeout(r, 500));
      return { success: true };
    },
    
    // ⚡ OPTIMISTIC UI
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['transactions'] });
      const previousTransactions = queryClient.getQueryData(['transactions']);

      queryClient.setQueryData(['transactions'], (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.filter((tx: any) => tx.id !== id);
      });

      return { previousTransactions };
    },
    // 🛡️ ROLLBACK
    onError: (err: any, id, context) => {
      if (context?.previousTransactions) {
        queryClient.setQueryData(['transactions'], context.previousTransactions);
      }
      const correlationId = err.data?.error?.correlationId;
      toast.error(
        <div className="flex flex-col gap-1">
          <span className="font-semibold">Xóa thất bại</span>
          <span className="text-xs opacity-80">Mã tham chiếu: {correlationId || 'N/A'}</span>
        </div>
      );
    },
    // 🔄 SYNC
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budgets', 'summary'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'cash'] });
    },
  });
}

/**
 * Hook: Goals List
 */
export function useGoals() {
  return useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      // return goalsAPI.list();
      await new Promise(r => setTimeout(r, 700));
      return MOCK_GOALS;
    },
  });
}

/**
 * Mutation: Create Goal
 */
export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const idempotencyKey = crypto.randomUUID();
      // return goalsAPI.create(data, idempotencyKey);
      await new Promise(r => setTimeout(r, 800));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}

/**
 * Mutation: Update Goal
 */
export function useUpdateGoal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      // return goalsAPI.update(id, data);
      await new Promise(r => setTimeout(r, 800));
      return { success: true };
    },
    
    // ⚡ OPTIMISTIC UI
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['goals'] });
      const previousGoals = queryClient.getQueryData(['goals']);

      queryClient.setQueryData(['goals'], (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.map((goal: any) => 
          goal.id === id ? { ...goal, ...data, isOptimistic: true } : goal
        );
      });

      return { previousGoals };
    },
    // 🛡️ ROLLBACK
    onError: (err: any, variables, context) => {
      if (context?.previousGoals) {
        queryClient.setQueryData(['goals'], context.previousGoals);
      }
      const correlationId = err.data?.error?.correlationId;
      toast.error(
        <div className="flex flex-col gap-1">
          <span className="font-semibold">Cập nhật mục tiêu thất bại</span>
          <span className="text-xs opacity-80">Mã tham chiếu: {correlationId || 'N/A'}</span>
        </div>
      );
    },
    // 🔄 SYNC
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}

/**
 * Mutation: Delete Goal
 */
export function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // return goalsAPI.delete(id);
      await new Promise(r => setTimeout(r, 500));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}

/**
 * Mutation: Contribute to Goal
 */
export function useContributeGoal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: string | number }) => {
      const idempotencyKey = crypto.randomUUID();
      // return goalsAPI.contribute(id, amount, idempotencyKey);
      await new Promise(r => setTimeout(r, 800));
      return { success: true };
    },
    // ⚡ OPTIMISTIC UI
    onMutate: async ({ id, amount }) => {
      await queryClient.cancelQueries({ queryKey: ['goals'] });
      const previousGoals = queryClient.getQueryData(['goals']);

      queryClient.setQueryData(['goals'], (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.map((goal: any) => {
          if (goal.id === id) {
            const current = new Decimal(goal.currentAmount || '0');
            const contribution = new Decimal(amount);
            return { 
              ...goal, 
              currentAmount: current.plus(contribution).toString(),
              isOptimistic: true 
            };
          }
          return goal;
        });
      });

      return { previousGoals };
    },
    // 🛡️ ROLLBACK
    onError: (err: any, variables, context) => {
      if (context?.previousGoals) {
        queryClient.setQueryData(['goals'], context.previousGoals);
      }
      const correlationId = err.data?.error?.correlationId;
      toast.error(
        <div className="flex flex-col gap-1">
          <span className="font-semibold">Đóng góp thất bại</span>
          <span className="text-xs opacity-80">Mã tham chiếu: {correlationId || 'N/A'}</span>
        </div>
      );
    },
    // 🔄 SYNC
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['budgets', 'summary'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'cash'] });
    },
  });
}

/**
 * Hook: Bills List
 */
export function useBills() {
  return useQuery({
    queryKey: ['bills'],
    queryFn: async () => {
      // const data = await billsAPI.list();
      // return data || [];
      await new Promise(r => setTimeout(r, 500));
      return MOCK_BILLS;
    },
  });
}

/**
 * Mutation: Create Bill
 */
export function useCreateBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const idempotencyKey = crypto.randomUUID();
      // return billsAPI.create(data, idempotencyKey);
      await new Promise(r => setTimeout(r, 800));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    },
  });
}

/**
 * Mutation: Pay Bill
 */
export function usePayBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { amount: string | number; paymentDate: string; note?: string } }) => {
      const idempotencyKey = crypto.randomUUID();
      // return billsAPI.pay(id, data, idempotencyKey);
      await new Promise(r => setTimeout(r, 800));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['budgets', 'summary'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'cash'] });
    },
  });
}

/**
 * Hook: Cash Wallet
 */
export function useCashWallet() {
  return useQuery({
    queryKey: ['wallet', 'cash'],
    queryFn: async () => {
      // return walletAPI.getCash();
      await new Promise(r => setTimeout(r, 400));
      return MOCK_CASH_WALLET;
    },
    retry: (failureCount, error: any) => {
      if (error?.status === 401) return false;
      return failureCount < 3;
    },
  });
}

/**
 * Mutation: Update Cash Wallet
 */
export function useUpdateCashWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ newBalance, note }: { newBalance: string; note?: string }) => {
      const idempotencyKey = crypto.randomUUID();
      // return walletAPI.updateCash(newBalance, note, idempotencyKey);
      await new Promise(r => setTimeout(r, 800));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet', 'cash'] });
      queryClient.invalidateQueries({ queryKey: ['budgets', 'summary'] });
    },
  });
}

/**
 * Hook: Category Spending Analytics
 */
export function useCategorySpending(month?: string) {
  return useQuery<CategorySpending[]>({
    queryKey: ['analytics', 'categories', month],
    queryFn: async () => {
      // const data = await analyticsAPI.categorySpending(month);
      // return data || [];
      await new Promise(r => setTimeout(r, 900));
      return MOCK_CATEGORY_SPENDING;
    },
  });
}

/**
 * Hook: Monthly Trends
 */
export function useMonthlyTrend(months: number = 6) {
  return useQuery<MonthlyTrend[]>({
    queryKey: ['analytics', 'trends', months],
    queryFn: async () => {
      // const data = await analyticsAPI.monthlyTrend(months);
      // return data || [];
      await new Promise(r => setTimeout(r, 1000));
      return MOCK_MONTHLY_TREND;
    },
  });
}

/**
 * Hook: Current User Profile
 */
export function useUser() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      // return authAPI.me();
      return MOCK_USER;
    },
  });
}

/**
 * Mutation: Login
 */
export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => {
      return authAPI.login(credentials);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

/**
 * Mutation: Register
 */
export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterData) => {
      return authAPI.register(data);
    },
  });
}

