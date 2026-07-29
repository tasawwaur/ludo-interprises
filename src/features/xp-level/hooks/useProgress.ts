import { useProgressStore } from '../store/progress.store';

export const useProgress = () => {
  const stats = useProgressStore((s) => s.stats);
  const addMatchResult = useProgressStore((s) => s.addMatchResult);

  return {
    stats,
    addMatchResult,
  };
};
export default useProgress;
