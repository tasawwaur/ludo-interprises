import React from 'react';
import { useProgress } from '../hooks/useProgress';

export const ProgressWidget: React.FC = () => {
  const { stats } = useProgress();

  return (
    <div className="bg-purple-950/40 border border-purple-900/30 rounded-2xl p-3 flex justify-around text-center">
      <div className="flex flex-col">
        <span className="text-[8px] text-purple-300 font-bold uppercase tracking-wider">Matches</span>
        <span className="text-sm font-black text-white">{stats.matchesPlayed}</span>
      </div>
      <div className="w-[1px] bg-purple-900/40 self-stretch"></div>
      <div className="flex flex-col">
        <span className="text-[8px] text-purple-300 font-bold uppercase tracking-wider">Wins</span>
        <span className="text-sm font-black text-amber-400">{stats.matchesWon}</span>
      </div>
      <div className="w-[1px] bg-purple-900/40 self-stretch"></div>
      <div className="flex flex-col">
        <span className="text-[8px] text-purple-300 font-bold uppercase tracking-wider">Win Rate</span>
        <span className="text-sm font-black text-teal-400">{stats.winRate}%</span>
      </div>
    </div>
  );
};
export default ProgressWidget;
