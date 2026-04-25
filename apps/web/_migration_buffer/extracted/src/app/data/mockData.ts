export const mockUser = {
  username: "tducn",
  full_name: "Trần Đức Nguyên",
  email: "tducn@gmail.com",
  avatar: "TD",
};

// ─────────────────────────────────────────────────────────────────────────────
// S2S MOCK DATA — Antigravity V1.2 Philosophy
// S2S = Income − Fixed Expenses − Savings Commitment − Emergency Buffer
// ─────────────────────────────────────────────────────────────────────────────

export type S2SPeriod = "today" | "week" | "month";
export type S2SStatus = "safe" | "warning" | "danger";

export const mockS2SData = {
  period: "Tháng 4/2026",
  incomeDate: 5, // ngày 5 hàng tháng

  // ── Income ──
  monthlyIncome: 25_000_000,

  // ── Antigravity Deductions ──
  fixedExpenses: {
    total: 8_500_000,
    breakdown: [
      {
        name: "Tiền trọ",
        amount: 5_000_000,
        icon: "🏠",
        billId: 1,
      },
      {
        name: "Điện nước",
        amount: 450_000,
        icon: "💡",
        billId: 2,
      },
      {
        name: "Internet FPT",
        amount: 180_000,
        icon: "📶",
        billId: 3,
      },
      {
        name: "Bảo hiểm",
        amount: 500_000,
        icon: "🛡️",
        billId: 4,
      },
      {
        name: "Gym tháng",
        amount: 500_000,
        icon: "💪",
        billId: null,
      },
      {
        name: "Netflix + Spotify",
        amount: 239_000,
        icon: "🎬",
        billId: null,
      },
      {
        name: "Khác cố định",
        amount: 1_631_000,
        icon: "📦",
        billId: null,
      },
    ],
  },
  savingsCommitment: {
    total: 5_000_000,
    breakdown: [
      {
        name: "iPhone 16 Pro",
        amount: 2_000_000,
        icon: "📱",
        goalId: 1,
        completed: false,
      },
      {
        name: "Du lịch Nhật",
        amount: 3_000_000,
        icon: "✈️",
        goalId: 2,
        completed: false,
      },
      {
        name: "Quỹ Khẩn Cấp",
        amount: 0,
        icon: "🛡️",
        goalId: 3,
        completed: true,
      },
    ],
  },
  emergencyBuffer: 1_500_000, // 6% buffer

  // ── S2S Core ──
  s2sBudget: 10_000_000, // 25M − 8.5M − 5M − 1.5M
  s2sSpent: 4_200_000,
  s2sRemaining: 4_800_000,
  usagePercent: 42,
  status: "safe" as S2SStatus,

  // ── Time context (April 1, 2026) ──
  daysElapsed: 1,
  daysTotal: 30,
  dailyBudget: 333_333, // 10M / 30
  dailyActualBurn: 145_000, // spent today
};

// Period-sliced S2S (for tab switching in Hero)
export const mockS2SByPeriod: Record<
  S2SPeriod,
  {
    budget: number;
    spent: number;
    remaining: number;
    percent: number;
    status: S2SStatus;
  }
> = {
  today: {
    budget: 333_333,
    spent: 145_000,
    remaining: 188_333,
    percent: 43,
    status: "safe",
  },
  week: {
    budget: 2_333_333,
    spent: 920_000,
    remaining: 1_413_333,
    percent: 39,
    status: "safe",
  },
  month: {
    budget: 10_000_000,
    spent: 4_200_000,
    remaining: 5_800_000,
    percent: 42,
    status: "safe",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// LEGACY / COMPATIBLE MOCK DATA
// ─────────────────────────────────────────────────────────────────────────────

export const mockFinanceData = {
  total_income: 25_000_000,
  total_expense: 12_700_000,
  balance: 12_300_000,
  safe_to_spend: 5_800_000,
  is_over_budget: false,
  monthly_budget: 10_000_000,
  emergency_buffer: 1_500_000,
  income_date: 5,
};

export const mockCategories = [
  { id: 1, name: "Thu Nhập", icon: "💰", color: "#10B981" },
  { id: 2, name: "Ăn Uống", icon: "🍔", color: "#F59E0B" },
  { id: 3, name: "Đồ Uống", icon: "🥤", color: "#3B82F6" },
  { id: 4, name: "Di Chuyển", icon: "🚗", color: "#EAB308" },
  { id: 5, name: "Nhà Ở", icon: "🏠", color: "#8B5CF6" },
  { id: 6, name: "Tiết Kiệm", icon: "🏦", color: "#10B981" },
  { id: 7, name: "Khác", icon: "📦", color: "#6B7280" },
];

export const mockTransactions = [
  {
    id: 1,
    date: "01/04/2026",
    note: "Lương tháng 4",
    category: "Thu Nhập",
    icon: "💰",
    amount: 25_000_000,
    type: "income" as const,
  },
  {
    id: 2,
    date: "01/04/2026",
    note: "Cafe sáng",
    category: "Đồ Uống",
    icon: "🥤",
    amount: -35_000,
    type: "expense" as const,
  },
  {
    id: 3,
    date: "01/04/2026",
    note: "Ăn trưa văn phòng",
    category: "Ăn Uống",
    icon: "🍔",
    amount: -55_000,
    type: "expense" as const,
  },
  {
    id: 4,
    date: "01/04/2026",
    note: "Grab đi làm",
    category: "Di Chuyển",
    icon: "🚗",
    amount: -45_000,
    type: "expense" as const,
  },
  {
    id: 5,
    date: "31/03/2026",
    note: "Siêu thị VinMart",
    category: "Ăn Uống",
    icon: "🍔",
    amount: -285_000,
    type: "expense" as const,
  },
  {
    id: 6,
    date: "31/03/2026",
    note: "Trà sữa Gong Cha",
    category: "Đồ Uống",
    icon: "🥤",
    amount: -65_000,
    type: "expense" as const,
  },
  {
    id: 7,
    date: "30/03/2026",
    note: "Tiết kiệm iPhone",
    category: "Tiết Kiệm",
    icon: "🏦",
    amount: -2_000_000,
    type: "expense" as const,
  },
  {
    id: 8,
    date: "30/03/2026",
    note: "Tiết kiệm Du lịch Nhật",
    category: "Tiết Kiệm",
    icon: "✈️",
    amount: -3_000_000,
    type: "expense" as const,
  },
  {
    id: 9,
    date: "29/03/2026",
    note: "Thưởng dự án Q1",
    category: "Thu Nhập",
    icon: "💰",
    amount: 500_000,
    type: "income" as const,
  },
  {
    id: 10,
    date: "28/03/2026",
    note: "Xăng xe máy",
    category: "Di Chuyển",
    icon: "🚗",
    amount: -80_000,
    type: "expense" as const,
  },
  {
    id: 11,
    date: "27/03/2026",
    note: "Cơm tối gia đình",
    category: "Ăn Uống",
    icon: "🍔",
    amount: -250_000,
    type: "expense" as const,
  },
  {
    id: 12,
    date: "26/03/2026",
    note: "Bán đồ cũ Shopee",
    category: "Thu Nhập",
    icon: "💰",
    amount: 350_000,
    type: "income" as const,
  },
  {
    id: 13,
    date: "25/03/2026",
    note: "Sách lập trình",
    category: "Khác",
    icon: "📦",
    amount: -120_000,
    type: "expense" as const,
  },
  {
    id: 14,
    date: "24/03/2026",
    note: "Sinh nhật bạn",
    category: "Khác",
    icon: "🎁",
    amount: -300_000,
    type: "expense" as const,
  },
  {
    id: 15,
    date: "23/03/2026",
    note: "Chi phí lặt vặt",
    category: "Khác",
    icon: "📦",
    amount: -110_000,
    type: "expense" as const,
  },
];

export const mockCategorySpending = [
  {
    name: "Ăn Uống",
    value: 2_800_000,
    icon: "🍔",
    color: "#F59E0B",
  },
  {
    name: "Đồ Uống",
    value: 650_000,
    icon: "🥤",
    color: "#3B82F6",
  },
  {
    name: "Di Chuyển",
    value: 450_000,
    icon: "🚗",
    color: "#EAB308",
  },
  {
    name: "Nhà Ở",
    value: 5_000_000,
    icon: "🏠",
    color: "#8B5CF6",
  },
  {
    name: "Tiết Kiệm",
    value: 5_000_000,
    icon: "🏦",
    color: "#10B981",
  },
  {
    name: "Khác",
    value: 530_000,
    icon: "📦",
    color: "#6B7280",
  },
];

export const mockMonthlyTrend = [
  { month: "T10/25", income: 22_000_000, expense: 16_500_000 },
  { month: "T11/25", income: 22_000_000, expense: 15_800_000 },
  { month: "T12/25", income: 27_500_000, expense: 19_200_000 },
  { month: "T1/26", income: 25_000_000, expense: 13_900_000 },
  { month: "T2/26", income: 25_000_000, expense: 14_600_000 },
  { month: "T3/26", income: 25_500_000, expense: 14_200_000 },
];

export const mockGoals = [
  {
    id: 1,
    name: "Mua iPhone 16 Pro",
    icon: "📱",
    current_saved: 8_500_000,
    target_amount: 25_000_000,
    monthly_contribution: 2_000_000,
    status: "active" as const,
    deadline: "12/2026",
  },
  {
    id: 2,
    name: "Du lịch Nhật Bản",
    icon: "✈️",
    current_saved: 12_000_000,
    target_amount: 20_000_000,
    monthly_contribution: 3_000_000,
    status: "active" as const,
    deadline: "06/2026",
  },
  {
    id: 3,
    name: "Quỹ Khẩn Cấp",
    icon: "🛡️",
    current_saved: 5_000_000,
    target_amount: 5_000_000,
    monthly_contribution: 0,
    status: "completed" as const,
    deadline: "01/2026",
  },
  {
    id: 4,
    name: "Mua Macbook M4",
    icon: "💻",
    current_saved: 3_200_000,
    target_amount: 35_000_000,
    monthly_contribution: 2_500_000,
    status: "paused" as const,
    deadline: "06/2027",
  },
];

export const mockBills = [
  {
    id: 1,
    name: "Tiền trọ",
    icon: "🏠",
    amount: 5_000_000,
    due_day: 5,
    status: "pending" as const,
    category: "Nhà Ở",
  },
  {
    id: 2,
    name: "Điện nước",
    icon: "💡",
    amount: 450_000,
    due_day: 10,
    status: "pending" as const,
    category: "Nhà Ở",
  },
  {
    id: 3,
    name: "Internet FPT",
    icon: "📶",
    amount: 180_000,
    due_day: 15,
    status: "pending" as const,
    category: "Khác",
  },
  {
    id: 4,
    name: "Phí bảo hiểm",
    icon: "🛡️",
    amount: 500_000,
    due_day: 1,
    status: "overdue" as const,
    category: "Khác",
  },
  {
    id: 5,
    name: "Spotify Premium",
    icon: "🎵",
    amount: 59_000,
    due_day: 20,
    status: "pending" as const,
    category: "Khác",
  },
  {
    id: 6,
    name: "Netflix",
    icon: "🎬",
    amount: 180_000,
    due_day: 19,
    status: "pending" as const,
    category: "Khác",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// CASH WALLET
// ─────────────────────────────────────────────────────────────────────────────
export const mockCashWallet = {
  balance: 1_500_000,
  lastSynced: "01/04/2026 08:30",
  note: "Không tính vào S2S — theo dõi riêng biệt",
};

// ─────────────────────────────────────────────────────────────────────────────
// MULTI-WALLET — Multiple Accounts Support
// ─────────────────────────────────────────────────────────────────────────────
export type WalletType = 'cash' | 'bank' | 'ewallet' | 'savings';

export interface MockWallet {
  id: string;
  name: string;
  icon: string;
  balance: number;
  type: WalletType;
  colorHex: string;
  accountNumber?: string;
  isDefault: boolean;
  lastSynced: string;
}

export const walletTypeLabel: Record<WalletType, string> = {
  cash: 'Tiền mặt',
  bank: 'Ngân hàng',
  ewallet: 'Ví điện tử',
  savings: 'Tiết kiệm',
};

export const mockWallets: MockWallet[] = [
  {
    id: 'mb-bank',
    name: 'MB Bank',
    icon: '🏦',
    balance: 15_200_000,
    type: 'bank',
    colorHex: '#4361ee',
    accountNumber: '****1234',
    isDefault: true,
    lastSynced: '01/04 09:00',
  },
  {
    id: 'techcombank',
    name: 'Techcombank',
    icon: '💳',
    balance: 8_300_000,
    type: 'bank',
    colorHex: '#ef4444',
    accountNumber: '****5678',
    isDefault: false,
    lastSynced: '31/03 22:00',
  },
  {
    id: 'cash',
    name: 'Tiền Mặt',
    icon: '💵',
    balance: 1_500_000,
    type: 'cash',
    colorHex: '#f59e0b',
    isDefault: false,
    lastSynced: '01/04 08:30',
  },
  {
    id: 'momo',
    name: 'MoMo',
    icon: '📱',
    balance: 250_000,
    type: 'ewallet',
    colorHex: '#e91e63',
    isDefault: false,
    lastSynced: '01/04 07:00',
  },
];

export const getTotalWalletBalance = (wallets: MockWallet[] = mockWallets): number =>
  wallets.reduce((sum, w) => sum + w.balance, 0);

export const getDefaultWallet = (wallets: MockWallet[] = mockWallets): MockWallet =>
  wallets.find((w) => w.isDefault) ?? wallets[0];

// ─────────────────────────────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────────────────────────────
export const formatVND = (amount: number): string =>
  new Intl.NumberFormat("vi-VN").format(Math.abs(amount)) + "₫";

export const getGreeting = (): string => {
  const h = new Date().getHours();
  if (h < 12) return "Chào buổi sáng";
  if (h < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
};

// ─────────────────────────────────────────────────────────────────────────────
// BUDGET MODULE — Budget-First Philosophy
// ─────────────────────────────────────────────────────────────────────────────

export type BudgetPeriod = 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

export interface MockBudget {
  id: number;
  name: string;
  budget_limit: number;
  spent: number;
  left: number;
  percent: number;
  period_type: BudgetPeriod;
  start_date: string;
  end_date: string;
  categories: { id: number; name: string; icon: string }[];
  wallet_scope: 'all' | 'specific';
  status: 'active' | 'finished';
  is_all_categories: boolean;
}

export const mockBudgets: MockBudget[] = [
  {
    id: 1,
    name: 'Ăn Uống Tháng 4',
    budget_limit: 3_000_000,
    spent: 2_590_000,
    left: 410_000,
    percent: 86,
    period_type: 'monthly',
    start_date: '2026-04-01',
    end_date: '2026-04-30',
    categories: [{ id: 2, name: 'Ăn Uống', icon: '🍔' }],
    wallet_scope: 'all',
    status: 'active',
    is_all_categories: false,
  },
  {
    id: 2,
    name: 'Di Chuyển Tháng 4',
    budget_limit: 1_000_000,
    spent: 410_000,
    left: 590_000,
    percent: 41,
    period_type: 'monthly',
    start_date: '2026-04-01',
    end_date: '2026-04-30',
    categories: [{ id: 4, name: 'Di Chuyển', icon: '🚗' }],
    wallet_scope: 'all',
    status: 'active',
    is_all_categories: false,
  },
  {
    id: 3,
    name: 'Giải Trí & Cà Phê',
    budget_limit: 800_000,
    spent: 650_000,
    left: 150_000,
    percent: 81,
    period_type: 'monthly',
    start_date: '2026-04-01',
    end_date: '2026-04-30',
    categories: [{ id: 3, name: 'Đồ Uống', icon: '🥤' }],
    wallet_scope: 'all',
    status: 'active',
    is_all_categories: false,
  },
  {
    id: 4,
    name: 'Chi Phí Khác',
    budget_limit: 500_000,
    spent: 530_000,
    left: -30_000,
    percent: 106,
    period_type: 'monthly',
    start_date: '2026-04-01',
    end_date: '2026-04-30',
    categories: [{ id: 7, name: 'Khác', icon: '📦' }],
    wallet_scope: 'all',
    status: 'active',
    is_all_categories: false,
  },
  {
    id: 5,
    name: 'Ngân Sách Tổng Q1/2026',
    budget_limit: 12_000_000,
    spent: 12_700_000,
    left: -700_000,
    percent: 106,
    period_type: 'quarterly',
    start_date: '2026-01-01',
    end_date: '2026-03-31',
    categories: [],
    wallet_scope: 'all',
    status: 'finished',
    is_all_categories: true,
  },
];

// Tổng hợp budget cho Dashboard Widget
export const mockBudgetSummary = {
  totalLimit: 5_300_000,
  totalSpent: 4_180_000,
  left: 1_120_000,
  percent: 79,
};

// Dữ liệu chi tiêu theo ngày (dùng cho LineChart trong BudgetDetailPage)
export const mockBudgetDailySpend = [
  { day: '1/4',  actual: 135_000, planned: 100_000 },
  { day: '3/4',  actual: 280_000, planned: 200_000 },
  { day: '5/4',  actual:  95_000, planned: 100_000 },
  { day: '8/4',  actual: 320_000, planned: 300_000 },
  { day: '10/4', actual: 180_000, planned: 200_000 },
  { day: '12/4', actual: 450_000, planned: 400_000 },
  { day: '15/4', actual: 210_000, planned: 333_333 },
  { day: '17/4', actual: 380_000, planned: 333_333 },
  { day: '19/4', actual: 155_000, planned: 333_333 },
  { day: '22/4', actual: 290_000, planned: 333_333 },
];