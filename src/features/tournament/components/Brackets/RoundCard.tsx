import React from 'react';
import { RoundStructure } from '../../types/bracket.types';
import MatchCard from './MatchCard';

interface RoundCardProps {
  round: RoundStructure;
  onPlayMatch?: (matchId: string) => void;
}

export const RoundCard: React.FC<RoundCardProps> = ({ round, onPlayMatch }) => {
  return (
    <div className="flex flex-col gap-4 items-center">
      <span className="text-[10px] font-black text-amber-200 uppercase tracking-widest block bg-black/40 border border-purple-900/35 px-3 py-1 rounded-full mb-1">
        {round.name}
      </span>

      <div className="flex flex-col gap-6 justify-around h-full py-2">
        {round.matches.map((match) => (
          <MatchCard key={match.id} match={match} onPlayMatch={onPlayMatch} />
        ))}
      </div>
    </div>
  );
};
export default RoundCard;
