import React from 'react';
import { useSkins } from '../hooks/useSkins';
import { useDice } from '../hooks/useDice';

export const SkinWidget: React.FC = () => {
  const { equippedDiceId } = useDice();
  const { equippedSkins, skins } = useSkins();

  const activeSkinId = equippedSkins[equippedDiceId];
  const activeSkin = skins.find((s) => s.id === activeSkinId);

  if (!activeSkin) return null;

  return (
    <div className="flex items-center gap-3 bg-purple-950/40 border border-purple-900/30 rounded-2xl p-2.5">
      <div className="w-8 h-8 rounded-xl bg-slate-800 border border-purple-500/20 flex items-center justify-center text-xl shadow-inner">
        🎨
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] text-white font-black">{activeSkin.name}</span>
        <span className="text-[8px] text-purple-300">Equipped Custom Skin</span>
      </div>
    </div>
  );
};
export default SkinWidget;
