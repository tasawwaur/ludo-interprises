import React, { useState, useEffect } from 'react';
import { LudoPageBackground } from '../../../components/effects/LudoPageBackground';
import { AD_REWARDS } from '../constants/reward.constants';
import { useRewardedStore } from '../store/rewarded.store';
import { RewardedAd } from '../components/Rewarded/RewardedAd';
import { RewardDialog } from '../components/Rewarded/RewardDialog';
import { formatCooldownTime } from '../utils/cooldown';

interface RewardCenterPageProps {
  onBack?: () => void;
}

export const RewardCenterPage: React.FC<RewardCenterPageProps> = ({ onBack }) => {
  const { getCooldownRemainingSeconds } = useRewardedStore();
  
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
  const [showClaimSuccess, setShowClaimSuccess] = useState(false);
  const [lastClaimedReward, setLastClaimedReward] = useState<{ label: string; icon: string } | null>(null);

  // Cooldown periodic updater
  useEffect(() => {
    const updateAllCooldowns = () => {
      const nextCooldowns: Record<string, number> = {};
      AD_REWARDS.forEach((reward) => {
        nextCooldowns[reward.id] = getCooldownRemainingSeconds(reward.id);
      });
      setCooldowns(nextCooldowns);
    };

    updateAllCooldowns();
    const interval = setInterval(updateAllCooldowns, 1000);
    return () => clearInterval(interval);
  }, [getCooldownRemainingSeconds]);

  const handleClaimSuccess = (rewardId: string) => {
    const reward = AD_REWARDS.find((r) => r.id === rewardId);
    if (reward) {
      setLastClaimedReward({ label: reward.label, icon: reward.icon });
      setShowClaimSuccess(true);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#12061F] text-white flex flex-col items-center relative overflow-hidden select-none font-sans">
      <LudoPageBackground variant="rewards" />

      {/* Claim Dialog */}
      {showClaimSuccess && lastClaimedReward && (
        <RewardDialog
          isOpen={showClaimSuccess}
          rewardLabel={lastClaimedReward.label}
          rewardIcon={lastClaimedReward.icon}
          onClose={() => setShowClaimSuccess(false)}
        />
      )}

      <div className="w-full max-w-[430px] h-screen flex flex-col relative z-10 px-3 py-3">
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-lg hover:bg-black/60 hover:scale-105 active:scale-95 transition-transform"
          >
            ❮
          </button>
          <h1 className="text-lg font-black tracking-widest bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent uppercase glow-amber-text">
            FREE REWARDS CENTER
          </h1>
          <div className="w-9 h-9"></div>
        </div>

        {/* Rewards List */}
        <div className="flex flex-col gap-4 overflow-y-auto no-scrollbar pb-6">
          {AD_REWARDS.map((reward) => {
            const cooldownSec = cooldowns[reward.id] || 0;
            const isCooldownActive = cooldownSec > 0;

            return (
              <div
                key={reward.id}
                className="bg-purple-950/60 border border-purple-800/40 rounded-2xl p-4 flex justify-between items-center shadow-md relative"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{reward.icon}</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-white">{reward.label}</span>
                    <span className="text-[9px] text-purple-300">Watch video ad to claim standard payout</span>
                  </div>
                </div>

                <div className="w-36 flex flex-col gap-1 items-end">
                  {isCooldownActive ? (
                    <span className="text-[9px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-lg font-mono">
                      ⏳ {formatCooldownTime(cooldownSec)}
                    </span>
                  ) : (
                    <RewardedAd
                      adId="ad_rewarded_1"
                      rewardId={reward.id}
                      label="WATCH AD"
                      onSuccess={() => handleClaimSuccess(reward.id)}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default RewardCenterPage;
