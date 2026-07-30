export type PlayerColor = 'RED' | 'GREEN' | 'YELLOW' | 'BLUE';

export type TokenState = 'YARD' | 'TRACK' | 'HOME_PATH' | 'HOME';

export type TeamName = 'TEAM_A' | 'TEAM_B';

export interface Token {
  id: string;             // e.g. 'RED_0'
  color: PlayerColor;
  index: number;          // 0 to 3 index in player's tokens
  position: number;       // -1 = Yard, 0..51 = Outer Track, 52..56 = Home Path, 57 = HOME
  stepCount: number;      // 0 = Yard, 1 = Start spot, 52 = Home Path Start, 57 = Finished
  state: TokenState;
}

export interface Player {
  id: string;
  name: string;
  color: PlayerColor;
  team?: TeamName;
  avatar?: string;
  profileFrame?: string;
  nameBanner?: string;
  isAi: boolean;
  isHost: boolean;
  isReady: boolean;
  rank?: number;
  tokens: Token[];
  // Stats
  level: number;
  coins: number;
  gems: number;
  winRate: number;
  matchesPlayed: number;
}

export type GameStatus = 
  | 'INITIALIZING'
  | 'ROLL_WAIT'
  | 'DICE_ROLLING'
  | 'MOVE_WAIT'
  | 'TOKEN_MOVING'
  | 'EVALUATING'
  | 'GAME_OVER';

export interface MoveableToken {
  tokenId: string;
  fromStep: number;
  toStep: number;
  isCapture: boolean;
  isHome: boolean;
}

export interface AnimatingTokenState {
  tokenId: string;
  color: PlayerColor;
  fromStep: number;
  toStep: number;
  currentStep: number;
}

export interface GameState {
  matchId: string;
  mode: '2P' | '2v2' | '4P';
  players: Player[];
  activePlayerIndex: number;
  currentTurnColor: PlayerColor;
  diceValue: number | null;
  lastDiceValue: number | null;
  isDiceRolled: boolean;
  consecutiveSixes: number;
  gameStatus: GameStatus;
  movableTokens: MoveableToken[];
  winnerRankings: PlayerColor[];
  turnTimeRemaining: number;
  lastActionSummary: string;
  animatingToken?: AnimatingTokenState | null;
}

export interface MoveAction {
  playerId: string;
  color: PlayerColor;
  tokenId: string;
  diceValue: number;
  timestamp: number;
}

export interface GameReplayEvent {
  step: number;
  timestamp: number;
  type: 'DICE_ROLL' | 'TOKEN_MOVE' | 'CAPTURE' | 'HOME_REACHED' | 'TURN_CHANGE' | 'GAME_OVER';
  color: PlayerColor;
  payload: Record<string, unknown>;
}
