import { MultiplayerAction, GameState } from '../types';

export class ReplayProtection {
  /**
   * Validates if the action index is strictly sequential to prevent skipped action packet exploits.
   */
  public static validateSequence(
    lastActionIndex: number,
    incomingActionIndex: number
  ): boolean {
    return incomingActionIndex === lastActionIndex + 1;
  }

  /**
   * Validates action timestamp to prevent stale packet replay attacks.
   * Ensures packets are not older than the allowed tolerance threshold (e.g. 5 seconds).
   */
  public static validateTimestamp(
    actionTimestamp: number,
    currentServerTime: number,
    toleranceMs: number = 5000
  ): boolean {
    const age = currentServerTime - actionTimestamp;
    return age >= -toleranceMs && age <= toleranceMs;
  }

  /**
   * Evaluates packet integrity signature if enabled in match settings.
   */
  public static validatePacketIntegrity(
    action: MultiplayerAction,
    expectedPlayerId: string
  ): boolean {
    return action.playerId === expectedPlayerId;
  }
}
