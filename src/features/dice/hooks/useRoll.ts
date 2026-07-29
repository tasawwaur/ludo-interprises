import { useRollStore } from '../store/roll.store';
import { RollService } from '../services/RollService';

export const useRoll = () => {
  const currentValue = useRollStore((s) => s.currentValue);
  const isRolling = useRollStore((s) => s.isRolling);
  const rollHistory = useRollStore((s) => s.rollHistory);
  const stats = useRollStore((s) => s.stats);
  const clearHistory = useRollStore((s) => s.clearHistory);

  return {
    currentValue,
    isRolling,
    rollHistory,
    stats,
    rollActiveDice: RollService.rollActiveDice,
    clearHistory,
  };
};
export default useRoll;
