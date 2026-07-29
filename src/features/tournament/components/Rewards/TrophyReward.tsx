import React from 'react';

interface TrophyRewardProps {
  amount: number;
}

export const TrophyReward: React.FC<TrophyRewardProps> = ({ amount }) => {
  return (
    <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 rounded-xl text-yellow-400 text-[10px] font-black font-mono">
      👑 {amount}
    </div>
  );
};
export default TrophyReward;
