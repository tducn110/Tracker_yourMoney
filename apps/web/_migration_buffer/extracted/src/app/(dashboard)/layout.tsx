'use client';

import { Outlet } from 'react-router';
import { Sidebar, MobileBottomNav } from '@/app/_components/layout/Sidebar';
import { Header } from '@/app/_components/layout/Header';
import { QuickAddModal } from '@/app/_components/quick-add/QuickAddModal';
import { useState } from 'react';
import { Toaster } from 'sonner';
import { WalletProvider } from '@/app/context/WalletContext';

export default function DashboardLayout() {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  return (
    <WalletProvider>
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar - Desktop */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 md:ml-[72px] lg:ml-[240px] transition-all duration-300">
          <Header onQuickAddClick={() => setIsQuickAddOpen(true)} />

          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>

        {/* Mobile Bottom Nav */}
        <MobileBottomNav />

        {/* Global Modals */}
        <QuickAddModal
          isOpen={isQuickAddOpen}
          onClose={() => setIsQuickAddOpen(false)}
          onSubmit={async () => setIsQuickAddOpen(false)}
        />

        <Toaster position="top-right" richColors />
      </div>
    </WalletProvider>
  );
}