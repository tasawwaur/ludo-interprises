import { useRewardsStore } from '../store/rewards.store';
import { claimMilestoneRewardApi, unlockPremiumTrackApi } from '../api';

export const RewardService = {
  claimReward: async (level: number, type: 'standard' | 'premium'): Promise<boolean> => {
    const { claimReward } = useRewardsStore.getState();
    const success = claimReward(level, type);
    if (!success) return false;

    // Call mock api
    await claimMilestoneRewardApi(level, type);
    return true;
  },

  unlockPremiumTrack: async (): Promise<boolean> => {
    const { unlockPremiumTrack } = useRewardsStore.getState();
    
    // Call mock API
    const response = await unlockPremiumTrackApi();
    if (response) {
      unlockPremiumTrack();
      return true;
    }
    return false;
  },
};
export default RewardService;
