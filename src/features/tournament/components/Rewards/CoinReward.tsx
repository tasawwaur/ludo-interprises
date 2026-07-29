import React from 'react';

interface CoinRewardProps {
  amount: number;
}

export const CoinReward: React.FC<CoinRewardProps> = ({ amount }) => {
  return (
    <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/25 px-2.5 py-1 rounded-xl text-amber-300 text-[10px] font-black font-mono">
      🪙 {amount.toLocaleString()}
    </div>
  );
};
export default CoinReward;
