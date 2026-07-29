import { MatchSummary } from '../results/match-summary';
import { useUserStore } from '../../user/user.store';

export interface RewardResult {
  coinsGranted: number;
  xpGranted: number;
}

export const grantMatchRewards = (
  summary: MatchSummary,
  currentUserId: string
): RewardResult => {
  const isWinner = summary.winnerId === currentUserId;
  const coinsGranted = isWinner ? summary.coinsWon : 0;
  const xpGranted = isWinner ? summary.xpEarned : 20; // consolation XP for loser

  const { updateUser, user } = useUserStore.getState();
  if (user) {
    updateUser({
      coins: (user.coins ?? 0) + coinsGranted,
      xp: (user.xp ?? 0) + xpGranted,
    });
  }

  return { coinsGranted, xpGranted };
};
