import React from 'react';
import { TournamentItem } from '../types/tournament.types';
import CountdownTimer from './CountdownTimer';

interface TournamentBannerProps {
  tournament: TournamentItem;
  onClick?: () => void;
}

export const TournamentBanner: React.FC<TournamentBannerProps> = ({ tournament, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="w-full wood-frame rounded-3xl border-2 border-yellow-500/50 p-4 shadow-2xl flex items-center justify-between cursor-pointer hover:scale-[1.01] transition-transform relative overflow-hidden"
    >
      <div className="flex items-center gap-3 relative z-10">
        <span className="text-4xl drop-shadow-md animate-bounce">👑</span>
        <div>
          <span className="text-sm font-black text-amber-200 uppercase tracking-widest block leading-tight">{tournament.name}</span>
          <CountdownTimer endTime={tournament.endTime} />
        </div>
      </div>
      <span className="text-3xl animate-pulse relative z-10">🎁</span>
    </div>
  );
};
export default TournamentBanner;
