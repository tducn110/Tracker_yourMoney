import { apiClient } from './client';
import type { 
  User, 
  Transaction, 
  Category, 
  Goal, 
  Bill, 
  Budget,
  BudgetSummary,
  BudgetDetail,
  CategorySpending, 
  MonthlyTrend,
  LoginCredentials,
  RegisterData,
  AuthResponse
} from './types';

/**
 * @finance/api-client - API Endpoints
 * 
 * Note: These methods return the data directly (transformed to camelCase) 
 * due to the axios interceptor in client.ts. We cast to unknown as Promise<T>
 * to maintain strict type safety.
 */

export const authAPI = {
  login: (credentials: LoginCredentials) =>
    apiClient.post<AuthResponse>('/api/auth/login', credentials) as unknown as Promise<AuthResponse>,
  register: (data: RegisterData) =>
    apiClient.post<{ success: boolean }>('/api/auth/register', data) as unknown as Promise<{ success: boolean }>,
  logout: () =>
    apiClient.post('/api/auth/logout') as unknown as Promise<void>,
  me: () =>
    apiClient.get<User>('/api/auth/me') as unknown as Promise<User>,
};

export const userAPI = {
  settings: () => apiClient.get('/api/v1/user/settings') as unknown as Promise<any>,
  updateSettings: (data: Record<string, unknown>) =>
    apiClient.put('/api/v1/user/settings', data) as unknown as Promise<any>,
};

export const budgetAPI = {
  list: () => apiClient.get<Budget[]>('/api/v1/budgets') as unknown as Promise<Budget[]>,
  summary: () => apiClient.get<BudgetSummary>('/api/v1/budgets/summary') as unknown as Promise<BudgetSummary>,
  getDetail: (id: string) => apiClient.get<BudgetDetail>(`/api/v1/budgets/${id}`) as unknown as Promise<BudgetDetail>,
  create: (data: any) => apiClient.post<BudgetDetail>('/api/v1/budgets', data) as unknown as Promise<BudgetDetail>,
  update: (id: string, data: any) => apiClient.put<BudgetDetail>(`/api/v1/budgets/${id}`, data) as unknown as Promise<BudgetDetail>,
  delete: (id: string) => apiClient.delete(`/api/v1/budgets/${id}`) as unknown as Promise<void>,
};

export const transactionsAPI = {
  list: (params?: any) => 
    apiClient.get<{ transactions: Transaction[]; total: number; pages: number }>('/api/v1/transactions', { params }) as unknown as Promise<{ transactions: Transaction[]; total: number; pages: number }>,
  create: (data: Partial<Transaction>, idempotencyKey?: string) => 
    apiClient.post<Transaction>('/api/v1/transactions', data, { 
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {} 
    }) as unknown as Promise<Transaction>,
  quickAdd: (text: string, options?: { walletId: string; categoryId?: number; idempotencyKey?: string }) =>
    apiClient.post<Transaction>('/api/v1/transactions/quick',
      { text, walletId: options?.walletId, categoryId: options?.categoryId },
      { headers: options?.idempotencyKey ? { 'Idempotency-Key': options.idempotencyKey } : {} }
    ) as unknown as Promise<Transaction>,
  update: (id: string, data: Partial<Transaction>) =>
    apiClient.put<Transaction>(`/api/v1/transactions/${id}`, data) as unknown as Promise<Transaction>,
};

export const goalsAPI = {
  list: () => apiClient.get<Goal[]>('/api/v1/goals') as unknown as Promise<Goal[]>,
  create: (data: Partial<Goal>, idempotencyKey?: string) => 
    apiClient.post<Goal>('/api/v1/goals', data, {
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}
    }) as unknown as Promise<Goal>,
  update: (id: string, data: Partial<Goal>) => apiClient.put<Goal>(`/api/v1/goals/${id}`, data) as unknown as Promise<Goal>,
  delete: (id: string) => apiClient.delete(`/api/v1/goals/${id}`) as unknown as Promise<void>,
  contribute: (id: string, data: { walletId: string; amount: string | number }, idempotencyKey?: string) =>
    apiClient.post<Goal>(`/api/v1/goals/${id}/contribute`, data, {
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}
    }) as unknown as Promise<Goal>,
};

export const billsAPI = {
  list: () => apiClient.get<Bill[]>('/api/v1/bills') as unknown as Promise<Bill[]>,
  create: (data: Partial<Bill>, idempotencyKey?: string) => 
    apiClient.post<Bill>('/api/v1/bills', data, {
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}
    }) as unknown as Promise<Bill>,
  update: (id: string, data: Partial<Bill>) => apiClient.put<Bill>(`/api/v1/bills/${id}`, data) as unknown as Promise<Bill>,
  delete: (id: string) => apiClient.delete(`/api/v1/bills/${id}`) as unknown as Promise<void>,
  pay: (id: string, data: { walletId: string; amount: string | number; paymentDate: string; note?: string }, idempotencyKey?: string) =>
    apiClient.patch<any>(`/api/v1/bills/${id}/pay`, data, {
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}
    }) as unknown as Promise<any>,
};

export const analyticsAPI = {
  categorySpending: (month?: string) => 
    apiClient.get<CategorySpending[]>('/api/v1/analytics/category-spending', { params: { month } }) as unknown as Promise<CategorySpending[]>,
  monthlyTrend: (months: number = 6) => 
    apiClient.get<MonthlyTrend[]>('/api/v1/analytics/monthly-trend', { params: { months } }) as unknown as Promise<MonthlyTrend[]>,
};

export const walletAPI = {
  list: () => apiClient.get<any[]>('/api/v1/wallet') as unknown as Promise<any[]>,
  getCash: () => apiClient.get<any>('/api/v1/wallet/cash') as unknown as Promise<any>,
  updateCash: (newBalance: string, note?: string, idempotencyKey?: string) =>
    apiClient.put('/api/v1/wallet/cash', { newBalance, note }, {
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}
    }) as unknown as Promise<any>,
  create: (data: Record<string, unknown>) =>
    apiClient.post('/api/v1/wallet', data) as unknown as Promise<any>,
  update: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/api/v1/wallet/${id}`, data) as unknown as Promise<any>,
  delete: (id: string) =>
    apiClient.delete(`/api/v1/wallet/${id}`) as unknown as Promise<void>,
  transfer: (data: { fromWalletId: string; toWalletId: string; amount: string; note?: string }, idempotencyKey?: string) =>
    apiClient.post('/api/v1/wallet/transfer', data, {
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}
    }) as unknown as Promise<{ source: any; target: any }>,
};

export const notificationAPI = {
  list: () => apiClient.get<any[]>('/api/v1/notifications') as unknown as Promise<any[]>,
  unreadCount: () => apiClient.get<{ count: number }>('/api/v1/notifications/unread-count') as unknown as Promise<{ count: number }>,
  markRead: (id: string) => apiClient.patch(`/api/v1/notifications/${id}/read`) as unknown as Promise<void>,
  markAllRead: () => apiClient.patch('/api/v1/notifications/read-all') as unknown as Promise<void>,
};

export const categoriesAPI = {
  list: () => apiClient.get<Category[]>('/api/v1/categories') as unknown as Promise<Category[]>,
  create: (data: { name: string; type: string; icon?: string; color?: string; sortOrder?: number }) =>
    apiClient.post<Category>('/api/v1/categories', data) as unknown as Promise<Category>,
  update: (id: number, data: { name?: string; type?: string; icon?: string; color?: string; sortOrder?: number }) =>
    apiClient.put<Category>(`/api/v1/categories/${id}`, data) as unknown as Promise<Category>,
  delete: (id: number) =>
    apiClient.delete(`/api/v1/categories/${id}`) as unknown as Promise<void>,
};
