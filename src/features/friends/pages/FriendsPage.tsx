import React, { useState } from "react";
import { LudoPageBackground } from "../../../components/effects/LudoPageBackground";

interface FriendsPageProps {
  onBack?: () => void;
  onInviteFriend?: (name: string) => void;
}

export const FriendsPage: React.FC<FriendsPageProps> = ({ onBack, onInviteFriend }) => {
  const [activeTab, setActiveTab] = useState<"ONLINE" | "ALL">("ONLINE");

  const friends = [
    { id: 1, name: "Roxana", status: "Online", isOnline: true },
    { id: 2, name: "Aman", status: "Online", isOnline: true },
    { id: 3, name: "Imran", status: "Online", isOnline: true },
    { id: 4, name: "Tasavvur", status: "Offline", isOnline: false },
    { id: 5, name: "Syed", status: "Online", isOnline: true },
  ];

  const filtered = activeTab === "ONLINE" ? friends.filter((f) => f.isOnline) : friends;

  return (
    <div className="min-h-screen w-full bg-[#12061F] text-white flex flex-col items-center relative overflow-hidden select-none font-sans">
      {/* 1. Ludo Themed Background */}
      <LudoPageBackground variant="friends" />

      <div className="w-full max-w-[430px] h-screen flex flex-col relative z-10 px-3 py-3">
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-lg hover:bg-black/60 hover:scale-105 active:scale-95 transition-transform"
          >
            ❮
          </button>
          <h1 className="text-xl font-black tracking-widest bg-gradient-to-r from-teal-200 to-emerald-400 bg-clip-text text-transparent uppercase glow-cyan-text">
            FRIENDS
          </h1>
          <div className="w-9 h-9"></div>
        </div>

        {/* Tabs: ONLINE / ALL */}
        <div className="flex bg-black/60 p-1.5 rounded-2xl border border-purple-500/30 mb-4 shadow-2xl">
          <button
            onClick={() => setActiveTab("ONLINE")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all ${
              activeTab === "ONLINE"
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg border border-emerald-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            ONLINE ({friends.filter((f) => f.isOnline).length})
          </button>
          <button
            onClick={() => setActiveTab("ALL")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all ${
              activeTab === "ALL"
                ? "bg-gradient-to-r from-purple-600 to-indigo-700 text-white shadow-lg border border-purple-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            ALL ({friends.length})
          </button>
        </div>

        {/* Friends Cards List */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2.5 pb-4">
          {filtered.map((friend) => (
            <div
              key={friend.id}
              className="bg-purple-950/80 border-2 border-purple-500/40 rounded-3xl p-3 flex items-center justify-between hover:scale-[1.01] hover:border-purple-400 transition-all shadow-lg cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-purple-400/60 flex items-center justify-center text-lg shadow-inner">
                    👤
                  </div>
                  {friend.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border border-black animate-pulse shadow-md"></div>
                  )}
                </div>

                <div>
                  <span className="text-xs font-black text-white block">{friend.name}</span>
                  <span className={`text-[10px] ${friend.isOnline ? "text-emerald-400 font-extrabold" : "text-gray-400"}`}>
                    {friend.status}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onInviteFriend?.(friend.name)}
                className={`font-black px-4 py-2 rounded-xl text-[10px] uppercase shadow border transition-all hover:scale-105 active:scale-95 ${
                  friend.isOnline
                    ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 border-yellow-300 shadow-yellow-500/20"
                    : "bg-gradient-to-r from-purple-800 to-indigo-900 text-white border-purple-500"
                }`}
              >
                INVITE
              </button>
            </div>
          ))}
        </div>

        {/* Bottom Add Friends Button (Matching Image #13) */}
        <button className="w-full py-3.5 bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 rounded-2xl text-white font-black text-xs tracking-widest uppercase shadow-xl hover:scale-[1.02] active:scale-95 transition-all border border-purple-400 mb-2 flex items-center justify-center gap-2">
          <span>➕</span>
          <span>ADD FRIENDS</span>
        </button>
      </div>
    </div>
  );
};
