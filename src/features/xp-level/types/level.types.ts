export interface LevelTier {
  level: number;
  xpRequired: number;
  title: string;      // e.g., 'Bronze Roller', 'Ludo Master'
  badgeColor: string; // e.g., gradient class or hex color
  unlockedFeatures: string[];
}

export interface UserLevelState {
  currentLevel: number;
  currentXp: number;
  xpRequiredForNextLevel: number;
  title: string;
}
