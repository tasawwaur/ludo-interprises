export class Timer {
  private startTime = 0;

  public start(): void {
    this.startTime = Date.now();
  }

  public getElapsedMs(): number {
    return Date.now() - this.startTime;
  }
}
