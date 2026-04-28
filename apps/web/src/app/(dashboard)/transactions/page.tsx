import { Suspense } from 'react';
import { TransactionsContainer } from './_components/TransactionsContainer';

export default function TransactionsPage() {
  return (
    <Suspense fallback={<div className="p-6">Đang tải lịch sử giao dịch...</div>}>
      <TransactionsContainer />
    </Suspense>
  );
}

