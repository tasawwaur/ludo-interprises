export const formatRankSuffix = (rank: number): string => {
  if (rank === 1) return '1st';
  if (rank === 2) return '2nd';
  if (rank === 3) return '3rd';
  return `${rank}th`;
};

export const formatPrizeAmount = (coins?: number, gems?: number): string => {
  const parts: string[] = [];
  if (coins) parts.push(`🪙 ${coins.toLocaleString()}`);
  if (gems) parts.push(`💎 ${gems.toLocaleString()}`);
  return parts.join(' + ');
};
