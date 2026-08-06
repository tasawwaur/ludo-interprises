/**
 * 🔒 SNAKES & LADDERS - LOCKED MODULE (GAME ENGINE TYPES)
 * --------------------------------------------------
 * This file is part of the isolated Snakes & Ladders game engine.
 * The gameplay logic is working perfectly. Do NOT modify or edit this file
 * to prevent breaking changes or desync in gameplay.
 * Locked at: v10 — All bug fixes (BUG 1, 3, 4, 5, 7) applied & verified.
 */

export type PlayerColor = "RED" | "GREEN" | "YELLOW" | "BLUE";
export type GamePhase = "LOBBY" | "PLAYING" | "FINISHED";

export interface TokenState {
  tokenId: number; // 0 or 1
  playerId: string;
  tokenColor: PlayerColor;
  currentPosition: number; // 1-100
  previousPosition: number; // 1-100
  isMoving: boolean;
  isFinished: boolean;
  isUnlocked: boolean;
}

export interface PlayerState {
  id: string;
  name: string;
  color: PlayerColor;
  tokens: TokenState[];
  isBot: boolean;
  avatar?: string;
  equippedFrameId?: string;
  winnerRank?: number; // 1, 2, 3, 4
  killCount?: number;
  ladderCount?: number;
}

export interface GameState {
  phase: GamePhase;
  players: PlayerState[];
  activePlayerIndex: number;
  currentTurnColor: PlayerColor;
  diceValue: number | null;
  consecutiveSixesCount: number;
  winnerCount: number;
  isWaitingForTokenChoice: boolean;
  movableTokenIds: number[];
  lastMovePath: number[]; // Step-by-step cell list for client animation
  logMessage: string;
}

export type GameEventType =
  | "DICE_ROLL_START"
  | "DICE_ROLL_COMPLETE"
  | "TOKEN_MOVE_STEP"
  | "SNAKE_SLIDE"
  | "LADDER_CLIMB"
  | "EXTRA_TURN"
  | "TOKEN_KILL"
  | "PLAYER_FINISHED"
  | "GAME_OVER"
  | "STATE_UPDATE";

export interface GameEventPayload {
  state: GameState;
  diceValue?: number;
  activePlayerColor?: PlayerColor;
  tokenId?: number;
  stepCell?: number;
  snakeStart?: number;
  snakeEnd?: number;
  ladderStart?: number;
  ladderEnd?: number;
  winnerRank?: number;
  message?: string;
}

export interface EngineConfig {
  tokensPerPlayer: number; // 1 or 2
  animationDelayMs: number; // Configurable step animation speed
}
