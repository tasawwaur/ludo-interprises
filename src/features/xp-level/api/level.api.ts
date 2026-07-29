import { LevelTier } from '../types/level.types';
import { LEVEL_TIERS } from '../constants/level.constants';

export const fetchLevelTiers = async (): Promise<LevelTier[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(LEVEL_TIERS);
    }, 250);
  });
};

export const fetchUserLevelState = async (): Promise<{ level: number; xp: number; nextLevelXp: number }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        level: 2,
        xp: 450,
        nextLevelXp: 1000,
      });
    }, 200);
  });
};
