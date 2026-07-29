import { useLeaderboardStore } from '../store/leaderboard.store';
import { fetchTournamentLeaderboardApi } from '../api';

export const LeaderboardService = {
  loadLeaderboard: async (tournamentId: string) => {
    const list = await fetchTournamentLeaderboardApi(tournamentId);
    useLeaderboardStore.getState().setStandings(tournamentId, list);
  },

  rewardPlayerPoints: (tournamentId: string, playerId: string, points: number) => {
    useLeaderboardStore.getState().updatePlayerScore(tournamentId, playerId, points);
  },
};
export default LeaderboardService;
