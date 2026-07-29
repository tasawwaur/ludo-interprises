import { PlayerColor } from '../two-player.types';

// Rotate turns between RED and GREEN
export const getNextPlayer = (currentColor: PlayerColor): PlayerColor =>
  currentColor === 'RED' ? 'GREEN' : 'RED';

// Player gets another turn if they rolled 6 or captured a token
export const shouldGetBonusTurn = (diceValue: number, captured: boolean): boolean =>
  diceValue === 6 || captured;
