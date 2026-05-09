'use client';

import { useGoals, useCreateGoal, useContributeGoal, useUpdateGoal, useWallets } from '@/_lib/hooks/finance';
import type { Goal as GoalType } from '@finance/api-client';
import Decimal from 'decimal.js';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { GoalsView, type GoalStatus } from './GoalsView';

interface GoalWithMeta extends GoalType {
  status: GoalStatus;
}

export function GoalsContainer() {
  const { data: apiGoals = [], isLoading } = useGoals();
  const { data: wallets = [] } = useWallets();
  const createGoal = useCreateGoal();
  const contributeGoal = useContributeGoal();
  const updateGoal = useUpdateGoal();

  const defaultWalletId = wallets[0]?.id;

  // Compute derived state
  const goals = apiGoals as GoalWithMeta[];
  const activeGoals = goals.filter((g) => g.status === 'active');
  const completedGoals = goals.filter((g) => g.status === 'completed');

  const activeCount = activeGoals.length;
  const completedCount = completedGoals.length;

  const totalSaved = goals.reduce(
    (sum: Decimal, g: GoalType) => sum.plus(new Decimal(g.currentSaved || 0)),
    new Decimal(0)
  );

  const totalTarget = goals.reduce(
    (sum: Decimal, g: GoalType) => sum.plus(new Decimal(g.targetAmount || 0)),
    new Decimal(0)
  );

  const handleToggleStatus = (goalId: string, newStatus: GoalStatus) => {
    updateGoal.mutate({
      id: goalId,
      data: { status: newStatus },
    });
    const verb = newStatus === 'paused' ? 'tạm dừng' : 'tiếp tục';
    toast.success(`Đã ${verb} mục tiêu`);
  };

  const handleAddGoal = async (data: Record<string, unknown>) => {
    try {
      await createGoal.mutateAsync(data);
      toast.success('Đã tạo mục tiêu mới 🎯');
    } catch (e: any) {
      toast.error(e?.message || 'Tạo mục tiêu thất bại');
      throw e;
    }
  };

  const handleContribute = (goalId: string, amount: string) => {
    if (!defaultWalletId) {
      toast.error('Chưa có ví nào. Vui lòng tạo ví trước.');
      return;
    }
    contributeGoal.mutate({
      id: goalId,
      data: {
        walletId: String(defaultWalletId),
        amount,
      },
    });

    // Check if goal will be completed
    const goal = activeGoals.find(g => g.id === goalId);
    if (goal) {
      const currentSaved = new Decimal(goal.currentSaved || 0);
      const targetAmount = new Decimal(goal.targetAmount || 1);
      const newSaved = currentSaved.plus(new Decimal(amount));
      if (newSaved.gte(targetAmount)) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
  };

  return (
    <GoalsView
      isLoading={isLoading}
      goals={goals}
      activeCount={activeCount}
      completedCount={completedCount}
      totalSaved={totalSaved}
      totalTarget={totalTarget}
      onToggleStatus={handleToggleStatus}
      onAddGoal={handleAddGoal}
      onContribute={handleContribute}
      isMutating={createGoal.isPending || contributeGoal.isPending || updateGoal.isPending}
    />
  );
}
