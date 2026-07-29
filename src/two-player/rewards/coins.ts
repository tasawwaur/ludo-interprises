import { useUserStore } from '../../user/user.store';

export const grantCoins = (amount: number): void => {
  const { updateUser, user } = useUserStore.getState();
  if (user) {
    updateUser({ coins: (user.coins ?? 0) + amount });
  }
};

export const deductCoins = (amount: number): boolean => {
  const { updateUser, user } = useUserStore.getState();
  if (!user || (user.coins ?? 0) < amount) return false;
  updateUser({ coins: (user.coins ?? 0) - amount });
  return true;
};
