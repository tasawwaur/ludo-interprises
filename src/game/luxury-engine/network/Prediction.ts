import { GameState, MultiplayerAction } from '../types';

export class Prediction {
  /**
   * Optimistically simulates local moves prior to official server confirmations.
   */
  public static predictState(
    currentState: GameState,
    action: MultiplayerAction,
    stateProcessor: (state: GameState, act: MultiplayerAction) => GameState
  ): GameState {
    return stateProcessor(currentState, action);
  }
}
