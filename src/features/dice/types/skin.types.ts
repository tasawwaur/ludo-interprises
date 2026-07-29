import { RarityType } from './rarity.types';

export interface DiceSkin {
  id: string;
  name: string;
  description: string;
  diceId: string;
  rarity: RarityType;
  assetPath: string; // Path to WebP dice faces
  glowColor: string; // Color scheme class for CSS glow effects
  particleEffect?: 'fire' | 'lightning' | 'sparks' | 'gold_dust';
  isUnlocked: boolean;
  cost: {
    gems?: number;
    coins?: number;
  };
}
