import { XPHistoryEntry } from '../types/xp.types';

export const sortHistoryByNewest = (history: XPHistoryEntry[]): XPHistoryEntry[] => {
  return [...history].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const filterHistoryBySource = (history: XPHistoryEntry[], source: string): XPHistoryEntry[] => {
  return history.filter((entry) => entry.source === source);
};
