import { create } from 'zustand';
import { DiceItem } from '../types/dice.types';
import { INITIAL_DICE_ITEMS } from '../constants/dice.constants';
import { useUserStore } from '../../../user/user.store';

interface DiceState {
  diceItems: DiceItem[];
  equippedDiceId: string;

  // Actions
  unlockDice: (diceId: string) => boolean;
  equipDice: (diceId: string) => boolean;
  upgradeDice: (diceId: string) => boolean;
  toggleFavorite: (diceId: string) => void;
  syncEquippedState: () => void;
}

const STORAGE_DICE_KEY = 'ludo_dice_items_v1';
const STORAGE_EQUIPPED_KEY = 'ludo_equipped_dice_v1';

const getInitialDice = (): DiceItem[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_DICE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse dice items', e);
      }
    }
  }
  return INITIAL_DICE_ITEMS;
};

const getInitialEquipped = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(STORAGE_EQUIPPED_KEY) || 'dice_classic';
  }
  return 'dice_classic';
};

export const useDiceStore = create<DiceState>((set, get) => ({
  diceItems: getInitialDice(),
  equippedDiceId: getInitialEquipped(),

  unlockDice: (diceId) => {
    const { diceItems } = get();
    const userStore = useUserStore.getState();
    const user = userStore.user;
    if (!user) return false;

    const targetDice = diceItems.find((d) => d.id === diceId);
    if (!targetDice || targetDice.isUnlocked) return false;

    const costCoins = targetDice.cost.coins || 0;
    const costGems = targetDice.cost.gems || 0;

    if (user.coins < costCoins || user.gems < costGems) {
      return false; // Insufficient funds
    }

    // Deduct cost and save
    userStore.updateUser({
      coins: user.coins - costCoins,
      gems: user.gems - costGems,
    });

    const updated = diceItems.map((d) => {
      if (d.id === diceId) {
        return { ...d, isUnlocked: true };
      }
      return d;
    });

    set({ diceItems: updated });
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_DICE_KEY, JSON.stringify(updated));
    }
    return true;
  },

  equipDice: (diceId) => {
    const { diceItems } = get();
    const target = diceItems.find((d) => d.id === diceId);
    if (!target || !target.isUnlocked) return false;

    const updated = diceItems.map((d) => ({
      ...d,
      isEquipped: d.id === diceId,
    }));

    set({ diceItems: updated, equippedDiceId: diceId });
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_DICE_KEY, JSON.stringify(updated));
      localStorage.setItem(STORAGE_EQUIPPED_KEY, diceId);
    }
    return true;
  },

  upgradeDice: (diceId) => {
    const { diceItems } = get();
    const userStore = useUserStore.getState();
    const user = userStore.user;
    if (!user) return false;

    const target = diceItems.find((d) => d.id === diceId);
    if (!target || !target.isUnlocked || target.level >= target.maxLevel) return false;

    // Cost formula for upgrade: e.g. level * 1000 coins
    const upgradeCost = target.level * 1500;
    if (user.coins < upgradeCost) return false;

    // Deduct coins
    userStore.updateUser({ coins: user.coins - upgradeCost });

    const updated = diceItems.map((d) => {
      if (d.id === diceId) {
        const nextLevel = d.level + 1;
        // Improve stats slightly
        const modifierVal = Math.min(d.attributes.rollModifier.maxValue, d.attributes.rollModifier.value + 0.4);
        const goldVal = Math.min(d.attributes.goldBonus.maxValue, d.attributes.goldBonus.value + 0.1);
        const xpVal = Math.min(d.attributes.xpBonus.maxValue, d.attributes.xpBonus.value + 0.1);

        return {
          ...d,
          level: nextLevel,
          attributes: {
            rollModifier: { ...d.attributes.rollModifier, value: Number(modifierVal.toFixed(2)) },
            goldBonus: { ...d.attributes.goldBonus, value: Number(goldVal.toFixed(2)) },
            xpBonus: { ...d.attributes.xpBonus, value: Number(xpVal.toFixed(2)) },
          },
        };
      }
      return d;
    });

    set({ diceItems: updated });
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_DICE_KEY, JSON.stringify(updated));
    }
    return true;
  },

  toggleFavorite: (diceId) => {
    const { diceItems } = get();
    const updated = diceItems.map((d) => {
      if (d.id === diceId) {
        return { ...d, isFavorite: !d.isFavorite };
      }
      return d;
    });
    set({ diceItems: updated });
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_DICE_KEY, JSON.stringify(updated));
    }
  },

  syncEquippedState: () => {
    // Ensures equipped state is correct on startup
    const activeId = get().equippedDiceId;
    const updated = get().diceItems.map((d) => ({
      ...d,
      isEquipped: d.id === activeId,
    }));
    set({ diceItems: updated });
  },
}));
