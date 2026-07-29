export type PlayerOnlineStatus = 'ONLINE' | 'RECONNECTING' | 'OFFLINE' | 'IDLE';

const STORAGE_STATUS_KEY = 'ludo_2p_player_status_v1';

export const setPlayerStatus = (playerId: string, status: PlayerOnlineStatus): void => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_STATUS_KEY);
    const all: Record<string, PlayerOnlineStatus> = saved ? JSON.parse(saved) : {};
    all[playerId] = status;
    localStorage.setItem(STORAGE_STATUS_KEY, JSON.stringify(all));
  }
};

export const getPlayerStatus = (playerId: string): PlayerOnlineStatus => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_STATUS_KEY);
    const all: Record<string, PlayerOnlineStatus> = saved ? JSON.parse(saved) : {};
    return all[playerId] ?? 'OFFLINE';
  }
  return 'OFFLINE';
};

export const markPlayerOnline = (playerId: string): void =>
  setPlayerStatus(playerId, 'ONLINE');

export const markPlayerOffline = (playerId: string): void =>
  setPlayerStatus(playerId, 'OFFLINE');
