import React from 'react';
import { getTitleForLevel } from '../../utils/level';

interface NextLevelProps {
  level: number;
}

export const NextLevel: React.FC<NextLevelProps> = ({ level }) => {
  const nextLevel = level + 1;
  const nextTitle = getTitleForLevel(nextLevel);

  return (
    <div className="bg-purple-950/40 border border-purple-800/40 rounded-2xl p-3 flex items-center justify-between w-full shadow-inner">
      <div className="flex flex-col">
        <span className="text-[9px] text-purple-300 uppercase tracking-widest font-bold">Next Milestone</span>
        <span className="text-xs font-black text-white mt-0.5">Level {nextLevel}: {nextTitle}</span>
      </div>
      <div className="w-8 h-8 rounded-full bg-slate-800/80 border border-amber-400/40 flex items-center justify-center text-xs font-bold text-amber-200">
        {nextLevel}
      </div>
    </div>
  );
};
export default NextLevel;
