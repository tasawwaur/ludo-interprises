import React from 'react';
import { RewardItem } from '../../types/reward.types';

interface LevelRewardProps {
  reward: RewardItem;
  isClaimed: boolean;
  onClaim?: () => void;
  canClaim?: boolean;
}

export const LevelReward: React.FC<LevelRewardProps> = ({ reward, isClaimed, onClaim, canClaim }) => {
  return (
    <div className="flex flex-col items-center p-3 rounded-2xl bg-purple-950/70 border border-purple-800/40 relative shadow-md">
      <span className="text-[24px] mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{reward.icon}</span>
      <span className="text-[10px] text-gray-300 font-bold text-center leading-tight mb-2">{reward.name}</span>
      
      {isClaimed ? (
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
export default LevelReward;
