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
      // return budgetAPI.list();
      await new Promise(r => setTimeout(r, 500)); // Simulate network
      return MOCK_BUDGETS;
    },
    staleTime: 60 * 1000,
  });
}

export function useBudgetSummary() {
  return useQuery<BudgetSummary>({
    queryKey: ["budgets", "summary"],
    queryFn: async () => {
      /*
      const data = await budgetAPI.summary();
      const result = BudgetSummarySchema.safeParse(data);
      if (!result.success) {
        console.error("Budget Data Mismatch:", result.error);
        return data;
      }
      return result.data as BudgetSummary;
      */
      await new Promise(r => setTimeout(r, 800)); // Simulate network
      return MOCK_BUDGET_SUMMARY;
    },
    staleTime: 60 * 1000,
  });
}

export function useBudgetDetail(id: string) {
  return useQuery<BudgetDetail>({
    queryKey: ["budgets", id],
    queryFn: async () => {
      // return budgetAPI.getDetail(id);
      await new Promise(r => setTimeout(r, 400));
      const budget = MOCK_BUDGETS.find(b => b.id === id) || MOCK_BUDGETS[0];
      
      // Calculate derived mock values
      const spent = id === "1" ? "14500000" : id === "2" ? "3500000" : "8000000";
      const target = new Decimal(budget.targetAmount);
      const spentDec = new Decimal(spent);
      
      return {
        ...budget,
        spent: spentDec.toFixed(2),
        left: target.minus(spentDec).toFixed(2),
        percent: Math.round(spentDec.div(target).times(100).toNumber()),
        recommendedDaily: 500000,
        projectedSpending: 15000000,
        daysElapsed: 15,
        daysRemaining: 15,
        transactions: [],
      };
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
