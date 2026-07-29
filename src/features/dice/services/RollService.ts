import { useRollStore } from '../store/roll.store';
import { useDiceStore } from '../store/dice.store';
import { generateRandomRoll } from '../utils/random';

export const RollService = {
  rollActiveDice: (): number => {
    const { diceItems, equippedDiceId } = useDiceStore.getState();
    const activeDice = diceItems.find((d) => d.id === equippedDiceId);

    const sixChance = activeDice ? activeDice.attributes.rollModifier.value : 16.6;
    const rolledVal = generateRandomRoll(sixChance);

    const modifiers: { name: string; value: number }[] = [];
    if (activeDice && activeDice.attributes.rollModifier.value > 16.6) {
      modifiers.push({
        name: 'Lucky Modifier',
        value: Number((activeDice.attributes.rollModifier.value - 16.6).toFixed(2)),
      });
    }

    useRollStore.getState().triggerRoll(equippedDiceId, rolledVal, modifiers);
    return rolledVal;
  },
};
export default RollService;
