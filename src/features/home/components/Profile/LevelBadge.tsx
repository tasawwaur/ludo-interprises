import React from 'react';

interface LevelBadgeProps {
  level?: number;
}

export const LevelBadge: React.FC<LevelBadgeProps> = ({ level = 25 }) => {
  return (
    <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-full border border-yellow-200 shadow-md flex items-center gap-1">
      <span>👑</span>
      <span>LEVEL {level}</span>
    </div>
  );
};
