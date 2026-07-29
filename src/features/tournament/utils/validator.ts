import { TournamentEntryCost } from '../types/tournament.types';

export const canAffordEntry = (cost: TournamentEntryCost, userCoins: number, userGems: number): boolean => {
  if (cost.coins && userCoins < cost.coins) return false;
  if (cost.gems && userGems < cost.gems) return false;
  return true;
};
