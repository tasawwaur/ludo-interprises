import React from 'react';
import { RankingReward } from '../../types/reward.types';
import CoinReward from './CoinReward';
import DiamondReward from './DiamondReward';
import TrophyReward from './TrophyReward';

interface RewardCardProps {
  reward: RankingReward;
  isClaimed: boolean;
  onClaim?: () => void;
}

export const RewardCard: React.FC<RewardCardProps> = ({ reward, isClaimed, onClaim }) => {
  return (
    <div
      className={`flex justify-between items-center p-3 rounded-2xl border-2 transition-all ${
        isClaimed
          ? 'bg-purple-950/40 border-purple-900/20 opacity-60'
          : 'bg-purple-950/80 border-purple-500/30'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">🏆</span>
        <div className="flex flex-col">
          <span className="text-xs font-black text-white">{reward.label}</span>
          <div className="flex gap-1.5 mt-1">
            {reward.coins && <CoinReward amount={reward.coins} />}
            {reward.gems && <DiamondReward amount={reward.gems} />}
            {reward.trophies && <TrophyReward amount={reward.trophies} />}
          </div>
        </div>
      </div>

      {isClaimed ? (
        <span className="text-[9px] font-black text-green-400 uppercase">CLAIMED ✓</span>
      ) : (
        <button
          onClick={onClaim}
          className="py-1.5 px-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-purple-955 font-black text-[9px] uppercase rounded-xl shadow active:scale-95 transition-all"
        >
          CLAIM
        </button>
      )}
    </div>
  );
};
export default RewardCard;
