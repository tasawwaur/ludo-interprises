import { getMatchHistory } from './history';

export interface PlayerStatistics {
  playerId: string;
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  totalCoinsWon: number;
  totalXpEarned: number;
  avgMatchDurationSecs: number;
}

export const computeStatistics = (playerId: string): PlayerStatistics => {
  const history = getMatchHistory(playerId);

  const wins = history.filter((m) => m.winnerId === playerId).length;
  const losses = history.filter((m) => m.loserId === playerId).length;
  const totalMatches = history.length;
  const totalCoinsWon = history
    .filter((m) => m.winnerId === playerId)
    .reduce((sum, m) => sum + m.coinsWon, 0);
  const totalXpEarned = history.reduce((sum, m) => sum + m.xpEarned, 0);
  const avgMatchDurationSecs =
    totalMatches > 0
      ? Math.round(history.reduce((sum, m) => sum + m.durationSecs, 0) / totalMatches)
      : 0;

  return {
    playerId,
    totalMatches,
    wins,
    losses,
    winRate: totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0,
    totalCoinsWon,
    totalXpEarned,
    avgMatchDurationSecs,
  };
};
