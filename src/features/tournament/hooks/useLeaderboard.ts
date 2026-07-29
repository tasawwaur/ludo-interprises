import { useLeaderboardStore } from '../store/leaderboard.store';
import { LeaderboardService } from '../services/LeaderboardService';

export const useLeaderboard = (tournamentId: string) => {
  const standings = useLeaderboardStore((s) => s.standings[tournamentId] || []);

  const loadLeaderboard = () => {
    LeaderboardService.loadLeaderboard(tournamentId);
  };

  return {
    standings,
    loadLeaderboard,
    rewardPlayerPoints: LeaderboardService.rewardPlayerPoints,
  };
};
export default useLeaderboard;
