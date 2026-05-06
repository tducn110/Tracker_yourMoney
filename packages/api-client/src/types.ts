/**
 * Shared Type Definitions & Type Adapters
 */

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  monthlyBudget: string;
  emergencyBuffer: string;
  incomeDate: number;
  currency: string;
}

export interface Transaction {
  id: string;
  userId: string;
  categoryId: number;
  amount: string;
  type: 'income' | 'expense' | 'transfer';
  note: string;
  displayDate: string;
  icon?: string;
  categoryName?: string;
  category?: Category;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense' | 'both';
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  icon: string;
  targetAmount: string;
  currentSaved: string;
  monthlyContribution: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  deadline?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bill {
  id: string;
  userId: string;
  name: string;
  icon: string;
  amount: string;
  dueDay: number;
  frequency: 'monthly' | 'quarterly' | 'yearly';
  status: 'active' | 'inactive';
  autoPay: boolean;
  nextDueDate: string;
}

export interface Budget {
  id: string;
  userId: string;
  name: string;
  icon: string;
  targetAmount: string;
  periodType: 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  startDate: string;
  endDate: string;
  isAllCategories: boolean;
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
  updatedAt: string;
  spent?: string;
}

export interface BudgetSummary {
  totalLimit: string;
  totalSpent: string;
  left: string;
  percent: number;
  totalIncome?: string;
  projectedSpending?: string;
}

export interface BudgetDetail extends Budget {
  spent: string;
  left: string;
  percent: number;
  recommendedDaily: number;
  projectedSpending: number;
  daysElapsed: number;
  daysRemaining: number;
  transactions: Transaction[];
  categories: { categoryId: number; name: string; icon: string }[];
}

export interface CategorySpending {
  categoryName: string;
  icon: string;
  color: string;
  totalSpent: string;
  transactionCount: number;
}

export interface MonthlyTrend {
  month: string;
  income: string;
  expense: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  fullName: string;
  password: string;
}

export interface AuthResponse {
  user: User;
}

/**
 * Staff-grade Type Transformer
 * Maps snake_case API response types to camelCase Frontend types
 */
type CamelCase<S extends string> = S extends `${infer T}_${infer U}`
  ? `${Lowercase<T>}${Capitalize<CamelCase<U>>}`
  : Lowercase<S>;

export type DeepCamelCase<T> = T extends Date | File | Blob | RegExp
  ? T
  : T extends Array<infer U>
  ? Array<DeepCamelCase<U>>
  : T extends object
  ? { [K in keyof T as CamelCase<string & K>]: DeepCamelCase<T[K]> }
  : T;


