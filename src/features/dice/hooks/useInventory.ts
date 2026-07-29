import { useDice } from './useDice';
import { useSkins } from './useSkins';

export const useInventory = () => {
  const { diceItems } = useDice();
  const { skins } = useSkins();

  const ownedDice = diceItems.filter((d) => d.isUnlocked);
  const lockedDice = diceItems.filter((d) => !d.isUnlocked);
  const favoriteDice = diceItems.filter((d) => d.isFavorite);
  const ownedSkins = skins.filter((s) => s.isUnlocked);

  return {
    ownedDice,
    lockedDice,
    favoriteDice,
    ownedSkins,
  };
};
export default useInventory;
