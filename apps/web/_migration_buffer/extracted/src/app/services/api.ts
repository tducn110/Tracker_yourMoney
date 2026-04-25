/**
 * S2S Finance Tracker - API Service Layer
 * Centralized API client for all backend communication
 * 
 * Environment Variables Required:
 * - VITE_API_BASE_URL: Backend API base URL (e.g., https://api.s2s-finance.com)
 * - VITE_API_TIMEOUT: Request timeout in ms (default: 10000)
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10);

// ==================== Types ====================

export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  monthly_budget: number;
  emergency_buffer: number;
  income_date: number;
  currency: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: number;
  amount: number;
  type: 'income' | 'expense';
  note: string;
  date: string; // ISO date string
  category?: Category;
  receipt_url?: string;
  created_at: string;
  updated_at: string;
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
  user_id: string;
  name: string;
  icon: string;
  target_amount: number;
  current_saved: number;
  monthly_contribution: number;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  deadline?: string;
  created_at: string;
  updated_at: string;
}

export interface Bill {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  amount: number;
  due_day: number;
  frequency: 'monthly' | 'quarterly' | 'yearly';
  status: 'active' | 'inactive';
  auto_pay: boolean;
  next_due_date: string;
}

export interface FinanceData {
  total_income: number;
  total_expense: number;
  balance: number;
  safe_to_spend: number;
  is_over_budget: boolean;
  monthly_budget: number;
  emergency_buffer: number;
  income_date: number;
  goals_allocation: number;
  bills_due: number;
}

export interface CategorySpending {
  category_name: string;
  icon: string;
  color: string;
  total_spent: number;
  transaction_count: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  full_name: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ==================== API Client ====================

class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

class APIClient {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string, timeout: number) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('s2s_auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAuthToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new APIError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData
        );
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof APIError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new APIError('Request timeout', 408);
        }
        throw new APIError(error.message);
      }

      throw new APIError('Unknown error occurred');
    }
  }

  // ==================== Auth Endpoints ====================

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Store token
    localStorage.setItem('s2s_auth_token', response.token);
    localStorage.setItem('s2s_user', JSON.stringify(response.user));
    
    return response;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    // Store token
    localStorage.setItem('s2s_auth_token', response.token);
    localStorage.setItem('s2s_user', JSON.stringify(response.user));
    
    return response;
  }

  logout(): void {
    localStorage.removeItem('s2s_auth_token');
    localStorage.removeItem('s2s_user');
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('s2s_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // ==================== Finance Endpoints ====================

  async getFinanceData(): Promise<FinanceData> {
    return this.request<FinanceData>('/api/finance/safe-to-spend');
  }

  async checkImpact(amount: number): Promise<{ impact: string; new_s2s: number }> {
    return this.request('/api/finance/check-impact', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  // ==================== Transaction Endpoints ====================

  async getTransactions(params?: {
    month?: string;
    category_id?: number;
    page?: number;
    limit?: number;
  }): Promise<{ transactions: Transaction[]; total: number; pages: number }> {
    const query = new URLSearchParams(
      Object.entries(params || {}).map(([k, v]) => [k, String(v)])
    );
    return this.request(`/api/transactions?${query}`);
  }

  async quickAddTransaction(note: string): Promise<Transaction> {
    return this.request<Transaction>('/api/transactions/quick', {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
  }

  async createTransaction(data: Partial<Transaction>): Promise<Transaction> {
    return this.request<Transaction>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTransaction(id: string, data: Partial<Transaction>): Promise<Transaction> {
    return this.request<Transaction>(`/api/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTransaction(id: string): Promise<void> {
    return this.request<void>(`/api/transactions/${id}`, {
      method: 'DELETE',
    });
  }

  async uploadReceipt(file: File): Promise<{ amount: number; confidence: number; receipt_url: string }> {
    const formData = new FormData();
    formData.append('receipt', file);

    const token = this.getAuthToken();
    const response = await fetch(`${this.baseURL}/api/finance/ocr`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!response.ok) {
      throw new APIError('OCR upload failed', response.status);
    }

    return response.json();
  }

  // ==================== Category Endpoints ====================

  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>('/api/categories');
  }

  async getCategorySpending(month?: string): Promise<CategorySpending[]> {
    const query = month ? `?month=${month}` : '';
    return this.request<CategorySpending[]>(`/api/analytics/category-spending${query}`);
  }

  // ==================== Analytics Endpoints ====================

  async getMonthlyTrend(months: number = 6): Promise<MonthlyTrend[]> {
    return this.request<MonthlyTrend[]>(`/api/analytics/monthly-trend?months=${months}`);
  }

  // ==================== Goal Endpoints ====================

  async getGoals(): Promise<Goal[]> {
    return this.request<Goal[]>('/api/goals');
  }

  async createGoal(data: Partial<Goal>): Promise<Goal> {
    return this.request<Goal>('/api/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateGoal(id: string, data: Partial<Goal>): Promise<Goal> {
    return this.request<Goal>(`/api/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteGoal(id: string): Promise<void> {
    return this.request<void>(`/api/goals/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== Bill Endpoints ====================

  async getBills(): Promise<Bill[]> {
    return this.request<Bill[]>('/api/bills');
  }

  async createBill(data: Partial<Bill>): Promise<Bill> {
    return this.request<Bill>('/api/bills', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBill(id: string, data: Partial<Bill>): Promise<Bill> {
    return this.request<Bill>(`/api/bills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBill(id: string): Promise<void> {
    return this.request<void>(`/api/bills/${id}`, {
      method: 'DELETE',
    });
  }
}

// ==================== Export Singleton ====================

export const apiClient = new APIClient(API_BASE_URL, API_TIMEOUT);

// ==================== React Hooks (Optional) ====================

export { APIError };
