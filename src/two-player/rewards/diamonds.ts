import { useUserStore } from '../../user/user.store';

export const grantDiamonds = (amount: number): void => {
  const { updateUser, user } = useUserStore.getState();
  if (user) {
    updateUser({ gems: (user.gems ?? 0) + amount });
  }
};

export const deductDiamonds = (amount: number): boolean => {
  const { updateUser, user } = useUserStore.getState();
  if (!user || (user.gems ?? 0) < amount) return false;
  updateUser({ gems: (user.gems ?? 0) - amount });
  return true;
};

// Bonus diamond reward for ranked wins
export const grantRankedWinDiamonds = (fee: number): number => {
  const bonus = fee >= 2000 ? 5 : fee >= 1000 ? 3 : fee >= 500 ? 2 : 1;
  grantDiamonds(bonus);
  return bonus;
};
