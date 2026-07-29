import React, { useState } from "react";
import { LudoPageBackground } from "../../../components/effects/LudoPageBackground";

interface InventoryPageProps {
  onBack?: () => void;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<"TOKENS" | "DICES" | "BOARDS">("TOKENS");

  const tokens = [
    { id: 1, name: "Classic", colorBg: "bg-green-600", isEquipped: true },
    { id: 2, name: "Neon", colorBg: "bg-blue-600", isEquipped: false },
    { id: 3, name: "Royal", colorBg: "bg-amber-600", isEquipped: false },
    { id: 4, name: "Glitter", colorBg: "bg-pink-600", isEquipped: false },
    { id: 5, name: "Candy", colorBg: "bg-rose-500", isEquipped: false },
    { id: 6, name: "Metal", colorBg: "bg-slate-400", isEquipped: false },
  ];

  return (
    <div className="min-h-screen w-full bg-[#12061F] text-white flex flex-col items-center relative overflow-hidden select-none font-sans">
      {/* 1. Ludo Themed Background */}
      <LudoPageBackground variant="profile" />

      <div className="w-full max-w-[430px] h-screen flex flex-col relative z-10 px-3 py-3 overflow-y-auto no-scrollbar">
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-lg hover:bg-black/60 hover:scale-105 active:scale-95 transition-transform"
          >
            ❮
          </button>
          <h1 className="text-xl font-black tracking-widest bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent uppercase glow-amber-text">
            INVENTORY
          </h1>
          <div className="w-9 h-9"></div>
        </div>

        {/* Tabs: TOKENS / DICES / BOARDS */}
        <div className="flex bg-black/60 p-1.5 rounded-2xl border border-purple-500/30 mb-4 shadow-2xl">
          {(["TOKENS", "DICES", "BOARDS"] as const).map((tab) => (
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

        {/* Tokens Skin Grid (Matching Image #12) */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {tokens.map((t) => (
            <div
              key={t.id}
              className={`bg-purple-950/80 border-2 rounded-3xl p-3 flex flex-col items-center justify-between text-center relative transition-all shadow-lg hover:scale-105 cursor-pointer ${
                t.isEquipped ? "border-amber-400 glow-gold-border" : "border-purple-500/35"
              }`}
            >
              <div className="w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center text-2xl shadow-inner mb-2 animate-float-mid">
                🔵
              </div>
              <span className="text-xs font-black text-white mb-2">{t.name}</span>

              {t.isEquipped ? (
                <span className="text-[9px] font-black text-amber-400 uppercase bg-black/50 px-2 py-0.5 rounded-full border border-amber-400/40">
                  EQUIPPED
                </span>
              ) : (
                <button className="w-full py-1.5 bg-gradient-to-r from-purple-700 to-indigo-800 hover:brightness-110 text-white border border-purple-500 text-[10px] font-black uppercase rounded-lg active:scale-95 transition-all shadow">
                  EQUIP
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Coming Soon Locked Row */}
        <div className="text-center mt-2">
          <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest block mb-2">
            MORE SKINS COMING SOON
          </span>
          <div className="grid grid-cols-3 gap-3 opacity-40">
            <div className="bg-purple-950/80 border-2 border-purple-500/35 rounded-3xl p-4 flex items-center justify-center text-2xl">
              🔒
            </div>
            <div className="bg-purple-950/80 border-2 border-purple-500/35 rounded-3xl p-4 flex items-center justify-center text-2xl">
              🔒
            </div>
            <div className="bg-purple-950/80 border-2 border-purple-500/35 rounded-3xl p-4 flex items-center justify-center text-2xl">
              🔒
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
