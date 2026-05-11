/**
 * Mock Data for UI Testing — Finance Tracker V3
 */

import type { 
  Budget, 
  BudgetSummary, 
  BudgetDetail,
  Transaction,
  Bill,
  Goal,
  CategorySpending,
  MonthlyTrend,
  User,
  Wallet
} from "@finance/api-client";

export const MOCK_USER: User = {
  id: 'u1',
  username: 'tducn',
  email: 'demo@example.com',
  fullName: 'Trần Đức',
  monthlyBudget: '25000000',
  emergencyBuffer: '5000000',
  incomeDate: 5,
  currency: 'VND'
};

export const MOCK_WALLETS: Wallet[] = [
  {
    id: 'w1',
    userId: 'u1',
    name: 'Tiền mặt',
    type: 'cash',
    balance: '1500000',
    initialBalance: '1500000',
    icon: '💵',
    color: '#10b981',
    isDefault: true,
    version: 1,
    lastSyncedAt: '01/04/2026 08:30',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'w2',
    userId: 'u1',
    name: 'Techcombank',
    type: 'bank',
    balance: '42500000',
    initialBalance: '40000000',
    icon: '🏦',
    color: '#ef4444',
    isDefault: false,
    version: 1,
    lastSyncedAt: '02/04/2026 14:15',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    accountNumber: '1234567890',
  },
  {
    id: 'w3',
    userId: 'u1',
    name: 'HSBC Visa',
    type: 'credit',
    balance: '-12500000',
    initialBalance: '0',
    icon: 'CreditCard',
    color: '#EF4444',
    isDefault: false,
    version: 1,
    lastSyncedAt: '02/04/2026 14:15',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    accountNumber: '**** 8888',
  },
];

export const MOCK_BUDGETS: Budget[] = [
  {
    id: "1",
    userId: "user-1",
    name: "Ngân sách tổng",
    icon: "🏦",
    targetAmount: "25000000",
    periodType: "monthly",
    startDate: "2024-04-01",
    endDate: "2024-04-30",
    isAllCategories: true,
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    userId: "user-1",
    name: "Ăn uống & Cà phê",
    icon: "🍜",
    targetAmount: "6000000",
    periodType: "monthly",
    startDate: "2024-04-01",
    endDate: "2024-04-30",
    isAllCategories: false,
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    userId: "user-1",
    name: "Mua sắm Tech",
    icon: "💻",
    targetAmount: "10000000",
    periodType: "monthly",
    startDate: "2024-04-01",
    endDate: "2024-04-30",
    isAllCategories: false,
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const MOCK_BUDGET_SUMMARY: BudgetSummary = {
  totalLimit: "25000000",
  totalSpent: "14500000",
  left: "10500000",
  percent: 58,
  totalIncome: "45000000",
  projectedSpending: "18000000",
};

export const MOCK_TRANSACTIONS: Transaction[] = [
  { 
    id: '1', 
    userId: 'u1', 
    note: 'Ăn sáng phở bò', 
    amount: '45000', 
    type: 'expense', 
    categoryName: 'Ăn uống', 
    displayDate: '2024-04-20',
    categoryId: 1, 
    createdAt: '2024-04-20T08:00:00Z', 
    updatedAt: '2024-04-20T08:00:00Z',
    category: { id: 1, name: 'Ăn uống', icon: '🍜', color: '#f87171', type: 'expense' }
  },
  { 
    id: '2', 
    userId: 'u1', 
    note: 'Lương tháng 4', 
    amount: '45000000', 
    type: 'income', 
    categoryName: 'Thu nhập', 
    displayDate: '2024-04-05',
    categoryId: 2, 
    createdAt: '2024-04-05T09:00:00Z', 
    updatedAt: '2024-04-05T09:00:00Z',
    category: { id: 2, name: 'Thu nhập', icon: '💰', color: '#34d399', type: 'income' }
  },
  { 
    id: '3', 
    userId: 'u1', 
    note: 'Mua MacBook Air M3', 
    amount: '28000000', 
    type: 'expense', 
    categoryName: 'Mua sắm', 
    displayDate: '2024-04-18',
    categoryId: 5, 
    createdAt: '2024-04-18T14:00:00Z', 
    updatedAt: '2024-04-18T14:00:00Z',
    category: { id: 5, name: 'Mua sắm', icon: '🛍️', color: '#f472b6', type: 'expense' }
  },
  { 
    id: '4', 
    userId: 'u1', 
    note: 'Tiền điện tháng 4', 
    amount: '1200000', 
    type: 'expense', 
    categoryName: 'Tiền ích', 
    displayDate: '2024-04-15',
    categoryId: 4, 
    createdAt: '2024-04-15T11:00:00Z', 
    updatedAt: '2024-04-15T11:00:00Z',
    category: { id: 4, name: 'Tiền ích', icon: '⚡', color: '#fbbf24', type: 'expense' }
  },
  { 
    id: '5', 
    userId: 'u1', 
    note: 'Ăn tối Sushi', 
    amount: '850000', 
    type: 'expense', 
    categoryName: 'Ăn uống', 
    displayDate: '2024-04-21',
    categoryId: 1, 
    createdAt: '2024-04-21T19:00:00Z', 
    updatedAt: '2024-04-21T19:00:00Z',
    category: { id: 1, name: 'Ăn uống', icon: '🍜', color: '#f87171', type: 'expense' }
  },
];

export const MOCK_GOALS: Goal[] = [
  { 
    id: 'g1', 
    userId: 'u1', 
    name: 'Mua iPhone 16 Pro', 
    icon: '📱', 
    targetAmount: '35000000', 
    currentSaved: '12000000', 
    monthlyContribution: '2000000', 
    status: 'active', 
    deadline: '2024-12-31', 
    createdAt: '2024-01-01T00:00:00Z', 
    updatedAt: '2024-01-01T00:00:00Z' 
  },
  { 
    id: 'g2', 
    userId: 'u1', 
    name: 'Quỹ khẩn cấp', 
    icon: '🛡️', 
    targetAmount: '50000000', 
    currentSaved: '45000000', 
    monthlyContribution: '5000000', 
    status: 'active', 
    createdAt: '2024-01-01T00:00:00Z', 
    updatedAt: '2024-01-01T00:00:00Z' 
  },
];

export const MOCK_BILLS: Bill[] = [
  { 
    id: 'b1', 
    userId: 'u1', 
    name: 'Tiền mạng FPT', 
    amount: '275000', 
    dueDay: 25, 
    status: 'active', 
    frequency: 'monthly', 
    icon: '🌐', 
    autoPay: false, 
    nextDueDate: '2024-04-25' 
  },
  { 
    id: 'b2', 
    userId: 'u1', 
    name: 'Netflix Premium', 
    amount: '260000', 
    dueDay: 28, 
    status: 'active', 
    frequency: 'monthly', 
    icon: '📺', 
    autoPay: true, 
    nextDueDate: '2024-04-28' 
  },
  { 
    id: 'b3', 
    userId: 'u1', 
    name: 'Tiền nhà', 
    amount: '5000000', 
    dueDay: 1, 
    status: 'active', 
    frequency: 'monthly', 
    icon: '🏠', 
    autoPay: false, 
    nextDueDate: '2024-05-01' 
  },
];

export const MOCK_CASH_WALLET = {
  balance: '1500000',
  currency: 'VND',
  lastSyncAt: new Date().toISOString(),
};

export const MOCK_CATEGORY_SPENDING: CategorySpending[] = [
  { categoryName: 'Ăn uống', totalSpent: '4500000', icon: '🍔', color: '#f87171', transactionCount: 15 },
  { categoryName: 'Di chuyển', totalSpent: '1200000', icon: '🚗', color: '#60a5fa', transactionCount: 8 },
  { categoryName: 'Nhà cửa', totalSpent: '8500000', icon: '🏠', color: '#fbbf24', transactionCount: 3 },
  { categoryName: 'Giải trí', totalSpent: '2300000', icon: '🎮', color: '#c084fc', transactionCount: 12 },
  { categoryName: 'Mua sắm', totalSpent: '3100000', icon: '🛍️', color: '#f472b6', transactionCount: 5 },
];

export const MOCK_MONTHLY_TREND: MonthlyTrend[] = [
  { month: 'T11', income: '25000000', expense: '18000000' },
  { month: 'T12', income: '25000000', expense: '22000000' },
  { month: 'T1', income: '28000000', expense: '15000000' },
  { month: 'T2', income: '25000000', expense: '19000000' },
  { month: 'T3', income: '30000000', expense: '21000000' },
  { month: 'T4', income: '45000000', expense: '17000000' },
];
