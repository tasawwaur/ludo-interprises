import { GameState } from '../types';

export class WinEngine {
  /**
   * Evaluates if a player has successfully brought all 4 tokens home.
   */
  public static hasPlayerFinished(tokens: Array<{ state: string }>): boolean {
    return tokens.every((t) => t.state === 'HOME');
  }

  /**
   * Check if game over condition is met.
   * In 1v1 (2P) mode, if 1 player finishes, game is over.
   * In 4P mode, if 3 players finish, game is over.
   */
  public static checkGameOver(
    mode: '2P' | '2v2' | '4P',
    winnerRankingsCount: number
  ): boolean {
    if (mode === '2P') {
      return winnerRankingsCount >= 1;
    }
    return winnerRankingsCount >= 3;
  }
}
