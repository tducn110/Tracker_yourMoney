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
 */

import { QuickAddSection }         from '@/components/quick-add/QuickAddSection';
import { OverviewSummaryCard }     from '@/components/dashboard/OverviewSummaryCard';
import { BudgetGrid }              from '@/components/budgets/BudgetGrid';
import { DashboardGoalsCard }      from '@/components/dashboard/DashboardGoalsCard';
import { RecentTransactionsCard }  from '@/components/dashboard/RecentTransactionsCard';
import { UpcomingBillsCard }       from '@/components/dashboard/UpcomingBillsCard';

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