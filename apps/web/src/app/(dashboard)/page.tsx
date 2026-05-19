'use client';

/**
 * Dashboard Page — Finance Tracker V3
 * Layout (8px grid):
 *   1. Quick Input (expense/income)
 *   2. Overview Summary (income / expense / wallet) — 3 stats
 *   3. Budget Featured (summary + 1 featured budget + create CTA)
 *   4. TopGoals Section
 *   5. Transactions (2/3) + Bills (1/3)
 *
 * Removed: MultiWalletStrip (ví lớn)
 *
 * All card components are code-split via next/dynamic to reduce the
 * initial JS bundle.  Each card shows in its own Suspense boundary
 * so a slow card never blocks a fast one.
 */

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// ── Card skeleton ────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border bg-white p-4 md:p-6">
      <div className="h-5 w-1/3 rounded bg-gray-200" />
      <div className="mt-3 h-8 w-1/2 rounded bg-gray-100" />
    </div>
  );
}

// ── Dynamic imports ──────────────────────────────────────────────────
const QuickAddSection = dynamic(
  () => import('@/components/quick-add/QuickAddSection').then((m) => ({ default: m.QuickAddSection })),
  { ssr: false, loading: () => <CardSkeleton /> },
);

const OverviewSummaryCard = dynamic(
  () => import('@/components/dashboard/OverviewSummaryCard').then((m) => ({ default: m.OverviewSummaryCard })),
  { ssr: false, loading: () => <CardSkeleton /> },
);

const BudgetGrid = dynamic(
  () => import('@/components/budgets/BudgetGrid').then((m) => ({ default: m.BudgetGrid })),
  { ssr: false, loading: () => <CardSkeleton /> },
);

const DashboardGoalsCard = dynamic(
  () => import('@/components/dashboard/DashboardGoalsCard').then((m) => ({ default: m.DashboardGoalsCard })),
  { ssr: false, loading: () => <CardSkeleton /> },
);

const RecentTransactionsCard = dynamic(
  () => import('@/components/dashboard/RecentTransactionsCard').then((m) => ({ default: m.RecentTransactionsCard })),
  { ssr: false, loading: () => <CardSkeleton /> },
);

const UpcomingBillsCard = dynamic(
  () => import('@/components/dashboard/UpcomingBillsCard').then((m) => ({ default: m.UpcomingBillsCard })),
  { ssr: false, loading: () => <CardSkeleton /> },
);

// ── Page ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
  return (
    <div className="p-4 md:p-6 pb-24 max-w-[1200px] mx-auto space-y-6">
      {/* ═══ 1. Quick Input (AI Chat + Nhập tay) ═══ */}
      <QuickAddSection />

      {/* ═══ 2. Overview — Thu nhập / Chi tiêu / Ví ═══*/}
      <OverviewSummaryCard />

      {/* ═══ 3. Budget Grid (one featured card) ═══ */}
      <BudgetGrid />

      {/* ═══ 4. Transactions + Upcoming Bills ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RecentTransactionsCard />
        </div>
        <div>
          <UpcomingBillsCard />
        </div>
      </div>

      {/* ═══ 5. TopGoals ═══ */}
      <DashboardGoalsCard />
    </div>
  );
}
