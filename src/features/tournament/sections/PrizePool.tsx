import React from 'react';
import { TournamentItem } from '../types/tournament.types';
import CoinReward from '../components/Rewards/CoinReward';
import TrophyReward from '../components/Rewards/TrophyReward';

interface PrizePoolProps {
  tournament: TournamentItem;
}

export const PrizePool: React.FC<PrizePoolProps> = ({ tournament }) => {
  return (
    <div className="bg-purple-950/50 border border-purple-800/60 rounded-3xl p-4 flex flex-col gap-3 shadow-inner">
      <span className="text-[10px] font-black text-amber-200 uppercase tracking-wider block">Championship Rewards Tiers</span>

      <div className="flex flex-col gap-2.5">
        <div className="flex justify-between items-center bg-black/20 p-2.5 rounded-xl border border-purple-900/10">
          <span className="text-xs font-black text-white">1st Place (Champion)</span>
          <div className="flex gap-2">
            <CoinReward amount={8000} />
            <TrophyReward amount={1} />
          </div>
        </div>

        <div className="flex justify-between items-center bg-black/20 p-2.5 rounded-xl border border-purple-900/10">
          <span className="text-xs font-black text-white">2nd Place (Runner-up)</span>
          <CoinReward amount={4000} />
        </div>

        <div className="flex justify-between items-center bg-black/20 p-2.5 rounded-xl border border-purple-900/10">
          <span className="text-xs font-black text-white">3rd - 4th Place</span>
          <CoinReward amount={1500} />
        </div>
      </div>
    </div>
  );
};
export default PrizePool;
