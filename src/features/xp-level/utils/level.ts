import { LEVEL_TITLES, LEVEL_COLORS } from '../constants/level.constants';

export const getTitleForLevel = (level: number): string => {
  let title = 'Novice Roller';
  for (const entry of LEVEL_TITLES) {
    if (level >= entry.level) {
      title = entry.title;
    }
  }
  return title;
};

export const getBadgeColorsForLevel = (level: number): string => {
  if (level >= 75) return LEVEL_COLORS.diamond;
  if (level >= 50) return LEVEL_COLORS.platinum;
  if (level >= 25) return LEVEL_COLORS.gold;
  if (level >= 10) return LEVEL_COLORS.silver;
  return LEVEL_COLORS.bronze;
};
