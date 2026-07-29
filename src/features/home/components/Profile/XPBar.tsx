import React from 'react';

interface XPBarProps {
  progressPercent?: number;
}

export const XPBar: React.FC<XPBarProps> = ({ progressPercent = 75 }) => {
  return (
    <div className="w-full flex items-center gap-2 mt-1">
      <div className="flex-1 h-2.5 bg-slate-950/80 rounded-full overflow-hidden border border-purple-400/40 shadow-inner relative">
        <div
          style={{ width: `${progressPercent}%` }}
          className="h-full bg-gradient-to-r from-[#ffc107] to-[#ff9800] rounded-full shadow transition-all duration-500"
        ></div>
      </div>
      <span className="text-[11px] font-black text-amber-300 drop-shadow">
        {progressPercent}% XP
      </span>
    </div>
  );
};
