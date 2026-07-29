import React from 'react';
import { DiceSkin } from '../../types/skin.types';
import SkinCard from './SkinCard';

interface SkinGridProps {
  skins: DiceSkin[];
  equippedSkinId: string;
  onEquip?: (skinId: string) => void;
  onUnlock?: (skinId: string) => void;
  userCoins: number;
  userGems: number;
}

export const SkinGrid: React.FC<SkinGridProps> = ({
  skins,
  equippedSkinId,
  onEquip,
  onUnlock,
  userCoins,
  userGems,
}) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {skins.map((skin) => (
        <SkinCard
          key={skin.id}
          skin={skin}
          isEquipped={skin.id === equippedSkinId}
          onEquip={() => onEquip?.(skin.id)}
          onUnlock={() => onUnlock?.(skin.id)}
          userCoins={userCoins}
          userGems={userGems}
        />
      ))}
    </div>
  );
};
export default SkinGrid;
