import React from 'react';
import { useUserStore } from '../../../user/user.store';

interface TopHeaderProps {
  onOpenProfileSettings?: () => void;
  onOpenInbox?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onOpenProfileSettings,
  onOpenInbox,
}) => {
  const user = useUserStore((s) => s.user);
  const displayName = user?.displayName || user?.username || 'Tasavvur';
  const level = user?.level || 25;
  const avatar = user?.avatar;

  return (
    <header className="w-full max-w-lg flex flex-col gap-2 px-3 pt-3 z-20">
      {/* Row 1: Profile Avatar & Currencies styled inside a Custom High-End Luxury Gold Frame (Pure CSS/SVG) */}
      <div 
        className="flex items-center justify-between gap-2 bg-gradient-to-b from-[#1E0836] via-[#120324] to-[#0A0118]/95 border-2 border-amber-400 shadow-[0_4px_25px_rgba(0,0,0,0.85),0_0_15px_rgba(245,158,11,0.25)] rounded-2xl w-full relative overflow-hidden"
        style={{ padding: '20px 16px 12px 14px', minHeight: '92px' }}
      >
        {/* Inner Gold Inset Line Border */}
        <div className="absolute inset-[3px] rounded-[13px] border border-yellow-200/20 pointer-events-none z-10" />

        {/* Top Center Glowing Jewel (Purple Diamond + Gold wings base) */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
          <div className="w-6 h-6 rotate-45 bg-gradient-to-br from-fuchsia-400 via-purple-600 to-indigo-800 border-2 border-yellow-300 shadow-[0_0_12px_#d946ef] flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-white/40 rounded-full blur-[0.5px] -mt-1.5 -ml-1.5" />
          </div>
          <div className="w-12 h-1 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 border border-yellow-200/50 rounded-full -mt-1 shadow-md" />
        </div>

        {/* Decorative corner gold scroll lines */}
        <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-yellow-400/40 rounded-tl pointer-events-none z-10" />
        <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-yellow-400/40 rounded-tr pointer-events-none z-10" />
        <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-yellow-400/40 rounded-bl pointer-events-none z-10" />
        <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-yellow-400/40 rounded-br pointer-events-none z-10" />
        {/* Profile Avatar with Online Dot & Level XP */}
        <div
          onClick={onOpenProfileSettings}
          className="flex items-center gap-1.5 cursor-pointer group"
          title="Edit Profile"
        >
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-amber-400 overflow-hidden shadow-[0_0_12px_rgba(255,193,7,0.5)] bg-slate-900 flex items-center justify-center text-xl group-hover:scale-105 transition-transform relative p-0.5">
              <div className="absolute inset-0 rounded-full border border-yellow-200/40 pointer-events-none"></div>
              {avatar ? (
                <img src={avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-2xl">👤</span>
              )}
            </div>
            {/* Green Online Dot */}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border border-slate-950 shadow animate-pulse"></span>
          </div>

          <div className="flex flex-col">
            <span className="text-sm font-black text-white truncate max-w-[120px] drop-shadow leading-tight">
              {displayName}
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-[8px] px-1 py-0.2 rounded shadow-[0_1px_2px_rgba(0,0,0,0.5)] border border-yellow-200/40 scale-95 origin-left">
                {level}
              </span>
              <div className="w-16 h-2 bg-purple-950/80 rounded-full overflow-hidden border border-amber-400/50 shadow-inner relative flex p-[1px] scale-95 origin-left">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-500 via-amber-300 to-yellow-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.8)]" 
                  style={{ width: "75%" }}
                ></div>
              </div>
              <span className="text-[8px] text-amber-300 font-extrabold scale-95 origin-left">75%</span>
            </div>
          </div>
        </div>

        {/* Luxury Currency Panel (Coins, Gems, Diamonds) on the right side */}
        <div className="flex items-center gap-1 z-20">
          {/* Coins Counter */}
          <div className="flex items-center bg-slate-950/90 border border-amber-400/50 rounded-xl px-1.5 py-0.5 shadow-lg gap-1 hover:scale-105 transition-transform cursor-pointer">
            <img src="/assets/images/icons/luxury_coin.png" className="w-4 h-4 object-contain" alt="Coins" />
            <span className="text-[9px] font-black text-amber-400">259.8K</span>
            <button className="w-3 h-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[8px] flex items-center justify-center shadow">+</button>
          </div>

          {/* Gems Counter */}
          <div className="flex items-center bg-slate-950/90 border border-purple-400/50 rounded-xl px-1.5 py-0.5 shadow-lg gap-1 hover:scale-105 transition-transform cursor-pointer">
            <img src="/assets/images/icons/luxury_gem.png" className="w-4 h-4 object-contain" alt="Gems" />
            <span className="text-[9px] font-black text-purple-300">1.2K</span>
            <button className="w-3 h-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[8px] flex items-center justify-center shadow">+</button>
          </div>

          {/* Diamonds Counter */}
          <div className="flex items-center bg-slate-950/90 border border-cyan-400/50 rounded-xl px-1.5 py-0.5 shadow-lg gap-1 hover:scale-105 transition-transform cursor-pointer">
            <span className="text-xs">💎</span>
            <span className="text-[9px] font-black text-cyan-300">350</span>
            <button className="w-3 h-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[8px] flex items-center justify-center shadow">+</button>
          </div>
        </div>
      </div>

      {/* Row 2: Right Action Badges (Inbox) */}
      <div className="flex justify-end items-center gap-2">
        {/* Inbox Button */}
        <button
          onClick={onOpenInbox}
          className="relative w-11 h-9 rounded-2xl bg-purple-950/90 border border-purple-400/50 flex items-center justify-center text-lg shadow-lg hover:scale-105 transition-transform"
        >
          📩
          <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white font-black text-[10px] w-5 h-5 rounded-full border border-slate-950 flex items-center justify-center shadow">
            5
          </span>
        </button>
      </div>
    </header>
  );
};
