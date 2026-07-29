import { createRoom, TwoPlayerRoom, getRooms } from '../room/create-room';
import { RoomSettings } from '../room/room-settings';

// Mock API for room operations (localStorage-backed)
export const roomApi = {
  create: (hostId: string, settings?: Partial<RoomSettings>): TwoPlayerRoom =>
    createRoom(hostId, settings),

  list: (): TwoPlayerRoom[] => getRooms().filter((r) => r.status === 'OPEN'),

  getById: (roomId: string): TwoPlayerRoom | undefined =>
    getRooms().find((r) => r.roomId === roomId),

  getByCode: (code: string): TwoPlayerRoom | undefined =>
    getRooms().find((r) => r.code === code.toUpperCase()),
};
