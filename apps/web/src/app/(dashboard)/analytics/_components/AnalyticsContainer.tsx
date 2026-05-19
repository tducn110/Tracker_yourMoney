'use client';

import { useState, useMemo } from 'react';
import { useCategorySpending, useDailySummary, useMonthlyTrend } from '@/_lib/hooks/finance';
import { AnalyticsView } from './AnalyticsView';

function getTodayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function getMonthFromDate(date: string) {
  return date.slice(0, 7);
}

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
  const [draftDate, setDraftDate] = useState(getTodayInputValue);
  const [selectedDate, setSelectedDate] = useState(getTodayInputValue);
  const [trendMonths, setTrendMonths] = useState(6);
  const selectedMonth = getMonthFromDate(selectedDate);

  const { data: categorySpending, isLoading: isLoadingCat } = useCategorySpending(selectedMonth, selectedDate);
  const { data: dailySummary, isLoading: isLoadingSummary } = useDailySummary(selectedDate);
  const { data: monthlyTrend, isLoading: isLoadingTrend } = useMonthlyTrend(trendMonths, selectedMonth);

  const isLoading = isLoadingCat || isLoadingSummary || isLoadingTrend;

  const totalIncome = Number(dailySummary?.income ?? 0);
  const totalExpense = Number(dailySummary?.expense ?? 0);
  const savings = Number(dailySummary?.savings ?? 0);

  // Trend data — properly hooks into selected endMonth
  const monthlyData = useMemo(() => {
    return (monthlyTrend || []).map((trend: any) => ({
      month: trend.month,
      income: Number(trend.income || 0),
      expense: Number(trend.expense || 0),
    }));
  }, [monthlyTrend]);

  const selectedDateLabel = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(selectedDate + 'T00:00:00'));

  const pieData = useMemo(() => {
    return (categorySpending || [])
      .map((cat: any) => ({
        name: cat.categoryName,
        value: Number(cat.amount ?? cat.totalSpent ?? 0),
      }))
      .filter((item) => item.value > 0);
  }, [categorySpending]);

  const hasStats = totalIncome > 0 || totalExpense > 0;

  if (isLoading) {
    return <AnalyticsSkeleton />;
  }

  return (
    <AnalyticsView
      totalIncome={totalIncome}
      totalExpense={totalExpense}
      savings={savings}
      pieData={pieData}
      monthlyData={monthlyData}
      selectedDate={draftDate}
      selectedDateLabel={selectedDateLabel}
      trendMonths={trendMonths}
      hasStats={hasStats}
      hasPendingFilter={draftDate !== selectedDate}
      onDateChange={setDraftDate}
      onApplyFilter={() => setSelectedDate(draftDate)}
      onTrendMonthsChange={setTrendMonths}
    />
  );
}
