import React from 'react';

export const RewardWidget: React.FC = () => {
  return (
    <div className="bg-purple-950/40 border border-purple-900/30 rounded-2xl p-3 flex justify-around text-center">
      <div className="flex flex-col">
        <span className="text-[8px] text-purple-300 font-bold uppercase tracking-wider">Trophies Earned</span>
        <span className="text-sm font-black text-amber-400">👑 5</span>
      </div>
    </div>
  );
};
export default RewardWidget;
