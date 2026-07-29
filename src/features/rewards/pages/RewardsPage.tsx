import React, { useState } from "react";
import { LudoPageBackground } from "../../../components/effects/LudoPageBackground";

interface RewardsPageProps {
  onBack?: () => void;
  onClaim?: (day: number) => void;
}

export const RewardsPage: React.FC<RewardsPageProps> = ({ onBack, onClaim }) => {
  const [activeTab, setActiveTab] = useState<"DAILY" | "WEEKLY" | "ACHIEVEMENTS">("DAILY");
  const [claimedDays, setClaimedDays] = useState<number[]>([1]);

  const days = [
    { day: 1, amount: "100", icon: "🪙", status: "CLAIMED" },
    { day: 2, amount: "150", icon: "🪙", status: "READY" },
    { day: 3, amount: "200", icon: "🪙", status: "LOCKED" },
    { day: 4, amount: "300", icon: "🪙", status: "LOCKED" },
    { day: 5, amount: "500", icon: "🪙", status: "LOCKED" },
    { day: 6, amount: "700", icon: "🪙", status: "LOCKED" },
    { day: 7, amount: "1000", icon: "🎁", status: "LOCKED", isBig: true },
  ];

  const handleClaimClick = (dayNum: number) => {
    if (!claimedDays.includes(dayNum)) {
      setClaimedDays([...claimedDays, dayNum]);
      onClaim?.(dayNum);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#12061F] text-white flex flex-col items-center relative overflow-hidden select-none font-sans">
      {/* 1. Ludo Themed Background */}
      <LudoPageBackground variant="rewards" />

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
            REWARDS
          </h1>
          <div className="w-9 h-9"></div>
        </div>

        {/* Tabs: DAILY / WEEKLY / ACHIEVEMENTS */}
        <div className="flex bg-black/60 p-1.5 rounded-2xl border border-purple-500/30 mb-4 shadow-2xl">
          {(["DAILY", "WEEKLY", "ACHIEVEMENTS"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-black tracking-wider uppercase transition-all ${
                activeTab === tab
                  ? "bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white shadow-lg border border-purple-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Banner */}
        <div className="text-center mb-3">
          <span className="text-xs font-black text-amber-300 block">Daily Login Rewards</span>
          <span className="text-[10px] text-purple-200">Claim free coins & gems every day!</span>
        </div>

        {/* 7-Day Grid (Matching Image #10) */}
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          {days.slice(0, 6).map((d) => {
            const isClaimed = claimedDays.includes(d.day);
            return (
              <div
                key={d.day}
                className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${
                  isClaimed
                    ? "bg-purple-950/40 border-purple-800/40 opacity-60"
                    : d.day === 2
                    ? "bg-gradient-to-b from-amber-500/30 to-purple-900 border-amber-400 shadow-[0_0_15px_rgba(255,193,7,0.4)] animate-pulse"
                    : "bg-purple-950/80 border-purple-500/30"
                }`}
              >
                <span className="text-[10px] font-bold text-gray-300 mb-1">Day {d.day}</span>
                <span className="text-2xl mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{d.icon}</span>
                <span className="text-xs font-black text-amber-400 mb-2">{d.amount}</span>

                {isClaimed ? (
                  <span className="text-[9px] font-black text-green-400 uppercase">CLAIMED ✓</span>
                ) : (
                  <button
                    onClick={() => handleClaimClick(d.day)}
                    className="w-full py-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-110 text-slate-950 text-[10px] font-black uppercase rounded-lg shadow active:scale-95 transition-all"
                  >
                    CLAIM
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Day 7 Jackpot Banner (Wooden Accent Theme) */}
        <div className="wood-frame rounded-2xl p-4 border-2 border-yellow-500/50 shadow-2xl flex items-center justify-between text-white mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl animate-bounce">🎁</span>
            <div>
              <span className="text-xs font-black uppercase block text-yellow-400 tracking-wider">DAY 7 JACKPOT REWARD</span>
              <span className="text-sm font-black text-amber-100 block">+1,000 COINS & GEMS</span>
            </div>
          </div>
          <button className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-black uppercase shadow hover:scale-105 active:scale-95 border border-yellow-200 transition-all">
            CLAIM
          </button>
        </div>

        {/* Next Reward Timer Footer */}
        <div className="mt-auto mb-2 bg-black/50 p-3 rounded-2xl border border-purple-500/20 text-center">
          <span className="text-[10px] text-purple-200 font-bold block">
            Next Reward in: <span className="text-amber-400 font-mono font-black glow-amber-text ml-1">11:59:45</span>
          </span>
        </div>
      </div>
    </div>
  );
};
