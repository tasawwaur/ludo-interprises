import React from "react";
import { useUserStore } from "../../../user/user.store";
import { LudoPageBackground } from "../../../components/effects/LudoPageBackground";

interface MatchResultScreenProps {
  onPlayAgain?: () => void;
  onBackToHome?: () => void;
  winnerName?: string;
  winnerScore?: number;
  loserName?: string;
  loserScore?: number;
  kills?: number;
}

export const MatchResultScreen: React.FC<MatchResultScreenProps> = ({
  onPlayAgain,
  onBackToHome,
  winnerName = "Govind",
  winnerScore = 312,
  loserName = "Roxana",
  loserScore = 280,
  kills = 3,
}) => {
  const user = useUserStore((s) => s.user);

  return (
    <div className="min-h-screen w-full bg-[#12061F] text-white flex flex-col items-center relative overflow-hidden select-none font-sans">
      {/* 1. Ludo Themed Background */}
      <LudoPageBackground variant="victory" />

      <div className="w-full max-w-[430px] h-screen flex flex-col justify-between relative z-10 px-4 py-8">
        {/* Top Header */}
        <div className="text-center mt-2">
          <span className="text-xs font-black tracking-widest text-amber-400 uppercase block mb-1">
            MATCH RESULT
          </span>
          <div className="relative flex items-center justify-center">
            <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-b from-yellow-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent drop-shadow-[0_4px_10px_rgba(255,193,7,0.5)] glow-amber-text">
              VICTORY
            </h1>
          </div>
        </div>

        {/* Center VS Comparison Matchup (Matching Image #14) */}
        <div className="flex items-center justify-center gap-3 my-4">
          {/* Winner Card */}
          <div className="flex-1 bg-purple-950/80 border-2 border-emerald-400/60 rounded-3xl p-4 flex flex-col items-center shadow-2xl relative glow-green-border">
            <div className="w-16 h-16 rounded-full border-2 border-amber-400 p-0.5 mb-2 shadow">
              <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-2xl">
                👤
              </div>
            </div>
            <span className="text-sm font-black text-white">{winnerName}</span>
            <span className="text-xl font-black text-amber-400 font-mono my-1 glow-amber-text">{winnerScore}</span>
            <span className="text-[10px] text-emerald-400 font-black uppercase tracking-wider">WINNER</span>
            <span className="text-[9px] text-gray-400 mt-1 font-bold">Kills: {kills}</span>
          </div>

          {/* VS Icon Badge */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 font-black text-base flex items-center justify-center shadow-2xl border-2 border-yellow-200 shrink-0">
            VS
          </div>

          {/* Loser Card */}
          <div className="flex-1 bg-purple-950/80 border-2 border-purple-500/20 rounded-3xl p-4 flex flex-col items-center shadow-lg opacity-80">
            <div className="w-16 h-16 rounded-full border-2 border-purple-400/50 p-0.5 mb-2">
              <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-2xl">
                👤
              </div>
            </div>
            <span className="text-sm font-bold text-white">{loserName}</span>
            <span className="text-xl font-black text-gray-300 font-mono my-1">{loserScore}</span>
            <span className="text-[10px] text-gray-400 uppercase">RUNNER UP</span>
          </div>
        </div>

        {/* Rewards Summary Row */}
        <div className="bg-black/60 border border-amber-400/30 rounded-2xl p-3.5 flex justify-around items-center mb-4 shadow-xl">
          <div className="flex items-center gap-2">
            <span className="text-xl">🪙</span>
            <span className="text-xs font-black text-amber-400">+5,000</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">💎</span>
            <span className="text-xs font-black text-blue-400">+50</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">⭐</span>
            <span className="text-xs font-black text-emerald-400">+100 XP</span>
          </div>
        </div>

        {/* Buttons (PLAY AGAIN & BACK TO HOME) */}
        <div className="flex flex-col gap-3 mb-2">
          <button
            onClick={onPlayAgain}
            className="w-full py-3.5 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 rounded-2xl text-slate-950 font-black text-sm tracking-widest uppercase shadow-xl hover:scale-[1.02] active:scale-95 transition-transform border border-yellow-200"
          >
            PLAY AGAIN
          </button>
          <button
            onClick={onBackToHome}
            className="w-full py-3.5 bg-gradient-to-r from-purple-800 to-indigo-900 rounded-2xl text-white font-black text-sm tracking-widest uppercase shadow-lg hover:scale-[1.02] active:scale-95 transition-transform border border-purple-400"
          >
            BACK TO HOME
          </button>
        </div>
      </div>
    </div>
  );
};
