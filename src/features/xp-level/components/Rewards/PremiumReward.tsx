import React from 'react';
import { RewardItem } from '../../types/reward.types';

interface PremiumRewardProps {
  reward: RewardItem;
  isUnlocked: boolean;
  isClaimed: boolean;
  onClaim?: () => void;
  canClaim?: boolean;
}

export const PremiumReward: React.FC<PremiumRewardProps> = ({
  reward,
  isUnlocked,
  isClaimed,
  onClaim,
  canClaim,
}) => {
  return (
    <div className={`flex flex-col items-center p-3 rounded-2xl border-2 relative shadow-md ${
      isUnlocked 
        ? 'bg-gradient-to-b from-[#2E1A47] to-[#160B28] border-yellow-500/40' 
        : 'bg-purple-950/20 border-purple-900/10 opacity-75'
    }`}>
      {/* Crown Premium Badge top-left corner */}
      <span className="absolute top-1.5 left-2 text-[10px] drop-shadow">👑</span>

      <span className="text-[24px] mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{reward.icon}</span>
      <span className="text-[10px] text-yellow-300 font-bold text-center leading-tight mb-2">{reward.name}</span>
      
      {!isUnlocked ? (
        <span className="text-[8px] font-black text-amber-500/80 uppercase py-1">LOCKED 🔒</span>
      ) : isClaimed ? (
        <span className="text-[9px] font-black text-green-400 uppercase py-1">CLAIMED ✓</span>
      ) : (
        <button
          onClick={onClaim}
          disabled={!canClaim}
          className={`w-full py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
            canClaim
              ? 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-110 text-slate-950 shadow active:scale-95'
              : 'bg-purple-900/40 border border-purple-800/40 text-purple-400/60 cursor-not-allowed'
          }`}
        >
          CLAIM
        </button>
      )}
    </div>
  );
};
export default PremiumReward;
