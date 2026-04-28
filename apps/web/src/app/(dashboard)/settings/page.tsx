import { Suspense } from 'react';
import { SettingsContainer } from './_components/SettingsContainer';

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-6">Đang tải cài đặt...</div>}>
      <SettingsContainer />
    </Suspense>
  );
}
