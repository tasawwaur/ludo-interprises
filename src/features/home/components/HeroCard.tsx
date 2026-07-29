import React from 'react';

interface HeroCardProps {
  onSelectMode: (modeKey: string) => void;
}

export const HeroCard: React.FC<HeroCardProps> = ({ onSelectMode }) => {
  return (
    <button
      onClick={() => onSelectMode('2P Classic')}
      className="group relative w-full h-36 rounded-[28px] card-2p-gradient border-2 border-[#ffd54f] p-4 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.35)] hover:scale-[1.02] active:scale-95 transition-all overflow-hidden cursor-pointer"
    >
      {/* Glossy Background Lighting */}
      <div className="absolute -left-10 -bottom-10 w-36 h-36 bg-yellow-200/30 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
      <div className="absolute right-12 -top-10 w-28 h-28 bg-white/25 rounded-full blur-xl"></div>

      {/* Left 3D Ludo Board Illustration */}
      <div className="relative z-10 flex items-center justify-center w-28 h-28 bg-slate-950/40 rounded-2xl border border-yellow-200/50 p-2 shadow-inner backdrop-blur-md">
        <div className="w-full h-full grid grid-cols-2 gap-1 bg-slate-900 p-1 rounded-xl">
          <div className="bg-[#00d26a] rounded-lg flex items-center justify-center text-xs shadow">🟢</div>
          <div className="bg-[#ffc107] rounded-lg flex items-center justify-center text-xs shadow">🟡</div>
          <div className="bg-[#ef4444] rounded-lg flex items-center justify-center text-xs shadow">🔴</div>
          <div className="bg-[#3b82f6] rounded-lg flex items-center justify-center text-xs shadow">🔵</div>
        </div>
      </div>

      {/* Center Details */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 mx-3">
        <span className="text-3xl font-black text-white tracking-widest drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
          2 PLAYER
        </span>
        <span className="text-sm font-extrabold text-amber-100 tracking-wider mt-1 drop-shadow">
          1 vs 1
        </span>
      </div>

      {/* Right Circular Arrow Button ➜ */}
      <div className="relative z-10 w-11 h-11 rounded-full bg-white text-slate-950 font-black text-xl flex items-center justify-center shadow-xl group-hover:scale-125 transition-transform">
        ➜
      </div>
    </button>
  );
};
