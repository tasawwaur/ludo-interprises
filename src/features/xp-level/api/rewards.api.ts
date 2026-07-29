import { LevelMilestoneReward } from '../types/reward.types';
import { LEVEL_MILESTONE_REWARDS } from '../constants/reward.constants';

export const fetchMilestoneRewards = async (): Promise<LevelMilestoneReward[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(LEVEL_MILESTONE_REWARDS);
    }, 300);
  });
};

export const claimMilestoneRewardApi = async (level: number, type: 'standard' | 'premium'): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 200);
  });
};

export const unlockPremiumTrackApi = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 300);
  });
};
