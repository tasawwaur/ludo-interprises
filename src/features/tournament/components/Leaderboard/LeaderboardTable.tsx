import React from 'react';
import { TournamentStanding } from '../../types/leaderboard.types';
import PlayerRank from './PlayerRank';

interface LeaderboardTableProps {
  standings: TournamentStanding[];
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ standings }) => {
  return (
    <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto no-scrollbar">
      {standings.map((standing) => (
        <PlayerRank key={standing.playerId} standing={standing} />
      ))}
    </div>
  );
};
export default LeaderboardTable;
