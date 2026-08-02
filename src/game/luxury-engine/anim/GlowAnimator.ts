export class GlowAnimator {
  private baseIntensity = 0.5;
  private frequency = 2; // Hz

  /**
   * Calculates a pulsing glow intensity (value between min and max) based on elapsed time.
   */
  public static calculatePulse(
    elapsedMs: number,
    frequencyHz: number = 2.0,
    minVal: number = 0.2,
    maxVal: number = 1.0
  ): number {
    const timeSec = elapsedMs / 1000;
    const sinValue = Math.sin(2 * Math.PI * frequencyHz * timeSec);
    // Map -1..1 to minVal..maxVal
    const normalized = (sinValue + 1) / 2;
    return minVal + normalized * (maxVal - minVal);
  }
}
