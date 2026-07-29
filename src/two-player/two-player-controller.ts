import { twoPlayerService } from './two-player-service';
import { MatchState } from './two-player.types';

// Controller: thin layer translating UI actions → service calls
export class TwoPlayerController {
  onStartGame(player1Id: string, player2Id: string, entryFeeCoins: number): MatchState {
    return twoPlayerService.startGame(player1Id, player2Id, entryFeeCoins);
  }

  onTokenClick(state: MatchState, tokenId: string): MatchState {
    return twoPlayerService.handleTurn(state, tokenId);
  }

  onSurrender(playerId: string): void {
    twoPlayerService.surrender(playerId);
  }

  onPause(): void {
    twoPlayerService.pause();
  }

  onResume(): boolean {
    return twoPlayerService.resume();
  }
}

export const twoPlayerController = new TwoPlayerController();
