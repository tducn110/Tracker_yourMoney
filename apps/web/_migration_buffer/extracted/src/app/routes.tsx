import { createBrowserRouter } from 'react-router';
import React from 'react';
import DashboardLayout from './(dashboard)/layout';
import DashboardPage from './(dashboard)/page';
import Login from './(auth)/login/page';
import Register from './(auth)/register/page';
import BudgetsPage from './(dashboard)/budgets/page';
import BudgetDetailPage from './(dashboard)/budgets/detail';
import TransactionsPage from './(dashboard)/transactions/page';
import GoalsPage from './pages/Goals';
import BillsPage from './pages/Bills';
import AnalyticsPage from './pages/Analytics';
import SettingsPage from './pages/Settings';
import WalletsPage from './(dashboard)/wallets/page';

// ─── Page Wrappers (consistent padding) ───────────────────────────────────────
function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4 md:p-6 pb-20 max-w-[1200px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
      {children}
    </div>
  );
}

function WrappedGoals() {
  return <PageWrapper><GoalsPage /></PageWrapper>;
}
function WrappedBills() {
  return <PageWrapper><BillsPage /></PageWrapper>;
}
function WrappedAnalytics() {
  return <PageWrapper><AnalyticsPage /></PageWrapper>;
}
function WrappedSettings() {
  return <PageWrapper><SettingsPage /></PageWrapper>;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/register',
    Component: Register,
  },
  {
    path: '/',
    Component: DashboardLayout,
    children: [
      {
        index: true,
        Component: DashboardPage,
      },
      {
        path: 'transactions',
        Component: TransactionsPage,
      },
      {
        path: 'budgets',
        Component: BudgetsPage,
      },
      {
        path: 'budgets/:id',
        Component: BudgetDetailPage,
      },
      {
        path: 'goals',
        Component: WrappedGoals,
      },
      {
        path: 'bills',
        Component: WrappedBills,
      },
      {
        path: 'analytics',
        Component: WrappedAnalytics,
      },
      {
        path: 'settings',
        Component: WrappedSettings,
      },
      {
        path: 'wallets',
        Component: WalletsPage,
      },
    ],
  },
]);