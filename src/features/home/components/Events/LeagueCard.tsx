import React from 'react';

interface LeagueCardProps {
  onOpen?: () => void;
}

export const LeagueCard: React.FC<LeagueCardProps> = ({ onOpen }) => {
  return (
    <button
      onClick={onOpen}
      className="relative bg-gradient-to-b from-amber-600/90 via-purple-900/95 to-purple-950 border-2 border-amber-400/70 rounded-3xl p-2.5 flex flex-col items-center justify-between shadow-2xl hover:scale-105 transition-transform overflow-hidden cursor-pointer"
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
  );
};
