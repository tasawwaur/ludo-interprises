import { useUserStore } from '../../user/user.store';

const XP_PER_MATCH_WIN = 50;
const XP_PER_MATCH_LOSS = 20;
const XP_PER_CAPTURE = 5;

export const grantXp = (amount: number): void => {
  const { updateUser, user } = useUserStore.getState();
  if (user) {
    updateUser({ xp: (user.xp ?? 0) + amount });
  }
};

export const computeMatchXp = (won: boolean, captures: number): number => {
  const base = won ? XP_PER_MATCH_WIN : XP_PER_MATCH_LOSS;
  return base + captures * XP_PER_CAPTURE;
};

export const grantMatchXp = (won: boolean, captures: number): number => {
  const xp = computeMatchXp(won, captures);
  grantXp(xp);
  return xp;
};
