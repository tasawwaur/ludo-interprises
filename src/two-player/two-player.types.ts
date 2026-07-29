export type PlayerColor = 'RED' | 'GREEN';

export interface TwoPlayerState {
  id: string;
  name: string;
  color: PlayerColor;
  isOnline: boolean;
  avatarUrl?: string;
}

export interface TokenState {
  id: string; // token index 0,1,2,3
  color: PlayerColor;
  position: number; // position on track (0 is starting block, 57 is home)
  isSafe: boolean;
  isHome: boolean;
}

export interface MatchState {
  matchId: string;
  players: TwoPlayerState[];
  tokens: TokenState[];
  activePlayerId: string;
  diceValue: number | null;
  status: 'WAITING' | 'PLAYING' | 'COMPLETED';
  winnerId?: string;
  turnStartTime?: string;
}
