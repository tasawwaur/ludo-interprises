export interface MatchmakingEntry {
  playerId: string;
  entryFeeCoins: number;
  enqueuedAt: string;
}

const STORAGE_QUEUE_KEY = 'ludo_2p_queue_v1';

export const getQueue = (): MatchmakingEntry[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_QUEUE_KEY);
    return saved ? JSON.parse(saved) : [];
  }
  return [];
};

export const enqueue = (playerId: string, entryFeeCoins: number): void => {
  const queue = getQueue();
  const alreadyInQueue = queue.some((e) => e.playerId === playerId);
  if (!alreadyInQueue) {
    queue.push({ playerId, entryFeeCoins, enqueuedAt: new Date().toISOString() });
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_QUEUE_KEY, JSON.stringify(queue));
    }
  }
};

export const dequeue = (playerId: string): void => {
  const queue = getQueue().filter((e) => e.playerId !== playerId);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_QUEUE_KEY, JSON.stringify(queue));
  }
};

// Find a potential match: first entry in queue with matching fee bracket
export const findMatch = (
  playerId: string,
  entryFeeCoins: number
): MatchmakingEntry | null => {
  const queue = getQueue();
  const opponent = queue.find(
    (e) => e.playerId !== playerId && e.entryFeeCoins === entryFeeCoins
  );
  return opponent || null;
};
