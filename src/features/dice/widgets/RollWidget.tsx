import React from 'react';
import { useRoll } from '../hooks/useRoll';

export const RollWidget: React.FC = () => {
  const { stats } = useRoll();

  return (
    <div className="bg-purple-950/40 border border-purple-900/30 rounded-2xl p-3 flex justify-around text-center">
      <div className="flex flex-col">
        <span className="text-[8px] text-purple-300 font-bold uppercase tracking-wider">Total Rolls</span>
        <span className="text-sm font-black text-white">{stats.totalRolls}</span>
      </div>
      <div className="w-[1px] bg-purple-900/40 self-stretch"></div>
      <div className="flex flex-col">
        <span className="text-[8px] text-purple-300 font-bold uppercase tracking-wider">Sixes</span>
        <span className="text-sm font-black text-amber-400">{stats.sixCount}</span>
      </div>
    </div>
  );
};
export default RollWidget;
