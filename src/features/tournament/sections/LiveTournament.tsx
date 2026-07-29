import React from 'react';
import { TournamentItem } from '../types/tournament.types';
import TournamentCard from '../components/TournamentCard';

interface LiveTournamentProps {
  tournaments: TournamentItem[];
  registeredIds: string[];
  onSelect: (id: string) => void;
  onJoin: (id: string) => void;
}

export const LiveTournament: React.FC<LiveTournamentProps> = ({
  tournaments,
  registeredIds,
  onSelect,
  onJoin,
}) => {
  const liveTours = tournaments.filter((t) => t.status === 'RUNNING');

  return (
    <div className="flex flex-col gap-3">
      <span className="text-[10px] font-black text-amber-200 uppercase tracking-wider block">Live Matches Bracket</span>
      {liveTours.length === 0 ? (
        <span className="text-[9px] text-gray-500 italic block py-2">No live cups at the moment.</span>
      ) : (
        liveTours.map((t) => (
          <TournamentCard
            key={t.id}
            tournament={t}
            isRegistered={registeredIds.includes(t.id)}
            onClick={() => onSelect(t.id)}
            onJoin={() => onJoin(t.id)}
          />
        ))
      )}
    </div>
  );
};
export default LiveTournament;
