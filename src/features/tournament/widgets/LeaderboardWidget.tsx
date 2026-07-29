import React from 'react';

export const LeaderboardWidget: React.FC = () => {
  return (
    <div className="bg-purple-950/40 border border-purple-900/30 rounded-2xl p-3 flex justify-around text-center">
      <div className="flex flex-col">
        <span className="text-[8px] text-purple-300 font-bold uppercase tracking-wider">Tournament Rank</span>
        <span className="text-sm font-black text-white">#2</span>
      </div>
      <div className="w-[1px] bg-purple-900/40 self-stretch"></div>
      <div className="flex flex-col">
        <span className="text-[8px] text-purple-300 font-bold uppercase tracking-wider">Win Ratio</span>
        <span className="text-sm font-black text-white">75%</span>
      </div>
    </div>
  );
};
export default LeaderboardWidget;
