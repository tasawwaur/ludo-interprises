import React from 'react';

interface DiamondRewardProps {
  amount: number;
}

export const DiamondReward: React.FC<DiamondRewardProps> = ({ amount }) => {
  return (
    <div className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/25 px-2.5 py-1 rounded-xl text-cyan-400 text-[10px] font-black font-mono">
      💎 {amount.toLocaleString()}
    </div>
  );
};
export default DiamondReward;
