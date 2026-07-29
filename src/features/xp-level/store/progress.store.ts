import { create } from 'zustand';

interface DailyXPGain {
  day: string; // e.g., 'Mon', 'Tue'
  amount: number;
}

interface ProgressionStats {
  matchesPlayed: number;
  matchesWon: number;
  winRate: number;
  totalXpEarned: number;
  dailyGains: DailyXPGain[];
}

interface ProgressState {
  stats: ProgressionStats;
  addMatchResult: (won: boolean, xpEarned: number) => void;
  recordDailyXP: (amount: number) => void;
}

const STORAGE_STATS_KEY = 'ludo_progression_stats_v1';

const getInitialStats = (): ProgressionStats => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_STATS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse progression stats', e);
      }
    }
  }
  return {
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
  };
};

export const useProgressStore = create<ProgressState>((set) => ({
  stats: getInitialStats(),

  addMatchResult: (won, xpEarned) => {
    set((state) => {
      const nextMatches = state.stats.matchesPlayed + 1;
      const nextWins = state.stats.matchesWon + (won ? 1 : 0);
      const nextWinRate = Math.round((nextWins / nextMatches) * 100);
      const nextTotalXp = state.stats.totalXpEarned + xpEarned;

      const updatedStats = {
        ...state.stats,
        matchesPlayed: nextMatches,
        matchesWon: nextWins,
        winRate: nextWinRate,
        totalXpEarned: nextTotalXp,
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_STATS_KEY, JSON.stringify(updatedStats));
      }
      return { stats: updatedStats };
    });
  },

  recordDailyXP: (amount) => {
    set((state) => {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const todayName = days[new Date().getDay()];

      const dailyGains = state.stats.dailyGains.map((dg) => {
        if (dg.day === todayName) {
          return { ...dg, amount: dg.amount + amount };
        }
        return dg;
      });

      const updatedStats = {
        ...state.stats,
        dailyGains,
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_STATS_KEY, JSON.stringify(updatedStats));
      }
      return { stats: updatedStats };
    });
  },
}));
