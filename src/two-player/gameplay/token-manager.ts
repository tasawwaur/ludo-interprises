import { TokenState, PlayerColor } from '../two-player.types';
import { isSafePosition } from './movement';

// Move a token to a new position, check for captures
export interface MoveResult {
  updatedTokens: TokenState[];
  capturedTokenId?: string;
}

export const applyTokenMove = (
  tokens: TokenState[],
  tokenId: string,
  color: PlayerColor,
  newPosition: number
): MoveResult => {
  const updatedTokens = tokens.map((t) => {
    if (t.id === tokenId) {
      return {
        ...t,
        position: newPosition,
        isSafe: isSafePosition(newPosition),
        isHome: newPosition === 58,
      };
    }
    return t;
  });

  // Check if opponent token is on the same position (capture)
  let capturedTokenId: string | undefined;
  const opponentColor: PlayerColor = color === 'RED' ? 'GREEN' : 'RED';

  if (!isSafePosition(newPosition)) {
    const capturedToken = updatedTokens.find(
      (t) => t.color === opponentColor && t.position === newPosition && !t.isHome
    );

    if (capturedToken) {
      capturedTokenId = capturedToken.id;
      // Reset opponent token to base
      const resetIdx = updatedTokens.findIndex((t) => t.id === capturedToken.id);
      if (resetIdx !== -1) {
        updatedTokens[resetIdx] = {
          ...updatedTokens[resetIdx],
          position: 0,
          isSafe: false,
          isHome: false,
        };
      }
    }
  }

  return { updatedTokens, capturedTokenId };
};

// All 4 tokens of a player reached home?
export const hasPlayerWon = (tokens: TokenState[], color: PlayerColor): boolean => {
  return tokens.filter((t) => t.color === color).every((t) => t.isHome);
};
