import { GameState, PlayerColor } from '../engine/Engine.types';

export class TurnManager {
  /**
   * Advances turn index to the next active player.
   */
  static getNextPlayerIndex(state: GameState): number {
    const total = state.players.length;
    let nextIndex = (state.activePlayerIndex + 1) % total;

    // Loop to find next player who has not finished all 4 tokens
    for (let i = 0; i < total; i++) {
      const player = state.players[nextIndex];
      const hasFinishedAll = player.tokens.every((t) => t.stepCount === 57);
      if (!hasFinishedAll) {
        return nextIndex;
      }
      nextIndex = (nextIndex + 1) % total;
    }

    return state.activePlayerIndex;
  }

  /**
   * Returns player color for given index.
   */
  static getPlayerColorByIndex(state: GameState, index: number): PlayerColor {
    return state.players[index]?.color || 'RED';
  }
}
