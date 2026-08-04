import React, { useState, useEffect } from "react";
import { useUserStore } from "../../../user/user.store";
import { useGameStore } from "../../../store/game.store";
import { useRoomStore } from "../../../features/matchmaking/rooms/RoomStore";
import { GLOBAL_PLAYER_DATABASE } from "../../../store/player-database.store";
import { LudoPageBackground } from "../../../components/effects/LudoPageBackground";

interface VIPLoungePageProps {
  onBack: () => void;
  onStartVIPMatch: () => void;
  onSpectateMatch: () => void;
}

interface ActiveVIPMatch {
  id: string;
  p1: typeof GLOBAL_PLAYER_DATABASE[0];
  p2: typeof GLOBAL_PLAYER_DATABASE[0];
  betAmount: number;
}

export const VIPLoungePage: React.FC<VIPLoungePageProps> = ({
  onBack,
  onStartVIPMatch,
  onSpectateMatch,
}) => {
  const user = useUserStore((s) => s.user);
  const startSpectatorMatch = useGameStore((s) => s.startSpectatorMatch);

  // Generate 6 random VIP matches once on mount
  const [activeMatches, setActiveMatches] = useState<ActiveVIPMatch[]>([]);

  useEffect(() => {
    const list: ActiveVIPMatch[] = [];
    const db = [...GLOBAL_PLAYER_DATABASE];

    // Pick 12 unique players to form 6 matches
    for (let i = 0; i < 6; i++) {
      const idx1 = Math.floor(Math.random() * db.length);
      const p1 = db[idx1];
      db.splice(idx1, 1);

      const idx2 = Math.floor(Math.random() * db.length);
      const p2 = db[idx2];
      db.splice(idx2, 1);

      const bets = [50000, 100000, 200000, 500000, 1000000];
      const betAmount = bets[Math.floor(Math.random() * bets.length)];

      list.push({
        id: `vip_match_${i}`,
        p1,
        p2,
        betAmount,
      });
    }
    setActiveMatches(list);
  }, []);

  const handleSpectate = (match: ActiveVIPMatch) => {
    // Start spectator match in game store
    startSpectatorMatch(match.p1, match.p2);
    // Persist session to game arena
    localStorage.setItem("ludo_active_match_session", "GAME_ARENA");
    onSpectateMatch();
  };

  const handlePlayVIP = () => {
    const userCoins = user?.coins ?? 0;
    if (userCoins < 50000) {
      alert("❌ 50,000 Coins are required to play in the VIP Lounge!");
      return;
    }
    onStartVIPMatch();
  };

  return (
    <div className="min-h-screen w-full bg-[#0c0316] text-white flex flex-col items-center px-4 py-6 relative overflow-hidden select-none font-sans">
      <LudoPageBackground variant="room" />

      {/* Header section with back button */}
      <div className="w-full max-w-md flex justify-between items-center z-10 mb-4">
        <button
          onClick={onBack}
          className="w-10 h-10 bg-purple-950/70 border border-purple-500/30 hover:border-amber-400 rounded-xl flex items-center justify-center text-amber-300 font-extrabold text-sm active:scale-95 transition-all cursor-pointer"
        >
          ◀
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 drop-shadow-[0_2px_8px_rgba(245,158,11,0.5)]">
            👑 VIP LOUNGE 👑
          </h1>
          <span className="text-[9px] font-black uppercase text-purple-300 tracking-widest">
            Royal Spectator & High Stakes
          </span>
        </div>
        <div className="w-10 h-10 opacity-0" /> {/* Spacer */}
      </div>

      {/* User Wealth Status Bar */}
      <div className="w-full max-w-md bg-purple-950/40 border border-purple-500/20 backdrop-blur-md rounded-2xl p-3 flex justify-around items-center z-10 mb-5 shadow-inner">
        <div className="flex items-center gap-1.5">
          <span className="text-lg">🪙</span>
          <div className="flex flex-col">
            <span className="text-[7.5px] font-black text-purple-300 uppercase tracking-wider">My Coins</span>
            <span className="text-xs font-black text-amber-300 font-mono">
              {(user?.coins ?? 0).toLocaleString()}
            </span>
          </div>
        </div>
        <div className="h-6 w-[1px] bg-purple-500/20" />
        <div className="flex items-center gap-1.5">
          <span className="text-lg">💎</span>
          <div className="flex flex-col">
            <span className="text-[7.5px] font-black text-purple-300 uppercase tracking-wider">My Diamonds</span>
            <span className="text-xs font-black text-purple-400 font-mono">
              {(user?.gems ?? 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Main Play VIP Card */}
      <div className="w-full max-w-md bg-gradient-to-b from-amber-500/20 to-yellow-600/10 border-2 border-amber-400/50 backdrop-blur-md rounded-3xl p-5 flex flex-col items-center gap-4 z-10 mb-6 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(245,158,11,0.5)] border border-yellow-200 animate-bounce">
          👑
        </div>
        <div className="text-center">
          <h2 className="text-lg font-black text-amber-200 tracking-wide">
            PLAY VIP 1VS1 MATCH
          </h2>
          <p className="text-[10px] text-gray-300 font-medium max-w-[280px] mt-1 leading-normal">
            Match with top-tier players in the high-stakes arena and double your bet!
          </p>
        </div>
        <button
          onClick={handlePlayVIP}
          className="w-full max-w-[240px] py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-[0_5px_15px_rgba(245,158,11,0.4)] border-0 outline-none cursor-pointer"
        >
          Entry Fee: 50,000 Coins
        </button>
      </div>

      {/* Section Title: Live Spectating */}
      <div className="w-full max-w-md z-10 flex items-center gap-2 mb-3">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[10.5px] font-black uppercase text-purple-200 tracking-wider">
          Live VIP 1v1 Matches (Spectate)
        </span>
      </div>

      {/* Spectator Match list */}
      <div className="w-full max-w-md flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3 z-10 pb-6 pr-0.5">
        {activeMatches.map((match) => (
          <div
            key={match.id}
            className="w-full bg-purple-950/30 border border-purple-500/10 backdrop-blur-md rounded-2xl p-3 flex justify-between items-center hover:border-amber-500/30 transition-all shadow"
          >
            {/* Player 1 */}
            <div className="flex items-center gap-2 w-[35%]">
              <div className="w-10 h-10 relative flex-shrink-0">
                <div className="absolute rounded-full overflow-hidden bg-slate-950 top-[15%] left-[15%] right-[15%] bottom-[26%] border border-purple-950">
                  <img
                    src={match.p1.avatarUrl}
                    alt={match.p1.username}
                    className="w-full h-full object-cover"
                  />
                </div>
                <img
                  src="/assets/images/icons/profile_frame_v3.png"
                  alt="Frame"
                  className="w-full h-full object-contain absolute inset-0 z-20 pointer-events-none"
                  style={{ filter: "hue-rotate(280deg) saturate(2.5) brightness(1.2)" }}
                />
              </div>
              <div className="flex flex-col truncate">
                <span className="text-[9.5px] font-black text-white truncate max-w-[80px]">
                  {match.p1.username}
                </span>
                <span className="text-[7.5px] font-bold text-gray-400">
                  Lv.{match.p1.level}
                </span>
              </div>
            </div>

            {/* Match Bet Info */}
            <div className="flex flex-col items-center justify-center w-[30%]">
              <span className="text-[12px] font-black text-amber-400 drop-shadow">VS</span>
              <span className="text-[8px] font-black text-amber-300 font-mono mt-1">
                🪙 {match.betAmount.toLocaleString()}
              </span>
            </div>

            {/* Player 2 */}
            <div className="flex items-center justify-end gap-2 w-[35%] text-right">
              <div className="flex flex-col truncate">
                <span className="text-[9.5px] font-black text-white truncate max-w-[80px]">
                  {match.p2.username}
                </span>
                <span className="text-[7.5px] font-bold text-gray-400">
                  Lv.{match.p2.level}
                </span>
              </div>
              <div className="w-10 h-10 relative flex-shrink-0">
                <div className="absolute rounded-full overflow-hidden bg-slate-950 top-[15%] left-[15%] right-[15%] bottom-[26%] border border-purple-950">
                  <img
                    src={match.p2.avatarUrl}
                    alt={match.p2.username}
                    className="w-full h-full object-cover"
                  />
                </div>
                <img
                  src="/assets/images/icons/profile_frame_v3.png"
                  alt="Frame"
                  className="w-full h-full object-contain absolute inset-0 z-20 pointer-events-none"
                  style={{ filter: "hue-rotate(280deg) saturate(2.5) brightness(1.2)" }}
                />
              </div>
            </div>

            {/* Spectate Button overlay */}
            <button
              onClick={() => handleSpectate(match)}
              className="ml-2.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-800 to-indigo-800 border border-purple-500 text-white font-black text-[8px] uppercase tracking-wider hover:from-amber-500 hover:to-yellow-500 hover:text-slate-950 hover:border-amber-400 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1 shadow-md"
            >
              👑 SPECTATE
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
