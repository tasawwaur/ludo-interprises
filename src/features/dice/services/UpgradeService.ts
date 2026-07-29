import { useDiceStore } from '../store/dice.store';
import { useUpgradeStore } from '../store/upgrade.store';
import { registerUpgradeOnServer } from '../api';

export const UpgradeService = {
  upgradeDice: async (diceId: string): Promise<boolean> => {
    const { diceItems } = useDiceStore.getState();
    const target = diceItems.find((d) => d.id === diceId);
    if (!target) return false;

    const coinsSpent = target.level * 1500;
    
    const { upgradeDice } = useDiceStore.getState();
    const success = upgradeDice(diceId);
    if (!success) return false;

    // Register on mock server API
    const updatedDice = useDiceStore.getState().diceItems.find((d) => d.id === diceId);
    if (updatedDice) {
      await registerUpgradeOnServer(diceId, updatedDice.level);
    }

    // Save telemetry stats
    useUpgradeStore.getState().recordUpgrade(coinsSpent, 0);
    return true;
  },
};
export default UpgradeService;
