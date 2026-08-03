import React, { useState, useEffect } from "react";
import { LudoPageBackground } from "../../../components/effects/LudoPageBackground";
import { TopHeader } from "../components/TopHeader";
import { EventCarousel } from "../components/EventCarousel";
import { HeroCard } from "../components/HeroCard";
import { GameModeGrid } from "../components/GameModeGrid";
import { BottomNavigation } from "../components/BottomNavigation";
import { LuckySpinModal } from "../../events/LuckySpinModal";
import { XPBar } from "../components/Profile/XPBar";
import { useUserStore } from "../../../user/user.store";
import { usePlayerStatsStore } from "../../../store/player-stats.store";

import { getFrameFilter } from "../../../store/cosmetics.store";
import { getDefaultAvatar } from "../../../utils/avatar";
import { InboxModal } from "../../../components/modal/InboxModal";
import { GLOBAL_PLAYER_DATABASE } from "../../../store/player-database.store";
import confetti from 'canvas-confetti';

const formatCurrency = (val: number): string => {
  if (val < 1000) {
    return Number(val.toFixed(2)).toString();
  }
  
  const formatValue = (num: number, divisor: number, suffix: string): string => {
    const divided = num / divisor;
    const formatted = Number(divided.toFixed(2));
    return `${formatted}${suffix}`;
  };

  if (val < 1000000) {
    return formatValue(val, 1000, "K");
  }
  if (val < 1000000000) {
    return formatValue(val, 1000000, "M");
  }
  if (val < 1000000000000) {
    return formatValue(val, 1000000000, "B");
  }
  return formatValue(val, 1000000000000, "T");
};

// Luxury Casino Web Audio Chime Sound Synthesizer
const playLuxuryRewardSound = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const frequencies = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00, 2637.02, 3135.96];
    frequencies.forEach((freq, idx) => {
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }, idx * 65);
    });
  } catch (e) {
    console.warn('Audio synthesis error:', e);
  }
};

interface HomePageProps {
  onSelectMode?: (mode: string) => void;
  onOpenView?: (view: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSelectMode, onOpenView }) => {
  const user = useUserStore((s) => s.user);
  const updateUser = useUserStore((s) => s.updateUser);
  const justClaimedWelcome = useUserStore((s) => s.justClaimedWelcome);
  const setJustClaimedWelcome = useUserStore((s) => s.setJustClaimedWelcome);

  const { stats, syncWithUserStore } = usePlayerStatsStore();

  useEffect(() => {
    syncWithUserStore();
  }, [user?.coins, user?.gems, user?.level]);

  const level = stats.level;
  const [showLuckySpin, setShowLuckySpin] = useState(false);
  const [showXPDetails, setShowXPDetails] = useState(false);
  const [showNameEdit, setShowNameEdit] = useState(false);
  const [tempName, setTempName] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState("home");
  const [showModeSelection, setShowModeSelection] = useState(false);
  const [showInboxModal, setShowInboxModal] = useState(false);

  const handleAcceptGameInvite = (invite: any) => {
    const opp = GLOBAL_PLAYER_DATABASE.find(p => p.username === invite.senderName);
    const opponentData = opp ? {
      name: opp.username,
      avatar: opp.avatarUrl,
      profileFrame: opp.equippedFrame,
      nameBanner: "/assets/images/icons/name_banner_v2.png",
      color: "GREEN",
      isBot: true,
      roomCode: "ROOM-" + Math.floor(100000 + Math.random() * 900000)
    } : {
      name: invite.senderName,
      avatar: "/assets/images/icons/icon_club_crown.png",
      profileFrame: "frame_default",
      nameBanner: "/assets/images/icons/name_banner_v2.png",
      color: "GREEN",
      isBot: true,
      roomCode: "ROOM-" + Math.floor(100000 + Math.random() * 900000)
    };

    localStorage.setItem("ludo_sl_opponent", JSON.stringify(opponentData));
    localStorage.setItem("ludo_sl_botName", opponentData.name);
    localStorage.removeItem("ludo_sl_engine_state");
    onSelectMode?.("Snake & Ladders");
  };

  const [animCrowns, setAnimCrowns] = useState<number | null>(null);
  const [animCoins, setAnimCoins] = useState<number | null>(null);
  const [animGems, setAnimGems] = useState<number | null>(null);
  const [isGlowBox, setIsGlowBox] = useState(false);

  useEffect(() => {
    if (justClaimedWelcome) {
      setIsGlowBox(true);
      playLuxuryRewardSound();

      const targetCrowns = user?.crowns || 5;
      const targetCoins = user?.coins || 10000;
      const targetGems = user?.gems || 100;

      // Start ALL THREE counters at 0!
      setAnimCrowns(0);
      setAnimCoins(0);
      setAnimGems(0);

      let currentCr = 0;
      let currentC = 0;
      let currentG = 0;
      const steps = 30;
      const stepCr = 1;
      const stepC = Math.ceil(targetCoins / steps);
      const stepG = Math.ceil(targetGems / steps);

      const interval = setInterval(() => {
        currentCr = Math.min(targetCrowns, currentCr + stepCr);
        currentC = Math.min(targetCoins, currentC + stepC);
        currentG = Math.min(targetGems, currentG + stepG);

        setAnimCrowns(currentCr);
        setAnimCoins(currentC);
        setAnimGems(currentG);

        if (currentCr >= targetCrowns && currentC >= targetCoins && currentG >= targetGems) {
          clearInterval(interval);
          setTimeout(() => {
            setAnimCrowns(null);
            setAnimCoins(null);
            setAnimGems(null);
            setIsGlowBox(false);
            setJustClaimedWelcome(false);
          }, 1500);
        }
      }, 45);

      return () => clearInterval(interval);
    }
  }, [justClaimedWelcome, user, setJustClaimedWelcome]);

  const displayCrowns = animCrowns !== null ? animCrowns : (user?.crowns || 0);
  const displayCoins = animCoins !== null ? animCoins : (user?.coins || 0);
  const displayGems = animGems !== null ? animGems : (user?.gems || 0);
  const [playerName, setPlayerName] = useState(() => {
    if (user) {
      return user.displayName || user.username || localStorage.getItem("ludo_player_name") || "TASAVVUR";
    }
    return localStorage.getItem("ludo_player_name") || "TASAVVUR";
  });
  const [playerPhoto, setPlayerPhoto] = useState<string | null>(() => {
    if (user?.avatar) {
      return user.avatar;
    }
    return localStorage.getItem("ludo_player_photo");
  });

  // ✅ Sync user store updates with home screen name + avatar (for Guest, Facebook, and Google)
  useEffect(() => {
    if (user) {
      const activeName = user.displayName || user.username;
      if (activeName && activeName !== playerName) {
        setPlayerName(activeName);
        localStorage.setItem("ludo_player_name", activeName);
      }
      if (user.avatar && user.avatar !== playerPhoto) {
        setPlayerPhoto(user.avatar);
        localStorage.setItem("ludo_player_photo", user.avatar);
      } else if (!user.avatar && playerPhoto) {
        const storedPhoto = localStorage.getItem("ludo_player_photo");
        if (!storedPhoto) {
          setPlayerPhoto(null);
        }
      }
    }
  }, [user?.id, user?.displayName, user?.username, user?.avatar]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleNavChange = (nav: string) => {
    setActiveNav(nav);
    if (nav === "shop") onOpenView?.("SHOP");
    else if (nav === "friends") onOpenView?.("FRIENDS");
    else if (nav === "rewards") onOpenView?.("REWARDS");
    else if (nav === "profile") onOpenView?.("PROFILE");
  };

  const handleTwoPlayerClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;

    confetti({
      particleCount: 22,
      spread: 50,
      origin: { x, y },
      colors: ['#FFD700', '#FFA500', '#FFD54F', '#FFF8DC'],
      scalar: 0.85,
      ticks: 60,
    });

    setShowModeSelection(true);
  };

  const handleNameClick = () => {
    setTempName(playerName);
    setShowNameEdit(true);
  };

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden select-none font-sans bg-[#0F041C] text-white">

      {/* Background */}
      <LudoPageBackground variant="home" />

      {/* ── Hidden Components ── */}
      <div className="hidden">
        <TopHeader
          onOpenProfileSettings={() => onOpenView?.("PROFILE")}
          onOpenInbox={() => triggerToast("Inbox: 5 New Messages")}
        />
        <EventCarousel
          onClaimDaily={() => onOpenView?.("REWARDS")}
          onOpenLeague={() => onOpenView?.("LEADERBOARD")}
          onLuckySpin={() => setShowLuckySpin(true)}
        />
        <HeroCard
          onSelectMode={(mode) => {
            triggerToast(`Joining ${mode}...`);
            onSelectMode?.(mode);
          }}
        />
        <BottomNavigation
          activeNav={activeNav}
          onNavChange={handleNavChange}
          onOpenProfileSettings={() => onOpenView?.("PROFILE")}
        />
      </div>

      {/* ── LUXURY PROFILE — Top Left Corner ── */}
      <div className="absolute top-[12px] left-[5%] z-40 flex flex-col items-center" style={{ width: '108px' }}>
        {/* Profile Picture with Luxury Frame - clickable to view profile */}
        <button
          onClick={() => onOpenView?.("PROFILE")}
          className="relative w-[108px] h-[108px] cursor-pointer border-0 outline-none bg-transparent p-0 hover:scale-105 active:scale-95 transition-transform"
          style={{ WebkitTapHighlightColor: "transparent" }}
          aria-label="View Player Profile"
        >
          {/* Avatar inside round circle — perfectly centered in frame opening */}
          <div
            className="absolute rounded-full overflow-hidden z-10"
            style={{ top: '16%', left: '20%', right: '20%', bottom: '28%' }}
          >
            {playerPhoto ? (
              <img
                src={playerPhoto}
                alt="Player"
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={getDefaultAvatar(user?.id || 'default')}
                alt="Player Default"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          {/* Luxury Frame overlay v3 */}
          <img
            src="/assets/images/icons/profile_frame_v3.png"
            alt="Profile Frame"
            className="absolute inset-0 w-full h-full object-contain z-20 pointer-events-none"
            draggable={false}
            style={{ filter: getFrameFilter(user?.equippedFrame) }}
          />
        </button>

        {/* Rejoin Active Game Button */}
        {typeof window !== 'undefined' && localStorage.getItem("ludo_active_match_session") === "GAME_ARENA" && (
          <button
            onClick={() => onOpenView?.("GAME_ARENA")}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-sm uppercase rounded-2xl border-2 border-yellow-200 shadow-[0_0_20px_rgba(255,215,0,0.8)] hover:scale-105 active:scale-95 transition-all flex items-center justify-between animate-bounce cursor-pointer mb-2"
          >
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-600 rounded-full animate-ping"></span>
              🎮 GAME IN PROGRESS
            </span>
            <span className="bg-slate-950 text-amber-300 px-3 py-1 rounded-xl text-xs font-black shadow">
              REJOIN MATCH ➜
            </span>
          </button>
        )}

        {/* Name Banner — Auto-scaled font size with Hindi & English support */}
        <button
          onClick={handleNameClick}
          className="relative w-[124px] -mt-[10px] cursor-pointer hover:scale-105 active:scale-95 transition-all border-0 outline-none p-0 bg-transparent flex flex-col items-center justify-center"
          style={{ WebkitTapHighlightColor: "transparent" }}
          aria-label="Change Player Name"
        >
          <img
            src="/assets/images/icons/name_banner_v2.png"
            alt="Name Banner"
            className="w-full h-auto object-contain pointer-events-none"
            draggable={false}
          />
          <span 
            className={`absolute inset-0 flex items-center justify-center font-black text-amber-200 tracking-wider drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)] pointer-events-none px-2 text-center overflow-hidden truncate max-w-[90%] ${
              playerName.length <= 8 ? 'text-[9.5px]' : playerName.length <= 12 ? 'text-[8.5px]' : 'text-[7.5px]'
            }`}
          >
            {playerName}
          </span>
        </button>
      </div>

      {/* ── LUXURY XP PROGRESS BAR ── */}
      <button
        onClick={() => {
          confetti({
            particleCount: 15,
            spread: 30,
            colors: ['#FFD700', '#FFA500'],
            scalar: 0.8,
          });
          onOpenView?.("XP_MAIN");
        }}
        className="absolute top-[40px] left-[122px] z-40 w-[175px] border-0 outline-none p-0 bg-transparent cursor-pointer hover:scale-105 active:scale-95 transition-all text-left"
        style={{ WebkitTapHighlightColor: "transparent" }}
        aria-label="View XP Details"
      >
        <XPBar currentXp={stats.xp} requiredXp={stats.nextLevelXp} level={stats.level} />
      </button>

      {/* ── LUXURY LEFT SIDE ICON BAR (Video Ads, VIP Club, & Golden Dice) ── */}
      <div className="absolute top-[142px] left-[12px] z-40 flex flex-col gap-[8px] items-center">
        {/* Video Ads Button */}
        <button
          onClick={() => {
            confetti({
              particleCount: 15,
              spread: 30,
              colors: ['#FFD700', '#FFA500'],
              scalar: 0.8,
            });
            onOpenView?.("REWARD_CENTER");
          }}
          className="w-[30px] h-[30px] p-0 border-0 outline-none bg-transparent hover:scale-110 active:scale-[0.96] transition-transform cursor-pointer"
          style={{ WebkitTapHighlightColor: "transparent" }}
          aria-label="Video Ads"
        >
          <img
            src="/assets/images/icons/icon_video_ads.png"
            alt="Video Ads"
            className="w-full h-full object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
            draggable={false}
          />
        </button>

        {/* VIP Club Button */}
        <button
          onClick={() => {
            confetti({
              particleCount: 15,
              spread: 30,
              colors: ['#FFD700', '#FFA500'],
              scalar: 0.8,
            });
            onOpenView?.("CLUB");
          }}
          className="w-[30px] h-[30px] p-0 border-0 outline-none bg-transparent hover:scale-110 active:scale-[0.96] transition-transform cursor-pointer"
          style={{ WebkitTapHighlightColor: "transparent" }}
          aria-label="VIP Club"
        >
          <img
            src="/assets/images/icons/icon_club_crown.png"
            alt="VIP Club"
            className="w-full h-full object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
            draggable={false}
          />
        </button>

        {/* Golden Dice Button */}
        <button
          onClick={() => {
            confetti({
              particleCount: 20,
              spread: 35,
              colors: ['#FFD700', '#FFA500', '#FFD54F', '#FFF8DC'],
              scalar: 0.85,
            });
            onOpenView?.("DICE_MAIN");
          }}
          className="w-[30px] h-[30px] p-0 border-0 outline-none bg-transparent hover:scale-110 active:scale-[0.96] transition-transform cursor-pointer"
          style={{ WebkitTapHighlightColor: "transparent" }}
          aria-label="Lucky Roll"
        >
          <img
            src="/assets/images/icons/icon_gold_dice.png"
            alt="Lucky Roll"
            className="w-full h-full object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] animate-pulse"
            style={{ animationDuration: '3s' }}
            draggable={false}
          />
        </button>
      </div>



      {/* ── LUXURY CURRENCY BAR — Top Header ── */}
      <div className="absolute top-[8px] right-1.5 z-40 w-[62%] max-w-[260px]">
        <div className="relative w-full">
          <img
            src="/assets/images/icons/luxury_header_divider.png"
            alt="Currency Bar"
            className="w-full h-auto object-contain rotate-180 translate-y-[8px]"
            draggable={false}
          />
          {/* Currency Values Overlay — Clickable to open Shop */}
          <button
            onClick={() => onOpenView?.("SHOP")}
            className="absolute inset-0 flex items-center justify-center translate-y-0 border-0 outline-none bg-transparent w-full h-full cursor-pointer hover:scale-[1.02] active:scale-98 transition-all"
            style={{ padding: '0 12%', WebkitTapHighlightColor: 'transparent' }}
            aria-label="Open Shop"
          >
            <div className="currencyBar">
              {/* Crowns (left section) */}
              <div className="currency-item">
                <img src="/assets/images/icons/icon_gem.png" alt="crown" className="currency-icon drop-shadow-[0_0_6px_rgba(100,149,237,0.8)]" style={{ animation: 'sparkle 2s ease-in-out infinite' }} draggable={false} />
                <span className="currency-value currency-crowns">{formatCurrency(user?.crowns || 0)}</span>
              </div>
              {/* Coins (middle section) */}
              <div className="currency-item">
                <img src="/assets/images/icons/icon_coin.png" alt="coin" className="currency-icon drop-shadow-[0_0_6px_rgba(255,179,0,0.8)]" style={{ animation: 'sparkle 2.2s ease-in-out infinite' }} draggable={false} />
                <span className="currency-value currency-coins">{formatCurrency(user?.coins || 0)}</span>
              </div>
              {/* Gems (right section) */}
              <div className="currency-item translate-x-[10px]">
                <img src="/assets/images/icons/icon_diamond.png" alt="diamond" className="currency-icon drop-shadow-[0_0_6px_rgba(168,85,247,0.8)]" style={{ animation: 'sparkle 2.5s ease-in-out infinite' }} draggable={false} />
                <span className="currency-value currency-gems">{formatCurrency(user?.gems || 0)}</span>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* ── LUXURY SIDE ICON BAR ── */}
      <div className="absolute top-[48px] right-[10px] z-40 flex flex-col gap-[10px] items-center">
        {/* Settings */}
        <button
          onClick={() => onOpenView?.("SETTINGS")}
          className="w-[34px] h-[34px] p-0 border-0 outline-none bg-transparent hover:scale-110 active:scale-95 transition-transform cursor-pointer"
          style={{ WebkitTapHighlightColor: "transparent" }}
          aria-label="Settings"
        >
          <img src="/assets/images/icons/luxury_settings.png" className="w-full h-full object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]" alt="Settings" />
        </button>

        {/* Shop */}
        <button
          onClick={() => onOpenView?.("SHOP")}
          className="w-[34px] h-[34px] p-0 border-0 outline-none bg-transparent hover:scale-110 active:scale-95 transition-transform cursor-pointer"
          style={{ WebkitTapHighlightColor: "transparent" }}
          aria-label="Shop"
        >
          <img src="/assets/images/icons/luxury_shop.png" className="w-full h-full object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]" alt="Shop" />
        </button>

        {/* Mail */}
        <button
          onClick={() => setShowInboxModal(true)}
          className="w-[34px] h-[34px] p-0 border-0 outline-none bg-transparent hover:scale-110 active:scale-95 transition-transform cursor-pointer"
          style={{ WebkitTapHighlightColor: "transparent" }}
          aria-label="Inbox"
        >
          <img src="/assets/images/icons/luxury_mail.png" className="w-full h-full object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]" alt="Inbox" />
        </button>

        {/* Notifications */}
        <button
          onClick={() => triggerToast("Notifications: Sounds are active")}
          className="w-[34px] h-[34px] p-0 border-0 outline-none bg-transparent hover:scale-110 active:scale-95 transition-transform cursor-pointer"
          style={{ WebkitTapHighlightColor: "transparent" }}
          aria-label="Notifications"
        >
          <img src="/assets/images/icons/luxury_bell.png" className="w-full h-full object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]" alt="Notifications" />
        </button>
      </div>


      {/* ── SPACER ── */}
      <div className="flex-1" />

      {/* ── GAME MODE GRID ── */}
      <div className="relative z-20 w-full flex justify-center px-3 pb-0 translate-y-[24px]">
        <div className="w-full max-w-[420px] relative">
          {/* 2 Player Mode Custom Graphic Overlay or REJOIN MATCH Banner */}
          {typeof window !== 'undefined' && localStorage.getItem("ludo_active_match_session") === "GAME_ARENA" ? (
            <button
              onClick={() => onOpenView?.("GAME_ARENA")}
              className="absolute top-[-96px] left-0 right-0 h-[88px] z-30 cursor-pointer border-2 border-amber-300 rounded-[18px] p-3 bg-gradient-to-r from-purple-900 via-amber-600 to-purple-900 flex items-center justify-between shadow-[0_0_25px_rgba(245,158,11,0.9)] hover:scale-[1.02] active:scale-[0.96] transition-transform animate-pulse"
            >
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 bg-emerald-400 rounded-full animate-ping"></span>
                <span className="font-black text-amber-200 text-sm tracking-wider">LIVE MATCH IN PROGRESS</span>
              </div>
              <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 px-3 py-1.5 rounded-xl font-black text-xs shadow-lg uppercase">
                REJOIN NOW ➜
              </span>
            </button>
          ) : (
            <button
              onClick={handleTwoPlayerClick}
              className="absolute top-[-96px] left-0 right-0 h-[88px] z-30 cursor-pointer border-0 outline-none p-0 bg-transparent flex items-center justify-center hover:scale-[1.02] active:scale-[0.96] transition-transform"
              style={{ WebkitTapHighlightColor: "transparent" }}
              aria-label="2 Player Mode"
            >
              <img
                src="/assets/images/home/cards/two_player_banner_custom.png"
                alt="2 Player Mode"
                className="w-full h-full object-fill rounded-[18px]"
                draggable={false}
              />
            </button>
          )}
          <GameModeGrid
            onSelectMode={(modeKey) => {
              if (modeKey === "Tournament") {
                onOpenView?.("TOURNAMENT");
              } else if (modeKey === "VIP Lounge" || modeKey === "VIP Room") {
                onOpenView?.("SHOP");
              } else if (modeKey === "Streak Stars") {
                onOpenView?.("REWARDS");
              } else {
                triggerToast(`Joining ${modeKey}...`);
                onSelectMode?.(modeKey);
              }
            }}
          />
        </div>
      </div>

      {/* ── LUXURY BOTTOM NAV — Transparent PNG with invisible click zones ── */}
      <div className="relative z-30 w-full flex-shrink-0" style={{ height: "98px" }}>
        {/* Transparent PNG nav bar image — full width */}
        <img
          src="/assets/images/icons/luxury_nav_bar.png"
          alt="nav frame"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none translate-y-[2px]"
          draggable={false}
        />

        {/* ── LUXURY RANK BADGE PNG — left bottom (replaces Shop) ── */}
        {(() => {
          const rank = user?.rank ?? 0;

          type TierCfg = { tier: string; emoji: string; glow: string; bg: string; rankColor: string; tierColor: string; border: string; };
          let cfg: TierCfg = {
            tier: "Rookie", emoji: "⚔️",
            glow: "rgba(180,110,60,0.95)",
            bg: "radial-gradient(circle at 40% 35%, #7c3400, #3b0f00)",
            rankColor: "#FCD3A0", tierColor: "#E0935A",
            border: "rgba(180,110,60,0.8)",
          };
          if (rank >= 1 && rank <= 500) {
            cfg = { tier: "Bronze", emoji: "🥉", glow: "rgba(205,127,50,1)", bg: "radial-gradient(circle at 40% 35%, #92400e, #451a03)", rankColor: "#FFB87A", tierColor: "#CD7F32", border: "rgba(205,127,50,0.9)" };
          } else if (rank >= 501 && rank <= 1000) {
            cfg = { tier: "Silver", emoji: "🥈", glow: "rgba(190,210,230,1)", bg: "radial-gradient(circle at 40% 35%, #374151, #111827)", rankColor: "#E8F0F8", tierColor: "#CBD5E1", border: "rgba(200,210,220,0.8)" };
          } else if (rank >= 1001 && rank <= 2000) {
            cfg = { tier: "Gold", emoji: "🥇", glow: "rgba(255,195,0,1)", bg: "radial-gradient(circle at 40% 35%, #78350f, #292100)", rankColor: "#FEF08A", tierColor: "#FFD700", border: "rgba(255,195,0,0.9)" };
          } else if (rank >= 2001 && rank <= 5000) {
            cfg = { tier: "Platinum", emoji: "💎", glow: "rgba(99,220,255,1)", bg: "radial-gradient(circle at 40% 35%, #0e4a5a, #041520)", rankColor: "#B2F5FF", tierColor: "#67E8F9", border: "rgba(99,220,255,0.8)" };
          } else if (rank >= 5001 && rank <= 10000) {
            cfg = { tier: "Diamond", emoji: "💠", glow: "rgba(100,160,255,1)", bg: "radial-gradient(circle at 40% 35%, #1e3a8a, #0a0f2e)", rankColor: "#BAD4FF", tierColor: "#93C5FD", border: "rgba(100,160,255,0.8)" };
          } else if (rank > 10000) {
            cfg = { tier: "Legendary", emoji: "👑", glow: "rgba(255,215,0,1)", bg: "radial-gradient(circle at 40% 35%, #713f12, #1c0a00)", rankColor: "#FFF8D0", tierColor: "#FFD700", border: "rgba(255,215,0,1)" };
          }

          return (
            <button
              onClick={() => onOpenView?.("LEADERBOARD")}
              className="absolute left-1/2 -translate-x-1/2 -top-[36px] z-40 cursor-pointer border-0 outline-none p-0 bg-transparent hover:scale-110 active:scale-95 transition-all duration-200"
              style={{ WebkitTapHighlightColor: "transparent" }}
              aria-label="View Leaderboard Rank"
            >
              {/* Outer glow halo */}
              <div
                style={{ filter: `drop-shadow(0 0 6px ${cfg.glow}) drop-shadow(0 0 12px ${cfg.glow})` }}
              >
                {/* Circular container — dark gradient base */}
                <div
                  className="relative w-[54px] h-[54px] rounded-full overflow-hidden flex items-center justify-center"
                  style={{
                    background: cfg.bg,
                    border: `1.5px solid ${cfg.border}`,
                    boxShadow: `inset 0 0 8px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.1)`,
                  }}
                >
                  {/* PNG crest — blended so dark bg dissolves, only bright crest shows */}
                  <img
                    src="/assets/images/icons/rank_badge_frame.jpg"
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ mixBlendMode: "screen", opacity: 0.65 }}
                    draggable={false}
                  />

                  {/* Text overlay */}
                  <div className="relative z-10 flex flex-col items-center justify-center gap-[0.5px]">
                    <span className="text-[13px] leading-none drop-shadow-[0_1px_3px_rgba(0,0,0,1)]">{cfg.emoji}</span>
                    <span
                      className="text-[8px] font-black leading-none tracking-tight"
                      style={{ color: cfg.rankColor, textShadow: `0 0 4px ${cfg.glow}, 0 1px 2px rgba(0,0,0,1)` }}
                    >
                      {rank > 0 ? `#${rank}` : "–"}
                    </span>
                    <span
                      className="text-[5px] font-black uppercase tracking-[0.05em] leading-none"
                      style={{ color: cfg.tierColor, textShadow: `0 1px 2px rgba(0,0,0,1)` }}
                    >
                      {cfg.tier}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })()}

        {/* Clickable overlay zones (invisible buttons matching image layout) */}
        <div className="absolute bottom-0 left-0 right-0 h-[58px] flex items-center justify-around px-2">
          {/* SHOP */}
          <button
            onClick={() => handleNavChange("shop")}
            className="w-[18%] h-full opacity-0 active:opacity-10 active:bg-amber-400/20 rounded-xl transition-all"
            aria-label="Shop"
          />

          {/* FRIENDS */}
          <button
            onClick={() => handleNavChange("friends")}
            className="w-[18%] h-full opacity-0 active:opacity-10 active:bg-amber-400/20 rounded-xl transition-all"
            aria-label="Friends"
          />

          {/* HOME */}
          <button
            onClick={() => handleNavChange("home")}
            className="w-[20%] h-[120%] -translate-y-1.5 opacity-0 active:opacity-10 active:bg-amber-400/20 rounded-full transition-all"
            aria-label="Home"
          />

          {/* REWARDS */}
          <button
            onClick={() => handleNavChange("rewards")}
            className="w-[18%] h-full opacity-0 active:opacity-10 active:bg-amber-400/20 rounded-xl transition-all"
            aria-label="Rewards"
          />

          {/* PROFILE */}
          <button
            onClick={() => { handleNavChange("profile"); onOpenView?.("PROFILE"); }}
            className="w-[18%] h-full opacity-0 active:opacity-10 active:bg-amber-400/20 rounded-xl transition-all"
            aria-label="Profile"
          />
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 px-5 py-2 bg-black/90 border border-amber-400 text-amber-300 font-bold text-xs tracking-wider rounded-full shadow-2xl whitespace-nowrap">
          {toastMessage}
        </div>
      )}

      {/* Lucky Spin Modal */}
      <LuckySpinModal
        isOpen={showLuckySpin}
        onClose={() => setShowLuckySpin(false)}
        onSpinWin={(reward) => triggerToast(`You won ${reward}!`)}
      />

      {/* Inbox Modal */}
      <InboxModal
        isOpen={showInboxModal}
        onClose={() => setShowInboxModal(false)}
        onAcceptGameInvite={handleAcceptGameInvite}
      />

      {/* XP & Quests Detail Modal */}
      {showXPDetails && (
        <div className="absolute inset-0 z-[110] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[320px] bg-gradient-to-b from-[#2B1440] to-[#12061F] border-2 border-amber-500/70 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.9)] text-white relative overflow-hidden animate-in fade-in zoom-in-95 duration-200 animate-fade-in">
            {/* Top Ornate gold light glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-2 bg-gradient-to-r from-transparent via-amber-400 to-transparent blur-md"></div>
            
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏆</span>
                <span className="text-sm font-black text-amber-200 tracking-widest uppercase">Level & Quests</span>
              </div>
              <button 
                onClick={() => setShowXPDetails(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-purple-950/80 border border-amber-500/30 text-amber-200 hover:bg-purple-900 active:scale-90 font-bold transition-all cursor-pointer"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                ✕
              </button>
            </div>

            {/* Level Info Card */}
            <div className="bg-purple-950/50 border border-purple-800/60 rounded-2xl p-4 flex flex-col items-center gap-3 mb-4 shadow-inner">
              <div className="flex items-center gap-4 w-full">
                {/* Shield Circle */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 border-2 border-yellow-200 flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.4)] flex-shrink-0">
                  <span className="text-lg font-black text-purple-950 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">{level}</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-xs font-bold text-purple-200 italic">Level {level} Progress</span>
                    <span className="text-[10px] font-black text-amber-300">75 / 100 XP</span>
                  </div>
                  {/* Large Progress Track */}
                  <div className="w-full h-3 bg-purple-950/80 rounded-full border border-purple-900/60 p-[1.5px] overflow-hidden">
                    <div className="h-full w-[75%] bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-[0_0_6px_rgba(251,191,36,0.8)]"></div>
                  </div>
                </div>
              </div>
              <p className="text-[9px] text-purple-300 text-center italic">Earn 25 more XP to level up to Level {level + 1}!</p>
            </div>

            {/* Quests Section */}
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-black text-amber-200 tracking-wider uppercase">Active Quests</p>
              
              {/* Quest 1 */}
              <div className="flex justify-between items-center bg-purple-950/30 border border-purple-900/40 rounded-xl p-2.5">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-white">Win 1 Classic Game</span>
                  <span className="text-[9px] text-amber-400/80 font-bold">Reward: +20 XP</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/80 font-bold border border-purple-800 text-purple-200">0 / 1</span>
                  <span className="text-xs text-slate-500">⏳</span>
                </div>
              </div>

              {/* Quest 2 */}
              <div className="flex justify-between items-center bg-purple-950/30 border border-purple-900/40 rounded-xl p-2.5">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-white">Send 3 Chat Emotes</span>
                  <span className="text-[9px] text-amber-400/80 font-bold">Reward: +10 XP</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/80 font-bold border border-purple-800 text-purple-200">2 / 3</span>
                  <span className="text-xs text-slate-500">⏳</span>
                </div>
              </div>

              {/* Quest 3 */}
              <div className="flex justify-between items-center bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-2.5">
                <div className="flex flex-col opacity-75">
                  <span className="text-xs font-black text-white line-through">Play 1 Private Match</span>
                  <span className="text-[9px] text-emerald-400 font-bold">Reward: +25 XP</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-bold border border-emerald-800">1 / 1</span>
                  <span className="text-emerald-400 text-xs">✓</span>
                </div>
              </div>
            </div>

            {/* Bottom Claim Button */}
            <button 
              onClick={() => {
                triggerToast("Reward claimed! +25 XP");
                setShowXPDetails(false);
              }}
              className="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-purple-950 font-black text-xs tracking-widest uppercase transition-all duration-200 active:scale-95 shadow-[0_4px_15px_rgba(245,158,11,0.35)] cursor-pointer border-0 outline-none"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              Claim Completed Rewards
            </button>
          </div>
        </div>
      )}

      {/* Edit Name Modal */}
      {showNameEdit && (
        <div className="absolute inset-0 z-[110] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[290px] bg-gradient-to-b from-[#2B1440] to-[#12061F] border-2 border-amber-500/70 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.9)] text-white relative overflow-hidden animate-in fade-in zoom-in-95 duration-200 animate-fade-in">
            {/* Top Ornate gold light glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-2 bg-gradient-to-r from-transparent via-amber-400 to-transparent blur-md"></div>
            
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">✏️</span>
                <span className="text-xs font-black text-amber-200 tracking-widest uppercase">Edit Name</span>
              </div>
              <button 
                onClick={() => setShowNameEdit(false)}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-purple-950/80 border border-amber-500/30 text-amber-200 hover:bg-purple-900 active:scale-90 font-bold transition-all cursor-pointer"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                ✕
              </button>
            </div>

            {/* Input Card Container */}
            <div className="bg-purple-950/50 border border-purple-800/60 rounded-2xl p-4 flex flex-col gap-3 mb-4 shadow-inner">
              <span className="text-[10px] font-bold text-purple-200 uppercase tracking-wider text-center">Enter New Profile Name</span>
              <input
                type="text"
                maxLength={12}
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="TASAVVUR"
                className="w-full py-2 bg-[#0C0416] border border-amber-500/40 rounded-xl text-center font-black text-amber-200 uppercase tracking-widest text-sm focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/50 transition-all placeholder:opacity-30 text-white"
                autoFocus
              />
              <p className="text-[9px] text-purple-300 text-center italic">Max length: 12 characters</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  const cleaned = tempName.trim();
                  if (cleaned.length > 0) {
                     const formatted = cleaned.toUpperCase();
                     setPlayerName(formatted);
                     localStorage.setItem("ludo_player_name", formatted);
                     updateUser({ username: formatted, displayName: formatted });
                     triggerToast(`Name updated to ${formatted}`);
                     setShowNameEdit(false);
                  } else {
                     triggerToast("Name cannot be empty!");
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-purple-950 font-black text-xs tracking-widest uppercase transition-all duration-200 active:scale-95 shadow-[0_4px_12px_rgba(245,158,11,0.25)] cursor-pointer border-0 outline-none"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                Save
              </button>
              <button 
                onClick={() => setShowNameEdit(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs tracking-widest uppercase transition-all duration-200 active:scale-95 cursor-pointer border-0 outline-none"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── LUXURY GAME MODE SELECTION MODAL ── */}
      {showModeSelection && (
        <div className="absolute inset-0 bg-[#090214]/95 z-[90] flex flex-col items-center justify-start p-6 overflow-y-auto animate-[fadeIn_0.25s_ease-out]">
          {/* Luxury background image fit */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-45 pointer-events-none mix-blend-screen"
            style={{ backgroundImage: `url('/assets/images/backgrounds/luxury_ludo_bg.jpg')` }}
          />

          {/* Glowing auroras */}
          <div className="absolute w-[280px] h-[280px] rounded-full bg-purple-600/20 blur-[100px] top-10 pointer-events-none animate-pulse-soft"></div>
          <div className="absolute w-[240px] h-[240px] rounded-full bg-amber-500/10 blur-[80px] bottom-10 pointer-events-none animate-pulse-soft"></div>

          {/* Modal Header */}
          <div className="w-full max-w-[390px] relative z-10 flex items-center justify-between mt-4 mb-6">
            <h2 className="text-xl font-black bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent tracking-widest uppercase glow-gold-text">
              SELECT LUDO MODE
            </h2>
            <button
              onClick={() => setShowModeSelection(false)}
              className="w-9 h-9 rounded-full bg-slate-900/80 border border-amber-500/30 flex items-center justify-center text-amber-200 text-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
            >
              ✕
            </button>
          </div>

          {/* Modes List */}
          <div className="w-full max-w-[390px] relative z-10 flex flex-col gap-4">
            {/* Mode 1: Quick Classic */}
            <button
              onClick={() => {
                setShowModeSelection(false);
                triggerToast("Joining Quick Classic...");
                onSelectMode?.("Quick Classic");
              }}
              className="w-full rounded-[24px] border border-amber-500/30 bg-gradient-to-r from-slate-950/90 via-purple-950/50 to-slate-950/90 p-3.5 flex items-center gap-4 text-left shadow-[0_8px_20px_rgba(0,0,0,0.65)] hover:border-amber-400/60 hover:scale-[1.02] active:scale-[0.98] transition-all outline-none duration-350 cursor-pointer relative"
            >
              <img 
                src="/assets/images/icons/quick_classic_icon.jpg" 
                alt="Quick Classic" 
                className="w-16 h-16 rounded-[16px] object-cover border-2 border-amber-400/40 shadow-inner" 
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-amber-200 tracking-wide">QUICK CLASSIC</h3>
                  <span className="text-[9px] bg-purple-950/80 border border-amber-400/40 text-amber-300 px-2.5 py-0.5 rounded-full font-black uppercase shadow">1 TOKEN</span>
                </div>
                <p className="text-[10px] text-purple-200/80 mt-1 leading-snug">
                  1-Token combat. Reach center to win instantly. Fast-paced &amp; action-packed!
                </p>
                <div className="flex items-center gap-1.5 mt-2.5">
                  <span className="text-[9px] font-black tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-md border border-amber-500/30 uppercase flex items-center gap-1">
                    ENTRY: 5K COINS <img src="/assets/images/icons/luxury_coin.png" className="w-3 h-3 object-contain inline" alt="coin" />
                  </span>
                </div>
              </div>
            </button>

            {/* Mode 2: Unique Classic */}
            <button
              onClick={() => {
                setShowModeSelection(false);
                triggerToast("Joining Unique Classic...");
                onSelectMode?.("Unique Classic");
              }}
              className="w-full rounded-[24px] border border-amber-500/30 bg-gradient-to-r from-slate-950/90 via-purple-950/50 to-slate-950/90 p-3.5 flex items-center gap-4 text-left shadow-[0_8px_20px_rgba(0,0,0,0.65)] hover:border-amber-400/60 hover:scale-[1.02] active:scale-[0.98] transition-all outline-none duration-350 cursor-pointer relative"
            >
              <img 
                src="/assets/images/icons/unique_classic_icon.jpg" 
                alt="Unique Classic" 
                className="w-16 h-16 rounded-[16px] object-cover border-2 border-amber-400/40 shadow-inner" 
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-amber-200 tracking-wide">UNIQUE CLASSIC</h3>
                  <span className="text-[9px] bg-purple-950/80 border border-amber-400/40 text-amber-300 px-2.5 py-0.5 rounded-full font-black uppercase shadow">COSMETICS</span>
                </div>
                <p className="text-[10px] text-purple-200/80 mt-1 leading-snug">
                  Show off equipped luxury dice, profile frames, board themes, and custom pawns!
                </p>
                <div className="flex items-center gap-1.5 mt-2.5">
                  <span className="text-[9px] font-black tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-md border border-amber-500/30 uppercase flex items-center gap-1">
                    ENTRY: 5K COINS <img src="/assets/images/icons/luxury_coin.png" className="w-3 h-3 object-contain inline" alt="coin" />
                  </span>
                </div>
              </div>
            </button>

            {/* Mode 3: Normal Classic */}
            <button
              onClick={() => {
                setShowModeSelection(false);
                triggerToast("Joining Normal Classic...");
                onSelectMode?.("Normal Classic");
              }}
              className="w-full rounded-[24px] border border-amber-500/30 bg-gradient-to-r from-slate-950/90 via-purple-950/50 to-slate-950/90 p-3.5 flex items-center gap-4 text-left shadow-[0_8px_20px_rgba(0,0,0,0.65)] hover:border-amber-400/60 hover:scale-[1.02] active:scale-[0.98] transition-all outline-none duration-350 cursor-pointer relative"
            >
              <img 
                src="/assets/images/icons/normal_classic_icon.jpg" 
                alt="Normal Classic" 
                className="w-16 h-16 rounded-[16px] object-cover border-2 border-amber-400/40 shadow-inner" 
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-amber-200 tracking-wide">NORMAL CLASSIC</h3>
                  <span className="text-[9px] bg-purple-950/80 border border-amber-400/40 text-amber-300 px-2.5 py-0.5 rounded-full font-black uppercase shadow">STANDARD</span>
                </div>
                <p className="text-[10px] text-purple-200/80 mt-1 leading-snug">
                  Play standard classic rules. Enforces default styles (standard dice, pawns &amp; classic board).
                </p>
                <div className="flex items-center gap-1.5 mt-2.5">
                  <span className="text-[9px] font-black tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-md border border-amber-500/30 uppercase flex items-center gap-1">
                    ENTRY: 5K COINS <img src="/assets/images/icons/luxury_coin.png" className="w-3 h-3 object-contain inline" alt="coin" />
                  </span>
                </div>
              </div>
            </button>

            {/* Divider: OTHER GAMES */}
            <div className="flex items-center gap-2 my-0.5">
              <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-amber-500/20" />
              <div className="text-[9px] font-black text-amber-300 tracking-[0.2em] uppercase flex items-center gap-1">
                <span className="text-amber-400 text-xs">♦</span> OTHER GAMES <span className="text-amber-400 text-xs">♦</span>
              </div>
              <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-amber-500/40 to-amber-500/20" />
            </div>

            {/* Mode 4: Snake & Ladders */}
            <button
              onClick={() => {
                setShowModeSelection(false);
                triggerToast("Loading Snakes & Ladders...");
                onSelectMode?.("Snake & Ladders");
              }}
              className="w-full rounded-[24px] border-2 border-emerald-500/40 bg-gradient-to-r from-slate-950/95 via-emerald-950/50 to-slate-950/95 p-3.5 flex items-center gap-4 text-left shadow-[0_10px_30px_rgba(16,185,129,0.25)] hover:border-emerald-400/70 hover:scale-[1.02] active:scale-[0.98] transition-all outline-none duration-350 cursor-pointer relative"
            >
              <img 
                src="/assets/images/icons/snake_ladder_luxury_icon.jpg" 
                alt="Snakes & Ladders" 
                className="w-16 h-16 rounded-[16px] object-cover border-2 border-emerald-400/60 shadow-[0_0_15px_rgba(16,185,129,0.4)]" 
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-amber-200 tracking-wide leading-tight flex flex-col">
                    <span>SNAKES &amp;</span>
                    <span>LADDERS</span>
                  </h3>
                  <div className="w-10 h-10 rounded-full border-2 border-amber-400/70 bg-gradient-to-br from-emerald-900 to-slate-950 flex flex-col items-center justify-center shadow-lg">
                    <span className="text-[9px] font-black text-amber-300 leading-none">1 vs</span>
                    <span className="text-[10px] font-black text-amber-300 leading-none">1</span>
                  </div>
                </div>
                <p className="text-[10px] text-emerald-200/80 mt-1 leading-snug">
                  Roll dice, climb golden ladders &amp; dodge deadly snakes. First to reach 100 wins!
                </p>
                <div className="flex items-center gap-1.5 mt-2.5">
                  <span className="text-[9px] font-black tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-md border border-amber-500/30 uppercase flex items-center gap-1">
                    ENTRY: 5K COINS <img src="/assets/images/icons/luxury_coin.png" className="w-3 h-3 object-contain inline" alt="coin" />
                  </span>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
