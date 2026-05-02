'use client';

import { Sidebar, MobileBottomNav } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { QuickAddModal } from '@/components/quick-add/QuickAddModal';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useState } from 'react';
import { Toaster } from 'sonner';
import { useCreateTransaction, useCategories } from '@/_lib/hooks/finance';
import { resolveCategoryId } from '@/_lib/category-map';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const { mutateAsync: createTransaction } = useCreateTransaction();
  const { data: categories = [] } = useCategories();

  const handleQuickAdd = async (data: {
    amount: number;
    type: 'income' | 'expense';
    category: string;
    walletId: string;
    note: string;
    date: string;
  }) => {
    const categoryId = resolveCategoryId(data.category, data.type, categories);
    await createTransaction({
      walletId: data.walletId,
      categoryId,
      amount: String(data.amount),
      type: data.type,
      note: data.note,
      displayDate: data.date,
      source: 'manual',
    });
    setIsQuickAddOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Desktop */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-[72px] lg:ml-[240px] transition-all duration-300">
        <Header onQuickAddClick={() => setIsQuickAddOpen(true)} />

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