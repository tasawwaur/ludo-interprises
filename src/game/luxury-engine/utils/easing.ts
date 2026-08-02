export class EasingUtils {
  /**
   * Quadratic ease-in-out formula.
   */
  public static easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  /**
   * Simple linear progress.
   */
  public static linear(t: number): number {
    return t;
  }
}
