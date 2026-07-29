import { initMatchState, loadMatchState, saveMatchState, executeTurn } from '../gameplay/gameplay';
import { MatchState } from '../two-player.types';

export const gameplayApi = {
  start: (matchId: string, player1Id: string, player2Id: string): MatchState =>
    initMatchState(matchId, player1Id, player2Id),

  load: (): MatchState | null => loadMatchState(),

  move: (state: MatchState, tokenId: string): MatchState =>
    executeTurn(state, tokenId),

  save: (state: MatchState): void => saveMatchState(state),
};
