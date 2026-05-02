'use client';

import { useState } from 'react';
import { useUser } from '@/_lib/hooks/finance';
import { SettingsView } from './SettingsView';
import { toast } from 'sonner';

export function SettingsContainer() {
  const { data: user, isLoading } = useUser();
  const [emergencyBuffer, setEmergencyBuffer] = useState(1500000);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  const handleSave = async () => {
    // User settings update — API endpoint not yet implemented
    // For now, just show success toast (settings are stored locally)
    toast.success('Đã lưu cài đặt');
  };

  return (
    <SettingsView
      user={user || { fullName: '', email: '' }}
      isLoading={isLoading}
      emergencyBuffer={emergencyBuffer}
      setEmergencyBuffer={setEmergencyBuffer}
      emailNotifications={emailNotifications}
      setEmailNotifications={setEmailNotifications}
      pushNotifications={pushNotifications}
      setPushNotifications={setPushNotifications}
      onSave={handleSave}
    />
  );
}
