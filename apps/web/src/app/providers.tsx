'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { WalletProvider } from './context/WalletContext';
import { AuthProvider } from './context/AuthProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
          mutations: {
            onError: (err: any) => {
              // Global 401 handler — redirect to login
              if (err?.status === 401) {
                if (typeof window !== 'undefined' && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/onboarding')) {
                  window.location.href = '/login';
                }
                return;
              }
              // 409 Conflict — duplicate idempotency request
              if (err?.status === 409) {
                toast.error('Yêu cầu trùng lặp — giao dịch đã được xử lý trước đó');
                return;
              }
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WalletProvider>
          {children}
        </WalletProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}