import { RollResult } from '../types/roll.types';

export const getSixPercentage = (rolls: RollResult[]): number => {
  if (rolls.length === 0) return 0;
  const sixes = rolls.filter((r) => r.isSix).length;
  return Math.round((sixes / rolls.length) * 100);
};

export const getLatestRollValue = (rolls: RollResult[]): number | null => {
  if (rolls.length === 0) return null;
  return rolls[0].value;
};
