import React from 'react';
import { LevelBadge } from '../LevelBadge';
import { getTitleForLevel } from '../../utils/level';

interface CurrentLevelProps {
  level: number;
}

export const CurrentLevel: React.FC<CurrentLevelProps> = ({ level }) => {
  const title = getTitleForLevel(level);

  return (
    <div className="flex flex-col items-center gap-2">
      <LevelBadge level={level} size="lg" />
      <div className="text-center">
        <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider block">Current Rank</span>
        <span className="text-sm font-black text-amber-200 uppercase tracking-widest block drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
          {title}
        </span>
      </div>
    </div>
  );
};
export default CurrentLevel;
