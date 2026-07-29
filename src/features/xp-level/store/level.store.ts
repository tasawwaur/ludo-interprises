import { create } from 'zustand';
import { UserLevelState } from '../types/level.types';
import { getTitleForLevel } from '../utils/level';
import { getXpForLevel } from '../utils/calculator';
import { useUserStore } from '../../../user/user.store';

interface LevelStoreState {
  levelState: UserLevelState;
  showLevelUpModal: boolean;
  levelUpFrom: number;
  levelUpTo: number;

  // Actions
  gainXp: (amount: number, source: string) => { leveledUp: boolean; newLevel: number };
  dismissLevelUpModal: () => void;
  syncWithUserStore: () => void;
}

export const useLevelStore = create<LevelStoreState>((set, get) => ({
  levelState: {
    currentLevel: 2,
    currentXp: 450,
    xpRequiredForNextLevel: 1000,
    title: 'Token Passer',
  },
  showLevelUpModal: false,
  levelUpFrom: 1,
  levelUpTo: 2,

  syncWithUserStore: () => {
    const user = useUserStore.getState().user;
    if (user) {
      const currentLevel = user.level || 2;
      const currentXp = user.xp || 450;
      const xpRequiredForNextLevel = user.nextLevelXp || 1000;
      set({
        levelState: {
          currentLevel,
          currentXp,
          xpRequiredForNextLevel,
          title: getTitleForLevel(currentLevel),
        },
      });
    }
  },

  gainXp: (amount, source) => {
    const userStore = useUserStore.getState();
    const user = userStore.user;
    if (!user) return { leveledUp: false, newLevel: get().levelState.currentLevel };

    let leveledUp = false;
    let currentXp = (user.xp || 0) + amount;
    let currentLevel = user.level || 1;
    let nextLevelXp = user.nextLevelXp || 1000;

    const levelUpFrom = currentLevel;

    // Check if user leveled up (potentially multiple times)
    while (currentXp >= nextLevelXp) {
      currentXp -= nextLevelXp;
      currentLevel += 1;
      nextLevelXp = Math.round(500 * Math.pow(currentLevel, 1.25)); // Formula to determine next level requirements
      leveledUp = true;
    }

    // Update stores
    const updates = {
      xp: currentXp,
      level: currentLevel,
      nextLevelXp,
    };
    userStore.updateUser(updates);

    set({
      levelState: {
        currentLevel,
        currentXp,
        xpRequiredForNextLevel: nextLevelXp,
        title: getTitleForLevel(currentLevel),
      },
    });

    if (leveledUp) {
      set({
        showLevelUpModal: true,
        levelUpFrom,
        levelUpTo: currentLevel,
      });
    }

    return { leveledUp, newLevel: currentLevel };
  },

  dismissLevelUpModal: () => set({ showLevelUpModal: false }),
}));

// Auto-sync helper
if (typeof window !== 'undefined') {
  setTimeout(() => {
    useLevelStore.getState().syncWithUserStore();
  }, 100);
}
