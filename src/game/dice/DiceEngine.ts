export interface DiceRollResult {
  value: number;
  isSix: boolean;
  consecutiveSixesCount: number;
  isInvalidated: boolean; // True if 3 consecutive sixes (turn forfeited)
}

export class DiceEngine {
  /**
   * Performs a deterministic or randomized dice roll.
   */
  static roll(currentConsecutiveSixes: number): DiceRollResult {
    const value = Math.floor(Math.random() * 6) + 1;
    const isSix = value === 6;
    const consecutiveSixesCount = isSix ? currentConsecutiveSixes + 1 : 0;
    const isInvalidated = consecutiveSixesCount >= 3;

    return {
      value,
      isSix,
      consecutiveSixesCount: isInvalidated ? 0 : consecutiveSixesCount,
      isInvalidated,
    };
  }
}
