import React from 'react';
import { useRewards } from '../hooks/useRewards';
import { useLevel } from '../hooks/useLevel';

export const RewardWidget: React.FC = () => {
  const { milestones } = useRewards();
  const { levelState } = useLevel();

  // Find next unclaimed milestone
  const nextMilestone = milestones.find((m) => m.level > levelState.currentLevel && !m.isClaimed);

  if (!nextMilestone) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500/10 to-purple-950/40 border border-amber-500/20 rounded-2xl p-3 flex justify-between items-center">
      <div className="flex flex-col">
        <span className="text-[8px] text-amber-400 font-black uppercase tracking-wider">Upcoming Milestone Reward</span>
        <span className="text-[10px] text-white font-bold mt-0.5">Level {nextMilestone.level} Milestone</span>
        <span className="text-[9px] text-gray-400 italic">Get {nextMilestone.standardReward.name}</span>
      </div>
      <span className="text-2xl animate-bounce" style={{ animationDuration: '3s' }}>
        {nextMilestone.standardReward.icon}
      </span>
    </div>
  );
};
export default RewardWidget;
