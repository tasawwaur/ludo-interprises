import React from 'react';

interface ClaimRewardProps {
  level: number;
  onClaimAll?: () => void;
  canClaimAny?: boolean;
}

export const ClaimReward: React.FC<ClaimRewardProps> = ({ level, onClaimAll, canClaimAny }) => {
  return (
    <div className="w-full flex items-center justify-between p-3.5 bg-black/40 border border-purple-900/40 rounded-2xl">
      <div className="flex flex-col">
        <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">Milestone Level {level}</span>
        <span className="text-[9px] text-gray-400 italic">Complete level goals to claim</span>
      </div>
      
      {canClaimAny && (
        <button
          onClick={onClaimAll}
          className="px-4 py-2 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-slate-950 font-black text-[10px] uppercase rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-transform"
        >
          CLAIM ALL
        </button>
      )}
    </div>
  );
};
export default ClaimReward;
