import { joinRoomById } from '../room/join-room';
import { TwoPlayerRoom } from '../room/create-room';

const STORAGE_ACTIVE_MATCH = 'ludo_2p_active_match_v1';

export const saveActiveMatchId = (matchId: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_ACTIVE_MATCH, matchId);
  }
};

export const getSavedActiveMatchId = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(STORAGE_ACTIVE_MATCH);
  }
  return null;
};

export const clearActiveMatch = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_ACTIVE_MATCH);
  }
};

// Attempt to rejoin a saved active room on app resume
export const attemptReconnect = (
  playerId: string
): TwoPlayerRoom | null => {
  const savedMatchId = getSavedActiveMatchId();
  if (!savedMatchId) return null;

  const room = joinRoomById(savedMatchId, playerId);
  return room;
};
