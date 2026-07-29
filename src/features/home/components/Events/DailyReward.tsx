import React from 'react';

interface DailyRewardProps {
  onClaim?: () => void;
}

export const DailyReward: React.FC<DailyRewardProps> = ({ onClaim }) => {
  return (
    <button
      onClick={onClaim}
      className="relative bg-gradient-to-b from-purple-900/90 to-purple-950/95 border border-purple-400/50 rounded-3xl p-2.5 flex flex-col items-center justify-between shadow-xl hover:scale-105 transition-transform cursor-pointer"
    >
      <span className="text-3xl drop-shadow">🎁</span>
      <div className="text-center my-0.5">
        <span className="text-[11px] font-black text-white block leading-tight">DAILY</span>
        <span className="text-[10px] font-black text-purple-200 block leading-tight">REWARD</span>
      </div>
      <span className="bg-[#ffc107] text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-xl shadow border border-amber-300">
        Claim Now
      </span>
    </button>
  );
};
