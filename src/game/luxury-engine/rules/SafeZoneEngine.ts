import { SAFE_TRACK_INDICES } from '../constants/GameConstants';

export class SafeZoneEngine {
  /**
   * Checks if an outer track tile index is safe.
   */
  public static isSafeIndex(trackIndex: number): boolean {
    return SAFE_TRACK_INDICES.has(trackIndex);
  }

  /**
   * Checks if the step is safe zone (stepCount >= 52).
   */
  public static isHomePath(stepCount: number): boolean {
    return stepCount >= 52 && stepCount <= 56;
  }
}
