import { useSkinsStore } from '../store/skins.store';
import { SkinService } from '../services/SkinService';

export const useSkins = () => {
  const skins = useSkinsStore((s) => s.skins);
  const equippedSkins = useSkinsStore((s) => s.equippedSkins);

  return {
    skins,
    equippedSkins,
    unlockSkin: SkinService.unlockSkin,
    equipSkin: SkinService.equipSkin,
    getEquippedSkinForDice: SkinService.getEquippedSkinForDice,
  };
};
export default useSkins;
