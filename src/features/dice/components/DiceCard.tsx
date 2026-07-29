import React from 'react';
import { DiceItem } from '../types/dice.types';
import { getRarityConfig } from '../utils/dice';
import { formatMultiplier } from '../utils/formatter';

interface DiceCardProps {
  dice: DiceItem;
  isEquipped: boolean;
  onEquip?: () => void;
  onUnlock?: () => void;
  onUpgrade?: () => void;
  onFavorite?: () => void;
  userCoins: number;
}

export const DiceCard: React.FC<DiceCardProps> = ({
  dice,
  isEquipped,
  onEquip,
  onUnlock,
  onUpgrade,
  onFavorite,
  userCoins,
}) => {
  const rarity = getRarityConfig(dice.rarity);
  const upgradeCost = dice.level * 1500;
  const canAffordUpgrade = userCoins >= upgradeCost;

  return (
    <div
      className={`relative rounded-3xl border-2 p-4 flex flex-col gap-3 transition-all ${
        isEquipped
          ? 'bg-gradient-to-br from-amber-500/20 via-purple-900/60 to-amber-500/20 border-amber-400 shadow-[0_0_15px_rgba(255,193,7,0.35)]'
          : 'bg-purple-950/80 border-purple-500/20 hover:border-purple-400'
      }`}
    >
      {/* Top Ornate Glow Line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-[1px] bg-gradient-to-r from-transparent via-amber-400 to-transparent blur-[0.5px]"></div>

      {/* Rarity & Favorite */}
      <div className="flex justify-between items-center">
        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-black/40 border ${rarity.color}`}>
          {rarity.label}
        </span>
        <button
          onClick={onFavorite}
          className="text-sm hover:scale-110 active:scale-90 transition-transform"
        >
          {dice.isFavorite ? '❤️' : '🤍'}
        </button>
      </div>

      {/* Dice Face Preview & Name */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-purple-500/30 flex items-center justify-center text-3xl shadow-inner relative">
          {/* Animated Glow on Equip */}
          {isEquipped && (
            <div className="absolute inset-0 rounded-2xl border-2 border-amber-400 animate-pulse opacity-60"></div>
          )}
          🎲
        </div>
        <div>
          <h4 className="text-xs font-black text-white">{dice.name}</h4>
          <span className="text-[8px] text-amber-300 font-bold block mt-0.5">Lv. {dice.level} / {dice.maxLevel}</span>
        </div>
      </div>

      {/* Attributes stats bar */}
      <div className="flex flex-col gap-1.5 bg-black/30 p-2 rounded-xl border border-purple-900/20">
        <div className="flex justify-between text-[8px] font-bold text-purple-200">
          <span>{dice.attributes.rollModifier.name}</span>
          <span className="text-amber-300">{dice.attributes.rollModifier.value}%</span>
        </div>
        <div className="flex justify-between text-[8px] font-bold text-purple-200">
          <span>Gold Multiplier</span>
          <span className="text-amber-300">{formatMultiplier(dice.attributes.goldBonus.value)}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-auto pt-2">
        {!dice.isUnlocked ? (
          <button
            onClick={onUnlock}
            className="w-full py-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-[9px] font-black uppercase rounded-xl shadow hover:brightness-110 active:scale-95 transition-all"
          >
            UNLOCK {dice.cost.coins ? `🪙 ${dice.cost.coins}` : `💎 ${dice.cost.gems}`}
          </button>
        ) : (
          <div className="flex gap-2">
            {isEquipped ? (
              <span className="flex-1 text-center py-2 bg-green-500/10 border border-green-500/30 text-green-400 text-[9px] font-black uppercase rounded-xl">
                EQUIPPED ✓
              </span>
            ) : (
              <button
                onClick={onEquip}
                className="flex-1 py-2 bg-purple-900/60 border border-purple-800/40 hover:bg-purple-800 text-white text-[9px] font-black uppercase rounded-xl active:scale-95 transition-all"
              >
                EQUIP
              </button>
            )}

            {dice.level < dice.maxLevel && (
              <button
                onClick={onUpgrade}
                disabled={!canAffordUpgrade}
                className={`px-3 py-2 text-[9px] font-black uppercase rounded-xl transition-all ${
                  canAffordUpgrade
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:brightness-110 active:scale-95'
                    : 'bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                UPGRADE
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default DiceCard;
