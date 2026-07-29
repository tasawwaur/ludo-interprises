import React from 'react';
import { LudoPageBackground } from '../../../components/effects/LudoPageBackground';

interface ResultPageProps {
  onBack?: () => void;
}

export const ResultPage: React.FC<ResultPageProps> = ({ onBack }) => {
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
            MATCH SUMMARY
          </h1>
          <div className="w-9 h-9"></div>
        </div>

        {/* Results summary details */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4 pb-6">
          <span className="text-5xl animate-bounce">🏆</span>
          <h2 className="text-base font-black text-amber-200 uppercase tracking-widest">TOURNAMENT COMPLETED</h2>
          
          <div className="bg-purple-950/60 border border-purple-900/30 p-4 rounded-3xl text-center w-full max-w-[280px]">
            <span className="text-[10px] text-purple-300 uppercase tracking-wider block">Champion</span>
            <span className="text-lg font-black text-white block mt-1">TASAVVUR</span>
            <span className="text-[9px] text-amber-300 font-bold block mt-1">Reward Claimed successfully!</span>
          </div>

          <button
            onClick={onBack}
            className="w-full max-w-[200px] py-2.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-purple-955 font-black text-xs uppercase rounded-xl tracking-wider shadow active:scale-95 transition-all"
          >
            BACK TO LOBBY
          </button>
        </div>
      </div>
    </div>
  );
};
export default ResultPage;
