import { create } from 'zustand';
import { RankingReward } from '../types/reward.types';

interface RewardState {
  unclaimedRewards: Record<string, RankingReward[]>;
  claimedRewardsLog: Record<string, boolean>;

  // Actions
  addUnclaimedReward: (tournamentId: string, reward: RankingReward) => void;
  claimTournamentPrize: (tournamentId: string, rank: number) => boolean;
}

const STORAGE_UNCLAIMED_TOUR_REWARDS = 'ludo_tour_unclaimed_rewards_v1';
const STORAGE_CLAIMED_TOUR_LOG = 'ludo_tour_claimed_rewards_log_v1';

const getInitialUnclaimed = (): Record<string, RankingReward[]> => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_UNCLAIMED_TOUR_REWARDS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
  }
  return {};
};

const getInitialClaimedLog = (): Record<string, boolean> => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_CLAIMED_TOUR_LOG);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
  }
  return {};
};

export const useRewardStore = create<RewardState>((set, get) => ({
  unclaimedRewards: getInitialUnclaimed(),
  claimedRewardsLog: getInitialClaimedLog(),

  addUnclaimedReward: (tournamentId, reward) => {
    set((state) => {
      const activeList = state.unclaimedRewards[tournamentId] || [];
      const nextList = [...activeList, reward];
      const nextMap = { ...state.unclaimedRewards, [tournamentId]: nextList };
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_UNCLAIMED_TOUR_REWARDS, JSON.stringify(nextMap));
      }
      return { unclaimedRewards: nextMap };
    });
  },

  claimTournamentPrize: (tournamentId, rank) => {
    const { unclaimedRewards } = get();
    const activeList = unclaimedRewards[tournamentId];
    if (!activeList) return false;

    const rewardIndex = activeList.findIndex((r) => r.rank === rank);
    if (rewardIndex === -1) return false;

    // Filter out the claimed reward
    const nextList = activeList.filter((_, idx) => idx !== rewardIndex);
    
    set((state) => {
      const nextUnclaimed = { ...state.unclaimedRewards, [tournamentId]: nextList };
      const nextLog = { ...state.claimedRewardsLog, [`${tournamentId}_${rank}`]: true };

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_UNCLAIMED_TOUR_REWARDS, JSON.stringify(nextUnclaimed));
        localStorage.setItem(STORAGE_CLAIMED_TOUR_LOG, JSON.stringify(nextLog));
      }

      return { unclaimedRewards: nextUnclaimed, claimedRewardsLog: nextLog };
    });

    return true;
  },
}));
