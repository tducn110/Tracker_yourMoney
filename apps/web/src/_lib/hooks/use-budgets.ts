/**
 * Budget Hooks — Finance Tracker V3
 * Uses typed budgetAPI from @finance/api-client for full type safety.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { budgetAPI } from "@finance/api-client";
import type { Budget, BudgetSummary, BudgetDetail } from "@finance/api-client";

import { z } from "zod";
import Decimal from "decimal.js";

const BudgetSummarySchema = z.object({
  totalLimit: z.string(),
  totalSpent: z.string(),
  left: z.string(),
  percent: z.number(),
  totalIncome: z.string().optional(),
  projectedSpending: z.string().optional(),
});

import { MOCK_BUDGETS, MOCK_BUDGET_SUMMARY } from "../mock-data";

export function useBudgets() {
  return useQuery<Budget[]>({
    queryKey: ["budgets"],
    queryFn: async () => {
      return budgetAPI.list();
    },
    staleTime: 60 * 1000,
  });
}

export function useBudgetSummary() {
  return useQuery<BudgetSummary>({
    queryKey: ["budgets", "summary"],
    queryFn: async () => {
      return budgetAPI.summary();
    },
    staleTime: 60 * 1000,
  });
}

export function useBudgetDetail(id: string) {
  return useQuery<BudgetDetail>({
    queryKey: ["budgets", id],
    queryFn: async () => {
      return budgetAPI.getDetail(id);
    },
    enabled: !!id,
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Budget>) => budgetAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["budgets", "summary"] });
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Budget> }) =>
      budgetAPI.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["budgets", "summary"] });
      queryClient.invalidateQueries({ queryKey: ["budgets", variables.id] });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => budgetAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["budgets", "summary"] });
    },
  });
}
