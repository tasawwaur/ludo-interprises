import { create } from 'zustand';
import { Quest, XPHistoryEntry } from '../types/xp.types';
import { INITIAL_QUESTS } from '../constants/xp.constants';

interface XPState {
  quests: Quest[];
  xpHistory: XPHistoryEntry[];
  
  // Actions
  addXpHistoryEntry: (entry: Omit<XPHistoryEntry, 'id' | 'timestamp'>) => void;
  updateQuestProgress: (questId: string, progressDelta: number) => void;
  claimQuestReward: (questId: string) => { xp: number; coins: number; gems: number } | null;
  resetQuests: () => void;
}

const STORAGE_QUESTS_KEY = 'ludo_quests_v1';
const STORAGE_HISTORY_KEY = 'ludo_xp_history_v1';

const getInitialQuests = (): Quest[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_QUESTS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse quests from localStorage', e);
      }
    }
  }
  return INITIAL_QUESTS;
};

const getInitialHistory = (): XPHistoryEntry[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_HISTORY_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse history from localStorage', e);
      }
    }
  }
  return [
    { id: 'h_1', amount: 350, source: 'MATCH_WIN', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), details: 'Classic match win' },
    { id: 'h_2', amount: 100, source: 'BONUS_XP', timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), details: 'First win of the day' },
  ];
};

export const useXPStore = create<XPState>((set, get) => ({
  quests: getInitialQuests(),
  xpHistory: getInitialHistory(),

  addXpHistoryEntry: (entry) => {
    const newEntry: XPHistoryEntry = {
      ...entry,
      id: `h_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    set((state) => {
      const updatedHistory = [newEntry, ...state.xpHistory];
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(updatedHistory));
      }
      return { xpHistory: updatedHistory };
    });
  },

  updateQuestProgress: (questId, progressDelta) => {
    set((state) => {
      const updatedQuests = state.quests.map((q) => {
        if (q.id !== questId || q.isClaimed) return q;
        const newCount = Math.min(q.targetCount, q.currentCount + progressDelta);
        const isCompleted = newCount >= q.targetCount;
        return {
          ...q,
          currentCount: newCount,
          isCompleted,
        };
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_QUESTS_KEY, JSON.stringify(updatedQuests));
      }
      return { quests: updatedQuests };
    });
  },

  claimQuestReward: (questId) => {
    let rewards = null;
    set((state) => {
      const targetQuest = state.quests.find((q) => q.id === questId);
      if (!targetQuest || !targetQuest.isCompleted || targetQuest.isClaimed) {
        return {};
      }

      rewards = {
        xp: targetQuest.xpReward,
        coins: targetQuest.coinReward || 0,
        gems: targetQuest.gemReward || 0,
      };

      const updatedQuests = state.quests.map((q) => {
        if (q.id === questId) {
          return { ...q, isClaimed: true };
        }
        return q;
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_QUESTS_KEY, JSON.stringify(updatedQuests));
      }

      return { quests: updatedQuests };
    });

    return rewards;
  },

  resetQuests: () => {
    set({ quests: INITIAL_QUESTS });
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_QUESTS_KEY, JSON.stringify(INITIAL_QUESTS));
    }
  },
}));
