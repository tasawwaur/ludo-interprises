import { getRooms, TwoPlayerRoom } from './create-room';
import { isValidRoomCode } from './room-code';

const STORAGE_ROOMS_KEY = 'ludo_2p_rooms_v1';

export const joinRoomByCode = (
  code: string,
  guestId: string
): TwoPlayerRoom | null => {
  if (!isValidRoomCode(code)) return null;

  const rooms = getRooms();
  const roomIdx = rooms.findIndex(
    (r) => r.code === code.toUpperCase() && r.status === 'OPEN'
  );

  if (roomIdx === -1) return null;

  rooms[roomIdx].guestId = guestId;
  rooms[roomIdx].status = 'FULL';

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_ROOMS_KEY, JSON.stringify(rooms));
  }

  return rooms[roomIdx];
};

export const joinRoomById = (
  roomId: string,
  guestId: string
): TwoPlayerRoom | null => {
  const rooms = getRooms();
  const roomIdx = rooms.findIndex(
    (r) => r.roomId === roomId && r.status === 'OPEN'
  );

  if (roomIdx === -1) return null;

  rooms[roomIdx].guestId = guestId;
  rooms[roomIdx].status = 'FULL';

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_ROOMS_KEY, JSON.stringify(rooms));
  }

  return rooms[roomIdx];
};
