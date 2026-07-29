import { TokenState, PlayerColor } from '../two-player.types';

// Count how many tokens are in home for a given player
export const countTokensHome = (tokens: TokenState[], color: PlayerColor): number =>
  tokens.filter((t) => t.color === color && t.isHome).length;

// Payout calculation: winner takes both entry fees minus 5% platform cut
export const calculatePayout = (entryFeePerPlayer: number): number => {
  const total = entryFeePerPlayer * 2;
  const cut = Math.floor(total * 0.05);
  return total - cut;
};

// XP earned scales with match duration
export const calculateXpFromDuration = (durationSecs: number): number => {
  const base = 50;
  const bonus = Math.min(Math.floor(durationSecs / 60) * 10, 100);
  return base + bonus;
};
