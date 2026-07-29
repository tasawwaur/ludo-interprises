import { useXPStore } from '../store/xp.store';
import { useLevelStore } from '../store/level.store';
import { useProgressStore } from '../store/progress.store';
import { claimQuestRewardApi } from '../api/xp.api';

export const XPService = {
  gainXP: (amount: number, source: string, details?: string) => {
    const { gainXp } = useLevelStore.getState();
    const { addXpHistoryEntry } = useXPStore.getState();
    const { recordDailyXP } = useProgressStore.getState();

    // Gain level-based XP
    const { leveledUp, newLevel } = gainXp(amount, source);

    // Save history entry
    addXpHistoryEntry({ amount, source, details });

    // Record daily gains
    recordDailyXP(amount);

    return { leveledUp, newLevel };
  },

  claimQuestReward: async (questId: string): Promise<boolean> => {
    const { claimQuestReward } = useXPStore.getState();
    const rewards = claimQuestReward(questId);
    if (!rewards) return false;

    // Call API endpoint
    await claimQuestRewardApi(questId);

    // Gain the experience points
    if (rewards.xp > 0) {
      XPService.gainXP(rewards.xp, 'DAILY_QUEST', `Claimed quest ${questId}`);
    }

    return true;
  },

  incrementQuestProgress: (questId: string, progressDelta: number) => {
    const { updateQuestProgress } = useXPStore.getState();
    updateQuestProgress(questId, progressDelta);
  },
};
export default XPService;
