'use client';

import { useGoals } from '@/_lib/hooks/finance';
import { Goal } from '@finance/api-client';
import Decimal from 'decimal.js';
import confetti from 'canvas-confetti';
import { GoalsView } from './GoalsView';

export function GoalsContainer() {
  const { data: apiGoals = [], isLoading } = useGoals();

  const activeGoals = apiGoals.filter((g: Goal) => g.status === 'active');
  const completedGoals = apiGoals.filter((g: Goal) => g.status === 'completed');

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

  return (
    <GoalsView
      isLoading={isLoading}
      activeGoals={activeGoals}
      completedGoals={completedGoals}
      onGoalClick={handleGoalClick}
    />
  );
}
