export type RewardType = 'COINS' | 'GEMS' | 'CROWNS' | 'DICE_SKIN' | 'AVATAR_FRAME' | 'EMOTE';

export interface RewardItem {
  id: string;
  type: RewardType;
  amount: number;
  name: string;
  icon: string;
}

export interface LevelMilestoneReward {
  level: number;
  standardReward: RewardItem;
  premiumReward?: RewardItem; // Extra reward if user unlocked Premium progression
  isClaimed: boolean;
  isPremiumClaimed: boolean;
}
