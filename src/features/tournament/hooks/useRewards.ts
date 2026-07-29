import { useRewardStore } from '../store/reward.store';
import { RewardService } from '../services/RewardService';
import { RankingReward } from '../types/reward.types';

export const useRewards = (tournamentId: string) => {
  const unclaimed = useRewardStore((s) => s.unclaimedRewards[tournamentId] || []);

  const claimPrize = async (reward: RankingReward) => {
    return RewardService.claimPrize(tournamentId, reward);
  };

  return {
    unclaimed,
    claimPrize,
  };
};
export default useRewards;
