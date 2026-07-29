import { useDiceStore } from '../store/dice.store';
import { DiceService } from '../services/DiceService';

export const useDice = () => {
  const diceItems = useDiceStore((s) => s.diceItems);
  const equippedDiceId = useDiceStore((s) => s.equippedDiceId);

  const equippedDice = diceItems.find((d) => d.id === equippedDiceId);

  return {
    diceItems,
    equippedDiceId,
    equippedDice,
    unlockDice: DiceService.unlockDice,
    equipDice: DiceService.equipDice,
    toggleFavorite: DiceService.toggleFavorite,
  };
};
export default useDice;
