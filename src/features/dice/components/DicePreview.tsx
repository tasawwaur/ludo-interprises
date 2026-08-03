import React from 'react';
import { DiceItem } from '../types/dice.types';
import { getRarityConfig } from '../utils/dice';
import { useSkins } from '../hooks/useSkins';
import { DiceFace } from '../../gameplay/components/DiceFace';
import FireEffect from './Effects/FireEffect';
import LightningEffect from './Effects/LightningEffect';
import GoldenEffect from './Effects/GoldenEffect';

interface DicePreviewProps {
  dice: DiceItem;
  isRolling?: boolean;
}

export const DicePreview: React.FC<DicePreviewProps> = ({ dice, isRolling = false }) => {
  const rarity = getRarityConfig(dice.rarity);
  const { equippedSkins, skins } = useSkins();

  const activeSkinId = equippedSkins[dice.id];
  const activeSkin = skins.find((s) => s.id === activeSkinId);

  // Rarity color mappings for the dice borders and face background
  const borderStyles: Record<string, string> = {
    COMMON: 'border-white/30 from-slate-700 to-slate-900',
    RARE: 'border-cyan-400/50 from-slate-800 via-cyan-950/80 to-slate-900 shadow-[0_0_15px_rgba(34,211,238,0.25)]',
    EPIC: 'border-purple-500/50 from-slate-800 via-purple-950/80 to-slate-900 shadow-[0_0_15px_rgba(168,85,247,0.25)]',
    LEGENDARY: 'border-yellow-400/60 from-slate-800 via-amber-950/85 to-slate-900 shadow-[0_0_20px_rgba(251,191,36,0.35)]',
  };

  const currentStyle = borderStyles[dice.rarity] || borderStyles.COMMON;

  // Choose the visual elements
  const renderVisualEffect = () => {
    if (!activeSkin) return null;
    if (activeSkin.particleEffect === 'fire') return <FireEffect />;
    if (activeSkin.particleEffect === 'sparks') return <LightningEffect />;
    if (activeSkin.particleEffect === 'gold_dust') return <GoldenEffect />;
    return null;
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-purple-950/30 border border-purple-900/30 rounded-3xl relative overflow-hidden shadow-inner">
      {/* Dynamic background glow based on skin */}
      <div className={`absolute w-40 h-40 rounded-full blur-3xl bg-amber-500/10 pointer-events-none animate-pulse-soft`}></div>

      {/* Rarity & Effect Overlays inside preview */}
      <div className="relative w-28 h-28 flex items-center justify-center">
        {/* Render particle animations inside */}
        {renderVisualEffect()}

        {/* Large 3D Dice */}
        <div
          className={`flex items-center justify-center select-none ${isRolling ? 'animate-spin' : 'animate-bounce'}`}
          style={{ animationDuration: isRolling ? '0.4s' : '3.5s' }}
        >
          <DiceFace value={6} size={90} diceId={dice.id} />
        </div>
      </div>

      <div className="text-center mt-4 relative z-10">
        <h3 className="text-xs font-black text-white">{dice.name}</h3>
        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-black/40 border ${rarity.color} inline-block mt-1`}>
          {rarity.label}
        </span>
        {activeSkin && (
          <span className="text-[7px] text-purple-300 font-bold block mt-1">
            Skin: <span className="text-amber-300">{activeSkin.name}</span>
          </span>
        )}
      </div>
    </div>
  );
};
export default DicePreview;
