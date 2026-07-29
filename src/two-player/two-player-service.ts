import { twoPlayerManager } from './two-player-manager';
import { executeTurn } from './gameplay/gameplay';
import { startTurnTimer, clearTurnTimer } from './gameplay/timer';
import { MAX_TURN_TIME_SECONDS } from './two-player.constants';
import { MatchState } from './two-player.types';

// Service layer: orchestrates game events and delegates to manager
export class TwoPlayerService {
  startGame(player1Id: string, player2Id: string, entryFeeCoins: number): MatchState {
    return twoPlayerManager.startMatch(player1Id, player2Id, entryFeeCoins);
  }

  handleTurn(state: MatchState, tokenId: string): MatchState {
    const matchId = state.matchId;
    clearTurnTimer(matchId);

    const newState = executeTurn(state, tokenId);
    twoPlayerManager.updateState(newState);

    if (newState.status !== 'COMPLETED') {
      startTurnTimer(matchId, () => {
        // Auto-pass on timeout: noop here, handled by game loop
      }, MAX_TURN_TIME_SECONDS);
    } else if (newState.winnerId && newState.players) {
      const loserId = newState.players.find((p) => p.id !== newState.winnerId)?.id;
      if (loserId) twoPlayerManager.endMatch(newState.winnerId, loserId);
    }

    return newState;
  }

  surrender(playerId: string): void {
    twoPlayerManager.surrender(playerId);
  }

  pause(): void {
    twoPlayerManager.pause();
  }

  resume(): boolean {
    return twoPlayerManager.resume();
  }
}

export const twoPlayerService = new TwoPlayerService();
