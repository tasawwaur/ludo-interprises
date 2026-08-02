import { RollResult, GameState, MultiplayerAction } from '../types';
import { SecureRandom } from './SecureRandom';

export class ValidationService {
  /**
   * Validates if a client-side dice roll checksum matches the server calculation.
   * Prevents client memory editor roll modifications (Anti-Cheat).
   */
  public static async validateRoll(
    roll: RollResult,
    matchId: string,
    actionIndex: number,
    seed: number
  ): Promise<boolean> {
    const tempRandom = new SecureRandom(seed);
    const calculatedChecksum = await tempRandom.generateChecksum(roll.value, matchId, actionIndex);
    return roll.checksum === calculatedChecksum;
  }

  /**
   * Validates if a player has permission to execute the action based on turn state.
   */
  public static validateActionTurn(
    state: GameState,
    action: MultiplayerAction
  ): boolean {
    const activePlayer = state.players[state.activePlayerIndex];
    if (!activePlayer || activePlayer.id !== action.playerId) {
      return false;
    }

    if (action.type === 'ROLL' && state.gameStatus !== 'ROLL_WAIT') {
      return false;
    }

    if (action.type === 'MOVE' && state.gameStatus !== 'MOVE_WAIT') {
      return false;
    }

    return true;
  }

  /**
   * Performs check on consecutive roll sequence.
   * Ludo rules forbid three consecutive 6s.
   */
  public static validateRollSequence(
    consecutiveSixes: number,
    rolledValue: number
  ): { isValidSequence: boolean; newConsecutiveCount: number } {
    if (rolledValue === 6) {
      const nextCount = consecutiveSixes + 1;
      if (nextCount >= 3) {
        return { isValidSequence: false, newConsecutiveCount: 0 };
      }
      return { isValidSequence: true, newConsecutiveCount: nextCount };
    }
    return { isValidSequence: true, newConsecutiveCount: 0 };
  }

  /**
   * Validates token path steps against board configurations to prevent teleport cheats.
   */
  public static validateTokenMovementPath(
    fromStep: number,
    toStep: number,
    diceValue: number
  ): boolean {
    if (fromStep === 0) {
      // Must roll 6 to exit yard to step 1
      return diceValue === 6 && toStep === 1;
    }
    return toStep - fromStep === diceValue;
  }
}
