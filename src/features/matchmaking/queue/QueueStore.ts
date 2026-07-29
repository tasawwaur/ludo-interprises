import { create } from "zustand";

export interface QueueState {
  inQueue: boolean;
  mode: string;
  elapsedSeconds: number;
  estimatedSeconds: number;
  matchFound: boolean;
  readyCheck: boolean;
  startQueue: (mode: string) => void;
  cancelQueue: () => void;
  setMatchFound: (found: boolean) => void;
  acceptMatch: () => void;
}

export const useQueueStore = create<QueueState>((set) => ({
  inQueue: false,
  mode: "2P Classic",
  elapsedSeconds: 0,
  estimatedSeconds: 12,
  matchFound: false,
  readyCheck: false,
  startQueue: (mode) => set({ inQueue: true, mode, elapsedSeconds: 0, matchFound: false, readyCheck: false }),
  cancelQueue: () => set({ inQueue: false, elapsedSeconds: 0, matchFound: false, readyCheck: false }),
  setMatchFound: (found) => set({ matchFound: found, readyCheck: found }),
  acceptMatch: () => set({ inQueue: false, matchFound: false, readyCheck: false })
}));
