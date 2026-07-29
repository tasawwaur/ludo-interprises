import { TwoPlayerRoom } from '../room/create-room';
import { MatchState } from '../two-player.types';

export const mapRoomToMatchInfo = (
  room: TwoPlayerRoom
): { matchId: string; fee: number; code: string } => ({
  matchId: room.roomId,
  fee: room.settings.entryFeeCoins,
  code: room.code,
});

export const mapMatchStateToResult = (
  state: MatchState
): { winnerId: string | null; status: string } => ({
  winnerId: state.winnerId ?? null,
  status: state.status,
});
