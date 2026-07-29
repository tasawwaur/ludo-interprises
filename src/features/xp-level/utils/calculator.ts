import { BASE_XP, XP_MULTIPLIER } from '../constants/level.constants';

export const getXpForLevel = (level: number): number => {
  if (level <= 1) return 0;
  // A standard progression curve: Level 2 needs 500, Level 3 needs 1000, etc.
  return Math.round(BASE_XP * Math.pow(level - 1, XP_MULTIPLIER));
};

export const getLevelFromXp = (xp: number): number => {
  let level = 1;
  while (true) {
    const req = getXpForLevel(level + 1);
    if (xp < req) {
      break;
    }
    level++;
  }
  return level;
};

export const getXpProgressPercent = (xp: number, level: number): number => {
  const currentLevelMinXp = getXpForLevel(level);
  const nextLevelMinXp = getXpForLevel(level + 1);
  const range = nextLevelMinXp - currentLevelMinXp;
  if (range <= 0) return 0;
  const progress = xp - currentLevelMinXp;
  return Math.max(0, Math.min(100, Math.round((progress / range) * 100)));
};
