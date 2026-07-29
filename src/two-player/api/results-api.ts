import { buildMatchSummary, saveMatchSummary, getMatchSummaries, MatchSummary } from '../results/match-summary';

export const resultsApi = {
  save: (
    matchId: string,
    winnerId: string,
    loserId: string,
    entryFee: number,
    durationSecs: number
  ): MatchSummary => {
    const summary = buildMatchSummary(matchId, winnerId, loserId, entryFee, durationSecs);
    saveMatchSummary(summary);
    return summary;
  },

  getAll: (): MatchSummary[] => getMatchSummaries(),

  getById: (matchId: string): MatchSummary | undefined =>
    getMatchSummaries().find((s) => s.matchId === matchId),
};
