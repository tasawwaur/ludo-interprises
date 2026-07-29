import React from 'react';

interface MatchXPProps {
  matchType: string;
  xpEarned: number;
  isVictory: boolean;
  dateString: string;
}

export const MatchXP: React.FC<MatchXPProps> = ({ matchType, xpEarned, isVictory, dateString }) => {
  return (
    <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-purple-950/70 to-purple-900/40 border border-purple-800/30 rounded-2xl">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-lg ${
          isVictory ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700/20 text-slate-400'
        }`}>
          {isVictory ? '🏆' : '⚔️'}
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-black text-white">{matchType}</span>
          <span className="text-[9px] text-purple-300">{isVictory ? 'Victory Match Bonus' : 'Played Match'}</span>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-xs font-black text-amber-400">+{xpEarned} XP</span>
        <span className="text-[8px] text-gray-400 mt-0.5">{dateString}</span>
      </div>
    </div>
  );
};
export default MatchXP;
