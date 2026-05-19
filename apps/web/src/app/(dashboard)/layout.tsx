'use client';

import { Sidebar, MobileBottomNav } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { QuickAddModal } from '@/components/quick-add/QuickAddModal';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateTransaction, useCategories } from '@/_lib/hooks/finance';
import { resolveCategoryId } from '@/_lib/category-map';
import { event as trackEvent } from '@/_lib/gtag';
import { transactionsAPI, goalsAPI, billsAPI, budgetAPI, walletAPI } from '@finance/api-client';

/**
 * Prefetch dashboard data so cards render instantly from cache.
 * Runs once on mount — all queries share the same `staleTime: 5min`.
 */
function useDashboardPrefetch() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Fire all dashboard queries in parallel to warm React Query cache
    const prefetches = [
      queryClient.prefetchQuery({
        queryKey: ['budgets', 'summary'],
        queryFn: () => budgetAPI.summary(),
        staleTime: 5 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: ['budgets'],
        queryFn: () => budgetAPI.list(),
        staleTime: 5 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: ['goals'],
        queryFn: () => goalsAPI.list(),
        staleTime: 5 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: ['bills'],
        queryFn: () => billsAPI.list(),
        staleTime: 5 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: ['wallets'],
        queryFn: () => walletAPI.list(),
        staleTime: 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: ['transactions', { limit: 20 }],
        queryFn: () => transactionsAPI.list({ limit: 20 }),
        staleTime: 5 * 60 * 1000,
      }),
    ];

    // Fire-and-forget — cards use their own useQuery hooks and will read from cache
    Promise.all(prefetches).catch(() => { /* errors surface in individual hooks */ });
  }, [queryClient]);
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const { mutateAsync: createTransaction } = useCreateTransaction();
  const { data: categories = [] } = useCategories();

  // Prefetch dashboard data so child cards render instantly
  useDashboardPrefetch();

  const handleQuickAdd = async (data: {
    amount: number;
    type: 'income' | 'expense';
    category: string;
    walletId: string;
    note: string;
    date: string;
  }) => {
    const categoryId = resolveCategoryId(data.category, data.type, categories);
    try {
      await createTransaction({
        walletId: data.walletId,
        categoryId,
        amount: String(data.amount),
        type: data.type,
        note: data.note,
        displayDate: data.date,
        source: 'manual',
      });
      trackEvent('transaction_create', {
        source: 'quick_add_modal',
        transaction_type: data.type,
        has_note: Boolean(data.note),
      });
      setIsQuickAddOpen(false);
    } catch (error) {
      trackEvent('transaction_create_failed', {
        source: 'quick_add_modal',
        transaction_type: data.type,
      });
      throw error;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Desktop */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-[72px] lg:ml-[240px] transition-all duration-300">
        <Header onQuickAddClick={() => {
          trackEvent('quick_add_open', { source: 'header' });
          setIsQuickAddOpen(true);
        }} />

        <main className="flex-1 overflow-y-auto">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav />

      {/* Global Modals */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSubmit={handleQuickAdd}
      />

      <Toaster position="top-right" richColors />
    </div>
  );
}
