import React from 'react';
import { useRewards } from '../hooks/useRewards';
import { useLevel } from '../hooks/useLevel';
import { LevelReward } from '../components/Rewards/LevelReward';
import { PremiumReward } from '../components/Rewards/PremiumReward';
import { ClaimReward } from '../components/Rewards/ClaimReward';
import { useUserStore } from '../../../user/user.store';
import confetti from 'canvas-confetti';

export const RewardsSection: React.FC = () => {
  const { milestones, isPremiumUnlocked, claimReward, unlockPremiumTrack } = useRewards();
  const { levelState } = useLevel();
  const user = useUserStore((s) => s.user);

  const handleClaim = async (level: number, type: 'standard' | 'premium') => {
    const success = await claimReward(level, type);
    if (success) {
      confetti({
        particleCount: 30,
        spread: 40,
        colors: ['#FFD700', '#FFA500', '#00FF00'],
      });
    }
  };

  const handleUnlockPremium = async () => {
    if (!user) return;
    if (user.gems < 50) {
      alert('Not enough gems to unlock Premium track! Cost is 50 Gems.');
      return;
    }

    // Deduct gems
    useUserStore.getState().updateUser({ gems: user.gems - 50 });
    const success = await unlockPremiumTrack();
    if (success) {
      confetti({
        particleCount: 50,
        spread: 60,
        colors: ['#FFD700', '#FFA500'],
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Premium Unlock Banner */}
      {!isPremiumUnlocked && (
        <div className="wood-frame rounded-2xl p-4 border-2 border-yellow-500/50 shadow-2xl flex items-center justify-between text-white bg-gradient-to-r from-amber-600/30 to-purple-900/60">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-bounce">👑</span>
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase text-yellow-400 tracking-wider">Unlock Premium Track</span>
              <span className="text-[10px] text-amber-100">Get legendary dice skins & frames!</span>
            </div>
          </div>
          <button
            onClick={handleUnlockPremium}
            className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-slate-950 px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow hover:scale-105 active:scale-95 border border-yellow-200 transition-all flex items-center gap-1"
          >
            💎 50 GEMS
          </button>
        </div>
      )}

      {/* Milestones List */}
      <div className="flex flex-col gap-4">
        {milestones.map((m) => {
          const isLevelReached = levelState.currentLevel >= m.level;
          const canClaimStandard = isLevelReached && !m.isClaimed;
          const canClaimPremium = isLevelReached && isPremiumUnlocked && !m.isPremiumClaimed;

          return (
            <div
              key={m.level}
              className="bg-purple-950/60 border border-purple-800/40 rounded-2xl p-3 flex flex-col gap-3 shadow-md"
            >
              {/* Header claim action */}
              <ClaimReward
                level={m.level}
                canClaimAny={canClaimStandard || canClaimPremium}
                onClaimAll={() => {
                  if (canClaimStandard) handleClaim(m.level, 'standard');
                  if (canClaimPremium) handleClaim(m.level, 'premium');
                }}
              />

              {/* Tracks columns */}
              <div className="grid grid-cols-2 gap-3">
                {/* Standard */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[8px] text-slate-300 font-bold uppercase tracking-wider pl-1">Standard</span>
                  <LevelReward
                    reward={m.standardReward}
                    isClaimed={m.isClaimed}
                    canClaim={canClaimStandard}
                    onClaim={() => handleClaim(m.level, 'standard')}
                  />
                </div>

                {/* Premium */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[8px] text-amber-300 font-black uppercase tracking-wider pl-1 flex items-center gap-0.5">
                    👑 Premium
                  </span>
                  {m.premiumReward ? (
                    <PremiumReward
                      reward={m.premiumReward}
                      isUnlocked={isPremiumUnlocked}
                      isClaimed={m.isPremiumClaimed}
                      canClaim={canClaimPremium}
                      onClaim={() => handleClaim(m.level, 'premium')}
                    />
                  ) : (
                    <div className="flex-1 rounded-2xl bg-purple-950/20 border border-dashed border-purple-900/40 flex items-center justify-center text-[9px] text-purple-400 italic p-4">
                      No Premium Reward
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default RewardsSection;
