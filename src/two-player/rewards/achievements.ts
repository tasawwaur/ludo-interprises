import { updatePlayerStats } from '../players/player-stats';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt: string;
}

const STORAGE_ACH_KEY = 'ludo_2p_achievements_v1';

const ACHIEVEMENT_DEFINITIONS: Record<string, { title: string; description: string }> = {
  first_win: { title: 'First Win!', description: 'Win your first 2-player match' },
  ten_wins: { title: 'Veteran', description: 'Win 10 matches' },
  capture_master: { title: 'Capture Master', description: 'Capture 50 opponent tokens' },
  six_roller: { title: 'Lucky Six', description: 'Roll six 30 times' },
};

export const checkAndUnlockAchievements = (
  playerId: string,
  newWin: boolean,
  captures: number,
  sixes: number
): Achievement[] => {
  const stats = {
    matchesWon: 0,
    totalTokensCaptured: 0,
    totalSixesRolled: 0,
  };

  const unlocked: Achievement[] = [];
  const existing = getAchievements(playerId);
  const existingIds = new Set(existing.map((a) => a.id));

  if (!existingIds.has('first_win') && newWin) {
    unlocked.push(makeAchievement('first_win'));
  }

  return unlocked;
};

const makeAchievement = (id: string): Achievement => ({
  id,
  title: ACHIEVEMENT_DEFINITIONS[id]?.title ?? id,
  description: ACHIEVEMENT_DEFINITIONS[id]?.description ?? '',
  unlockedAt: new Date().toISOString(),
});

export const getAchievements = (playerId: string): Achievement[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_ACH_KEY);
    const all: Record<string, Achievement[]> = saved ? JSON.parse(saved) : {};
    return all[playerId] ?? [];
  }
  return [];
};

export const saveAchievement = (playerId: string, achievement: Achievement): void => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_ACH_KEY);
    const all: Record<string, Achievement[]> = saved ? JSON.parse(saved) : {};
    const list = all[playerId] ?? [];
    if (!list.some((a) => a.id === achievement.id)) {
      list.push(achievement);
    }
    all[playerId] = list;
    localStorage.setItem(STORAGE_ACH_KEY, JSON.stringify(all));
  }
};
