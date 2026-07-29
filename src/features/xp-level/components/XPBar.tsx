import React from 'react';

interface XPBarProps {
  currentXp: number;
  requiredXp: number;
  className?: string;
}

export const XPBar: React.FC<XPBarProps> = ({ currentXp, requiredXp, className = '' }) => {
  const percent = Math.min(100, Math.max(0, Math.round((currentXp / requiredXp) * 100)));

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-end mb-1">
        <span className="text-[10px] font-bold text-purple-200 uppercase tracking-wider">Progression</span>
        <span className="text-[10px] font-black text-amber-300 tracking-wider">
          {currentXp} / {requiredXp} XP ({percent}%)
        </span>
      </div>
      {/* ProgressBar track */}
      <div className="w-full h-3 bg-purple-950/80 rounded-full border border-purple-800/40 p-[1.5px] overflow-hidden shadow-inner">
        <div
          style={{ width: `${percent}%` }}
          className="h-full bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.7)] transition-all duration-500"
        />
      </div>
    </div>
  );
};
export default XPBar;
