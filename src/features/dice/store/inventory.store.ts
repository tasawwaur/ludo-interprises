import { create } from 'zustand';
import { useDiceStore } from './dice.store';
import { useSkinsStore } from './skins.store';
import { DiceItem } from '../types/dice.types';
import { DiceSkin } from '../types/skin.types';

interface InventoryState {
  // Queries
  getOwnedDice: () => DiceItem[];
  getLockedDice: () => DiceItem[];
  getFavoriteDice: () => DiceItem[];
  getOwnedSkins: () => DiceSkin[];
}

export const useInventoryStore = create<InventoryState>((set) => ({
  getOwnedDice: () => {
    return useDiceStore.getState().diceItems.filter((d) => d.isUnlocked);
  },
  getLockedDice: () => {
    return useDiceStore.getState().diceItems.filter((d) => !d.isUnlocked);
  },
  getFavoriteDice: () => {
    return useDiceStore.getState().diceItems.filter((d) => d.isFavorite);
  },
  getOwnedSkins: () => {
    return useSkinsStore.getState().skins.filter((s) => s.isUnlocked);
  },
}));
