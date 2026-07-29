import React from 'react';
import { BracketMatch } from '../../types/bracket.types';

interface MatchCardProps {
  match: BracketMatch;
  onPlayMatch?: (matchId: string) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, onPlayMatch }) => {
  const isUserMatch = match.player1?.id === 'user_1' || match.player2?.id === 'user_1';

  return (
    <div
      className={`rounded-2xl border p-2.5 flex flex-col gap-1.5 min-w-[130px] transition-all bg-purple-950/80 ${
        isUserMatch
          ? 'border-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.25)]'
          : 'border-purple-900/40'
      }`}
    >
      {/* Player 1 Row */}
      <div className="flex justify-between items-center text-[10px]">
        <span
          className={`font-black truncate max-w-[80px] ${
            match.winnerId === match.player1?.id ? 'text-amber-300' : 'text-white'
          }`}
        >
          {match.player1 ? match.player1.name : 'TBD'}
        </span>
        <span className="font-mono text-amber-200 font-bold">{match.score1 ?? '-'}</span>
      </div>

      {/* Divider */}
      <div className="h-[1px] bg-purple-900/30"></div>

      {/* Player 2 Row */}
      <div className="flex justify-between items-center text-[10px]">
        <span
          className={`font-black truncate max-w-[80px] ${
            match.winnerId === match.player2?.id ? 'text-amber-300' : 'text-white'
          }`}
        >
          {match.player2 ? match.player2.name : 'TBD'}
        </span>
        <span className="font-mono text-amber-200 font-bold">{match.score2 ?? '-'}</span>
      </div>

      {/* Play Action for user Match */}
      {isUserMatch && match.status === 'PENDING' && match.player1 && match.player2 && (
        <button
          onClick={() => onPlayMatch?.(match.id)}
          className="mt-1.5 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 text-[9px] font-black uppercase rounded-lg active:scale-95 transition-all shadow"
        >
          PLAY GAME
        </button>
      )}
    </div>
  );
};
export default MatchCard;
