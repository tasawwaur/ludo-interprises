import React, { useState } from "react";
import { LudoPageBackground } from "../../../components/effects/LudoPageBackground";
import { useGlobalModalStore } from "../../../store/global-modal.store";
import { useUserStore } from "../../../user/user.store";
import { GLOBAL_PLAYER_DATABASE } from "../../../store/player-database.store";

interface LeaderboardPageProps {
  onBack?: () => void;
}

export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<"LEAGUE" | "FRIENDS" | "ACHIEVEMENTS">("LEAGUE");
  const openProfile = useGlobalModalStore((s) => s.openProfile);

  const { user } = useUserStore();

  const leadersList = React.useMemo(() => {
    // 1. Map all 100 bot players from local database
    const dbLeaders = [...GLOBAL_PLAYER_DATABASE]
      .sort((a, b) => b.level - a.level || b.matchesWon - a.matchesWon)
      .slice(0, 100)
      .map((p, idx) => ({
        rank: idx + 1,
        name: p.username,
        level: p.level,
        score: p.totalEarning,
        avatarUrl: p.avatarUrl,
        equippedFrame: p.equippedFrame,
        isUser: false,
      }));

    // 2. Identify if real user matches any name, if so highlight them
    const mapped = dbLeaders.map(p => {
      if (user && p.name.toLowerCase() === user.username.toLowerCase()) {
        return { ...p, isUser: true };
      }
      return p;
    });

    // 3. If real user is not in the list, inject them at their designated rank
    const hasUser = mapped.some(p => p.isUser);
    if (!hasUser && user) {
      const userRank = user.rank || 42;
      const insertIndex = Math.min(userRank - 1, 99);
      const userLeader = {
        rank: userRank,
        name: user.username || "Tasavvur",
        level: user.level || 5,
        score: user.coins > 1000000 ? `${(user.coins / 1000000).toFixed(1)} M` : `${(user.coins / 1000).toFixed(1)} K`,
        avatarUrl: user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        equippedFrame: "frame_gold",
        isUser: true,
      };
      mapped.splice(insertIndex, 0, userLeader);
    }

    // 4. Re-index ranks if list size changes slightly
    return mapped.map((p, idx) => ({ ...p, rank: idx + 1 }));
  }, [user]);

  return (
    <div className="min-h-screen w-full bg-[#12061F] text-white flex flex-col items-center relative overflow-hidden select-none font-sans">
      {/* 1. Ludo Themed Background */}
      <LudoPageBackground variant="leaderboard" />

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
            LEADERBOARD
          </h1>
          <div className="w-9 h-9"></div>
        </div>

        {/* 3 Tabs: LEAGUE / FRIENDS / ACHIEVEMENTS */}
        <div className="flex bg-black/60 p-1.5 rounded-2xl border border-purple-500/30 mb-4 shadow-2xl">
          {(["LEAGUE", "FRIENDS", "ACHIEVEMENTS"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-black tracking-wider uppercase transition-all ${
                activeTab === tab
                  ? "bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 shadow-lg border border-yellow-200"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 312 League Header Banner (Wooden Theme) */}
        <div className="w-full wood-frame rounded-2xl border-2 border-yellow-500/50 p-3.5 flex items-center justify-center gap-2.5 shadow-2xl mb-4">
          <span className="text-2xl animate-bounce">👑</span>
          <span className="text-xl font-black text-amber-100 tracking-widest uppercase">312 LEAGUE</span>
        </div>

        {/* Leaderboard Ranks List */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pb-4">
          {leadersList.map((player) => (
            <div
              key={player.rank}
              onClick={() => openProfile(player.isUser ? (user?.username || "TASAVVUR") : player.name)}
              className={`flex items-center justify-between p-3.5 rounded-3xl border-2 transition-all cursor-pointer ${
                player.isUser
                  ? "bg-gradient-to-r from-amber-500/20 via-purple-900/60 to-amber-500/20 border-amber-400 shadow-[0_0_15px_rgba(255,193,7,0.4)]"
                  : "bg-purple-950/80 border-purple-500/30 hover:scale-[1.01] hover:border-purple-400"
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Rank Badge */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shadow-md ${
                    player.rank === 1
                      ? "bg-gradient-to-b from-yellow-300 to-yellow-500 text-slate-950 border-2 border-yellow-100"
                      : player.rank === 2
                      ? "bg-gradient-to-b from-slate-300 to-slate-400 text-slate-950 border-2 border-slate-200"
                      : player.rank === 3
                      ? "bg-gradient-to-b from-amber-700 to-amber-950 text-amber-100 border-2 border-amber-600"
                      : "bg-purple-950 text-purple-300 border border-purple-800"
                  }`}
                >
                  {player.rank === 1 ? "👑" : player.rank}
                </div>

                {/* Avatar with Equipped Frame filter overlay */}
                <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center">
                  <div
                    className="absolute w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-slate-900 border border-white/10"
                    style={{
                      backgroundImage: `url(${player.avatarUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  {player.equippedFrame && (
                    <img
                      src="/assets/images/icons/profile_frame_v3.png"
                      alt="frame"
                      className="absolute inset-0 w-full h-full object-cover scale-[1.2] pointer-events-none"
                    />
                  )}
                </div>

                {/* Info */}
                <div>
                  <span className="text-xs font-black text-white block">{player.name}</span>
                  <div className="flex items-center gap-1 text-[10px] text-amber-400 font-extrabold mt-0.5">
                    <span>⭐</span> {player.level}
                  </div>
                </div>
              </div>

              {/* Score */}
              <span className="text-sm font-black text-amber-300 font-mono glow-amber-text">{player.score}</span>
            </div>
          ))}
        </div>

        {/* Bottom Action Button */}
        <button className="w-full py-3.5 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 rounded-2xl text-slate-950 font-black text-xs tracking-widest uppercase shadow-xl hover:scale-[1.02] active:scale-95 transition-all border border-yellow-200 mb-2">
          SEE FULL LEADERBOARD
        </button>
      </div>
    </div>
  );
};
