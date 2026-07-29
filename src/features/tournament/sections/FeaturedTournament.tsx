import React from 'react';
import { TournamentItem } from '../types/tournament.types';
import TournamentBanner from '../components/TournamentBanner';

interface FeaturedTournamentProps {
  tournaments: TournamentItem[];
  onSelect: (id: string) => void;
}

export const FeaturedTournament: React.FC<FeaturedTournamentProps> = ({ tournaments, onSelect }) => {
  const featured = tournaments.find((t) => t.id === 'tour_312_league') || tournaments[0];

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[9px] text-amber-300 font-black uppercase tracking-wider block">Featured Championship</span>
      <TournamentBanner tournament={featured} onClick={() => onSelect(featured.id)} />
    </div>
  );
};
export default FeaturedTournament;
