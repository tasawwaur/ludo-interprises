import { TwoPlayerRoom } from '../room/create-room';
import { PlayerProfile } from '../players/player-one';

export interface LobbyState {
  room: TwoPlayerRoom;
  players: PlayerProfile[];
  allReady: boolean;
  countdown: number | null;
}

export const buildLobbyState = (
  room: TwoPlayerRoom,
  players: PlayerProfile[]
): LobbyState => ({
  room,
  players,
  allReady: players.length === 2,
  countdown: players.length === 2 ? 5 : null,
});
