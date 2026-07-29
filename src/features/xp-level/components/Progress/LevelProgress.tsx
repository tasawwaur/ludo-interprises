import React from 'react';
import { ProgressCircle } from '../ProgressCircle';

interface LevelProgressProps {
  currentXp: number;
  requiredXp: number;
  level: number;
}

export const LevelProgress: React.FC<LevelProgressProps> = ({ currentXp, requiredXp, level }) => {
  const percent = Math.min(100, Math.max(0, Math.round((currentXp / requiredXp) * 100)));

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <ProgressCircle percent={percent} size={130} strokeWidth={8}>
        <span className="text-3xl font-black text-amber-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-sans italic">{level}</span>
        <span className="text-[9px] font-bold text-purple-300 uppercase tracking-widest mt-0.5">Level</span>
      </ProgressCircle>
    </div>
  );
};
export default LevelProgress;
