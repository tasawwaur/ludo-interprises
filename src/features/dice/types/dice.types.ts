import { RarityType } from './rarity.types';

export interface DiceAttribute {
  name: string;
  value: number;
  maxValue: number;
}

export interface DiceItem {
  id: string;
  name: string;
  description: string;
  rarity: RarityType;
  level: number;
  maxLevel: number;
  isUnlocked: boolean;
  isEquipped: boolean;
  isFavorite: boolean;
  cost: {
    coins?: number;
    gems?: number;
  };
  attributes: {
    rollModifier: DiceAttribute;  // e.g. Lucky chance
    goldBonus: DiceAttribute;     // e.g. Extra coins won
    xpBonus: DiceAttribute;       // e.g. Extra XP won
  };
  visualEffectId: string;
  soundEffectId: string;
  skinId: string;
}
