import { Player, PlayerColor } from './player.types';
import { MoveableToken } from './token.types';

export type GameStatus = 'ROLL_WAIT' | 'MOVE_WAIT' | 'TOKEN_MOVING' | 'GAME_OVER';
export type TeamName = 'TEAM_A' | 'TEAM_B';

export interface GameState {
  matchId: string;
  mode: '2P' | '2v2' | '4P';
  players: Player[];
  activePlayerIndex: number;
  currentTurnColor: PlayerColor;
  diceValue: number | null;
  isDiceRolled: boolean;
  consecutiveSixes: number;
  gameStatus: GameStatus;
  movableTokens: MoveableToken[];
  winnerRankings: string[]; // Player ids in order of finish
  turnTimeRemaining: number;
  lastActionSummary: string;
}
