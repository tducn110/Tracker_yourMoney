import { Suspense } from 'react';
import { AnalyticsContainer } from './_components/AnalyticsContainer';

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div className="p-6">Đang tải dữ liệu phân tích...</div>}>
      <AnalyticsContainer />
    </Suspense>
  );
}
