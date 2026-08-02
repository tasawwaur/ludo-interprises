import React, { useEffect } from "react";
import { useUserStore } from "../../../user/user.store";
import { usePlayerStatsStore } from "../../../store/player-stats.store";
import { LudoPageBackground } from "../../../components/effects/LudoPageBackground";
import { PlayerColor } from "../../../game/engine/Engine.types";
import confetti from "canvas-confetti";

interface MatchResultScreenProps {
  onPlayAgain?: () => void;
  onBackToHome?: () => void;
  winnerName?: string;
  winnerScore?: number;
  winnerAvatar?: string;
  winnerFrame?: string;
  winnerColor?: PlayerColor;
  winnerKills?: number;
  winnerPassedTokens?: number;
  
  loserName?: string;
  loserScore?: number;
  loserAvatar?: string;
  loserFrame?: string;
  loserKills?: number;
  loserPassedTokens?: number;
  
  isLocalPlayerWinner?: boolean;
  betCoins?: number;
}

const colorConfig: Record<
  PlayerColor,
  {
    borderClass: string;
    glowClass: string;
    textClass: string;
    badgeBg: string;
    confettiColors: string[];
    glowColorStyle: string;
  }
> = {
  RED: {
    borderClass: "border-red-500/60",
    glowClass: "shadow-[0_0_20px_rgba(239,68,68,0.6)]",
    textClass: "text-red-400",
    badgeBg: "bg-red-500/20 text-red-300 border-red-500/40",
    confettiColors: ["#dc2626", "#ef4444", "#b91c1c", "#fca5a5"],
    glowColorStyle: "rgba(239, 68, 68, 0.4)",
  },
  BLUE: {
    borderClass: "border-blue-500/60",
    glowClass: "shadow-[0_0_20px_rgba(59,130,246,0.6)]",
    textClass: "text-blue-400",
    badgeBg: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    confettiColors: ["#2563eb", "#3b82f6", "#1d4ed8", "#93c5fd"],
    glowColorStyle: "rgba(59, 130, 246, 0.4)",
  },
  GREEN: {
    borderClass: "border-emerald-500/60",
    glowClass: "shadow-[0_0_20px_rgba(16,185,129,0.6)]",
    textClass: "text-emerald-400",
    badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    confettiColors: ["#10b981", "#34d399", "#047857", "#a7f3d0"],
    glowColorStyle: "rgba(16, 185, 129, 0.4)",
  },
  YELLOW: {
    borderClass: "border-amber-400/60",
    glowClass: "shadow-[0_0_20px_rgba(251,191,36,0.6)]",
    textClass: "text-amber-400",
    badgeBg: "bg-amber-400/20 text-amber-300 border-amber-400/40",
    confettiColors: ["#f59e0b", "#fbbf24", "#d97706", "#fde68a"],
    glowColorStyle: "rgba(251, 191, 36, 0.4)",
  },
};

export const MatchResultScreen: React.FC<MatchResultScreenProps> = ({
  onPlayAgain,
  onBackToHome,
  winnerName = "Govind",
  winnerScore = 312,
  winnerAvatar = "",
  winnerFrame = "",
  winnerColor = "GREEN",
  winnerKills = 3,
  winnerPassedTokens = 4,
  
  loserName = "Roxana",
  loserScore = 280,
  loserAvatar = "",
  loserFrame = "",
  loserKills = 1,
  loserPassedTokens = 2,
  
  isLocalPlayerWinner = true,
  betCoins = 5000,
}) => {
  const user = useUserStore((s) => s.user);
  const cfg = colorConfig[winnerColor] || colorConfig.GREEN;

  // Confetti only if local player is the winner
  useEffect(() => {
    if (!isLocalPlayerWinner) return;

    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: cfg.confettiColors,
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: cfg.confettiColors,
      });
    }, 250);

    return () => clearInterval(interval);
  }, [winnerColor, isLocalPlayerWinner, cfg.confettiColors]);

  const { recordMatchEnd } = usePlayerStatsStore();

  const localPlayerKills = isLocalPlayerWinner ? winnerKills : loserKills;
  const localPlayerPassed = isLocalPlayerWinner ? winnerPassedTokens : loserPassedTokens;

  // XP rules from prompt
  const killXPReward = localPlayerKills * 8; // +8 XP
  const passXPReward = localPlayerPassed * 50; // +50 XP
  const winXPReward = isLocalPlayerWinner ? 200 : 0; // +200 XP
  const firstKillBonus = localPlayerKills > 0 ? 20 : 0; // +20 XP
  const perfectWinBonus = isLocalPlayerWinner && localPlayerPassed === 4 ? 75 : 0; // +75 XP
  const allHomeBonus = isLocalPlayerWinner && localPlayerPassed === 4 ? 100 : 0; // +100 XP
  const totalXPReward = killXPReward + passXPReward + winXPReward + firstKillBonus + perfectWinBonus + allHomeBonus;

  // Auto record match stats on mount
  useEffect(() => {
    recordMatchEnd({
      gameMode: "1VS1",
      isWin: isLocalPlayerWinner,
      betCoins: betCoins,
      betDiamonds: isLocalPlayerWinner ? 5 : 0,
      tokensMoved: localPlayerPassed * 25 + Math.floor(Math.random() * 10),
      kills: localPlayerKills,
      hardKills: Math.floor(localPlayerKills / 2),
      revengeKills: Math.floor(localPlayerKills / 3),
      doubleKills: localPlayerKills >= 2 ? 1 : 0,
      tripleKills: localPlayerKills >= 3 ? 1 : 0,
      quadraKills: localPlayerKills >= 4 ? 1 : 0,
      tokensCompleted: localPlayerPassed,
      tokensLost: isLocalPlayerWinner ? 1 : 4,
      diceRolls: 20 + Math.floor(Math.random() * 15),
      sixesCount: 3 + Math.floor(Math.random() * 5),
      maxConsecutiveSixes: Math.random() > 0.85 ? 2 : 1,
      safeZoneVisits: 2 + Math.floor(Math.random() * 3),
      luckyRolls: 1 + Math.floor(Math.random() * 2),
      unluckyRolls: Math.floor(Math.random() * 2),
      isFirstKill: localPlayerKills > 0,
      isPerfectWin: isLocalPlayerWinner && localPlayerPassed === 4,
      isAllTokensHome: isLocalPlayerWinner && localPlayerPassed === 4,
      matchDurationSeconds: 240 + Math.floor(Math.random() * 120),
    });
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#12061F] text-white flex flex-col items-center relative overflow-hidden select-none font-sans">
      {/* 1. Ludo Themed Background based on win/defeat */}
      <LudoPageBackground variant={isLocalPlayerWinner ? "victory" : "defeat"} />

      <div className="w-full max-w-[430px] h-screen flex flex-col justify-between relative z-10 px-4 py-8">
        {/* Top Header */}
        <div className="text-center mt-2 relative">
          <span className="text-xs font-black tracking-widest text-amber-400 uppercase block mb-1">
            MATCH RESULT
          </span>
          <div className="relative flex items-center justify-center">
            <h1 className={`text-4xl font-black tracking-tighter bg-gradient-to-b bg-clip-text text-transparent ${
              isLocalPlayerWinner 
                ? "from-yellow-200 via-yellow-400 to-amber-600 drop-shadow-[0_4px_10px_rgba(255,193,7,0.5)] glow-amber-text" 
                : "from-red-300 via-red-500 to-red-800 drop-shadow-[0_4px_10px_rgba(239,68,68,0.5)] glow-red-text"
            }`}>
              {isLocalPlayerWinner ? "VICTORY" : "DEFEAT"}
            </h1>
          </div>

          {/* Dynamic Radial Glow Behind Trophy */}
          <div className="relative flex items-center justify-center my-2">
            <div
              className="absolute w-28 h-28 rounded-full blur-2xl animate-pulse-soft pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${isLocalPlayerWinner ? cfg.glowColorStyle : 'rgba(239, 68, 68, 0.4)'} 0%, transparent 70%)`
              }}
            ></div>
            <span className={`text-6xl filter drop-shadow-[0_0_15px_rgba(251,191,36,0.85)] z-10 ${isLocalPlayerWinner ? 'animate-bounce' : 'animate-pulse'}`}>
              {isLocalPlayerWinner ? "🏆" : "💔"}
            </span>
          </div>
        </div>

        {/* Center VS Comparison Matchup (Matching Image #14) */}
        <div className="flex items-center justify-center gap-3 my-4">
          {/* Winner Card */}
          <div className={`flex-1 bg-purple-950/80 border-2 ${cfg.borderClass} rounded-3xl p-3 flex flex-col items-center shadow-2xl relative ${cfg.glowClass}`}>
            {/* Winner Avatar Container with Victory Crown */}
            <div className="relative w-[80px] h-[80px] mb-1">
              {/* Victory Crown with bounce animation delay */}
              <span className="absolute -top-[20px] left-1/2 -translate-x-1/2 text-2xl z-30 animate-bounce" style={{ animationDelay: '0.2s' }}>👑</span>
              {/* Winner's Crown Light Pulse Ring */}
              <div 
                className="absolute inset-0 rounded-full animate-ping opacity-75 border-2 pointer-events-none z-0"
                style={{ borderColor: cfg.confettiColors[0] }}
              ></div>
              
              <div
                className="absolute rounded-full overflow-hidden z-10"
                style={{ top: '16%', left: '20%', right: '20%', bottom: '28%' }}
              >
                {winnerAvatar ? (
                  <img
                    src={winnerAvatar}
                    alt={winnerName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="w-full h-full flex items-center justify-center text-2xl bg-slate-900">👤</span>
                )}
              </div>
              <img
                src={winnerFrame || "/assets/images/icons/profile_frame_v3.png"}
                alt="Frame"
                className="absolute inset-0 w-full h-full object-contain z-20 pointer-events-none"
                draggable={false}
              />
            </div>

            {/* Winner Name Banner Image */}
            <div className="relative w-[96px] -mt-[6px] flex flex-col items-center justify-center mb-1">
              <img
                src="/assets/images/icons/name_banner_v2.png"
                alt="Name Banner"
                className="w-full h-auto object-contain pointer-events-none"
                draggable={false}
              />
              <span className="absolute inset-0 flex items-center justify-center font-black text-amber-200 tracking-wider text-[7.5px] truncate max-w-[90%] px-1">
                {winnerName}
              </span>
            </div>

            <span className="text-lg font-black text-amber-400 font-mono my-0.5 glow-amber-text">{winnerScore}</span>
            <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${cfg.badgeBg}`}>
              WINNER
            </span>
            <span className="text-[8px] text-gray-400 mt-1 font-bold">Kills: {winnerKills}</span>
          </div>

          {/* VS Icon Badge */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 font-black text-xs flex items-center justify-center shadow-2xl border-2 border-yellow-200 shrink-0">
            VS
          </div>

          {/* Loser Card */}
          <div className="flex-1 bg-purple-950/80 border-2 border-purple-500/20 rounded-3xl p-3 flex flex-col items-center shadow-lg opacity-80">
            {/* Loser Avatar Container */}
            <div className="relative w-[80px] h-[80px] mb-1">
              <div
                className="absolute rounded-full overflow-hidden z-10"
                style={{ top: '16%', left: '20%', right: '20%', bottom: '28%' }}
              >
                {loserAvatar ? (
                  <img
                    src={loserAvatar}
                    alt={loserName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="w-full h-full flex items-center justify-center text-2xl bg-slate-900">👤</span>
                )}
              </div>
              <img
                src={loserFrame || "/assets/images/icons/profile_frame_v3.png"}
                alt="Frame"
                className="absolute inset-0 w-full h-full object-contain z-20 pointer-events-none"
                draggable={false}
              />
            </div>

            {/* Loser Name Banner Image */}
            <div className="relative w-[96px] -mt-[6px] flex flex-col items-center justify-center mb-1">
              <img
                src="/assets/images/icons/name_banner_v2.png"
                alt="Name Banner"
                className="w-full h-auto object-contain pointer-events-none"
                draggable={false}
              />
              <span className="absolute inset-0 flex items-center justify-center font-black text-amber-200 tracking-wider text-[7.5px] truncate max-w-[90%] px-1">
                {loserName}
              </span>
            </div>

            <span className="text-lg font-black text-gray-300 font-mono my-0.5">{loserScore}</span>
            <span className="text-[9px] text-gray-400 uppercase font-black">RUNNER UP</span>
            <span className="text-[8px] text-gray-400 mt-1 font-bold">Kills: {loserKills}</span>
          </div>
        </div>

        {/* Rewards Summary Row */}
        <div className="bg-black/60 border border-amber-400/30 rounded-2xl py-2 px-3 flex justify-around items-center mb-4 shadow-xl">
          {/* Coins Reward (Minus feedback on loss) */}
          <div className="flex items-center gap-1.5">
            <span className="text-lg">🪙</span>
            <span className={`text-xs font-black ${isLocalPlayerWinner ? 'text-amber-400' : 'text-red-400'}`}>
              {isLocalPlayerWinner ? `+${betCoins.toLocaleString()}` : `-${betCoins.toLocaleString()}`}
            </span>
          </div>
          {/* Diamonds/Gems Reward (Capped at 5 on win, 0 on loss) */}
          <div className="flex items-center gap-1.5">
            <span className="text-lg">💎</span>
            <span className="text-xs font-black text-blue-400">
              {isLocalPlayerWinner ? "+5" : "+0"}
            </span>
          </div>
          {/* Dynamic XP Progress Breakdown */}
          <div className="flex flex-col items-center gap-0.5">
            <div className="flex items-center gap-1">
              <span className="text-lg">⭐</span>
              <span className="text-xs font-black text-emerald-400">+{totalXPReward} XP</span>
            </div>
            <span className="text-[7.5px] text-gray-400 font-bold uppercase tracking-wider scale-[0.9]">
              {localPlayerPassed} Pass ({passXPReward}XP) | {localPlayerKills} Kill ({killXPReward}XP)
            </span>
          </div>
        </div>

        {/* Buttons (PLAY AGAIN & BACK TO HOME) */}
        <div className="flex flex-col gap-3 mb-2">
          <button
            onClick={onPlayAgain}
            className="w-full py-3.5 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 rounded-2xl text-slate-950 font-black text-sm tracking-widest uppercase shadow-xl hover:scale-[1.02] active:scale-95 transition-transform border border-yellow-200 cursor-pointer"
          >
            PLAY AGAIN
          </button>
          <button
            onClick={onBackToHome}
            className="w-full py-3.5 bg-gradient-to-r from-purple-800 to-indigo-900 rounded-2xl text-white font-black text-sm tracking-widest uppercase shadow-lg hover:scale-[1.02] active:scale-95 transition-transform border border-purple-400 cursor-pointer"
          >
            BACK TO HOME
          </button>
        </div>
      </div>
    </div>
  );
};
