import { useRewardedStore } from '../store/rewarded.store';
import { useUserStore } from '../../../user/user.store';
import { AD_REWARDS } from '../constants/reward.constants';
import { requestRewardedReward } from '../api';

export const RewardService = {
  claimRewardedAd: async (rewardId: string): Promise<boolean> => {
    const { getCooldownRemainingSeconds, recordClaim } = useRewardedStore.getState();
    const userStore = useUserStore.getState();
    const user = userStore.user;
    if (!user) return false;

    // Check cooldown limits
    if (getCooldownRemainingSeconds(rewardId) > 0) return false;

    const reward = AD_REWARDS.find((r) => r.id === rewardId);
    if (!reward) return false;

    const success = await requestRewardedReward(rewardId);
    if (success) {
      // Award to profile
      if (reward.type === 'FREE_COINS') {
        userStore.updateUser({ coins: user.coins + reward.amount });
      } else if (reward.type === 'FREE_GEMS') {
        userStore.updateUser({ gems: user.gems + reward.amount });
      } else if (reward.type === 'EXTRA_XP') {
        // Double reward XP trigger
        userStore.updateUser({ xp: (user.xp || 0) + reward.amount });
      }

      recordClaim(rewardId);
      return true;
    }
    return false;
  },
};
export default RewardService;
