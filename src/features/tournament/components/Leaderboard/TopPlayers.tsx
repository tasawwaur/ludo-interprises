import React from 'react';
import { TournamentStanding } from '../../types/leaderboard.types';

interface TopPlayersProps {
  standings: TournamentStanding[];
}

export const TopPlayers: React.FC<TopPlayersProps> = ({ standings }) => {
  const first = standings.find((s) => s.rank === 1);
  const second = standings.find((s) => s.rank === 2);
  const third = standings.find((s) => s.rank === 3);

  return (
    <div className="flex gap-4 items-end justify-center py-4 bg-purple-950/20 border border-purple-900/30 rounded-3xl p-4">
      {/* 2nd Place */}
      {second && (
        <div className="flex flex-col items-center gap-1.5 flex-1 max-w-[80px]">
          <div className="w-9 h-9 rounded-full bg-slate-400 border-2 border-white flex items-center justify-center text-xl shadow-md">
            🥈
          </div>
          <span className="text-[9px] font-black text-white truncate max-w-full text-center">{second.playerName}</span>
          <span className="text-[8px] text-slate-300 font-bold font-mono">{second.points} PTS</span>
        </div>
      )}

      {/* 1st Place */}
      {first && (
        <div className="flex flex-col items-center gap-1.5 flex-1 max-w-[90px] -translate-y-2">
          <div className="w-12 h-12 rounded-full bg-yellow-400 border-2 border-amber-300 flex items-center justify-center text-2xl shadow-xl animate-bounce">
            🏆
          </div>
          <span className="text-[10px] font-black text-amber-300 truncate max-w-full text-center uppercase tracking-wide">{first.playerName}</span>
          <span className="text-[9px] text-amber-100 font-black font-mono">{first.points} PTS</span>
        </div>
      )}

      {/* 3rd Place */}
      {third && (
        <div className="flex flex-col items-center gap-1.5 flex-1 max-w-[80px]">
          <div className="w-9 h-9 rounded-full bg-amber-700 border-2 border-orange-600 flex items-center justify-center text-xl shadow-md">
            🥉
          </div>
          <span className="text-[9px] font-black text-white truncate max-w-full text-center">{third.playerName}</span>
          <span className="text-[8px] text-amber-600 font-bold font-mono">{third.points} PTS</span>
        </div>
      )}
    </div>
  );
};
export default TopPlayers;
