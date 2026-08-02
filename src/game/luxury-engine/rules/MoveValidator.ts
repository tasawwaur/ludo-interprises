import { GameState, MoveableToken, Token, PlayerColor } from '../types';
import { BOARD_RULES, COLOR_START_INDEX } from '../constants/GameConstants';
import { SafeZoneEngine } from './SafeZoneEngine';
import { HomeEngine } from './HomeEngine';
import { KillEngine } from './KillEngine';

export class MoveValidator {
  /**
   * Calculates all legal moves for a player given the active dice roll.
   */
  public static getLegalMoves(state: GameState, diceValue: number): MoveableToken[] {
    const activePlayer = state.players[state.activePlayerIndex];
    if (!activePlayer) return [];

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
   * Validates if a specific token can move. Returns the MoveableToken detail or null.
   */
  public static evaluateTokenMove(
    state: GameState,
    color: PlayerColor,
    token: Token,
    diceValue: number
  ): MoveableToken | null {
    // Yard state
    if (token.state === 'YARD') {
      if (diceValue === BOARD_RULES.SPAWN_REQUIREMENT_ROLL) {
        return {
          tokenId: token.id,
          fromStep: 0,
          toStep: 1, // Exits yard to step 1
          isCapture: false,
          isHome: false,
        };
      }
      return null;
    }

    // Finished/Home state
    if (token.state === 'HOME') {
      return null;
    }

    // Exceeds finished step checks
    if (HomeEngine.exceedsFinishedStep(token.stepCount, diceValue)) {
      return null;
    }

    const targetStep = token.stepCount + diceValue;
    const isHome = HomeEngine.hasReachedHome(targetStep);

    // Evaluate capture target
    const captured = KillEngine.getCapturedTokens(state, color, targetStep);
    const isCapture = captured.length > 0;

    return {
      tokenId: token.id,
      fromStep: token.stepCount,
      toStep: targetStep,
      isCapture,
      isHome,
    };
  }
}
