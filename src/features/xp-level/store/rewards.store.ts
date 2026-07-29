import { create } from 'zustand';
import { LevelMilestoneReward, RewardItem } from '../types/reward.types';
import { LEVEL_MILESTONE_REWARDS } from '../constants/reward.constants';
import { useUserStore } from '../../../user/user.store';

interface RewardsState {
  milestones: LevelMilestoneReward[];
  isPremiumUnlocked: boolean;

  // Actions
  unlockPremiumTrack: () => void;
  claimReward: (level: number, type: 'standard' | 'premium') => boolean;
  syncClaimedState: () => void;
}

const STORAGE_REWARDS_KEY = 'ludo_claimed_rewards_v1';
const STORAGE_PREMIUM_KEY = 'ludo_premium_track_unlocked_v1';

const getInitialMilestones = (): LevelMilestoneReward[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_REWARDS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse claimed rewards', e);
      }
    }
  }
  return LEVEL_MILESTONE_REWARDS;
};

const getInitialPremiumStatus = (): boolean => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(STORAGE_PREMIUM_KEY) === 'true';
  }
  return false;
};

export const useRewardsStore = create<RewardsState>((set, get) => ({
  milestones: getInitialMilestones(),
  isPremiumUnlocked: getInitialPremiumStatus(),

  unlockPremiumTrack: () => {
    set({ isPremiumUnlocked: true });
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_PREMIUM_KEY, 'true');
    }
  },

  claimReward: (level, type) => {
    const { milestones, isPremiumUnlocked } = get();
    const userStore = useUserStore.getState();
    const user = userStore.user;
    if (!user) return false;

    // Check if user level is high enough
    if (user.level && user.level < level) return false;

    let rewardItem: RewardItem | undefined;
    let rewardClaimed = false;

    const updatedMilestones = milestones.map((m) => {
      if (m.level === level) {
        if (type === 'standard' && !m.isClaimed) {
          rewardItem = m.standardReward;
          rewardClaimed = true;
          return { ...m, isClaimed: true };
        }
        if (type === 'premium' && isPremiumUnlocked && !m.isPremiumClaimed) {
          rewardItem = m.premiumReward;
          rewardClaimed = true;
          return { ...m, isPremiumClaimed: true };
        }
      }
      return m;
    });

    if (rewardClaimed && rewardItem) {
      // Add standard benefits to user store
      if (rewardItem.type === 'COINS') {
        userStore.updateUser({ coins: user.coins + rewardItem.amount });
      } else if (rewardItem.type === 'GEMS') {
        userStore.updateUser({ gems: user.gems + rewardItem.amount });
      } else if (rewardItem.type === 'CROWNS') {
        userStore.updateUser({ crowns: (user.crowns || 0) + rewardItem.amount });
      }

      set({ milestones: updatedMilestones });
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_REWARDS_KEY, JSON.stringify(updatedMilestones));
      }
      return true;
    }

    return false;
  },

  syncClaimedState: () => {
    // If we want to restore default milestone list
    set({ milestones: getInitialMilestones() });
  },
}));
