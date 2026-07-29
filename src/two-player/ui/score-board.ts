export interface ScoreBoardEntry {
  playerId: string;
  displayName: string;
  tokensHome: number;
  coinsAtStake: number;
}

export const buildScoreBoard = (
  entries: Omit<ScoreBoardEntry, never>[]
): ScoreBoardEntry[] => {
  return [...entries].sort((a, b) => b.tokensHome - a.tokensHome);
};
