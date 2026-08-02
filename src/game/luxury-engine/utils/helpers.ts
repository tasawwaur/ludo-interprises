export class Helpers {
  /**
   * Generates a unique short match or packet identifier.
   */
  public static generateUUID(): string {
    return Math.random().toString(36).substring(2, 9);
  }
}
