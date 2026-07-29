export interface Quest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  coinReward?: number;
  gemReward?: number;
  targetCount: number;
  currentCount: number;
  isCompleted: boolean;
  isClaimed: boolean;
  category: 'daily' | 'weekly';
}

export interface XPHistoryEntry {
  id: string;
  amount: number;
  source: string; // e.g., 'MATCH_WIN', 'DAILY_QUEST'
  timestamp: string;
  details?: string;
}
