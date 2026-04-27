'use client';

import { useBills } from '@/_lib/hooks/finance';
import { Bill } from '@finance/api-client';
import Decimal from 'decimal.js';
import { BillsView } from './BillsView';

export function BillsContainer() {
  const { data: apiBills = [], isLoading } = useBills();

  const activeBills = apiBills.filter((b: Bill) => b.status === 'active');
  const totalMonthly = activeBills.reduce(
    (sum: Decimal, b: Bill) => sum.plus(new Decimal(b.amount || 0)),
    new Decimal(0)
  );

  return (
    <BillsView
      isLoading={isLoading}
      activeBills={activeBills}
      totalMonthly={totalMonthly}
    />
  );
}
