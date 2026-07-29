import { GameState, MoveableToken, PlayerColor, Token } from '../engine/Engine.types';
import { COLOR_START_INDEX, SAFE_TRACK_INDICES } from '../board/BoardCoordinates';

export class RuleValidator {
  /**
   * Calculates all legal token moves for the active player given the dice value.
   */
  static getLegalMoves(state: GameState, diceValue: number): MoveableToken[] {
    const activePlayer = state.players[state.activePlayerIndex];
    if (!activePlayer || state.isDiceRolled === false) return [];

    const legalMoves: MoveableToken[] = [];

    for (const token of activePlayer.tokens) {
      const move = this.evaluateTokenMove(state, activePlayer.color, token, diceValue);
      if (move) {
        legalMoves.push(move);
      }
    }

    return legalMoves;
  }

  /**
   * Evaluates if a single token can move and if it results in a capture or home entry.
   */
  static evaluateTokenMove(
    state: GameState,
    color: PlayerColor,
    token: Token,
    diceValue: number
  ): MoveableToken | null {
    // Case 1: Token in Yard (stepCount === 0)
    if (token.stepCount === 0) {
      if (diceValue === 6) {
        return {
          tokenId: token.id,
          fromStep: 0,
          toStep: 1,
          isCapture: false,
          isHome: false,
        };
      }
      return null;
    }

    // Case 2: Token already at Home (stepCount === 57)
    if (token.stepCount === 57) {
      return null;
    }

    // Case 3: Target step exceeds Home (stepCount + diceValue > 57)
    const targetStep = token.stepCount + diceValue;
    if (targetStep > 57) {
      return null;
    }

    const isHome = targetStep === 57;
    let isCapture = false;

    // Check for capture if target is on outer track (steps 1..51)
    if (targetStep >= 1 && targetStep <= 51) {
      const targetTrackIndex = (COLOR_START_INDEX[color] + (targetStep - 1)) % 52;
      const isSafe = SAFE_TRACK_INDICES.has(targetTrackIndex);

      if (!isSafe) {
        // Search all opponent tokens on outer track
        for (const player of state.players) {
          if (player.color === color) continue;

          for (const oppToken of player.tokens) {
            if (oppToken.stepCount >= 1 && oppToken.stepCount <= 51) {
              const oppTrackIndex = (COLOR_START_INDEX[player.color] + (oppToken.stepCount - 1)) % 52;
              if (oppTrackIndex === targetTrackIndex) {
                isCapture = true;
                break;
              }
            }
          }
          if (isCapture) break;
        }
      }
    }

    return {
      tokenId: token.id,
      fromStep: token.stepCount,
      toStep: targetStep,
      isCapture,
      isHome,
    };
  }

  /**
   * Determines if player earns an extra turn (Rolled a 6, captured an opponent, or reached home).
   */
  static shouldGrantExtraTurn(
    diceValue: number,
    consecutiveSixes: number,
    isCapture: boolean,
    isHome: boolean
  ): boolean {
    if (consecutiveSixes >= 3) return false;
    if (diceValue === 6) return true;
    if (isCapture) return true;
    if (isHome) return true;
    return false;
  }
}
