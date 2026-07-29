import React from 'react';
import { DiceSkin } from '../../types/skin.types';
import { getRarityConfig } from '../../utils/dice';

interface SkinCardProps {
  skin: DiceSkin;
  isEquipped: boolean;
  onEquip?: () => void;
  onUnlock?: () => void;
  userCoins: number;
  userGems: number;
}

export const SkinCard: React.FC<SkinCardProps> = ({
  skin,
  isEquipped,
  onEquip,
  onUnlock,
  userCoins,
  userGems,
}) => {
  const rarity = getRarityConfig(skin.rarity);
  const costCoins = skin.cost.coins || 0;
  const costGems = skin.cost.gems || 0;
  const canAfford = userCoins >= costCoins && userGems >= costGems;

  return (
    <div
      className={`relative rounded-2xl border-2 p-3 flex flex-col gap-2 transition-all ${
        isEquipped
          ? 'bg-gradient-to-br from-amber-500/10 via-purple-900/40 to-amber-500/10 border-amber-400 shadow-md'
          : 'bg-purple-950/40 border-purple-900/30'
      }`}
    >
      {/* Rarity */}
      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-black/40 border ${rarity.color} self-start`}>
        {rarity.label}
      </span>

      {/* Face & Name */}
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-purple-500/20 flex items-center justify-center text-xl shadow-inner">
          🎨
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-white">{skin.name}</span>
          <span className="text-[8px] text-purple-300 line-clamp-1">{skin.description}</span>
        </div>
      </div>

      {/* Action */}
      <div className="mt-2">
        {!skin.isUnlocked ? (
          <button
            onClick={onUnlock}
            disabled={!canAfford}
            className={`w-full py-1.5 text-[9px] font-black uppercase rounded-lg shadow-sm transition-all ${
              canAfford
                ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 active:scale-95'
                : 'bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            UNLOCK {costCoins ? `🪙 ${costCoins}` : `💎 ${costGems}`}
          </button>
        ) : isEquipped ? (
          <span className="w-full block text-center py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 text-[8px] font-black uppercase rounded-lg">
            EQUIPPED
          </span>
        ) : (
          <button
            onClick={onEquip}
            className="w-full py-1.5 bg-purple-900 border border-purple-800 hover:bg-purple-800 text-white text-[8px] font-black uppercase rounded-lg active:scale-95 transition-all"
          >
            EQUIP SKIN
          </button>
        )}
      </div>
    </div>
  );
};
export default SkinCard;
