import React from 'react';

export const BackgroundEffects: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Dark Purple Luxury Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#5B174D] via-[#481343] to-[#3A103A]"></div>

      {/* Subtle Vignette & Light Radial Center Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500/15 via-transparent to-black/70"></div>

      {/* Center Watermark LUDO STAR */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center opacity-10">
        <span className="text-7xl font-black tracking-widest text-pink-300 block drop-shadow-2xl">
          LUDO
        </span>
        <span className="text-6xl font-black tracking-widest text-amber-300 block -mt-3">
          STAR
        </span>
      </div>

      {/* Ambient Pulsing Glow Orbs */}
      <div className="absolute top-10 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
    </div>
  );
};
