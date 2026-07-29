import React, { useState } from "react";
import { LudoPageBackground } from "../../../components/effects/LudoPageBackground";

interface TournamentPageProps {
  onBack?: () => void;
  onJoinMatch?: (mode: string) => void;
}

export const TournamentPage: React.FC<TournamentPageProps> = ({ onBack, onJoinMatch }) => {
  const [activeTab, setActiveTab] = useState<"ONGOING" | "UPCOMING">("ONGOING");

  const tournaments = [
    {
      id: 1,
      name: "312 LEAGUE GRAND",
      prize: "₹50,000",
      entry: "₹500",
      players: "120",
      timeLeft: "2h 15m Left",
      badgeBg: "from-amber-500 to-yellow-600",
      icon: "🎁",
    },
    {
      id: 2,
      name: "WEEKEND MASTERS",
      prize: "₹10,000",
      entry: "₹200",
      players: "60",
      timeLeft: "5h 40m Left",
      badgeBg: "from-purple-600 to-indigo-800",
      icon: "🏆",
    },
    {
      id: 3,
      name: "QUICK KNOCKOUT",
      prize: "₹1,000",
      entry: "₹20",
      players: "45",
      timeLeft: "1h 05m Left",
      badgeBg: "from-emerald-500 to-teal-700",
      icon: "⚡",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#12061F] text-white flex flex-col items-center relative overflow-hidden select-none font-sans">
      {/* 1. Ludo Themed Background */}
      <LudoPageBackground variant="tournament" />

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
            TOURNAMENT
          </h1>
          <div className="w-9 h-9"></div>
        </div>

        {/* 312 League Hero Banner (Wooden Accent Theme) */}
        <div className="w-full wood-frame rounded-3xl border-2 border-yellow-500/50 p-4 shadow-2xl flex items-center justify-between mb-4 relative overflow-hidden">
          <div className="flex items-center gap-3">
            <span className="text-4xl drop-shadow-md animate-bounce">👑</span>
            <div>
              <span className="text-2xl font-black text-amber-100 block leading-tight tracking-wider">312 LEAGUE</span>
              <span className="text-xs font-black text-yellow-400">2d 14h Left</span>
            </div>
          </div>
          <span className="text-4xl animate-pulse">🎁</span>
        </div>

        {/* Tabs: ONGOING / UPCOMING */}
        <div className="flex bg-black/60 p-1.5 rounded-2xl border border-purple-500/30 mb-4 shadow-2xl">
          <button
            onClick={() => setActiveTab("ONGOING")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all ${
              activeTab === "ONGOING"
                ? "bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white shadow-lg border border-purple-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            ONGOING
          </button>
          <button
            onClick={() => setActiveTab("UPCOMING")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all ${
              activeTab === "UPCOMING"
                ? "bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white shadow-lg border border-purple-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            UPCOMING
          </button>
        </div>

        {/* Tournament Cards List */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pb-6">
          {tournaments.map((t) => (
            <div
              key={t.id}
              className="bg-purple-950/80 border-2 border-purple-500/40 rounded-3xl p-4 flex items-center justify-between shadow-2xl hover:scale-[1.01] hover:border-purple-400 transition-all cursor-pointer glow-purple-border"
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${t.badgeBg} flex items-center justify-center text-2xl shadow-md border border-white/20`}>
                  {t.icon}
                </div>
                <div>
                  <span className="text-[10px] font-black text-purple-300 block">PRIZE POOL</span>
                  <span className="text-lg font-black text-amber-400 block leading-tight">{t.prize}</span>
                  <span className="text-[9px] text-gray-400 font-bold block mt-0.5">Entry: {t.entry} • Players: {t.players}</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1">
                  <span>⏳</span> {t.timeLeft}
                </span>
                <button
                  onClick={() => onJoinMatch?.("Tournament")}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-slate-950 font-black px-4 py-2 rounded-xl text-xs uppercase shadow border border-emerald-300 active:scale-95 transition-all"
                >
                  JOIN
                </button>
              </div>
            </div>
          ))}

          {/* Create Tournament Footer Option */}
          <div className="mt-4 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-amber-500/10 border-2 border-amber-400/45 rounded-3xl p-4 flex items-center justify-between cursor-pointer hover:scale-[1.01] active:scale-95 transition-all shadow-xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl animate-bounce">⭐</span>
              <div>
                <span className="text-xs font-black text-amber-300 block">CREATE TOURNAMENT</span>
                <span className="text-[10px] text-purple-200">Create your own private tournament</span>
              </div>
            </div>
            <span className="text-amber-400 font-black">❯</span>
          </div>
        </div>
      </div>
    </div>
  );
};
