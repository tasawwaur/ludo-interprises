import React from 'react';
import { TournamentStanding } from '../../types/leaderboard.types';

interface PlayerRankProps {
  standing: TournamentStanding;
}

export const PlayerRank: React.FC<PlayerRankProps> = ({ standing }) => {
  return (
    <div
      className={`flex justify-between items-center p-3 rounded-2xl border-2 transition-all ${
        standing.isUser
          ? 'bg-gradient-to-r from-amber-500/10 via-purple-900/60 to-amber-500/10 border-amber-400 shadow-md'
          : 'bg-purple-950/40 border-purple-900/20'
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
            standing.rank === 1
              ? 'bg-amber-400 text-purple-950 border border-yellow-200 shadow'
              : standing.rank === 2
              ? 'bg-slate-300 text-purple-950 border border-white'
              : standing.rank === 3
              ? 'bg-amber-700 text-white'
              : 'bg-purple-900/50 text-purple-200'
          }`}
        >
          {standing.rank}
        </span>
        <div className="flex flex-col">
          <span className="text-xs font-black text-white">{standing.playerName}</span>
          <span className="text-[8px] text-purple-300">Played: {standing.matchesPlayed} • Won: {standing.matchesWon}</span>
        </div>
      </div>

      <span className="text-xs font-black text-amber-400 font-mono">{standing.points} PTS</span>
    </div>
  );
};
export default PlayerRank;
