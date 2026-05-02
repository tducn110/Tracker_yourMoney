'use client';

import { useState } from 'react';
import { useUser, useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/_lib/hooks/finance';
import type { Category } from '@finance/api-client';
import { SettingsView } from './SettingsView';
import { toast } from 'sonner';

export function SettingsContainer() {
  const { data: user, isLoading } = useUser();
  const { data: categories = [], isLoading: catsLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [emergencyBuffer, setEmergencyBuffer] = useState(1500000);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  const handleSave = async () => {
    toast.success('Đã lưu cài đặt');
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
      isLoading={isLoading}
      emergencyBuffer={emergencyBuffer}
      setEmergencyBuffer={setEmergencyBuffer}
      emailNotifications={emailNotifications}
      setEmailNotifications={setEmailNotifications}
      pushNotifications={pushNotifications}
      setPushNotifications={setPushNotifications}
      onSave={handleSave}
      categories={categories}
      categoriesLoading={catsLoading}
      isMutatingCategories={createCategory.isPending || updateCategory.isPending || deleteCategory.isPending}
      onCreateCategory={handleCreateCategory}
      onUpdateCategory={handleUpdateCategory}
      onDeleteCategory={handleDeleteCategory}
    />
  );
}
