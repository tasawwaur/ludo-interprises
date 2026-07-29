import { grantCoins, deductCoins } from '../rewards/coins';
import { grantDiamonds, grantRankedWinDiamonds } from '../rewards/diamonds';
import { grantMatchXp } from '../rewards/xp';

export const rewardsApi = {
  grantCoins: (amount: number): void => grantCoins(amount),
  deductCoins: (amount: number): boolean => deductCoins(amount),
  grantDiamonds: (amount: number): void => grantDiamonds(amount),
  grantRankedWinDiamonds: (fee: number): number => grantRankedWinDiamonds(fee),
  grantMatchXp: (won: boolean, captures: number): number => grantMatchXp(won, captures),
};
