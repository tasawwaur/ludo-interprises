import { create } from 'zustand';
import { UserRewardTracker } from '../types/reward.types';
import { REWARD_COOLDOWN_MINUTES } from '../constants/reward.constants';

interface RewardedStoreState {
  claims: UserRewardTracker[];

  // Actions
  recordClaim: (rewardId: string) => void;
  getCooldownRemainingSeconds: (rewardId: string) => number;
}

const STORAGE_REWARDS_CLAIM = 'ludo_ads_rewards_claims_v1';

const getInitialClaims = (): UserRewardTracker[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_REWARDS_CLAIM);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
  }
  return [];
};

export const useRewardedStore = create<RewardedStoreState>((set, get) => ({
  claims: getInitialClaims(),

  recordClaim: (rewardId) => {
    const newClaim: UserRewardTracker = {
      rewardId,
      isClaimed: true,
      claimTimestamp: new Date().toISOString(),
    };

    set((state) => {
      // Keep only last claim per reward ID
      const filtered = state.claims.filter((c) => c.rewardId !== rewardId);
      const nextClaims = [newClaim, ...filtered];

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_REWARDS_CLAIM, JSON.stringify(nextClaims));
      }
      return { claims: nextClaims };
    });
  },

  getCooldownRemainingSeconds: (rewardId) => {
    const { claims } = get();
    const claim = claims.find((c) => c.rewardId === rewardId);
    if (!claim) return 0;

    const claimTime = new Date(claim.claimTimestamp).getTime();
    const now = Date.now();
    const elapsedMs = now - claimTime;
    const cooldownMs = REWARD_COOLDOWN_MINUTES * 60 * 1000;

    const remainingMs = cooldownMs - elapsedMs;
    return remainingMs > 0 ? Math.ceil(remainingMs / 1000) : 0;
  },
}));
