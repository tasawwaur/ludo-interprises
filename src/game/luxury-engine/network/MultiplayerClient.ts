import { GameState, MultiplayerAction } from '../types';
import { Prediction } from './Prediction';
import { Rollback } from './Rollback';

export class MultiplayerClient {
  private localStateHistory: Array<{ actionIndex: number; state: GameState }> = [];
  private pendingLocalActions: MultiplayerAction[] = [];
  private lastConfirmedActionIndex = -1;

  constructor() {}

  /**
   * Records a local optimistic action and returns a predicted local state.
   */
  public applyOptimisticAction(
    currentState: GameState,
    action: MultiplayerAction,
    stateProcessor: (state: GameState, act: MultiplayerAction) => GameState
  ): GameState {
    this.pendingLocalActions.push(action);
    const predictedState = Prediction.predictState(currentState, action, stateProcessor);

    // Save history for potential future rollback
    this.localStateHistory.push({
      actionIndex: action.actionIndex,
      state: predictedState,
    });

    return predictedState;
  }

  /**
   * Reconciles local predicted state with authoritative server states.
   * If server action index does not match or a prediction error is found,
   * performs rollback and re-applies pending actions.
   */
  public reconcileState(
    serverState: GameState,
    serverLastActionIndex: number,
    stateProcessor: (state: GameState, act: MultiplayerAction) => GameState
  ): GameState {
    this.lastConfirmedActionIndex = serverLastActionIndex;

    // Filter out actions that have already been confirmed by the server
    this.pendingLocalActions = this.pendingLocalActions.filter(
      (action) => action.actionIndex > serverLastActionIndex
    );

    // Remove obsolete history entries
    this.localStateHistory = this.localStateHistory.filter(
      (entry) => entry.actionIndex > serverLastActionIndex
    );

    if (this.pendingLocalActions.length === 0) {
      // Complete sync achieved, return authoritative server state
      return serverState;
    }

    // Rollback: Re-apply outstanding local actions on top of server state
    return Rollback.rollbackAndReplay(serverState, this.pendingLocalActions, stateProcessor);
  }

  /**
   * Clears transaction logs (used on matchmaking cleanups or exits).
   */
  public clear(): void {
    this.localStateHistory = [];
    this.pendingLocalActions = [];
    this.lastConfirmedActionIndex = -1;
  }
}
