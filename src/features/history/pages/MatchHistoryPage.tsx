import React from "react";
import { LudoPageBackground } from "../../../components/effects/LudoPageBackground";

interface MatchHistoryPageProps {
  onBack?: () => void;
}

export const MatchHistoryPage: React.FC<MatchHistoryPageProps> = ({ onBack }) => {
  const history = [
    { id: 1, opponent: "Roxana", result: "WIN", score: "2 - 1", timeAgo: "2m ago" },
    { id: 2, opponent: "Aman", result: "LOST", score: "1 - 2", timeAgo: "10m ago" },
    { id: 3, opponent: "Imran", result: "WIN", score: "2 - 0", timeAgo: "25m ago" },
    { id: 4, opponent: "Syed", result: "WIN", score: "2 - 1", timeAgo: "45m ago" },
    { id: 5, opponent: "Priya", result: "LOST", score: "0 - 2", timeAgo: "1h ago" },
    { id: 6, opponent: "Deepak", result: "WIN", score: "2 - 1", timeAgo: "2h ago" },
  ];

  return (
    <div className="min-h-screen w-full bg-[#12061F] text-white flex flex-col items-center relative overflow-hidden select-none font-sans">
      {/* 1. Ludo Themed Background */}
      <LudoPageBackground variant="profile" />

      <div className="w-full max-w-[430px] h-screen flex flex-col relative z-10 px-3 py-3">
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-lg hover:bg-black/60 hover:scale-105 active:scale-95 transition-transform"
          >
            ❮
          </button>
          <h1 className="text-xl font-black tracking-widest bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent uppercase glow-amber-text">
            MATCH HISTORY
          </h1>
          <div className="w-9 h-9"></div>
        </div>

        {/* Matches List (Matching Image #16) */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2.5 pb-4">
          {history.map((m) => (
            <div
              key={m.id}
              className={`bg-purple-950/80 border-2 rounded-3xl p-3.5 flex items-center justify-between shadow-lg hover:scale-[1.01] transition-all cursor-pointer ${
                m.result === "WIN" ? "border-green-500/40 glow-green-border" : "border-purple-500/20"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-purple-400/60 flex items-center justify-center text-lg shadow-inner">
                  👤
                </div>
                <div>
                  <span className="text-xs font-black text-white block">vs {m.opponent}</span>
                  <span className="text-[10px] text-gray-400 font-bold">{m.timeAgo}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-black text-purple-200">{m.score}</span>
                <span
                  className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-xl shadow border transition-all ${
                    m.result === "WIN"
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                      : "bg-red-500/20 text-red-400 border-red-500/40"
                  }`}
                >
                  {m.result}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
