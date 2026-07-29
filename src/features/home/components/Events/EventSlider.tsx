import React, { useState, useEffect } from 'react';

interface EventSliderProps {
  onClaimDaily?: () => void;
  onOpenLeague?: () => void;
  onLuckySpin?: () => void;
}

export const EventSlider: React.FC<EventSliderProps> = ({
  onClaimDaily,
  onOpenLeague,
  onLuckySpin,
}) => {
  return (
    <div className="w-full flex items-center gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory py-1">
      {/* Card 1: Daily Reward */}
      <div className="snap-center shrink-0 w-[240px] h-[100px] rounded-2xl bg-gradient-to-r from-purple-800 to-purple-950 border border-purple-400/50 p-3 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.4)] relative overflow-hidden">
        {/* Glow & decorations */}
        <div className="absolute -right-4 -top-4 w-16 h-16 bg-purple-500/30 rounded-full blur-xl"></div>
        <div className="flex items-center gap-3 z-10">
          <span className="text-3xl drop-shadow-md">🎁</span>
          <div className="flex flex-col">
            <span className="text-[13px] font-black text-white tracking-wide uppercase">Daily Reward</span>
            <span className="text-[10px] text-purple-200">Free Coins Inside</span>
          </div>
        </div>
        <button onClick={onClaimDaily} className="self-end z-10 bg-gradient-to-r from-yellow-400 to-yellow-600 text-[#12061f] px-4 py-1.5 rounded-full text-[11px] font-black uppercase shadow-lg border border-yellow-300 hover:scale-105 active:scale-95 transition-transform">
          Claim Now
        </button>
      </div>

      {/* Card 2: 312 League */}
      <div className="snap-center shrink-0 w-[240px] h-[100px] rounded-2xl bg-gradient-to-r from-amber-600 to-amber-900 border border-amber-400/50 p-3 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.4)] relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-16 h-16 bg-amber-400/30 rounded-full blur-xl"></div>
        <div className="flex items-center gap-3 z-10">
          <span className="text-3xl drop-shadow-md">👑</span>
          <div className="flex flex-col">
            <span className="text-[13px] font-black text-white tracking-wide uppercase">312 League</span>
            <span className="text-[10px] text-amber-200">Leaderboard Event</span>
          </div>
        </div>
        <div className="self-end z-10 bg-black/40 text-amber-300 px-3 py-1.5 rounded-full text-[11px] font-black uppercase shadow-inner border border-white/10 flex items-center gap-1">
          <span>⏳</span> 2d 14h Left
        </div>
      </div>

      {/* Card 3: Lucky Spin */}
      <div className="snap-center shrink-0 w-[240px] h-[100px] rounded-2xl bg-gradient-to-r from-blue-700 to-blue-950 border border-blue-400/50 p-3 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.4)] relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-400/30 rounded-full blur-xl"></div>
        <div className="flex items-center gap-3 z-10">
          <span className="text-3xl drop-shadow-md">🎰</span>
          <div className="flex flex-col">
            <span className="text-[13px] font-black text-white tracking-wide uppercase">Lucky Spin</span>
            <span className="text-[10px] text-blue-200">Win Jackpots</span>
          </div>
        </div>
        <button onClick={onLuckySpin} className="self-end z-10 bg-gradient-to-r from-yellow-400 to-yellow-600 text-[#12061f] px-4 py-1.5 rounded-full text-[11px] font-black uppercase shadow-lg border border-yellow-300 hover:scale-105 active:scale-95 transition-transform">
          Spin Now
        </button>
      </div>
    </div>
  );
};
