import { MatchSummary } from '../results/match-summary';

export interface ResultDialogData {
  isWinner: boolean;
  coinsChange: number;
  xpEarned: number;
  durationLabel: string;
  opponentName: string;
}

export const buildResultDialog = (
  summary: MatchSummary,
  currentUserId: string,
  opponentName: string
): ResultDialogData => {
  const isWinner = summary.winnerId === currentUserId;
  const minutes = Math.floor(summary.durationSecs / 60);
  const seconds = summary.durationSecs % 60;
  const durationLabel = `${minutes}m ${seconds}s`;

  return {
    isWinner,
    coinsChange: isWinner ? summary.coinsWon : -(summary.coinsWon / 2),
    xpEarned: summary.xpEarned,
    durationLabel,
    opponentName,
  };
};
