import React, { useState } from 'react';
import { LudoPageBackground } from '../../../components/effects/LudoPageBackground';
import { TournamentItem } from '../types/tournament.types';
import PrizePool from '../sections/PrizePool';
import TournamentRules from '../sections/TournamentRules';
import { useRegistration } from '../hooks/useRegistration';

interface TournamentDetailsPageProps {
  tournament: TournamentItem;
  onBack?: () => void;
  onJoin?: () => void;
  onViewBracket?: () => void;
}

export const TournamentDetailsPage: React.FC<TournamentDetailsPageProps> = ({
  tournament,
  onBack,
  onJoin,
  onViewBracket,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'PRIZES' | 'RULES'>('PRIZES');
  const { isRegistered } = useRegistration();

  const userJoined = isRegistered(tournament.id);

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
            DETAILS
          </h1>
          <div className="w-9 h-9"></div>
        </div>

        {/* Info panel */}
        <div className="flex-1 flex flex-col gap-4 pb-6">
          <div className="bg-purple-950/60 border-2 border-purple-500/35 rounded-3xl p-4 flex flex-col gap-3 shadow-md relative">
            <span className="text-[10px] font-black text-amber-200 uppercase tracking-wider block">{tournament.name}</span>
            <p className="text-[9px] text-purple-300 leading-normal font-bold italic">{tournament.description}</p>
          </div>

          {/* Subtabs prizes/rules */}
          <div className="flex bg-black/40 p-1 rounded-xl border border-purple-900/30">
            <button
              onClick={() => setActiveSubTab('PRIZES')}
              className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                activeSubTab === 'PRIZES' ? 'bg-purple-700 text-white' : 'text-purple-300'
              }`}
            >
              PRIZES
            </button>
            <button
              onClick={() => setActiveSubTab('RULES')}
              className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                activeSubTab === 'RULES' ? 'bg-purple-700 text-white' : 'text-purple-300'
              }`}
            >
              RULES
            </button>
          </div>

          <div className="flex-1">
            {activeSubTab === 'PRIZES' ? (
              <PrizePool tournament={tournament} />
            ) : (
              <TournamentRules />
            )}
          </div>

          {/* Registration trigger */}
          <div className="mt-auto">
            {userJoined ? (
              <button
                onClick={onViewBracket}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-955 font-black text-xs tracking-widest uppercase rounded-2xl shadow-xl border border-emerald-300 hover:scale-[1.01] active:scale-95 transition-all"
              >
                VIEW ACTIVE BRACKET
              </button>
            ) : (
              <button
                onClick={onJoin}
                className="w-full py-3.5 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-slate-955 font-black text-xs tracking-widest uppercase rounded-2xl shadow-xl border border-yellow-200 hover:scale-[1.01] active:scale-95 transition-all"
              >
                REGISTER FOR TOURNAMENT
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default TournamentDetailsPage;
