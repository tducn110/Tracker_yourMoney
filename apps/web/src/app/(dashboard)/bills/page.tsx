import { Suspense } from 'react';
import { BillsContainer } from './_components/BillsContainer';

export default function BillsPage() {
  return (
    <Suspense fallback={<div className="p-6">Đang tải hóa đơn định kỳ...</div>}>
      <BillsContainer />
    </Suspense>
  );
}
