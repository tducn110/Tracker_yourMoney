'use client';

import { useState, useEffect } from 'react';
import {
  useUser, useUserSettings, useUpdateUserSettings,
  useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory,
} from '@/_lib/hooks/finance';
import type { Category } from '@finance/api-client';
import { SettingsView } from './SettingsView';
import { toast } from 'sonner';

export function SettingsContainer() {
  const { data: user, isLoading } = useUser();
  const { data: settings, isLoading: settingsLoading } = useUserSettings();
  const updateSettings = useUpdateUserSettings();
  const { data: categories = [], isLoading: catsLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [emergencyBuffer, setEmergencyBuffer] = useState(0);
  const [monthlyBudget, setMonthlyBudget] = useState('0');
  const [incomeDate, setIncomeDate] = useState(1);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Sync settings from API to local state on first load
  useEffect(() => {
    if (settings && !initialized) {
      setEmergencyBuffer(parseFloat(settings.emergencyBuffer || '0'));
      setMonthlyBudget(settings.monthlyBudget || '0');
      setIncomeDate(settings.incomeDate || 1);
      setEmailNotifications(Boolean(settings.notifyEmail));
      setPushNotifications(Boolean(settings.notifyPush));
      setInitialized(true);
    }
  }, [settings, initialized]);

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync({
        emergencyBuffer: String(emergencyBuffer),
        monthlyBudget: monthlyBudget,
        incomeDate: incomeDate,
        notifyEmail: emailNotifications,
        notifyPush: pushNotifications,
      });
    } catch {
      // Toast handled in mutation onError
    }
  };

  const handleCreateCategory = async (data: { name: string; type: string; icon?: string; color?: string }) => {
    try {
      await createCategory.mutateAsync({ ...data, sortOrder: categories.length });
      toast.success(`Đã thêm danh mục "${data.name}"`);
    } catch (e: any) {
      toast.error('Lỗi: ' + (e?.message || 'Không thể tạo danh mục'));
    }
  };

  const handleUpdateCategory = async (id: number, data: { name?: string; type?: string; icon?: string; color?: string }) => {
    try {
      await updateCategory.mutateAsync({ id, data });
      toast.success('Đã cập nhật danh mục');
    } catch (e: any) {
      toast.error('Lỗi: ' + (e?.message || 'Không thể cập nhật danh mục'));
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await deleteCategory.mutateAsync(id);
      toast.success('Đã xoá danh mục');
    } catch (e: any) {
      toast.error('Lỗi: ' + (e?.message || 'Không thể xoá danh mục'));
    }
  };

  return (
    <SettingsView
      user={user || { fullName: '', email: '' }}
      isLoading={isLoading || settingsLoading}
      emergencyBuffer={emergencyBuffer}
      setEmergencyBuffer={setEmergencyBuffer}
      monthlyBudget={monthlyBudget}
      setMonthlyBudget={setMonthlyBudget}
      incomeDate={incomeDate}
      setIncomeDate={setIncomeDate}
      emailNotifications={emailNotifications}
      setEmailNotifications={setEmailNotifications}
      pushNotifications={pushNotifications}
      setPushNotifications={setPushNotifications}
      onSave={handleSave}
      isSaving={updateSettings.isPending}
      categories={categories}
      categoriesLoading={catsLoading}
      isMutatingCategories={createCategory.isPending || updateCategory.isPending || deleteCategory.isPending}
      onCreateCategory={handleCreateCategory}
      onUpdateCategory={handleUpdateCategory}
      onDeleteCategory={handleDeleteCategory}
    />
  );
}
