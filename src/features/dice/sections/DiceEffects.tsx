import React from 'react';
import { DiceSkin } from '../types/skin.types';
import SkinGrid from '../components/Skins/SkinGrid';

interface DiceEffectsProps {
  skins: DiceSkin[];
  equippedSkins: Record<string, string>;
  onEquipSkin?: (diceId: string, skinId: string) => void;
  onUnlockSkin?: (skinId: string) => void;
  userCoins: number;
  userGems: number;
}

export const DiceEffects: React.FC<DiceEffectsProps> = ({
  skins,
  equippedSkins,
  onEquipSkin,
  onUnlockSkin,
  userCoins,
  userGems,
}) => {
  // Classic dice skins
  const classicSkins = skins.filter((s) => s.diceId === 'dice_classic');

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-purple-950/60 border border-purple-800/40 rounded-3xl p-4 flex flex-col gap-3 shadow-md">
        <span className="text-[10px] font-black text-amber-200 uppercase tracking-wider block">Classic Dice Custom Skins</span>
        
        <SkinGrid
          skins={classicSkins}
          equippedSkinId={equippedSkins['dice_classic'] || 'skin_classic_white'}
          onEquip={(skinId) => onEquipSkin?.('dice_classic', skinId)}
          onUnlock={(skinId) => onUnlockSkin?.(skinId)}
          userCoins={userCoins}
          userGems={userGems}
        />
      </div>
    </div>
  );
};
export default DiceEffects;
