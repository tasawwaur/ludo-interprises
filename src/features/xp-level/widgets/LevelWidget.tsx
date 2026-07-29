import React from 'react';
import { useLevel } from '../hooks/useLevel';
import { LevelBadge } from '../components/LevelBadge';

export const LevelWidget: React.FC = () => {
  const { levelState } = useLevel();

  return (
    <div className="flex items-center gap-3 bg-purple-950/40 border border-purple-900/30 rounded-2xl p-2.5">
      <LevelBadge level={levelState.currentLevel} size="sm" />
      <div className="flex flex-col">
        <span className="text-[10px] text-amber-200 font-black tracking-wide leading-tight">{levelState.title}</span>
        <span className="text-[8px] text-purple-300">Level {levelState.currentLevel} Player</span>
      </div>
    </div>
  );
};
export default LevelWidget;
