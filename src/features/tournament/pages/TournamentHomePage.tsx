import React from 'react';
import { LudoPageBackground } from '../../../components/effects/LudoPageBackground';
import { useTournament } from '../hooks/useTournament';
import { useRegistration } from '../hooks/useRegistration';
import { FeaturedTournament } from '../sections/FeaturedTournament';
import { LiveTournament } from '../sections/LiveTournament';
import { UpcomingTournament } from '../sections/UpcomingTournament';
import { Winners } from '../sections/Winners';

interface TournamentHomePageProps {
  onBack?: () => void;
  onSelectTournament: (id: string) => void;
  onJoinTournament: (id: string) => void;
}

export const TournamentHomePage: React.FC<TournamentHomePageProps> = ({
  onBack,
  onSelectTournament,
  onJoinTournament,
}) => {
  const { tournaments } = useTournament();
  const { registeredTournamentIds } = useRegistration();

  return (
    <div className="min-h-screen w-full bg-[#12061F] text-white flex flex-col items-center relative overflow-hidden select-none font-sans">
      <LudoPageBackground variant="tournament" />

      <div className="w-full max-w-[430px] h-screen flex flex-col relative z-10 px-3 py-3 overflow-y-auto no-scrollbar">
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-lg hover:bg-black/60 hover:scale-105 active:scale-95 transition-transform"
          >
            ❮
          </button>
          <h1 className="text-lg font-black tracking-widest bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent uppercase glow-amber-text">
            TOURNAMENTS
          </h1>
          <div className="w-9 h-9"></div>
        </div>

        {/* Content list */}
        <div className="flex-1 flex flex-col gap-5 pb-6">
          <FeaturedTournament tournaments={tournaments} onSelect={onSelectTournament} />
          
          <LiveTournament
            tournaments={tournaments}
            registeredIds={registeredTournamentIds}
            onSelect={onSelectTournament}
            onJoin={onJoinTournament}
          />

          <UpcomingTournament
            tournaments={tournaments}
            registeredIds={registeredTournamentIds}
            onSelect={onSelectTournament}
            onJoin={onJoinTournament}
          />

          <Winners />
        </div>
      </div>
    </div>
  );
};
export default TournamentHomePage;
