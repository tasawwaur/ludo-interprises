import { BOARD_RULES } from '../constants/GameConstants';

export class HomeEngine {
  /**
   * Evaluates if a token has reached the center home tile.
   */
  public static hasReachedHome(stepCount: number): boolean {
    return stepCount === BOARD_RULES.FINISHED_STEP;
  }

  /**
   * Determines if target steps exceed the finished home step limit.
   */
  public static exceedsFinishedStep(currentStep: number, roll: number): boolean {
    return currentStep + roll > BOARD_RULES.FINISHED_STEP;
  }
}
