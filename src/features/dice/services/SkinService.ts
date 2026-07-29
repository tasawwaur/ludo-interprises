import { useSkinsStore } from '../store/skins.store';

export const SkinService = {
  unlockSkin: (skinId: string): boolean => {
    return useSkinsStore.getState().unlockSkin(skinId);
  },

  equipSkin: (diceId: string, skinId: string): boolean => {
    return useSkinsStore.getState().equipSkin(diceId, skinId);
  },

  getEquippedSkinForDice: (diceId: string): string => {
    const { equippedSkins } = useSkinsStore.getState();
    return equippedSkins[diceId] || 'skin_classic_white';
  },
};
export default SkinService;
