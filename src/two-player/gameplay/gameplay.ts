import { MatchState, TokenState, PlayerColor } from '../two-player.types';
import { rollDice } from './dice';
import { calculateNewPosition } from './movement';
import { applyTokenMove, hasPlayerWon } from './token-manager';
import { getNextPlayer, shouldGetBonusTurn } from './turn-manager';

const STORAGE_MATCH_STATE = 'ludo_2p_match_state_v1';

export const initMatchState = (
  matchId: string,
  player1Id: string,
  player2Id: string
): MatchState => {
  const tokens: TokenState[] = [
    // RED tokens (player1) — 4 tokens
    { id: 'red_0', color: 'RED', position: 0, isSafe: false, isHome: false },
    { id: 'red_1', color: 'RED', position: 0, isSafe: false, isHome: false },
    { id: 'red_2', color: 'RED', position: 0, isSafe: false, isHome: false },
    { id: 'red_3', color: 'RED', position: 0, isSafe: false, isHome: false },
    // GREEN tokens (player2) — 4 tokens
    { id: 'green_0', color: 'GREEN', position: 0, isSafe: false, isHome: false },
    { id: 'green_1', color: 'GREEN', position: 0, isSafe: false, isHome: false },
    { id: 'green_2', color: 'GREEN', position: 0, isSafe: false, isHome: false },
    { id: 'green_3', color: 'GREEN', position: 0, isSafe: false, isHome: false },
  ];

  const state: MatchState = {
    matchId,
    players: [
      { id: player1Id, name: 'Player 1', color: 'RED', isOnline: true },
      { id: player2Id, name: 'Player 2', color: 'GREEN', isOnline: true },
    ],
    tokens,
    activePlayerId: player1Id,
    diceValue: null,
    status: 'PLAYING',
    turnStartTime: new Date().toISOString(),
  };

  saveMatchState(state);
  return state;
};

export const saveMatchState = (state: MatchState): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_MATCH_STATE, JSON.stringify(state));
  }
};

export const loadMatchState = (): MatchState | null => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_MATCH_STATE);
    return saved ? JSON.parse(saved) : null;
  }
  return null;
};

export const clearMatchState = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_MATCH_STATE);
  }
};

// Full turn action: roll dice, then move a specific token
export const executeTurn = (
  state: MatchState,
  tokenId: string
): MatchState => {
  const diceValue = rollDice();
  const token = state.tokens.find((t) => t.id === tokenId);
  if (!token) return state;

  const activePlayer = state.players.find((p) => p.id === state.activePlayerId);
  if (!activePlayer) return state;

  const newPosition = calculateNewPosition(token, diceValue);
  if (newPosition === null) {
    // No valid move → switch turn
    const nextColor = getNextPlayer(activePlayer.color);
    const nextPlayer = state.players.find((p) => p.color === nextColor);
    const nextState: MatchState = {
      ...state,
      diceValue,
      activePlayerId: nextPlayer?.id || state.activePlayerId,
      turnStartTime: new Date().toISOString(),
    };
    saveMatchState(nextState);
    return nextState;
  }

  const { updatedTokens, capturedTokenId } = applyTokenMove(
    state.tokens,
    tokenId,
    activePlayer.color,
    newPosition
  );

  const bonusTurn = shouldGetBonusTurn(diceValue, !!capturedTokenId);
  const won = hasPlayerWon(updatedTokens, activePlayer.color);

  let nextPlayerId = state.activePlayerId;
  if (!bonusTurn && !won) {
    const nextColor = getNextPlayer(activePlayer.color);
    const nextPlayer = state.players.find((p) => p.color === nextColor);
    nextPlayerId = nextPlayer?.id || state.activePlayerId;
  }

  const nextState: MatchState = {
    ...state,
    tokens: updatedTokens,
    diceValue,
    activePlayerId: nextPlayerId,
    status: won ? 'COMPLETED' : 'PLAYING',
    winnerId: won ? state.activePlayerId : undefined,
    turnStartTime: new Date().toISOString(),
  };

  saveMatchState(nextState);
  return nextState;
};
