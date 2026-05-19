'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { WalletProvider } from './context/WalletContext';
import { AuthProvider } from './context/AuthProvider';
import { pageview } from '@/_lib/gtag';

function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    const query = searchParams?.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    pageview(url);
  }, [pathname, searchParams]);

  return null;
}

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
                if (
                  typeof window !== 'undefined' &&
                  !window.location.pathname.includes('/login') &&
                  !window.location.pathname.includes('/onboarding')
                ) {
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
          <Suspense fallback={null}>
            <AnalyticsTracker />
          </Suspense>
          {children}
        </WalletProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
