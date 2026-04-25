/**
 * React Hooks for API Integration
 * Provides easy-to-use hooks for data fetching with loading/error states
 */

import { useState, useEffect, useCallback } from 'react';
import { apiClient, APIError, type FinanceData, type Transaction, type Category, type Goal, type Bill, type CategorySpending, type MonthlyTrend } from '../services/api';

// ==================== Generic Hook ====================

export function useAPIData<T>(
  fetcher: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

// ==================== Specific Hooks ====================

export function useFinanceData() {
  return useAPIData<FinanceData>(() => apiClient.getFinanceData());
}

export function useTransactions(params?: {
  month?: string;
  category_id?: number;
  page?: number;
  limit?: number;
}) {
  return useAPIData(
    () => apiClient.getTransactions(params),
    [params?.month, params?.category_id, params?.page, params?.limit]
  );
}

export function useCategories() {
  return useAPIData<Category[]>(() => apiClient.getCategories());
}

export function useCategorySpending(month?: string) {
  return useAPIData<CategorySpending[]>(
    () => apiClient.getCategorySpending(month),
    [month]
  );
}

export function useMonthlyTrend(months: number = 6) {
  return useAPIData<MonthlyTrend[]>(
    () => apiClient.getMonthlyTrend(months),
    [months]
  );
}

export function useGoals() {
  return useAPIData<Goal[]>(() => apiClient.getGoals());
}

export function useBills() {
  return useAPIData<Bill[]>(() => apiClient.getBills());
}

// ==================== Mutation Hooks ====================

export function useCreateTransaction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (note: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.quickAddTransaction(note);
      return result;
    } catch (err) {
      const message = err instanceof APIError ? err.message : 'Failed to create transaction';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
}

export function useDeleteTransaction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteTransaction = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.deleteTransaction(id);
    } catch (err) {
      const message = err instanceof APIError ? err.message : 'Failed to delete transaction';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteTransaction, loading, error };
}

export function useUploadReceipt() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.uploadReceipt(file);
      return result;
    } catch (err) {
      const message = err instanceof APIError ? err.message : 'Failed to upload receipt';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { upload, loading, error };
}

// ==================== Auth Hook ====================

export function useAuth() {
  const [user, setUser] = useState(() => apiClient.getCurrentUser());

  const login = async (email: string, password: string) => {
    const response = await apiClient.login({ email, password });
    setUser(response.user);
    return response;
  };

  const register = async (data: {
    username: string;
    email: string;
    full_name: string;
    password: string;
  }) => {
    const response = await apiClient.register(data);
    setUser(response.user);
    return response;
  };

  const logout = () => {
    apiClient.logout();
    setUser(null);
  };

  return { user, login, register, logout };
}
