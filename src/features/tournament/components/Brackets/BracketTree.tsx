import React from 'react';
import { RoundStructure } from '../../types/bracket.types';
import RoundCard from './RoundCard';

interface BracketTreeProps {
  rounds: RoundStructure[];
  onPlayMatch?: (matchId: string) => void;
}

export const BracketTree: React.FC<BracketTreeProps> = ({ rounds, onPlayMatch }) => {
  return (
    <div className="flex gap-8 overflow-x-auto no-scrollbar items-stretch py-3 px-1">
      {rounds.map((round) => (
        <RoundCard key={round.roundNumber} round={round} onPlayMatch={onPlayMatch} />
      ))}
    </div>
  );
};
export default BracketTree;
