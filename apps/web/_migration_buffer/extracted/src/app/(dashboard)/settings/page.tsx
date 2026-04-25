'use client';

import { useState } from 'react';
import { User, Bell, Shield, DollarSign, Save } from 'lucide-react';
import { mockUser, formatVND } from '../../data/mockData';
import { Button } from '../../_components/ui/button';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [emergencyBuffer, setEmergencyBuffer] = useState(1500000);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  const handleSave = () => {
    toast.success('Đã lưu cài đặt thành công!');
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cài Đặt</h1>
        <p className="text-sm text-gray-600 mt-1">Quản lý tài khoản và tùy chỉnh ứng dụng</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl mb-4">
                {mockUser.fullName.charAt(0)}
              </div>
              <h3 className="font-bold text-gray-800">{mockUser.fullName}</h3>
              <p className="text-sm text-gray-600 mt-1">{mockUser.email}</p>
              <Button variant="outline" className="mt-4 w-full">
                Đổi Ảnh Đại Diện
              </Button>
            </div>
          </div>
        </div>

        {/* Settings Panels */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <User size={20} className="text-gray-600" />
              <h2 className="font-bold text-gray-800">Thông tin tài khoản</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                <input
                  type="text"
                  defaultValue={mockUser.fullName}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  defaultValue={mockUser.email}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Financial Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign size={20} className="text-gray-600" />
              <h2 className="font-bold text-gray-800">Cài đặt tài chính</h2>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quỹ dự phòng khẩn cấp
              </label>
              <input
                type="text"
                value={formatVND(emergencyBuffer)}
                onChange={(e) => {
                  const val = parseInt(e.target.value.replace(/\D/g, '') || '0');
                  setEmergencyBuffer(val);
                }}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">Số tiền dự phòng sẽ được trừ vào S2S</p>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell size={20} className="text-gray-600" />
              <h2 className="font-bold text-gray-800">Thông báo</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">Email notifications</p>
                  <p className="text-sm text-gray-600">Nhận thông báo qua email</p>
                </div>
                <button
                  onClick={() => setEmailNotifications(!emailNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">Push notifications</p>
                  <p className="text-sm text-gray-600">Nhận thông báo trên thiết bị</p>
                </div>
                <button
                  onClick={() => setPushNotifications(!pushNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    pushNotifications ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      pushNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <Button onClick={handleSave} className="w-full">
            <Save size={16} className="mr-2" />
            Lưu Thay Đổi
          </Button>
        </div>
      </div>
    </div>
  );
}
