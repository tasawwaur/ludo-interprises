import { useXPStore } from '../store/xp.store';
import { XPService } from '../services/XPService';

export const useXP = () => {
  const quests = useXPStore((s) => s.quests);
  const xpHistory = useXPStore((s) => s.xpHistory);

  return {
    quests,
    xpHistory,
    claimQuestReward: XPService.claimQuestReward,
    incrementQuestProgress: XPService.incrementQuestProgress,
    gainXP: XPService.gainXP,
  };
};
export default useXP;
