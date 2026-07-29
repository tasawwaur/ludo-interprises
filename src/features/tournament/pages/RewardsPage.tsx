import React from 'react';
import { LudoPageBackground } from '../../../components/effects/LudoPageBackground';
import { CHAMPION_REWARDS } from '../constants/reward.constants';
import RewardCard from '../components/Rewards/RewardCard';
import { useRewardStore } from '../store/reward.store';
import { useUserStore } from '../../../user/user.store';

interface RewardsPageProps {
  tournamentId: string;
  onBack?: () => void;
}

export const RewardsPage: React.FC<RewardsPageProps> = ({ tournamentId, onBack }) => {
  const { claimedRewardsLog, claimTournamentPrize } = useRewardStore();
  const userStore = useUserStore();
  const user = userStore.user;

  const handleClaim = (reward: typeof CHAMPION_REWARDS[0]) => {
    if (!user) return;
    
    // Add currencies
    userStore.updateUser({
      coins: user.coins + (reward.coins || 0),
      gems: user.gems + (reward.gems || 0),
      crowns: (user.crowns || 0) + (reward.trophies || 0),
    });

    claimTournamentPrize(tournamentId, reward.rank);
  };

  return (
    <div className="min-h-screen w-full bg-[#12061F] text-white flex flex-col items-center relative overflow-hidden select-none font-sans">
      <LudoPageBackground variant="tournament" />

      <div className="w-full max-w-[430px] h-screen flex flex-col relative z-10 px-3 py-3 overflow-y-auto no-scrollbar">
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-lg hover:bg-black/60 hover:scale-105 active:scale-95 transition-transform"
          >
            ❮
          </button>
          <h1 className="text-lg font-black tracking-widest bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent uppercase glow-amber-text">
            PRIZES
          </h1>
          <div className="w-9 h-9"></div>
        </div>

        {/* Rewards list */}
        <div className="flex-1 flex flex-col gap-3 pb-6">
          {CHAMPION_REWARDS.map((reward) => {
            const logKey = `${tournamentId}_${reward.rank}`;
            const isClaimed = !!claimedRewardsLog[logKey];
            return (
              <RewardCard
                key={reward.rank}
                reward={reward}
                isClaimed={isClaimed}
                onClaim={() => handleClaim(reward)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default RewardsPage;
