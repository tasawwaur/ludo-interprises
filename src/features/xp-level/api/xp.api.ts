import { Quest, XPHistoryEntry } from '../types/xp.types';
import { INITIAL_QUESTS } from '../constants/xp.constants';

export const fetchQuests = async (): Promise<Quest[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(INITIAL_QUESTS);
    }, 300);
  });
};

export const claimQuestRewardApi = async (questId: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 200);
  });
};

export const fetchXPHistory = async (): Promise<XPHistoryEntry[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 'h_1', amount: 350, source: 'MATCH_WIN', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), details: 'Classic match win' },
        { id: 'h_2', amount: 100, source: 'BONUS_XP', timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), details: 'First win of the day' },
      ]);
    }, 400);
  });
};
