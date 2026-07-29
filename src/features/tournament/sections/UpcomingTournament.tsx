import React from 'react';
import { TournamentItem } from '../types/tournament.types';
import TournamentCard from '../components/TournamentCard';

interface UpcomingTournamentProps {
  tournaments: TournamentItem[];
  registeredIds: string[];
  onSelect: (id: string) => void;
  onJoin: (id: string) => void;
}

export const UpcomingTournament: React.FC<UpcomingTournamentProps> = ({
  tournaments,
  registeredIds,
  onSelect,
  onJoin,
}) => {
  const upcomingTours = tournaments.filter((t) => t.status === 'REGISTERING');

  return (
    <div className="flex flex-col gap-3">
      <span className="text-[10px] font-black text-amber-200 uppercase tracking-wider block">Upcoming Registrations</span>
      {upcomingTours.map((t) => (
        <TournamentCard
          key={t.id}
          tournament={t}
          isRegistered={registeredIds.includes(t.id)}
          onClick={() => onSelect(t.id)}
          onJoin={() => onJoin(t.id)}
        />
      ))}
    </div>
  );
};
export default UpcomingTournament;
