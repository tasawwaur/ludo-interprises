import { DiceItem } from '../types/dice.types';
import { RarityType } from '../types/rarity.types';
import { RARITY_CONFIGS } from '../constants/rarity.constants';

export const getRarityConfig = (rarity: RarityType) => {
  return RARITY_CONFIGS[rarity];
};

export const filterDiceByRarity = (items: DiceItem[], rarity: RarityType): DiceItem[] => {
  return items.filter((item) => item.rarity === rarity);
};
