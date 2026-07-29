import React from "react";

export const PingWidget: React.FC = () => (
  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/80 border border-slate-800 rounded-full text-[11px] font-bold text-emerald-400">
    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
    <span>28ms (Asia-IN)</span>
  </div>
);
