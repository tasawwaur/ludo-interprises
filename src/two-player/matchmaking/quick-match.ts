import { enqueue, findMatch, dequeue } from './matchmaking';
import { createRoom, TwoPlayerRoom } from '../room/create-room';

export interface QuickMatchResult {
  matched: boolean;
  room?: TwoPlayerRoom;
  waitingInQueue: boolean;
}

// Quick match: enter a 100-coin bracket match instantly
export const startQuickMatch = (playerId: string): QuickMatchResult => {
  const FEE = 100;
  const opponent = findMatch(playerId, FEE);

  if (opponent) {
    // Remove both from queue and create a room
    dequeue(opponent.playerId);
    const room = createRoom(opponent.playerId, { entryFeeCoins: FEE });
    return { matched: true, room, waitingInQueue: false };
  }

  // No match yet, enter queue
  enqueue(playerId, FEE);
  return { matched: false, waitingInQueue: true };
};

export const cancelQuickMatch = (playerId: string): void => {
  dequeue(playerId);
};
