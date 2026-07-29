import { create } from 'zustand';

interface UpgradeStats {
  totalUpgradesDone: number;
  totalGemsSpent: number;
  totalCoinsSpent: number;
}

interface UpgradeProgressState {
  stats: UpgradeStats;
  recordUpgrade: (coinsSpent: number, gemsSpent: number) => void;
}

const STORAGE_UPGRADE_STATS = 'ludo_dice_upgrade_stats_v1';

const getInitialStats = (): UpgradeStats => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_UPGRADE_STATS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
  }
  return {
    totalUpgradesDone: 0,
    totalGemsSpent: 0,
    totalCoinsSpent: 0,
  };
};

export const useUpgradeStore = create<UpgradeProgressState>((set) => ({
  stats: getInitialStats(),

  recordUpgrade: (coinsSpent, gemsSpent) => {
    set((state) => {
      const nextStats = {
        totalUpgradesDone: state.stats.totalUpgradesDone + 1,
        totalCoinsSpent: state.stats.totalCoinsSpent + coinsSpent,
        totalGemsSpent: state.stats.totalGemsSpent + gemsSpent,
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_UPGRADE_STATS, JSON.stringify(nextStats));
      }
      return { stats: nextStats };
    });
  },
}));
