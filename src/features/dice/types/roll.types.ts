export interface RollResult {
  diceId: string;
  value: number;
  isSix: boolean;
  timestamp: string;
  modifiersApplied: {
    name: string;
    value: number;
  }[];
}

export interface RollStats {
  totalRolls: number;
  sixCount: number;
  averageValue: number;
  frequencyDistribution: Record<number, number>; // 1-6 counts
}
