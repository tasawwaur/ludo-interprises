export interface MatchSummary {
  matchId: string;
  winnerId: string;
  loserId: string;
  coinsWon: number;
  xpEarned: number;
  durationSecs: number;
  completedAt: string;
}

const STORAGE_SUMMARY_KEY = 'ludo_2p_match_summary_v1';

export const saveMatchSummary = (summary: MatchSummary): void => {
  if (typeof window !== 'undefined') {
    const existing = getMatchSummaries();
    existing.push(summary);
    localStorage.setItem(STORAGE_SUMMARY_KEY, JSON.stringify(existing));
  }
};

export const getMatchSummaries = (): MatchSummary[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_SUMMARY_KEY);
    return saved ? JSON.parse(saved) : [];
  }
  return [];
};

export const buildMatchSummary = (
  matchId: string,
  winnerId: string,
  loserId: string,
  entryFee: number,
  durationSecs: number
): MatchSummary => {
  const coinsWon = entryFee * 2;
  const xpEarned = 50 + Math.floor(durationSecs / 60) * 10;

  return {
    matchId,
    winnerId,
    loserId,
    coinsWon,
    xpEarned,
    durationSecs,
    completedAt: new Date().toISOString(),
  };
};
