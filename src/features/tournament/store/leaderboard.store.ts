import { create } from 'zustand';
import { TournamentStanding } from '../types/leaderboard.types';

interface LeaderboardState {
  standings: Record<string, TournamentStanding[]>;

  // Actions
  setStandings: (tournamentId: string, list: TournamentStanding[]) => void;
  updatePlayerScore: (tournamentId: string, playerId: string, pointsGained: number) => void;
}

const STORAGE_TOUR_LEADERBOARD = 'ludo_tour_leaderboard_v1';

const getInitialLeaderboard = (): Record<string, TournamentStanding[]> => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_TOUR_LEADERBOARD);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
  }
  return {};
};

export const useLeaderboardStore = create<LeaderboardState>((set) => ({
  standings: getInitialLeaderboard(),

  setStandings: (tournamentId, list) => {
    set((state) => {
      const nextMap = { ...state.standings, [tournamentId]: list };
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_TOUR_LEADERBOARD, JSON.stringify(nextMap));
      }
      return { standings: nextMap };
    });
  },

  updatePlayerScore: (tournamentId, playerId, pointsGained) => {
    set((state) => {
      const list = state.standings[tournamentId];
      if (!list) return {};

      const nextList = list.map((item) => {
        if (item.playerId === playerId) {
          const nextPoints = item.points + pointsGained;
          const nextWins = item.matchesWon + 1;
          const nextPlayed = item.matchesPlayed + 1;
          return {
            ...item,
            points: nextPoints,
            matchesWon: nextWins,
            matchesPlayed: nextPlayed,
          };
        }
        return item;
      });

      // Sort by points descending
      nextList.sort((a, b) => b.points - a.points);
      
      // Update ranks
      const rankedList = nextList.map((item, idx) => ({
        ...item,
        rank: idx + 1,
      }));

      const nextMap = { ...state.standings, [tournamentId]: rankedList };
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_TOUR_LEADERBOARD, JSON.stringify(nextMap));
      }

      return { standings: nextMap };
    });
  },
}));
