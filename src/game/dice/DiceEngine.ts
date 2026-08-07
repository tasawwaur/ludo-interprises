export interface DiceRollResult {
  value: number;
  isSix: boolean;
  consecutiveSixesCount: number;
  isInvalidated: boolean; // True if 3 consecutive sixes (turn forfeited)
}

export class DiceEngine {
  /**
   * Performs a dice roll with 40% probability for 6 and equal 12% probability for 1..5.
   */
  static roll(currentConsecutiveSixes: number): DiceRollResult {
    const rand = Math.random();
    let value: number;
    if (rand < 0.40) {
      value = 6;
    } else {
      const otherNumbers = [1, 2, 3, 4, 5];
      const idx = Math.floor((rand - 0.40) / 0.12);
      value = otherNumbers[Math.min(idx, 4)];
    }

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
