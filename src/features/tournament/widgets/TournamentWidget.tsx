import React from 'react';
import { useTournament } from '../hooks/useTournament';

interface TournamentWidgetProps {
  onClick?: () => void;
}

export const TournamentWidget: React.FC<TournamentWidgetProps> = ({ onClick }) => {
  const { tournaments } = useTournament();
  const active = tournaments[0];

  if (!active) return null;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-purple-950/60 border border-purple-800/40 rounded-2xl p-3 flex items-center justify-between hover:scale-[1.01] active:scale-95 transition-transform"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">🏆</span>
        <div className="flex flex-col">
          <span className="text-[10px] text-white font-black leading-tight">{active.name}</span>
          <span className="text-[8px] text-amber-300 font-bold mt-0.5">Prize: {active.prizePool}</span>
        </div>
      </div>
      <span className="text-xs text-amber-400">➔</span>
    </button>
  );
};
export default TournamentWidget;
