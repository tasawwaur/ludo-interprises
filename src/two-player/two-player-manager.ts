import { createRoom } from './room/create-room';
import { leaveRoom } from './room/leave-room';
import { initMatchState, clearMatchState } from './gameplay/gameplay';
import { clearTurnTimer } from './gameplay/timer';
import { surrenderMatch } from './gameplay/surrender';
import { pauseMatch, resumeMatch } from './gameplay/pause';
import { clearActiveMatch } from './matchmaking/reconnect';
import { markPlayerOnline, markPlayerOffline } from './players/player-status';
import { resultsApi } from './api/results-api';
import { rewardsApi } from './api/rewards-api';
import { MatchState } from './two-player.types';
import { TwoPlayerRoom } from './room/create-room';

export class TwoPlayerManager {
  private activeRoom: TwoPlayerRoom | null = null;
  private activeState: MatchState | null = null;
  private matchStartTime: number = 0;

  startMatch(player1Id: string, player2Id: string, entryFeeCoins: number): MatchState {
    this.activeRoom = createRoom(player1Id, { entryFeeCoins });
    const matchId = this.activeRoom.roomId;

    markPlayerOnline(player1Id);
    markPlayerOnline(player2Id);

    this.activeState = initMatchState(matchId, player1Id, player2Id);
    this.matchStartTime = Date.now();
    return this.activeState;
  }

  updateState(state: MatchState): void {
    this.activeState = state;
  }

  endMatch(winnerId: string, loserId: string): void {
    if (!this.activeRoom || !this.activeState) return;

    const durationSecs = Math.floor((Date.now() - this.matchStartTime) / 1000);
    const fee = this.activeRoom.settings.entryFeeCoins;

    resultsApi.save(this.activeState.matchId, winnerId, loserId, fee, durationSecs);
    rewardsApi.grantCoins(fee * 2);
    rewardsApi.grantMatchXp(true, 0);
    clearActiveMatch();

    this.activeRoom = null;
    this.activeState = null;
  }

  surrender(playerId: string): void {
    if (!this.activeState) return;
    surrenderMatch(this.activeState.matchId, playerId);
    clearTurnTimer(this.activeState.matchId);
    clearMatchState();
    this.activeRoom = null;
    this.activeState = null;
  }

  pause(): void {
    if (this.activeState) pauseMatch(this.activeState.matchId);
  }

  resume(): boolean {
    if (!this.activeState) return false;
    return resumeMatch(this.activeState.matchId);
  }

  getActiveState(): MatchState | null {
    return this.activeState;
  }
}

// Singleton
export const twoPlayerManager = new TwoPlayerManager();
