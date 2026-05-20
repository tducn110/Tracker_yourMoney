import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as Sentry from '@sentry/nextjs';
import { 
  transactionsAPI,
  goalsAPI,
  billsAPI,
  walletAPI,
  analyticsAPI,
  authAPI,
  userAPI,
  notificationAPI,
  categoriesAPI,
  LoginCredentials,
  RegisterData,
  CategorySpending,
  MonthlyTrend,
  DailySummary,
  Category
} from '@finance/api-client';

/**
 * Hook: Transactions List
 */
export function useTransactions(params?: { limit?: number; offset?: number; categoryId?: number; type?: string; search?: string; month?: string }) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: async () => {
      const data = await transactionsAPI.list(params);
      return data;
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
    retry: (failureCount, error: any) => {
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
    mutationFn: async ({ text, walletId }: { text: string; walletId: string }) => {
      const idempotencyKey = crypto.randomUUID();
      return transactionsAPI.quickAdd(text, { walletId, idempotencyKey });
    },
    onSuccess: (result: any) => {
      if (result.type === 'transaction') {
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        queryClient.refetchQueries({ queryKey: ['transactions'] });
        queryClient.invalidateQueries({ queryKey: ['budgets', 'summary'] });
        queryClient.refetchQueries({ queryKey: ['budgets', 'summary'] });
        queryClient.invalidateQueries({ queryKey: ['analytics'] });
        queryClient.refetchQueries({ queryKey: ['analytics'] });
        queryClient.invalidateQueries({ queryKey: ['wallet', 'cash'] });
        queryClient.refetchQueries({ queryKey: ['wallet', 'cash'] });
        queryClient.invalidateQueries({ queryKey: ['wallets'] });
        queryClient.refetchQueries({ queryKey: ['wallets'] });
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
      } else if (result.type === 'wallet') {
        queryClient.invalidateQueries({ queryKey: ['wallets'] });
        queryClient.refetchQueries({ queryKey: ['wallets'] });
        queryClient.invalidateQueries({ queryKey: ['wallet', 'cash'] });
        queryClient.refetchQueries({ queryKey: ['wallet', 'cash'] });
      } else if (result.type === 'category') {
        queryClient.invalidateQueries({ queryKey: ['categories'] });
        queryClient.refetchQueries({ queryKey: ['categories'] });
      }
      
      if (result.message) {
        toast.success(result.message);
      }
    },
    onError: (err: any) => {
      Sentry.captureException(err, { tags: { feature: 'quick_add' } });
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
      return categoriesAPI.list();
    },
    staleTime: 0,
    refetchOnMount: true,
  });
}

/**
 * Mutation: Create Category
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; type: string; icon?: string; color?: string; sortOrder?: number }) => {
      return categoriesAPI.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || 'Không thể tạo danh mục');
    },
  });
}

/**
 * Mutation: Update Category
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { name?: string; type?: string; icon?: string; color?: string; sortOrder?: number } }) => {
      return categoriesAPI.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || 'Không thể cập nhật danh mục');
    },
  });
}

/**
 * Mutation: Delete Category
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      return categoriesAPI.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || 'Không thể xoá danh mục');
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
      return transactionsAPI.create(data, idempotencyKey);
    },
    onError: (err: any) => {
      const correlationId = err.data?.error?.correlationId ?? err?.response?.data?.error?.correlationId;
      Sentry.captureException(err, {
        tags: { feature: 'transaction_create', correlationId: correlationId || 'N/A' },
      });
    },
    // 🔄 SYNC: Always refetch after error or success to ensure server sync
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.refetchQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budgets', 'summary'] });
      queryClient.refetchQueries({ queryKey: ['budgets', 'summary'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.refetchQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'cash'] });
      queryClient.refetchQueries({ queryKey: ['wallet', 'cash'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.refetchQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
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
      return transactionsAPI.update(id, data);
    },
    onError: (err: any) => {
      const correlationId = err.data?.error?.correlationId;
      toast.error(
        <div className="flex flex-col gap-1">
          <span className="font-semibold">Cập nhật thất bại</span>
          <span className="text-xs opacity-80">Mã tham chiếu: {correlationId || 'N/A'}</span>
        </div>
      );
    },
    // 🔄 SYNC: Always refetch after error or success to ensure server sync
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.refetchQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budgets', 'summary'] });
      queryClient.refetchQueries({ queryKey: ['budgets', 'summary'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'cash'] });
      queryClient.refetchQueries({ queryKey: ['wallet', 'cash'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.refetchQueries({ queryKey: ['wallets'] });
    },
  });
}

/**
 * Note: Transactions are immutable ledger entries.
 * Deletion has been intentionally removed. To reverse a transaction,
 * create a reversal (opposite type) instead.
 */

/**
 * Hook: Goals List
 */
export function useGoals() {
  return useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      return goalsAPI.list();
    },
    staleTime: 5 * 60 * 1000,
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
      return goalsAPI.create(data, idempotencyKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budgets', 'summary'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || 'Không thể tạo mục tiêu');
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
      return goalsAPI.update(id, data);
    },
    onError: (err: any) => {
      const apiMessage = err?.message || err?.response?.data?.error?.message || '';
      toast.error(
        <div className="flex flex-col gap-1">
          <span className="font-semibold">Cập nhật mục tiêu thất bại</span>
          <span className="text-xs opacity-80">{apiMessage || 'Có lỗi xảy ra, vui lòng thử lại'}</span>
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
      return goalsAPI.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || 'Không thể xoá mục tiêu');
    },
  });
}

/**
 * Mutation: Contribute to Goal
 */
export function useContributeGoal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { walletId: string; amount: string | number } }) => {
      const idempotencyKey = crypto.randomUUID();
      return goalsAPI.contribute(id, data, idempotencyKey);
    },
    onError: (err: any) => {
      const apiMessage = err?.message || err?.response?.data?.error?.message || '';
      toast.error(
        <div className="flex flex-col gap-1">
          <span className="font-semibold">Đóng góp thất bại</span>
          <span className="text-xs opacity-80">{apiMessage || 'Có lỗi xảy ra, vui lòng thử lại'}</span>
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
      return billsAPI.list();
    },
    staleTime: 5 * 60 * 1000,
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
      return billsAPI.create(data, idempotencyKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || 'Không thể tạo hoá đơn');
    },
  });
}

/**
 * Mutation: Pay Bill
 */
export function usePayBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { walletId: string; amount: string | number; paymentDate: string; note?: string } }) => {
      const idempotencyKey = crypto.randomUUID();
      return billsAPI.pay(id, data, idempotencyKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.refetchQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budgets', 'summary'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'cash'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || 'Không thể thanh toán hoá đơn');
    },
  });
}

/**
 * Hook: Cash Wallet
 */
export function useWallets() {
  return useQuery<any[]>({
    queryKey: ['wallets'],
    queryFn: async () => {
      return walletAPI.list();
    },
    staleTime: 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.status === 401) return false;
      return failureCount < 2;
    },
  });
}

export function useCashWallet() {
  return useQuery({
    queryKey: ['wallet', 'cash'],
    queryFn: async () => {
      return walletAPI.getCash();
    },
    staleTime: 5 * 60 * 1000,
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
      return walletAPI.updateCash(newBalance, note, idempotencyKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet', 'cash'] });
      queryClient.refetchQueries({ queryKey: ['wallet', 'cash'] });
      queryClient.invalidateQueries({ queryKey: ['budgets', 'summary'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.refetchQueries({ queryKey: ['transactions'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || 'Không thể cập nhật số dư');
    },
  });
}

/**
 * Hook: Category Spending Analytics
 */
export function useCategorySpending(month?: string, date?: string) {
  return useQuery<CategorySpending[]>({
    queryKey: ['analytics', 'categories', month, date],
    queryFn: async () => {
      return analyticsAPI.categorySpending(month, date);
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useDailySummary(date?: string) {
  return useQuery<DailySummary>({
    queryKey: ['analytics', 'daily-summary', date],
    queryFn: async () => {
      return analyticsAPI.dailySummary(date);
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook: Monthly Trends
 */
export function useMonthlyTrend(months: number = 6, endMonth?: string) {
  return useQuery<MonthlyTrend[]>({
    queryKey: ['analytics', 'trends', months, endMonth],
    queryFn: async () => {
      return analyticsAPI.monthlyTrend(months, endMonth);
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook: Current User Profile
 */
export function useUser() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      return authAPI.me();
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook: User Settings
 */
export function useUserSettings() {
  return useQuery({
    queryKey: ['user', 'settings'],
    queryFn: async () => {
      return userAPI.settings();
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Mutation: Update User Settings
 */
export function useUpdateUserSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => userAPI.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'settings'] });
      toast.success('Đã lưu cài đặt');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Không thể lưu cài đặt');
    },
  });
}

/**
 * Hook: Notifications
 */
export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => notificationAPI.list(),
    staleTime: 30 * 1000,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: async () => {
      const res = await notificationAPI.unreadCount();
      return res.count;
    },
    refetchInterval: 60 * 1000,
    staleTime: 30 * 1000,
  });
}

export function useMarkRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationAPI.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationAPI.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
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
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || 'Đăng nhập thất bại');
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
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || 'Đăng ký thất bại');
    },
  });
}
