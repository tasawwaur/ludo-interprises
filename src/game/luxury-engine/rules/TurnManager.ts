import { GameState, PlayerColor } from '../types';

export class TurnManager {
  /**
   * Returns the next active player color in clockwise order.
   * Skips players who have already finished (reached HOME with all 4 tokens).
   */
  public static getNextTurnColor(state: GameState): PlayerColor {
    const totalPlayers = state.players.length;
    let checkIndex = state.activePlayerIndex;

    for (let i = 0; i < totalPlayers; i++) {
      checkIndex = (checkIndex + 1) % totalPlayers;
      const potentialPlayer = state.players[checkIndex];

      // Verify if player has finished the game
      const allHome = potentialPlayer.tokens.every((t) => t.state === 'HOME');
      if (!allHome && potentialPlayer.isOnline) {
        return potentialPlayer.color;
      }
    }

    // Default fallback to current color if all others finished
    return state.players[state.activePlayerIndex].color;
  }

  /**
   * Evaluates turn continuation or handover.
   * Players get an extra turn if:
   * 1. They roll a 6 (max 2 consecutive).
   * 2. They capture an opponent's token.
   * 3. They reach HOME with a token.
   */
  public static handlePostMoveTurn(
    state: GameState,
    didCapture: boolean,
    didReachHome: boolean,
    rolledSix: boolean
  ): { nextColor: PlayerColor; nextStatus: 'ROLL_WAIT' | 'GAME_OVER' } {
    // 1. Verify Victory / Game Over
    const activePlayer = state.players[state.activePlayerIndex];
    const isWinner = activePlayer.tokens.every((t) => t.state === 'HOME');
    
    let newWinnerRankings = [...state.winnerRankings];
    if (isWinner && !state.winnerRankings.includes(activePlayer.id)) {
      newWinnerRankings.push(activePlayer.id);
    }

    // Check if match is finished (e.g. in 2P, 1 player wins = game over)
    const finishedCount = newWinnerRankings.length;
    const isGameOver = state.mode === '2P' ? finishedCount >= 1 : finishedCount >= 3;

    if (isGameOver) {
      return {
        nextColor: activePlayer.color,
        nextStatus: 'GAME_OVER',
      };
    }

    // Extra Turn logic
    const getsExtraTurn = didCapture || didReachHome || (rolledSix && state.consecutiveSixes < 3);

    if (getsExtraTurn) {
      return {
        nextColor: activePlayer.color,
        nextStatus: 'ROLL_WAIT',
      };
    }

    const nextColor = this.getNextTurnColor({
      ...state,
      winnerRankings: newWinnerRankings,
    });

    return {
      nextColor,
      nextStatus: 'ROLL_WAIT',
    };
  }
}
