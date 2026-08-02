export class SyncManager {
  private pingIntervalMs = 2000;
  private pings: number[] = [];
  private lastPingSentTime = 0;

  /**
   * Tracks ping delays to maintain authoritative latency compensation.
   */
  public recordPingRequest(): void {
    this.lastPingSentTime = Date.now();
  }

  public recordPingResponse(): number {
    const latency = Date.now() - this.lastPingSentTime;
    this.pings.push(latency);
    if (this.pings.length > 10) {
      this.pings.shift(); // Maintain sliding window of 10 pings
    }
    return latency;
  }

  public getAverageLatency(): number {
    if (this.pings.length === 0) return 0;
    const sum = this.pings.reduce((a, b) => a + b, 0);
    return sum / this.pings.length;
  }
}
