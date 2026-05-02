'use client';

import { useBills, useCreateBill, usePayBill, useWallets } from '@/_lib/hooks/finance';
import { Bill } from '@finance/api-client';
import Decimal from 'decimal.js';
import { toast } from 'sonner';
import { BillsView } from './BillsView';

export function BillsContainer() {
  const { data: apiBills = [], isLoading } = useBills();
  const { data: wallets = [] } = useWallets();
  const createBill = useCreateBill();
  const payBill = usePayBill();

  const activeBills = apiBills.filter((b: Bill) => b.status === 'active');
  const totalMonthly = activeBills.reduce(
    (sum: Decimal, b: Bill) => sum.plus(new Decimal(b.amount || 0)),
    new Decimal(0)
  );

  const defaultWalletId = wallets[0]?.id;

  const handleAddBill = async (data: Record<string, unknown>) => {
    try {
      await createBill.mutateAsync(data);
      toast.success('Đã thêm hóa đơn');
    } catch (e: any) {
      toast.error(e?.message || 'Thêm hóa đơn thất bại');
    }
  };

  const handlePayBill = async (billId: string, amount: string) => {
    if (!defaultWalletId) {
      toast.error('Chưa có ví nào. Vui lòng tạo ví trước.');
      return;
    }
    const now = new Date();
    const periodMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    try {
      await payBill.mutateAsync({
        id: billId,
        data: {
          walletId: String(defaultWalletId),
          amount,
          paymentDate: now.toISOString().split('T')[0],
        },
      });
      toast.success('Đã thanh toán hóa đơn');
    } catch (e: any) {
      toast.error(e?.message || 'Thanh toán thất bại');
    }
  };

  return (
    <BillsView
      isLoading={isLoading}
      activeBills={activeBills}
      totalMonthly={totalMonthly}
      onAddBill={handleAddBill}
      onPayBill={handlePayBill}
      isMutating={createBill.isPending || payBill.isPending}
    />
  );
}
