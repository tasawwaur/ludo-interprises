export class SeededRandom {
  private seed: number;

  constructor(initialSeed: number) {
    this.seed = initialSeed;
  }

  /**
   * Mulberry32 Seeded Pseudo-Random Number Generator.
   * Produces high-quality deterministic pseudo-random values.
   */
  public seededNext(): number {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    const result = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    return result;
  }

  /**
   * Retrieves a deterministic roll between 1 and 6 based on seed state.
   */
  public rollDeterministic(): number {
    const r = this.seededNext();
    return Math.floor(r * 6) + 1;
  }

  public getSeed(): number {
    return this.seed;
  }

  public setSeed(newSeed: number): void {
    this.seed = newSeed;
  }
}
