import { useUpgradeStore } from '../store/upgrade.store';
import { UpgradeService } from '../services/UpgradeService';

export const useUpgrade = () => {
  const stats = useUpgradeStore((s) => s.stats);

  return {
    stats,
    upgradeDice: UpgradeService.upgradeDice,
  };
};
export default useUpgrade;
