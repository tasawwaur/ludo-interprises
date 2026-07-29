import { MatchSummary, getMatchSummaries } from './match-summary';

export interface WinnerRecord {
  playerId: string;
  matchId: string;
  coinsWon: number;
  xpEarned: number;
  celebrationShown: boolean;
}

export const buildWinnerRecord = (summary: MatchSummary): WinnerRecord => ({
  playerId: summary.winnerId,
  matchId: summary.matchId,
  coinsWon: summary.coinsWon,
  xpEarned: summary.xpEarned,
  celebrationShown: false,
});

export const getWinnerForMatch = (matchId: string): WinnerRecord | null => {
  const summary = getMatchSummaries().find((s) => s.matchId === matchId);
  if (!summary) return null;
  return buildWinnerRecord(summary);
};
