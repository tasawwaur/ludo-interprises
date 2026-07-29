import { TournamentStanding } from '../types/leaderboard.types';

export const fetchTournamentLeaderboardApi = async (tournamentId: string): Promise<TournamentStanding[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { rank: 1, playerId: 'npc_2', playerName: 'Roxana', points: 1500, matchesPlayed: 4, matchesWon: 4, isUser: false },
        { rank: 2, playerId: 'user_1', playerName: 'TASAVVUR', points: 1200, matchesPlayed: 4, matchesWon: 3, isUser: true },
        { rank: 3, playerId: 'npc_5', playerName: 'Sarah', points: 900, matchesPlayed: 3, matchesWon: 2, isUser: false },
        { rank: 4, playerId: 'npc_6', playerName: 'Pranav', points: 800, matchesPlayed: 3, matchesWon: 2, isUser: false },
      ]);
    }, 200);
  });
};
