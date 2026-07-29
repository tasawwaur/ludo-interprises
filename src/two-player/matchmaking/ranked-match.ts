import { enqueue, findMatch, dequeue } from './matchmaking';
import { createRoom, TwoPlayerRoom } from '../room/create-room';

const RANKED_FEES = [200, 500, 1000, 2000] as const;
type RankedFee = typeof RANKED_FEES[number];

export const startRankedMatch = (
  playerId: string,
  entryFeeCoins: RankedFee
): { matched: boolean; room?: TwoPlayerRoom; waitingInQueue: boolean } => {
  const opponent = findMatch(playerId, entryFeeCoins);

  if (opponent) {
    dequeue(opponent.playerId);
    const room = createRoom(opponent.playerId, { entryFeeCoins });
    return { matched: true, room, waitingInQueue: false };
  }

  enqueue(playerId, entryFeeCoins);
  return { matched: false, waitingInQueue: true };
};

export const cancelRankedMatch = (playerId: string): void => {
  dequeue(playerId);
};

export const RANKED_FEE_OPTIONS = RANKED_FEES;
