import { MatchSummary, getMatchSummaries } from './match-summary';

export interface LoserRecord {
  playerId: string;
  matchId: string;
  coinsLost: number;
  consolationXp: number;
}

export const buildLoserRecord = (summary: MatchSummary): LoserRecord => ({
  playerId: summary.loserId,
  matchId: summary.matchId,
  coinsLost: summary.coinsWon / 2, // They bet this amount
  consolationXp: 20,               // Small XP for participation
});

export const getLoserForMatch = (matchId: string): LoserRecord | null => {
  const summary = getMatchSummaries().find((s) => s.matchId === matchId);
  if (!summary) return null;
  return buildLoserRecord(summary);
};
