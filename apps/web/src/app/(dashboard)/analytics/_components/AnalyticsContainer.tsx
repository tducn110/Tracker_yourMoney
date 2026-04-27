'use client';

import { useCategorySpending, useMonthlyTrend } from '@/_lib/hooks/finance';
import { AnalyticsView } from './AnalyticsView';
// Provide an inline skeleton since the ui component might be missing
function AnalyticsSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-gray-200 rounded"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-24 bg-gray-200 rounded-xl"></div>
        <div className="h-24 bg-gray-200 rounded-xl"></div>
        <div className="h-24 bg-gray-200 rounded-xl"></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 bg-gray-200 rounded-xl"></div>
        <div className="h-80 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  );
}

export function AnalyticsContainer() {
  // Fetch data using hooks
  const { data: categorySpending, isLoading: isLoadingCat } = useCategorySpending();
  const { data: monthlyTrend, isLoading: isLoadingTrend } = useMonthlyTrend(6);

  if (isLoadingCat || isLoadingTrend) {
    return <AnalyticsSkeleton />;
  }

  // Calculate totals from monthlyTrend
  let totalIncome = 0;
  let totalExpense = 0;

  const monthlyData = (monthlyTrend || []).map((trend: any) => {
    const inc = Number(trend.income);
    const exp = Number(trend.expense);
    totalIncome += inc;
    totalExpense += exp;
    return {
      month: trend.month,
      income: inc,
      expense: exp,
    };
  });

  const savings = totalIncome - totalExpense;

  // Format category data for PieChart
  const pieData = (categorySpending || []).map((cat: any) => ({
    name: cat.categoryName,
    value: Number(cat.totalSpent),
  }));

  return (
    <AnalyticsView
      totalIncome={totalIncome}
      totalExpense={totalExpense}
      savings={savings}
      pieData={pieData}
      monthlyData={monthlyData}
    />
  );
}
