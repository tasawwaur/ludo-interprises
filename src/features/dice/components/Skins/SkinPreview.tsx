import React from 'react';
import { DiceSkin } from '../../types/skin.types';

interface SkinPreviewProps {
  skin: DiceSkin;
}

export const SkinPreview: React.FC<SkinPreviewProps> = ({ skin }) => {
  return (
    <div className="flex flex-col items-center p-4 bg-purple-950/20 border border-purple-900/30 rounded-2xl">
      <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center text-4xl shadow-inner border-2 border-purple-500/20 animate-pulse">
        🎨
      </div>
      <span className="text-xs font-black text-white mt-2.5">{skin.name}</span>
      {skin.particleEffect && (
        <span className="text-[8px] text-amber-300 font-bold uppercase tracking-wider mt-1">
          ✨ {skin.particleEffect.replace('_', ' ')} Effect
        </span>
      )}
    </div>
  );
};
export default SkinPreview;
