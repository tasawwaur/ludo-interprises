export interface TournamentStanding {
  rank: number;
  playerId: string;
  playerName: string;
  avatarUrl?: string;
  points: number;
  matchesPlayed: number;
  matchesWon: number;
  isUser: boolean;
}

export interface TournamentLeaderboardData {
  tournamentId: string;
  standings: TournamentStanding[];
}
