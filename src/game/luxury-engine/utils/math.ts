export class MathUtils {
  /**
   * Clamps a value between a minimum and maximum range.
   */
  public static clamp(val: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, val));
  }

  /**
   * Linearly interpolates between two numbers.
   */
  public static lerp(start: number, end: number, amt: number): number {
    return (1 - amt) * start + amt * end;
  }
}
