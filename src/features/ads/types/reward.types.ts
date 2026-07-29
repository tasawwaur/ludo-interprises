export type AdRewardType = 'FREE_COINS' | 'FREE_GEMS' | 'EXTRA_XP' | 'SPIN_MULTIPLIER';

export interface AdReward {
  id: string;
  type: AdRewardType;
  amount: number;
  label: string;
  icon: string;
}
export interface UserRewardTracker {
  rewardId: string;
  isClaimed: boolean;
  claimTimestamp: string;
}
