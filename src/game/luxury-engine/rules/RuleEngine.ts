import { GameState, MoveableToken, Token, PlayerColor } from '../types';
import { MoveValidator } from './MoveValidator';
import { KillEngine } from './KillEngine';

export class RuleEngine {
  /**
   * Calculates all legal moves for a player given the active dice roll.
   */
  public static getLegalMoves(state: GameState, diceValue: number): MoveableToken[] {
    return MoveValidator.getLegalMoves(state, diceValue);
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
    return MoveValidator.evaluateTokenMove(state, color, token, diceValue);
  }

  /**
   * Identifies all opponent tokens that will be sent back to Yard (captured) by a movement.
   */
  public static getCapturedTokens(
    state: GameState,
    moverColor: PlayerColor,
    targetStep: number
  ): Token[] {
    return KillEngine.getCapturedTokens(state, moverColor, targetStep);
  }
}
