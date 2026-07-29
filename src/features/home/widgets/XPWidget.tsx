import React from "react";

export const XPWidget: React.FC = () => (
  <div className="w-full bg-slate-900/80 p-3 rounded-2xl border border-slate-800/80">
    <div className="flex justify-between items-center text-xs font-bold mb-1.5">
      <span className="text-slate-400 uppercase tracking-wider text-[10px]">Season XP Progress</span>
      <span className="text-indigo-400">7,450 / 10,000 XP</span>
    </div>
    <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full w-[74.5%] transition-all duration-500"></div>
    </div>
  </div>
);
