export interface SecurityViolationReport {
  timestamp: number;
  violationType: "SPEED_HACK" | "MEMORY_TAMPER" | "AUTO_CLICKER" | "REPLAY_ATTACK" | "UNKNOWN";
  details: string;
}

export class AntiCheat {
  private static lastTickTime = Date.now();
  private static clickHistory: Array<{ x: number; y: number; time: number }> = [];
  
  // Memory protection hashes map
  private static secureMemoryStore: Record<string, string> = {};

  /**
   * Detect speed hacks by monitoring clock frequency variance.
   * If game tick updates occur faster than physically possible, flags speed hack.
   */
  public static detectSpeedHack(): boolean {
    const now = Date.now();
    const delta = now - this.lastTickTime;
    this.lastTickTime = now;

    // Minimum physical interval between ticks is 8ms. Speed hacks decrease delta below this threshold.
    if (delta < 8) {
      console.warn("Anti-Cheat Triggered: SPEED_HACK_DETECTED. Clock speed anomaly.");
      return true;
    }
    return false;
  }

  /**
   * Anti-Cheat memory vault protecting sensitive scores, gold, and gems against
   * browser inspect element memory editing tools (such as Cheat Engine or Lucky Patcher script models).
   */
  public static setProtectedValue(key: string, value: number): void {
    const hashed = this.hashValue(value);
    this.secureMemoryStore[key] = hashed;
  }

  public static verifyProtectedValue(key: string, currentValue: number): boolean {
    const storedHash = this.secureMemoryStore[key];
    if (!storedHash) return true; // No protection set yet
    
    const computedHash = this.hashValue(currentValue);
    if (storedHash !== computedHash) {
      console.error(`Anti-Cheat Triggered: MEMORY_TAMPER_DETECTED on key: ${key}. Expected hash mismatch.`);
      return false;
    }
    return true;
  }

  /**
   * Auto Clicker Heuristics Analyzer.
   * Monitors mouse/touch coordinates. If click variance is exactly 0 or reaction
   * time has no human jitters (exactly uniform delay), flags auto clicker macro scripts.
   */
  public static recordInputEvent(x: number, y: number): boolean {
    const now = Date.now();
    this.clickHistory.push({ x, y, time: now });

    // Maintain only the last 8 inputs
    if (this.clickHistory.length > 8) {
      this.clickHistory.shift();
    }

    if (this.clickHistory.length < 5) return false;

    // 1. Coordinates Variance Check (Bots tap exactly the same pixel coordinate)
    const firstClick = this.clickHistory[0];
    const allSameCoords = this.clickHistory.every(
      click => Math.abs(click.x - firstClick.x) < 0.001 && Math.abs(click.y - firstClick.y) < 0.001
    );

    if (allSameCoords) {
      console.warn("Anti-Cheat Triggered: AUTO_CLICKER_DETECTED. Uniform pixel coordinates.");
      return true;
    }

    // 2. Uniform Delay Check (Bots use set-interval loops with zero reaction variance)
    const deltas: number[] = [];
    for (let i = 1; i < this.clickHistory.length; i++) {
      deltas.push(this.clickHistory[i].time - this.clickHistory[i - 1].time);
    }

    const avgDelta = deltas.reduce((a, b) => a + b, 0) / deltas.length;
    const timeVariance = deltas.every(d => Math.abs(d - avgDelta) < 3); // less than 3ms jitter indicates bot scripts

    if (timeVariance && avgDelta < 400) {
      console.warn("Anti-Cheat Triggered: MACRO_BOT_DETECTED. Uniform tap intervals detected.");
      return true;
    }

    return false;
  }

  private static hashValue(val: number): string {
    // Basic SHA-like deterministic salt multiplier to obfuscate numbers
    const salt = 0xF59E0B;
    const computed = (val * salt) ^ 0xDEADBEEF;
    return computed.toString(16);
  }
}
export default AntiCheat;
