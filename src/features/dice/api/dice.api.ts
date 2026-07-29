import { DiceItem } from '../types/dice.types';
import { INITIAL_DICE_ITEMS } from '../constants/dice.constants';

export const fetchDiceItemsApi = async (): Promise<DiceItem[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(INITIAL_DICE_ITEMS);
    }, 200);
  });
};
