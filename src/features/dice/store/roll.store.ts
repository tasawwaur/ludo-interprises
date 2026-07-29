import { create } from 'zustand';
import { RollResult, RollStats } from '../types/roll.types';

interface RollState {
  currentValue: number | null;
  isRolling: boolean;
  rollHistory: RollResult[];
  stats: RollStats;

  // Actions
  triggerRoll: (diceId: string, value: number, modifiers?: { name: string; value: number }[]) => void;
  clearHistory: () => void;
}

const STORAGE_ROLL_HISTORY = 'ludo_roll_history_v1';
const STORAGE_ROLL_STATS = 'ludo_roll_stats_v1';

const getInitialHistory = (): RollResult[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_ROLL_HISTORY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
  }
  return [];
};

const getInitialStats = (): RollStats => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_ROLL_STATS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
  }
  return {
    totalRolls: 0,
    sixCount: 0,
    averageValue: 0,
    frequencyDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
  };
};

export const useRollStore = create<RollState>((set, get) => ({
  currentValue: null,
  isRolling: false,
  rollHistory: getInitialHistory(),
  stats: getInitialStats(),

  triggerRoll: (diceId, value, modifiers = []) => {
    set({ isRolling: true, currentValue: null });

    // Mock roll animation delay (e.g. 500ms)
    setTimeout(() => {
      const newResult: RollResult = {
        diceId,
        value,
        isSix: value === 6,
        timestamp: new Date().toISOString(),
        modifiersApplied: modifiers,
      };

      set((state) => {
        const nextHistory = [newResult, ...state.rollHistory].slice(0, 50); // Keep last 50 rolls
        const nextTotal = state.stats.totalRolls + 1;
        const nextSixes = state.stats.sixCount + (value === 6 ? 1 : 0);
        const nextAverage = Number(
          ((state.stats.averageValue * state.stats.totalRolls + value) / nextTotal).toFixed(2)
        );

        const nextDistribution = { ...state.stats.frequencyDistribution };
        nextDistribution[value] = (nextDistribution[value] || 0) + 1;

        const nextStats = {
          totalRolls: nextTotal,
          sixCount: nextSixes,
          averageValue: nextAverage,
          frequencyDistribution: nextDistribution,
        };

        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_ROLL_HISTORY, JSON.stringify(nextHistory));
          localStorage.setItem(STORAGE_ROLL_STATS, JSON.stringify(nextStats));
        }

        return {
          currentValue: value,
          isRolling: false,
          rollHistory: nextHistory,
          stats: nextStats,
        };
      });
    }, 600);
  },

  clearHistory: () => {
    set({
      rollHistory: [],
      stats: {
        totalRolls: 0,
        sixCount: 0,
        averageValue: 0,
        frequencyDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
      },
    });
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_ROLL_HISTORY);
      localStorage.removeItem(STORAGE_ROLL_STATS);
    }
  },
}));
