import { findMatch, enqueue, dequeue } from '../matchmaking/matchmaking';
import { createRoom, TwoPlayerRoom } from '../room/create-room';

export const matchmakingApi = {
  findOrQueue: (
    playerId: string,
    entryFeeCoins: number
  ): { matched: boolean; room?: TwoPlayerRoom } => {
    const opponent = findMatch(playerId, entryFeeCoins);
    if (opponent) {
      dequeue(opponent.playerId);
      const room = createRoom(opponent.playerId, { entryFeeCoins });
      return { matched: true, room };
    }
    enqueue(playerId, entryFeeCoins);
    return { matched: false };
  },

  cancel: (playerId: string): void => {
    dequeue(playerId);
  },
};
