import { createRoom, TwoPlayerRoom } from './create-room';
import { RoomSettings } from './room-settings';

// Private room: locked to invitation only via room code sharing
export const createPrivateRoom = (
  hostId: string,
  entryFeeCoins: number = 0
): TwoPlayerRoom => {
  return createRoom(hostId, {
    isPrivate: true,
    entryFeeCoins,
    turnTimeLimitSecs: 30,
    allowReconnect: true,
  } as Partial<RoomSettings>);
};
