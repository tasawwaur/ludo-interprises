import { getMatchSummaries, MatchSummary } from './match-summary';

const STORAGE_HISTORY_KEY = 'ludo_2p_match_history_v1';

export const getMatchHistory = (playerId: string): MatchSummary[] => {
  return getMatchSummaries().filter(
    (s) => s.winnerId === playerId || s.loserId === playerId
  );
};

export const clearMatchHistory = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_HISTORY_KEY);
  }
};

export const getRecentMatches = (playerId: string, limit: number = 10): MatchSummary[] => {
  return getMatchHistory(playerId)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, limit);
};
