export interface TournamentPlayer {
  id: string;
  name: string;
  avatarUrl?: string;
  isNpc: boolean;
  score?: number;
}

export interface BracketMatch {
  id: string;
  roundNumber: number;
  player1: TournamentPlayer | null;
  player2: TournamentPlayer | null;
  score1?: number;
  score2?: number;
  winnerId?: string;
  status: 'PENDING' | 'PLAYING' | 'COMPLETED';
}

export interface RoundStructure {
  roundNumber: number;
  name: string; // e.g. Quarterfinals, Semifinals, Finals
  matches: BracketMatch[];
}
