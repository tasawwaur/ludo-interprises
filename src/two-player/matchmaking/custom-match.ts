import { joinRoomByCode, joinRoomById } from '../room/join-room';
import { TwoPlayerRoom } from '../room/create-room';

// Custom match: join by explicit room code or room ID
export const joinCustomMatchByCode = (
  code: string,
  guestId: string
): TwoPlayerRoom | null => {
  return joinRoomByCode(code, guestId);
};

export const joinCustomMatchById = (
  roomId: string,
  guestId: string
): TwoPlayerRoom | null => {
  return joinRoomById(roomId, guestId);
};
