import { BOARD_SAFE_ZONES, TRACK_LENGTH, HOME_PATH_LENGTH } from '../two-player.constants';
import { TokenState } from '../two-player.types';

// Calculate new position after a move
export const calculateNewPosition = (
  token: TokenState,
  diceValue: number
): number | null => {
  // Token still in home base (position 0), needs a 6 to enter
  if (token.position === 0 && diceValue !== 6) return null;
  if (token.position === 0 && diceValue === 6) return 1;

  const newPos = token.position + diceValue;

  // Token overshoots home path
  if (newPos > TRACK_LENGTH + HOME_PATH_LENGTH) return null;

  return newPos;
};

// Check if a position is a safe zone
export const isSafePosition = (position: number): boolean => {
  return BOARD_SAFE_ZONES.includes(position);
};

// Check if token has reached home
export const isTokenHome = (position: number): boolean => {
  return position === TRACK_LENGTH + HOME_PATH_LENGTH;
};
