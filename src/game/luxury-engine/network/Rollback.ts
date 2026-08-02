import { GameState, MultiplayerAction } from '../types';

export class Rollback {
  /**
   * Reverts predicted game state back to last confirmed state and reapplies pending actions.
   */
  public static rollbackAndReplay(
    authoritativeState: GameState,
    pendingActions: MultiplayerAction[],
    stateProcessor: (state: GameState, act: MultiplayerAction) => GameState
  ): GameState {
    let replayedState = { ...authoritativeState };
    for (const action of pendingActions) {
      replayedState = stateProcessor(replayedState, action);
    }
    return replayedState;
  }
}
