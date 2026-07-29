export interface PlayerMatchStats {
  playerId: string;
  matchesPlayed: number;
  matchesWon: number;
  totalTokensCaptured: number;
  totalSixesRolled: number;
  winRate: number;
}

const STORAGE_STATS_KEY = 'ludo_2p_player_stats_v1';

export const getPlayerStats = (playerId: string): PlayerMatchStats => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_STATS_KEY);
    const all: Record<string, PlayerMatchStats> = saved ? JSON.parse(saved) : {};
    return all[playerId] ?? {
      playerId,
      matchesPlayed: 0,
      matchesWon: 0,
      totalTokensCaptured: 0,
      totalSixesRolled: 0,
      winRate: 0,
    };
  }
  return { playerId, matchesPlayed: 0, matchesWon: 0, totalTokensCaptured: 0, totalSixesRolled: 0, winRate: 0 };
};

export const updatePlayerStats = (
  playerId: string,
  won: boolean,
  captures: number,
  sixes: number
): void => {
  const stats = getPlayerStats(playerId);
  const updated: PlayerMatchStats = {
    playerId,
    matchesPlayed: stats.matchesPlayed + 1,
    matchesWon: stats.matchesWon + (won ? 1 : 0),
    totalTokensCaptured: stats.totalTokensCaptured + captures,
    totalSixesRolled: stats.totalSixesRolled + sixes,
    winRate: 0,
  };
  updated.winRate =
    updated.matchesPlayed > 0
      ? Math.round((updated.matchesWon / updated.matchesPlayed) * 100)
      : 0;

  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_STATS_KEY);
    const all: Record<string, PlayerMatchStats> = saved ? JSON.parse(saved) : {};
    all[playerId] = updated;
    localStorage.setItem(STORAGE_STATS_KEY, JSON.stringify(all));
  }
};
