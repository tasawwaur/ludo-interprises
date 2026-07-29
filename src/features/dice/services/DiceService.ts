import { useDiceStore } from '../store/dice.store';

export const DiceService = {
  unlockDice: (diceId: string): boolean => {
    return useDiceStore.getState().unlockDice(diceId);
  },

  equipDice: (diceId: string): boolean => {
    return useDiceStore.getState().equipDice(diceId);
  },

  toggleFavorite: (diceId: string) => {
    useDiceStore.getState().toggleFavorite(diceId);
  },

  getEquippedDice: () => {
    const { diceItems, equippedDiceId } = useDiceStore.getState();
    return diceItems.find((d) => d.id === equippedDiceId);
  },
};
export default DiceService;
