import { useProgressStore } from '../store/progress.store';

export const ProgressService = {
  getProgressionStats: () => {
    return useProgressStore.getState().stats;
  },
};
export default ProgressService;
