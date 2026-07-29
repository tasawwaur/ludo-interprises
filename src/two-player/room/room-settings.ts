export interface RoomSettings {
  entryFeeCoins: number;
  turnTimeLimitSecs: number;
  isPrivate: boolean;
  allowReconnect: boolean;
}

export const DEFAULT_ROOM_SETTINGS: RoomSettings = {
  entryFeeCoins: 100,
  turnTimeLimitSecs: 30,
  isPrivate: false,
  allowReconnect: true,
};

export const applyRoomSettings = (
  partial: Partial<RoomSettings>
): RoomSettings => ({
  ...DEFAULT_ROOM_SETTINGS,
  ...partial,
});
