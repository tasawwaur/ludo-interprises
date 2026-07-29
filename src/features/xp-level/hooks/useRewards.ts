import { useRewardsStore } from '../store/rewards.store';
import { RewardService } from '../services/RewardService';

export const useRewards = () => {
  const milestones = useRewardsStore((s) => s.milestones);
  const isPremiumUnlocked = useRewardsStore((s) => s.isPremiumUnlocked);

  return {
    milestones,
    isPremiumUnlocked,
    claimReward: RewardService.claimReward,
    unlockPremiumTrack: RewardService.unlockPremiumTrack,
  };
};
export default useRewards;
