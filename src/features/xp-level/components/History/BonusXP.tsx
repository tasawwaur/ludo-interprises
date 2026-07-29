import React from 'react';

interface BonusXPProps {
  reason: string;
  amount: number;
  dateString: string;
}

export const BonusXP: React.FC<BonusXPProps> = ({ reason, amount, dateString }) => {
  return (
    <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-amber-500/10 via-purple-950/70 to-purple-900/40 border border-amber-500/20 rounded-2xl">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-lg">
          ⭐
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-black text-white">{reason}</span>
          <span className="text-[9px] text-amber-300 font-bold uppercase tracking-wider">Bonus Reward</span>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-xs font-black text-amber-400">+{amount} XP</span>
        <span className="text-[8px] text-gray-400 mt-0.5">{dateString}</span>
      </div>
    </div>
  );
};
export default BonusXP;
