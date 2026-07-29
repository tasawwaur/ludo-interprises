import { TwoPlayerRoom } from '../room/create-room';

export interface RoomCardData {
  room: TwoPlayerRoom;
  hostName: string;
  joinable: boolean;
}

export const buildRoomCard = (
  room: TwoPlayerRoom,
  hostName: string
): RoomCardData => ({
  room,
  hostName,
  joinable: room.status === 'OPEN',
});
