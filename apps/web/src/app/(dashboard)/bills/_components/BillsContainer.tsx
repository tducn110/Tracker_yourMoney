'use client';

import { useBills, useCreateBill, usePayBill, useWallets } from '@/_lib/hooks/finance';
import type { Bill } from '@finance/api-client';
import Decimal from 'decimal.js';
import { toast } from 'sonner';
import { BillsView } from './BillsView';

const TODAY = new Date().getDate();

export function BillsContainer() {
  const { data: apiBills = [], isLoading } = useBills();
  const { data: wallets = [] } = useWallets();
  const createBill = useCreateBill();
  const payBill = usePayBill();

  const defaultWalletId = wallets[0]?.id;

  // Compute derived state
  const paidBills = apiBills.filter((b) => b.paymentStatus === 'paid');
  const unpaidBills = apiBills.filter((b) => b.paymentStatus !== 'paid');

  const totalMonthly = apiBills.reduce(
    (sum: Decimal, b) => sum.plus(new Decimal(b.amount || 0)),
    new Decimal(0)
  );

  const paidTotal = paidBills.reduce(
    (sum: Decimal, b) => sum.plus(new Decimal(b.amount || 0)),
    new Decimal(0)
  );

  const unpaidTotal = unpaidBills.reduce(
    (sum: Decimal, b) => sum.plus(new Decimal(b.amount || 0)),
    new Decimal(0)
  );

  const overdueCount = apiBills.filter((b) => {
    return b.dueDay < TODAY && b.paymentStatus !== 'paid';
  }).length;

  const handleAddBill = async (data: Record<string, unknown>) => {
    try {
      await createBill.mutateAsync(data);
      toast.success('Đã thêm hóa đơn');
    } catch (e: any) {
      toast.error(e?.message || 'Thêm hóa đơn thất bại');
      throw e;
    }
  };

  const handlePayBill = (billId: string, amount: string) => {
    if (!defaultWalletId) {
      toast.error('Chưa có ví nào. Vui lòng tạo ví trước.');
      return;
    }
    const now = new Date();
    const paymentDate = now.toISOString().split('T')[0];
    payBill.mutate({
      id: billId,
      data: {
        walletId: String(defaultWalletId),
        amount,
        paymentDate,
      },
    });
  };

  return (
    <BillsView
      isLoading={isLoading}
      bills={apiBills}
      totalMonthly={totalMonthly}
      unpaidTotal={unpaidTotal}
      paidTotal={paidTotal}
      overdueCount={overdueCount}
      onAddBill={handleAddBill}
      onPayBill={handlePayBill}
      isMutating={createBill.isPending || payBill.isPending}
    />
  );
}
