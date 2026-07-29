import { create } from 'zustand';
import { DiceSkin } from '../types/skin.types';
import { INITIAL_DICE_SKINS } from '../constants/skins.constants';
import { useUserStore } from '../../../user/user.store';

interface SkinsState {
  skins: DiceSkin[];
  equippedSkins: Record<string, string>; // Maps diceId to skinId

  // Actions
  unlockSkin: (skinId: string) => boolean;
  equipSkin: (diceId: string, skinId: string) => boolean;
}

const STORAGE_SKINS_LIST = 'ludo_dice_skins_list_v1';
const STORAGE_EQUIPPED_SKINS = 'ludo_equipped_skins_map_v1';

const getInitialSkins = (): DiceSkin[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_SKINS_LIST);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
  }
  return INITIAL_DICE_SKINS;
};

const getInitialEquippedSkins = (): Record<string, string> => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_EQUIPPED_SKINS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
  }
  return {
    dice_classic: 'skin_classic_white',
  };
};

export const useSkinsStore = create<SkinsState>((set, get) => ({
  skins: getInitialSkins(),
  equippedSkins: getInitialEquippedSkins(),

  unlockSkin: (skinId) => {
    const { skins } = get();
    const userStore = useUserStore.getState();
    const user = userStore.user;
    if (!user) return false;

    const targetSkin = skins.find((s) => s.id === skinId);
    if (!targetSkin || targetSkin.isUnlocked) return false;

    const costCoins = targetSkin.cost.coins || 0;
    const costGems = targetSkin.cost.gems || 0;

    if (user.coins < costCoins || user.gems < costGems) {
      return false; // Insufficient funds
    }

    userStore.updateUser({
      coins: user.coins - costCoins,
      gems: user.gems - costGems,
    });

    const updated = skins.map((s) => {
      if (s.id === skinId) {
        return { ...s, isUnlocked: true };
      }
      return s;
    });

    set({ skins: updated });
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_SKINS_LIST, JSON.stringify(updated));
    }
    return true;
  },

  equipSkin: (diceId, skinId) => {
    const { skins, equippedSkins } = get();
    const targetSkin = skins.find((s) => s.id === skinId);
    if (!targetSkin || !targetSkin.isUnlocked || targetSkin.diceId !== diceId) {
      return false;
    }

    const nextEquipped = {
      ...equippedSkins,
      [diceId]: skinId,
    };

    set({ equippedSkins: nextEquipped });
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_EQUIPPED_SKINS, JSON.stringify(nextEquipped));
    }
    return true;
  },
}));
