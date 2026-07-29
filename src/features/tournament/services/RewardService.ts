import { useRewardStore } from '../store/reward.store';
import { useUserStore } from '../../../user/user.store';
import { claimTournamentRewardApi } from '../api';
import { RankingReward } from '../types/reward.types';

export const RewardService = {
  claimPrize: async (tournamentId: string, reward: RankingReward): Promise<boolean> => {
    const success = await claimTournamentRewardApi(tournamentId, reward.rank);
    if (success) {
      const userStore = useUserStore.getState();
      const user = userStore.user;
      if (user) {
        // Apply currencies to profile
        const coinsReward = reward.coins || 0;
        const gemsReward = reward.gems || 0;
        const crownsReward = reward.trophies || 0; // trophies map to crowns
        
        userStore.updateUser({
          coins: user.coins + coinsReward,
          gems: user.gems + gemsReward,
          crowns: (user.crowns || 0) + crownsReward,
        });
      }

      useRewardStore.getState().claimTournamentPrize(tournamentId, reward.rank);
      return true;
    }
    return false;
  },
};
export default RewardService;
