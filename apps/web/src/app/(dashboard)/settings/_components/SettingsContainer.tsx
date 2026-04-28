'use client';

import { useState } from 'react';
import { SettingsView } from './SettingsView';

const mockUser = {
  full_name: 'Người Dùng Demo',
  email: 'demo@example.com',
};

export function SettingsContainer() {
  const [emergencyBuffer, setEmergencyBuffer] = useState(1500000);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  return (
    <SettingsView
      user={mockUser}
      emergencyBuffer={emergencyBuffer}
      setEmergencyBuffer={setEmergencyBuffer}
      emailNotifications={emailNotifications}
      setEmailNotifications={setEmailNotifications}
      pushNotifications={pushNotifications}
      setPushNotifications={setPushNotifications}
    />
  );
}
