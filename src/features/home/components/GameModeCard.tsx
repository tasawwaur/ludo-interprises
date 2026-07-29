import React from 'react';
import { GameModeItem } from '../types/home.types';

interface GameModeCardProps {
  mode: GameModeItem;
  onClick: (modeKey: string) => void;
}

export const GameModeCard: React.FC<GameModeCardProps> = ({ mode, onClick }) => {
  const isLarge = !!mode.isHero;

  return (
    <button
      onClick={() => onClick(mode.modeKey)}
      className={`group relative ${
        isLarge ? 'h-44' : 'h-28'
      } rounded-[28px] bg-gradient-to-br ${mode.bgGradient} border-2 ${mode.borderColor} p-3.5 flex flex-col justify-between shadow-2xl hover:scale-105 active:scale-95 transition-all overflow-hidden cursor-pointer`}
    >
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>

      <div className="flex justify-between items-start">
        {mode.badgeText && (
          <span className={`${isLarge ? 'text-4xl' : 'text-2xl'} font-black ${mode.accentColor} drop-shadow-lg`}>
            {mode.badgeText}
          </span>
        )}
        {mode.isLocked && (
          <span className="text-[10px] bg-slate-950/90 text-purple-300 font-black px-2 py-0.5 rounded-full border border-purple-400/50">
            🔒 Level {mode.requiredLevel}
          </span>
        )}
        <span className={`${isLarge ? 'text-4xl' : 'text-3xl'} drop-shadow ml-auto`}>
          {mode.icon}
        </span>
      </div>

      <div className={`bg-slate-950/80 backdrop-blur-md rounded-2xl ${isLarge ? 'py-2 px-2.5' : 'py-1 px-2'} text-center border ${mode.borderColor} shadow-lg`}>
        <span className={`text-xs font-black ${mode.accentColor} block tracking-widest`}>
          {mode.title}
        </span>
        <span className="text-[10px] text-slate-200/90 font-extrabold block">
          {mode.subtitle}
        </span>
      </div>
    </button>
  );
};
