import { Suspense } from 'react';
import { GoalsContainer } from './_components/GoalsContainer';

export default function GoalsPage() {
  return (
    <Suspense fallback={<div className="p-6">Đang tải mục tiêu...</div>}>
      <GoalsContainer />
    </Suspense>
  );
}
