import React, { useState } from "react";
import { useUserStore } from "../../../user/user.store";
import { LudoPageBackground } from "../../../components/effects/LudoPageBackground";

interface ShopPageProps {
  onBack?: () => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({ onBack }) => {
  const user = useUserStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<"COINS" | "GEMS">("COINS");

  const coinPacks = [
    { id: 1, amount: "10K", coins: "10,000", price: "₹30.00", icon: "🪙" },
    { id: 2, amount: "50K", coins: "50,000", price: "₹150.00", icon: "🪙", isPopular: true },
    { id: 3, amount: "100K", coins: "100,000", price: "₹300.00", icon: "💰" },
  ];

  const gemPacks = [
    { id: 1, amount: "100", gems: "100", price: "₹30.00", icon: "💎" },
    { id: 2, amount: "500", gems: "500", price: "₹150.00", icon: "💎", isPopular: true },
    { id: 3, amount: "1200", gems: "1,200", price: "₹300.00", icon: "💎" },
  ];

  return (
    <div className="min-h-screen w-full bg-[#12061F] text-white flex flex-col items-center relative overflow-hidden select-none font-sans">
      {/* 1. Ludo Themed Shop Background */}
      <LudoPageBackground variant="shop" />

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
            SHOP
          </h1>
          <div className="w-9 h-9"></div>
        </div>

        {/* User Balance Header Pill */}
        <div className="flex justify-center gap-4 mb-4">
          <div className="flex items-center gap-1.5 bg-black/60 border border-amber-400/50 px-4 py-1.5 rounded-full shadow-lg glow-gold-border hover:scale-105 transition-transform">
            <span className="text-sm">🪙</span>
            <span className="text-xs font-black text-amber-400">{user?.coins || "259.8K"}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-black/60 border border-blue-400/50 px-4 py-1.5 rounded-full shadow-lg glow-purple-border hover:scale-105 transition-transform">
            <span className="text-sm">💎</span>
            <span className="text-xs font-black text-blue-400">{user?.gems || "1,250"}</span>
          </div>
        </div>

        {/* Tabs: COINS / GEMS */}
        <div className="flex bg-black/60 p-1.5 rounded-2xl border border-purple-500/30 mb-5 shadow-2xl">
          <button
            onClick={() => setActiveTab("COINS")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all ${
              activeTab === "COINS"
                ? "bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 shadow-lg border border-yellow-200 hover:scale-[1.02]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            COINS
          </button>
          <button
            onClick={() => setActiveTab("GEMS")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all ${
              activeTab === "GEMS"
                ? "bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-700 text-white shadow-lg border border-blue-400 hover:scale-[1.02]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            GEMS
          </button>
        </div>

        {/* Pack Grid (Matching Image #11) */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {activeTab === "COINS"
            ? coinPacks.map((p) => (
                <div
                  key={p.id}
                  className="bg-purple-950/80 border-2 border-amber-400/50 rounded-3xl p-3 flex flex-col items-center justify-between text-center relative shadow-[0_8px_32px_rgba(0,0,0,0.5)] glow-gold-border hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  {p.isPopular && (
                    <span className="absolute -top-2 bg-gradient-to-r from-red-500 to-rose-600 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full shadow border border-red-300">
                      POPULAR
                    </span>
                  )}
                  <span className="text-xs font-black text-amber-400 mt-1">{p.amount}</span>
                  <span className="text-3xl my-3 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] animate-float-fast">{p.icon}</span>
                  <button className="w-full py-2 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-slate-950 font-black text-[11px] rounded-xl shadow border border-yellow-200 hover:brightness-110 active:scale-95 transition-all">
                    {p.price}
                  </button>
                </div>
              ))
            : gemPacks.map((p) => (
                <div
                  key={p.id}
                  className="bg-purple-950/80 border-2 border-blue-400/50 rounded-3xl p-3 flex flex-col items-center justify-between text-center relative shadow-[0_8px_32px_rgba(0,0,0,0.5)] glow-purple-border hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  {p.isPopular && (
                    <span className="absolute -top-2 bg-gradient-to-r from-red-500 to-rose-600 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full shadow border border-red-300">
                      POPULAR
                    </span>
                  )}
                  <span className="text-xs font-black text-blue-400 mt-1">{p.amount}</span>
                  <span className="text-3xl my-3 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] animate-float-mid">{p.icon}</span>
                  <button className="w-full py-2 bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-700 text-white font-black text-[11px] rounded-xl shadow border border-blue-300 hover:brightness-110 active:scale-95 transition-all">
                    {p.price}
                  </button>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
};
