import { getRooms } from './create-room';

const STORAGE_ROOMS_KEY = 'ludo_2p_rooms_v1';

export const leaveRoom = (roomId: string, playerId: string): boolean => {
  const rooms = getRooms();
  const roomIdx = rooms.findIndex((r) => r.roomId === roomId);

  if (roomIdx === -1) return false;

  const room = rooms[roomIdx];

  if (room.hostId === playerId) {
    // Host leaves → close the room entirely
    rooms[roomIdx].status = 'CLOSED';
  } else if (room.guestId === playerId) {
    // Guest leaves → room becomes open again
    rooms[roomIdx].guestId = undefined;
    rooms[roomIdx].status = 'OPEN';
  } else {
    return false;
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_ROOMS_KEY, JSON.stringify(rooms));
  }

  return true;
};
