import React from 'react';
import { TournamentEntryCost } from '../../types/tournament.types';

interface EntryFeeProps {
  cost: TournamentEntryCost;
}

export const EntryFee: React.FC<EntryFeeProps> = ({ cost }) => {
  const isCoins = !!cost.coins;

  return (
    <div className="bg-black/30 border border-purple-900/30 p-3 rounded-2xl flex justify-between items-center">
      <span className="text-[10px] text-purple-200 font-bold uppercase tracking-wider">Registration Entry Fee</span>
      <span className="text-sm font-black text-amber-300 font-mono">
        {isCoins ? `🪙 ${cost.coins?.toLocaleString()}` : `💎 ${cost.gems?.toLocaleString()}`}
      </span>
    </div>
  );
};
export default EntryFee;
