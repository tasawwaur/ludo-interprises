export class Logger {
  private static prefix = '[LuxuryEngine]';

  public static info(msg: string, ...args: any[]): void {
    console.log(`${this.prefix} INFO: ${msg}`, ...args);
  }

  public static warn(msg: string, ...args: any[]): void {
    console.warn(`${this.prefix} WARN: ${msg}`, ...args);
  }

  public static error(msg: string, ...args: any[]): void {
    console.error(`${this.prefix} ERROR: ${msg}`, ...args);
  }
}
