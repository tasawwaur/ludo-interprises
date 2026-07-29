import React from 'react';

interface EventCarouselProps {
  onClaimDaily?: () => void;
  onOpenLeague?: () => void;
  onLuckySpin?: () => void;
}

export const EventCarousel: React.FC<EventCarouselProps> = ({
  onClaimDaily,
  onOpenLeague,
  onLuckySpin,
}) => {
  return (
    <div className="w-full max-w-lg grid grid-cols-3 gap-2.5 my-1">
      {/* Card 1: DAILY REWARD */}
      <button
        onClick={onClaimDaily}
        className="relative bg-gradient-to-b from-purple-900/90 to-purple-950/95 border border-purple-400/50 rounded-3xl p-2.5 flex flex-col items-center justify-between shadow-xl hover:scale-105 transition-transform"
      >
        <span className="text-3xl drop-shadow">🎁</span>
        <div className="text-center my-0.5">
          <span className="text-[11px] font-black text-white block leading-tight">DAILY</span>
          <span className="text-[10px] font-black text-purple-200 block leading-tight">REWARD</span>
        </div>
        <span className="bg-amber-400 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-xl shadow border border-amber-300">
          Claim Now
        </span>
      </button>

      {/* Card 2: 312 LEAGUE (Center Crown Card) */}
      <button
        onClick={onOpenLeague}
        className="relative bg-gradient-to-b from-amber-600/90 via-purple-900/95 to-purple-950 border-2 border-amber-400/70 rounded-3xl p-2.5 flex flex-col items-center justify-between shadow-2xl hover:scale-105 transition-transform overflow-hidden"
      >
        <div className="absolute -top-1 text-center">
          <span className="text-lg">👑</span>
        </div>
        <div className="text-center mt-3">
          <span className="text-lg font-black text-amber-300 tracking-wider block drop-shadow">312</span>
          <span className="text-[9px] font-black text-amber-100 tracking-widest block uppercase">LEAGUE</span>
        </div>
        <span className="bg-slate-950/80 text-amber-300 font-extrabold text-[9px] px-2 py-0.5 rounded-xl border border-amber-400/40">
          2d 14h Left
        </span>
      </button>

      {/* Card 3: LUCKY SPIN */}
      <button
        onClick={onLuckySpin}
        className="relative bg-gradient-to-b from-purple-900/90 to-purple-950/95 border border-purple-400/50 rounded-3xl p-2.5 flex flex-col items-center justify-between shadow-xl hover:scale-105 transition-transform"
      >
        <span className="text-3xl drop-shadow">🎡</span>
        <div className="text-center my-0.5">
          <span className="text-[11px] font-black text-white block leading-tight">LUCKY</span>
          <span className="text-[10px] font-black text-purple-200 block leading-tight">SPIN</span>
        </div>
        <span className="bg-amber-400 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-xl shadow border border-amber-300">
          Spin Now
        </span>
      </button>
    </div>
  );
};
