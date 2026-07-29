import React from 'react';

export const Winners: React.FC = () => {
  return (
    <div className="bg-purple-950/50 border border-purple-800/60 rounded-3xl p-4 flex flex-col gap-3 shadow-inner">
      <span className="text-[10px] font-black text-amber-200 uppercase tracking-wider block">Recent Champions</span>
      <div className="flex justify-between items-center bg-black/20 p-2.5 rounded-xl border border-purple-900/10">
        <div className="flex items-center gap-3">
          <span className="text-xl">👑</span>
          <span className="text-xs font-black text-white">GOVIND</span>
        </div>
        <span className="text-[9px] text-amber-400 font-bold">12 Wins</span>
      </div>
    </div>
  );
};
export default Winners;
