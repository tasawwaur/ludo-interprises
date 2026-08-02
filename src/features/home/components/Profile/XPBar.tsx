import React from 'react';
import { LevelBadge } from '../../../../components/badges/LevelBadge';

interface XPBarProps {
  progressPercent?: number;
  level?: number;
}

export const XPBar: React.FC<XPBarProps> = ({ progressPercent = 75, level = 85 }) => {
  return (
    <div className="relative w-full aspect-[4.54/1] select-none my-0.5">
      {/* 1. Progress Bar Fill (behind the frame, showing through the transparent cut-out) */}
      <div 
        className="absolute left-[23.2%] right-[18.9%] top-[38%] bottom-[42%] bg-purple-950/80 rounded-full overflow-hidden z-0 flex p-[0.5px]"
      >
        <div
          style={{ width: `${progressPercent}%` }}
          className="h-full bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 rounded-full shadow-[0_0_4px_rgba(245,158,11,0.8)] transition-all duration-500"
        />
      </div>

      {/* 2. Golden Luxury Frame Image (on top, with transparent middle track and shield) */}
      <img
        src="/assets/images/icons/luxury_xp_bar.png"
        alt="XP Bar Frame"
        className="absolute inset-0 w-full h-full object-contain z-10 pointer-events-none"
        draggable={false}
      />

      {/* 3. Premium Dynamic Level Badge Frame */}
      <div className="absolute left-[16.6%] top-[50%] -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center">
        <LevelBadge level={level} size={35} />
      </div>

      {/* 4. Progress Text (centered on the progress bar, italic) */}
      <div className="absolute left-[52.15%] top-[58%] -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center pointer-events-none">
        <span className="text-[9.5px] font-black text-white italic drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] tracking-wider">
          {Math.round(progressPercent * 100)} / 100 XP
        </span>
      </div>
    </div>
  );
};
