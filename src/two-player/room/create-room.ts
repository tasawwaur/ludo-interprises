import { generateRoomCode } from './room-code';
import { RoomSettings, DEFAULT_ROOM_SETTINGS } from './room-settings';

export interface TwoPlayerRoom {
  roomId: string;
  code: string;
  hostId: string;
  guestId?: string;
  settings: RoomSettings;
  status: 'OPEN' | 'FULL' | 'IN_GAME' | 'CLOSED';
  createdAt: string;
}

const STORAGE_ROOMS_KEY = 'ludo_2p_rooms_v1';

export const createRoom = (hostId: string, settings?: Partial<RoomSettings>): TwoPlayerRoom => {
  const room: TwoPlayerRoom = {
    roomId: `room_${Math.random().toString(36).substring(2, 9)}`,
    code: generateRoomCode(),
    hostId,
    settings: { ...DEFAULT_ROOM_SETTINGS, ...settings },
    status: 'OPEN',
    createdAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    const existing = getRooms();
    existing.push(room);
    localStorage.setItem(STORAGE_ROOMS_KEY, JSON.stringify(existing));
  }

  return room;
};

export const getRooms = (): TwoPlayerRoom[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_ROOMS_KEY);
    return saved ? JSON.parse(saved) : [];
  }
  return [];
};

export const getRoomById = (roomId: string): TwoPlayerRoom | undefined => {
  return getRooms().find((r) => r.roomId === roomId);
};
