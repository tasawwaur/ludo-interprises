import { MatchState } from '../two-player.types';
import { saveMatchState, loadMatchState } from '../gameplay/gameplay';

// Sync current match state snapshot to a remote-compatible format (currently localStorage)
export const syncMatchState = (state: MatchState): void => {
  saveMatchState(state);
};

export const fetchSyncedState = (): MatchState | null => {
  return loadMatchState();
};

export const isTurnMine = (state: MatchState, playerId: string): boolean => {
  return state.activePlayerId === playerId;
};
