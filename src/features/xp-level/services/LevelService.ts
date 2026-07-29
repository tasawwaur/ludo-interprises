import { useLevelStore } from '../store/level.store';
import { getTitleForLevel } from '../utils/level';

export const LevelService = {
  syncLocalXPState: () => {
    const { syncWithUserStore } = useLevelStore.getState();
    syncWithUserStore();
  },

  getLevelTitle: (level: number): string => {
    return getTitleForLevel(level);
  },

  getCurrentLevelState: () => {
    return useLevelStore.getState().levelState;
  },
};
export default LevelService;
