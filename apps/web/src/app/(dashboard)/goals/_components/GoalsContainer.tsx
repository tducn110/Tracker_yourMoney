'use client';

import { useGoals, useCreateGoal, useContributeGoal, useWallets } from '@/_lib/hooks/finance';
import { Goal } from '@finance/api-client';
import Decimal from 'decimal.js';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { GoalsView } from './GoalsView';

export function GoalsContainer() {
  const { data: apiGoals = [], isLoading } = useGoals();
  const { data: wallets = [] } = useWallets();
  const createGoal = useCreateGoal();
  const contributeGoal = useContributeGoal();

  const activeGoals = apiGoals.filter((g: Goal) => g.status === 'active');
  const completedGoals = apiGoals.filter((g: Goal) => g.status === 'completed');

  const defaultWalletId = wallets[0]?.id;

  const handleGoalClick = (goal: Goal) => {
    const currentSaved = new Decimal(goal.currentSaved || 0).toNumber();
    const targetAmount = new Decimal(goal.targetAmount || 1).toNumber();
    const progress = (currentSaved / targetAmount) * 100;

    if (progress >= 100) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const handleAddGoal = async (data: Record<string, unknown>) => {
    try {
      await createGoal.mutateAsync(data);
      toast.success('Đã thêm mục tiêu');
    } catch (e: any) {
      toast.error(e?.message || 'Thêm mục tiêu thất bại');
    }
  };

  const handleContribute = async (goalId: string, amount: string) => {
    if (!defaultWalletId) {
      toast.error('Chưa có ví nào. Vui lòng tạo ví trước.');
      return;
    }
    try {
      await contributeGoal.mutateAsync({
        id: goalId,
        data: {
          walletId: String(defaultWalletId),
          amount,
        },
      });
      toast.success('Đã đóng góp vào mục tiêu');
    } catch (e: any) {
      toast.error(e?.message || 'Đóng góp thất bại');
    }
  };

  return (
    <GoalsView
      isLoading={isLoading}
      activeGoals={activeGoals}
      completedGoals={completedGoals}
      onGoalClick={handleGoalClick}
      onAddGoal={handleAddGoal}
      onContribute={handleContribute}
      isMutating={createGoal.isPending || contributeGoal.isPending}
    />
  );
}
