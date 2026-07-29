export interface XPProgressStats {
  matchesPlayed: number;
  matchesWon: number;
  winRate: number;
  totalXpEarned: number;
  dailyGains: { day: string; amount: number }[];
}

export const fetchProgressStats = async (): Promise<XPProgressStats> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        matchesPlayed: 48,
        matchesWon: 28,
        winRate: 58,
        totalXpEarned: 4500,
        dailyGains: [
          { day: 'Mon', amount: 150 },
          { day: 'Tue', amount: 250 },
          { day: 'Wed', amount: 100 },
          { day: 'Thu', amount: 400 },
          { day: 'Fri', amount: 200 },
          { day: 'Sat', amount: 600 },
          { day: 'Sun', amount: 350 },
        ],
      });
    }, 350);
  });
};
