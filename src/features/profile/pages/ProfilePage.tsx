import React, { useState, useEffect, useRef } from "react";
import { useUserStore } from "../../../user/user.store";
import { LudoPageBackground } from "../../../components/effects/LudoPageBackground";
import { getFrameFilter } from "../../../store/cosmetics.store";
import { usePlayerStatsStore } from "../../../store/player-stats.store";
import { LevelBadge } from "../../../components/badges/LevelBadge";
import { UserProfileModal } from "../../../components/modal/UserProfileModal";
import confetti from "canvas-confetti";
import { formatPlayerUID } from "../../../utils/uuid";
import { loginWithFacebook } from "../../../auth/utils/fb";
import { triggerGoogleOAuth } from "../../../auth/utils/google";

interface ProfilePageProps {
  onBack?: () => void;
  onOpenHistory?: () => void;
  onLogout?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onBack, onOpenHistory, onLogout }) => {
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const updateUser = useUserStore((s) => s.updateUser);
  const logout = useUserStore((s) => s.logout);

  const { stats, syncWithUserStore, updateStats } = usePlayerStatsStore();

  // Sync stores on load
  useEffect(() => {
    syncWithUserStore();
  }, [user?.coins, user?.gems, user?.level, user?.displayName, user?.avatar]);

  // Tabs: STATS | GAMEPLAY | ACHIEVEMENTS | SETTINGS
  const [activeTab, setActiveTab] = useState<"STATS" | "GAMEPLAY" | "ACHIEVEMENTS" | "SETTINGS">("STATS");

  // States
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showStatsCard, setShowStatsCard] = useState(false);
  
  // Modals
  const [showEditName, setShowEditName] = useState(false);
  const [newName, setNewName] = useState("");
  
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currPassword, setCurrPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeEmail, setUpgradeEmail] = useState("");
  const [upgradePassword, setUpgradePassword] = useState("");

  const [showFBLinkModal, setShowFBLinkModal] = useState(false);
  const [fbLinkEmail, setFbLinkEmail] = useState("");
  const [fbLinkPassword, setFbLinkPassword] = useState("");

  const [showGoogleLinkModal, setShowGoogleLinkModal] = useState(false);
  const [googleLinkEmail, setGoogleLinkEmail] = useState("");
  const [googleLinkPassword, setGoogleLinkPassword] = useState("");

  // Simulated link states
  const [isFBLinked, setIsFBLinked] = useState(() => {
    if (user?.loginProvider === 'guest') return false;
    return user?.loginProvider === 'facebook' || !!user?.facebookId || localStorage.getItem("ludo_fb_linked") === "true";
  });
  const [isGoogleLinked, setIsGoogleLinked] = useState(() => {
    if (user?.loginProvider === 'guest') return false;
    return user?.loginProvider === 'google' || !!user?.googleId || localStorage.getItem("ludo_google_linked") === "true";
  });
  const [isPhoneLinked, setIsPhoneLinked] = useState(() => {
    return user?.loginProvider === 'phone' || localStorage.getItem("ludo_phone_linked") === "true";
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    localStorage.setItem("ludo_fb_linked", isFBLinked ? "true" : "false");
  }, [isFBLinked]);

  useEffect(() => {
    localStorage.setItem("ludo_google_linked", isGoogleLinked ? "true" : "false");
  }, [isGoogleLinked]);

  useEffect(() => {
    localStorage.setItem("ludo_phone_linked", isPhoneLinked ? "true" : "false");
  }, [isPhoneLinked]);

  const playerName = user?.displayName || user?.username || "TASAVVUR";
  const playerUID = formatPlayerUID(user);

  const handleCopyUID = () => {
    navigator.clipboard.writeText(playerUID);
    triggerToast("UID Copied to Clipboard!");
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64 = uploadEvent.target?.result as string;
        updateUser({ avatar: base64 });
        triggerToast("Profile Photo updated!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveName = () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      triggerToast("Name cannot be empty!");
      return;
    }
    updateUser({ displayName: trimmed, username: trimmed });
    setShowEditName(false);
    triggerToast("Display Name Saved!");
  };

  const handleChangePassword = () => {
    if (!currPassword || !newPassword || !confirmPassword) {
      triggerToast("Please fill all password fields!");
      return;
    }
    if (newPassword !== confirmPassword) {
      triggerToast("New passwords do not match!");
      return;
    }
    triggerToast("Password Changed Successfully!");
    setShowChangePassword(false);
    setCurrPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleUpgradeAccount = () => {
    if (!upgradeEmail || !upgradePassword) {
      triggerToast("Please fill email and password!");
      return;
    }
    updateUser({ loginProvider: "phone", email: upgradeEmail });
    setShowUpgradeModal(false);
    triggerToast("Account successfully upgraded!");
  };

  const handleLinkFB = async () => {
    try {
      await loginWithFacebook();
      setIsFBLinked(true);
      updateUser({ facebookId: "fb_simulated_id_123" });
      triggerToast("Facebook account successfully linked!");
    } catch (err) {
      setFbLinkEmail("");
      setFbLinkPassword("");
      setShowFBLinkModal(true);
    }
  };

  const handleSubmitFBLink = () => {
    if (!fbLinkEmail || !fbLinkPassword) {
      triggerToast("Please fill all details.");
      return;
    }
    setIsFBLinked(true);
    updateUser({ facebookId: "fb_simulated_id_123" });
    setShowFBLinkModal(false);
    triggerToast("Facebook account linked successfully!");
  };

  const handleLinkGoogle = () => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1088492040921-sample.apps.googleusercontent.com';
    try {
      triggerGoogleOAuth(googleClientId, (profile) => {
        setIsGoogleLinked(true);
        updateUser({ googleId: profile.sub || "google_simulated_id_456" });
        triggerToast("Google account successfully linked!");
      });
    } catch (err) {
      setGoogleLinkEmail("");
      setGoogleLinkPassword("");
      setShowGoogleLinkModal(true);
    }
  };

  const handleSubmitGoogleLink = () => {
    if (!googleLinkEmail || !googleLinkPassword) {
      triggerToast("Please fill all details.");
      return;
    }
    setIsGoogleLinked(true);
    updateUser({ googleId: "google_simulated_id_456" });
    setShowGoogleLinkModal(false);
    triggerToast("Google account linked successfully!");
  };

  const handleUnlink = (provider: "FB" | "GOOGLE") => {
    if (provider === "FB") {
      setIsFBLinked(false);
      updateUser({ facebookId: undefined });
      triggerToast("Facebook account unlinked!");
    } else {
      setIsGoogleLinked(false);
      updateUser({ googleId: undefined });
      triggerToast("Google account unlinked!");
    }
  };

  const handleLogoutClick = () => {
    logout();
    onLogout?.();
  };

  // Derive stats win rate
  const winRate = stats.matchesPlayed > 0 
    ? Math.round((stats.matchesWon / stats.matchesPlayed) * 100) 
    : 0;

  // Format Avg Match Duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const xpProgressPercent = stats.nextLevelXp > 0 
    ? Math.min(100, Math.round((stats.xp / stats.nextLevelXp) * 100)) 
    : 0;

  return (
    <div className="min-h-screen w-full bg-[#12061F] text-white flex flex-col items-center relative overflow-hidden select-none font-sans">
      <LudoPageBackground variant="profile" />

      {/* Hidden file input for avatar upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />

      <div className="w-full max-w-[430px] h-screen flex flex-col relative z-10 px-3 py-3 overflow-y-auto no-scrollbar pb-6">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-lg hover:bg-black/60 hover:scale-105 active:scale-95 transition-transform"
          >
            ❮
          </button>
          <h1 className="text-sm font-black tracking-widest bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent uppercase glow-amber-text">
            PLAYER PROFILE
          </h1>
          <div className="w-9 h-9"></div>
        </div>

        {/* Tab Selection Bar (Gold UI theme) */}
        <div className="flex bg-black/60 p-1.5 rounded-2xl border border-purple-500/30 mb-4 shadow-2xl flex-shrink-0">
          {(["STATS", "GAMEPLAY", "ACHIEVEMENTS", "SETTINGS"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-xl text-[8.5px] font-black tracking-wider uppercase transition-all ${
                activeTab === tab
                  ? "bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 shadow-lg border border-yellow-200"
                  : "text-purple-300 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* TAB 1: #GAMEBUDDY CARD OVERVIEW */}
        {activeTab === "STATS" && (
          <div className="flex flex-col gap-4 animate-fade-in pb-4">
            {/* Card Overlay mimicking reference exactly */}
            <div className="bg-gradient-to-b from-[#1D0933]/90 via-[#12061F]/95 to-[#0D0A1C]/98 border-[3px] border-amber-500 rounded-3xl p-4 pt-6 shadow-2xl relative">
              
              {/* Profile Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {/* Dynamic circular avatar */}
                  <div className="w-20 h-20 relative flex-shrink-0 cursor-pointer" onClick={handleAvatarClick}>
                    <div
                      className="absolute rounded-full overflow-hidden bg-slate-950 border border-purple-950 z-10"
                      style={{ top: '15%', left: '15%', right: '15%', bottom: '26%' }}
                    >
                      {user?.avatar ? (
                        <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-800 to-indigo-900 flex items-center justify-center text-2xl font-black text-purple-200">
                          {playerName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <img
                      src="/assets/images/icons/profile_frame_v3.png"
                      alt="Profile Frame"
                      className="w-full h-full object-contain absolute inset-0 z-20 pointer-events-none"
                      style={{ filter: getFrameFilter(user?.equippedFrame) }}
                      draggable={false}
                    />
                  </div>

                  {/* Name and country */}
                  <div className="flex flex-col gap-1">
                    <h2 className="text-sm font-black text-white drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.8)] tracking-wide">
                      {playerName}
                    </h2>
                    <div className="flex items-center gap-1.5 bg-black/35 border border-purple-500/20 px-2 py-0.5 rounded-lg w-max shadow-inner">
                      <span className="text-[10px] leading-none">{stats.countryFlag}</span>
                      <span className="text-[7.5px] font-black text-purple-200 uppercase tracking-widest leading-none">
                        {stats.country}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="self-start mt-1">
                  <LevelBadge level={stats.level} size={48} />
                </div>
              </div>

              {/* Animated XP Progress Bar (AAA quality) */}
              <div className="mb-4 bg-black/45 border border-purple-500/25 rounded-2xl p-3 shadow-inner">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[8.5px] font-black text-purple-200 uppercase tracking-wider">XP Level Progression</span>
                  <span className="text-[8.5px] font-black text-amber-300 font-mono">
                    {stats.xp} / {stats.nextLevelXp} XP ({xpProgressPercent}%)
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-950 rounded-full border border-purple-900/50 p-0.5 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-amber-400 shadow-[0_0_8px_rgba(168,85,247,0.8)] rounded-full transition-all duration-500"
                    style={{ width: `${xpProgressPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Info Columns */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="flex flex-col gap-2">
                  <div className="bg-black/35 border border-purple-900/40 rounded-xl px-2.5 py-1.5 h-10 flex flex-col justify-center">
                    <span className="text-[7.5px] font-black uppercase text-purple-200 tracking-wider">Level</span>
                    <span className="text-xs font-extrabold text-white">{stats.level}</span>
                  </div>
                  <div className="bg-black/35 border border-purple-900/40 rounded-xl px-2.5 py-1.5 h-10 flex flex-col justify-center">
                    <span className="text-[7.5px] font-black uppercase text-purple-200 tracking-wider">Total earning</span>
                    <span className="text-xs font-extrabold text-amber-300">{stats.totalEarning}</span>
                  </div>
                  <div className="bg-black/35 border border-purple-900/40 rounded-xl px-2.5 py-1.5 h-10 flex flex-col justify-center cursor-pointer active:scale-98 transition-transform" onClick={handleCopyUID}>
                    <span className="text-[7.5px] font-black uppercase text-purple-200 tracking-wider">Player ID 📋</span>
                    <span className="text-[9.5px] font-bold text-gray-300 font-mono truncate">{playerUID}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="bg-black/35 border border-purple-900/40 rounded-xl px-2.5 py-1.5 h-10 flex flex-col justify-center">
                    <span className="text-[7.5px] font-black uppercase text-purple-200 tracking-wider">Signature</span>
                    <span className="text-xs font-extrabold text-yellow-300 uppercase tracking-wide truncate">{stats.signature}</span>
                  </div>
                  <div className="bg-black/35 border border-purple-900/40 rounded-xl px-2.5 py-1.5 h-10 flex flex-col justify-center">
                    <span className="text-[7.5px] font-black uppercase text-purple-200 tracking-wider">Current gold</span>
                    <span className="text-xs font-extrabold text-amber-400 font-mono">{stats.currentCoins.toLocaleString()}</span>
                  </div>
                  <div className="bg-black/35 border border-purple-900/40 rounded-xl px-2.5 py-1.5 h-10 flex flex-col justify-center">
                    <span className="text-[7.5px] font-black uppercase text-purple-200 tracking-wider">Current League</span>
                    <span className="text-[9.5px] font-extrabold text-blue-300 uppercase tracking-wider flex items-center gap-1">
                      👑 {stats.currentLeague}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Section Divider */}
              <div className="my-4 border-t border-purple-500/20 w-full" />

              {/* 2x4 Stats Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-black/35 border border-purple-900/40 rounded-xl px-2.5 py-1 h-9 flex flex-col justify-center">
                  <span className="text-[7px] font-black uppercase text-purple-200/80 tracking-wider">Games won</span>
                  <span className="text-[10.5px] font-extrabold text-white truncate">{stats.matchesWon} of {stats.matchesPlayed}</span>
                </div>
                <div className="bg-black/35 border border-purple-900/40 rounded-xl px-2.5 py-1 h-9 flex flex-col justify-center">
                  <span className="text-[7px] font-black uppercase text-purple-200/80 tracking-wider">Team wins</span>
                  <span className="text-[10.5px] font-extrabold text-white">{stats.teamWins}</span>
                </div>
                <div className="bg-black/35 border border-purple-900/40 rounded-xl px-2.5 py-1 h-9 flex flex-col justify-center">
                  <span className="text-[7px] font-black uppercase text-purple-200/80 tracking-wider">Win Rate</span>
                  <span className="text-[10.5px] font-extrabold text-white">{winRate} %</span>
                </div>
                <div className="bg-black/35 border border-purple-900/40 rounded-xl px-2.5 py-1 h-9 flex flex-col justify-center">
                  <span className="text-[7px] font-black uppercase text-purple-200/80 tracking-wider">Win streak</span>
                  <span className="text-[10.5px] font-extrabold text-white">{stats.currentWinStreak}</span>
                </div>
                <div className="bg-black/35 border border-purple-900/40 rounded-xl px-2.5 py-1 h-9 flex flex-col justify-center">
                  <span className="text-[7px] font-black uppercase text-purple-200/80 tracking-wider">2 Player wins</span>
                  <span className="text-[10.5px] font-extrabold text-white">{stats.twoPlayerWins}</span>
                </div>
                <div className="bg-black/35 border border-purple-900/40 rounded-xl px-2.5 py-1 h-9 flex flex-col justify-center">
                  <span className="text-[7px] font-black uppercase text-purple-200/80 tracking-wider">Titan badge</span>
                  <span className="text-[10.5px] font-extrabold text-amber-300">{stats.titanBadgeCount}</span>
                </div>
                <div className="bg-black/35 border border-purple-900/40 rounded-xl px-2.5 py-1 h-9 flex flex-col justify-center">
                  <span className="text-[7px] font-black uppercase text-purple-200/80 tracking-wider">4 Player wins</span>
                  <span className="text-[10.5px] font-extrabold text-white">{stats.fourPlayerWins}</span>
                </div>
                <div className="bg-black/35 border border-purple-900/40 rounded-xl px-2.5 py-1 h-9 flex flex-col justify-center">
                  <span className="text-[7px] font-black uppercase text-purple-200/80 tracking-wider">Kill Count</span>
                  <span className="text-[10.5px] font-extrabold text-white">{stats.killCount}</span>
                </div>
              </div>
            </div>

            {/* Economy Summary Cards */}
            <div className="bg-purple-950/70 border border-purple-500/20 rounded-3xl p-4 shadow-xl flex flex-col gap-2">
              <h3 className="text-[10px] font-black text-amber-300 uppercase tracking-widest mb-1">Economy Vault</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-black/30 p-2 rounded-xl flex items-center gap-2">
                  <span className="text-xl">🪙</span>
                  <div className="flex flex-col">
                    <span className="text-[7px] text-purple-300 font-bold uppercase">Total Earned</span>
                    <span className="text-[11px] font-black font-mono text-amber-400">{stats.totalCoinsEarned.toLocaleString()}</span>
                  </div>
                </div>
                <div className="bg-black/30 p-2 rounded-xl flex items-center gap-2">
                  <span className="text-xl">💎</span>
                  <div className="flex flex-col">
                    <span className="text-[7px] text-purple-300 font-bold uppercase">Total Diamonds</span>
                    <span className="text-[11px] font-black font-mono text-blue-400">{stats.totalDiamondsEarned.toLocaleString()}</span>
                  </div>
                </div>
                <div className="bg-black/30 p-2 rounded-xl flex items-center gap-2">
                  <span className="text-xl">🎁</span>
                  <div className="flex flex-col">
                    <span className="text-[7px] text-purple-300 font-bold uppercase">Rewards Claimed</span>
                    <span className="text-[11px] font-black font-mono text-purple-300">{stats.totalRewardsClaimed}</span>
                  </div>
                </div>
                <div className="bg-black/30 p-2 rounded-xl flex items-center gap-2">
                  <span className="text-xl">🔥</span>
                  <div className="flex flex-col">
                    <span className="text-[7px] text-purple-300 font-bold uppercase">Login Streak</span>
                    <span className="text-[11px] font-black font-mono text-orange-400">{stats.dailyLoginStreak} Days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DETAILED MODES & GAMEPLAY */}
        {activeTab === "GAMEPLAY" && (
          <div className="flex flex-col gap-4 animate-fade-in pb-4">
            
            {/* Game Modes breakdown */}
            <div className="bg-purple-950/70 border border-purple-500/20 rounded-3xl p-4 shadow-xl">
              <h3 className="text-xs font-black text-amber-300 uppercase tracking-widest mb-3">Game Modes History</h3>
              <div className="flex flex-col gap-2.5">
                {(Object.keys(stats.modeStats) as Array<keyof typeof stats.modeStats>).map((mode) => {
                  const data = stats.modeStats[mode];
                  const wins = data.wins;
                  const played = data.played;
                  const losses = "losses" in data ? data.losses : 0;
                  const wr = played > 0 ? Math.round((wins / played) * 100) : 0;

                  return (
                    <div key={mode} className="flex justify-between items-center bg-black/40 p-2.5 rounded-xl border border-purple-800/25">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-white uppercase tracking-wider">{mode.replace("PLAYER", " PLAYER")}</span>
                        <span className="text-[8px] text-purple-300">Played: {played}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-black text-emerald-400">Wins: {wins}</span>
                          {"losses" in data && <span className="text-[8px] text-red-400">Losses: {losses}</span>}
                        </div>
                        <span className="text-[11px] font-black text-amber-300 font-mono w-10 text-right">{wr}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Gameplay Stats */}
            <div className="bg-purple-950/70 border border-purple-500/20 rounded-3xl p-4 shadow-xl">
              <h3 className="text-xs font-black text-amber-300 uppercase tracking-widest mb-3">Battlefield stats</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-black/35 border border-purple-900/30 p-2.5 rounded-xl flex justify-between">
                  <span className="text-purple-300 font-bold">Hard Kills</span>
                  <span className="font-extrabold text-white">{stats.hardKillCount}</span>
                </div>
                <div className="bg-black/35 border border-purple-900/30 p-2.5 rounded-xl flex justify-between">
                  <span className="text-purple-300 font-bold">Revenge Kills</span>
                  <span className="font-extrabold text-white">{stats.revengeKillCount}</span>
                </div>
                <div className="bg-black/35 border border-purple-900/30 p-2.5 rounded-xl flex justify-between">
                  <span className="text-purple-300 font-bold">Double Kills</span>
                  <span className="font-extrabold text-white">{stats.doubleKill}</span>
                </div>
                <div className="bg-black/35 border border-purple-900/30 p-2.5 rounded-xl flex justify-between">
                  <span className="text-purple-300 font-bold">Triple Kills</span>
                  <span className="font-extrabold text-white">{stats.tripleKill}</span>
                </div>
                <div className="bg-black/35 border border-purple-900/30 p-2.5 rounded-xl flex justify-between">
                  <span className="text-purple-300 font-bold">Quadra Kills</span>
                  <span className="font-extrabold text-white">{stats.quadraKill}</span>
                </div>
                <div className="bg-black/35 border border-purple-900/30 p-2.5 rounded-xl flex justify-between">
                  <span className="text-purple-300 font-bold">Tokens Lost</span>
                  <span className="font-extrabold text-red-400">{stats.tokensLost}</span>
                </div>
                <div className="bg-black/35 border border-purple-900/30 p-2.5 rounded-xl flex justify-between">
                  <span className="text-purple-300 font-bold">Dice Rolls</span>
                  <span className="font-extrabold text-white">{stats.totalDiceRolls}</span>
                </div>
                <div className="bg-black/35 border border-purple-900/30 p-2.5 rounded-xl flex justify-between">
                  <span className="text-purple-300 font-bold">Total Sixes</span>
                  <span className="font-extrabold text-amber-300">{stats.totalSixes}</span>
                </div>
                <div className="bg-black/35 border border-purple-900/30 p-2.5 rounded-xl flex justify-between">
                  <span className="text-purple-300 font-bold">Consecutive 6s</span>
                  <span className="font-extrabold text-amber-400">{stats.consecutiveSixes}</span>
                </div>
                <div className="bg-black/35 border border-purple-900/30 p-2.5 rounded-xl flex justify-between">
                  <span className="text-purple-300 font-bold">Safe Zone Visits</span>
                  <span className="font-extrabold text-white">{stats.safeZoneVisits}</span>
                </div>
                <div className="bg-black/35 border border-purple-900/30 p-2.5 rounded-xl flex justify-between">
                  <span className="text-purple-300 font-bold">Lucky Rolls</span>
                  <span className="font-extrabold text-emerald-400">{stats.luckyRolls}</span>
                </div>
                <div className="bg-black/35 border border-purple-900/30 p-2.5 rounded-xl flex justify-between">
                  <span className="text-purple-300 font-bold">Unlucky Rolls</span>
                  <span className="font-extrabold text-red-300">{stats.unluckyRolls}</span>
                </div>
              </div>
              <div className="bg-black/40 p-2.5 rounded-xl border border-purple-800/25 flex justify-between mt-3 text-xs">
                <span className="text-purple-300 font-bold">Avg Match Duration</span>
                <span className="font-extrabold text-amber-200">
                  {stats.matchesPlayed > 0 ? formatDuration(Math.round(stats.totalMatchDurationSeconds / stats.matchesPlayed)) : "0m"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ACHIEVEMENTS LIST */}
        {activeTab === "ACHIEVEMENTS" && (
          <div className="flex flex-col gap-4 animate-fade-in pb-4">
            
            {/* League Progress Visualization */}
            <div className="bg-purple-950/70 border border-purple-500/20 rounded-3xl p-4 shadow-xl text-center">
              <span className="text-[9px] font-black text-blue-300 uppercase tracking-widest">League Progress</span>
              <h3 className="text-lg font-black text-white mt-1 uppercase tracking-wider">👑 {stats.currentLeague}</h3>
              <p className="text-[8.5px] text-purple-300 italic mt-1 leading-relaxed">
                Earn win points (Wins x 12 - Losses x 6) to rank up your league tier and claim luxury rewards!
              </p>
            </div>

            {/* Achievements Grid */}
            <div className="bg-purple-950/70 border border-purple-500/20 rounded-3xl p-4 shadow-xl">
              <h3 className="text-xs font-black text-amber-300 uppercase tracking-widest mb-3">Trophies & Medals</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "First Win", desc: "Win your first Ludo match" },
                  { id: "100 Wins", desc: "Win 100 matches in total" },
                  { id: "500 Wins", desc: "Win 500 matches in total" },
                  { id: "1000 Wins", desc: "Win 1,000 matches in total" },
                  { id: "First Kill", desc: "Kill your first enemy token" },
                  { id: "100 Kills", desc: "Kill 100 tokens in total" },
                  { id: "1000 Kills", desc: "Kill 1,000 tokens in total" },
                  { id: "Legend Killer", desc: "Kill 5,000 tokens in total" },
                  { id: "Champion", desc: "Reach a win streak of 10" },
                  { id: "Emperor", desc: "Reach Level 100" },
                  { id: "Titan", desc: "Reach Level 150" },
                  { id: "Immortal", desc: "Reach Level 200" },
                ].map((ach) => {
                  const isUnlocked = stats.achievements.includes(ach.id);
                  return (
                    <div 
                      key={ach.id} 
                      className={`p-3 rounded-2xl border flex flex-col justify-between items-center text-center relative shadow-inner ${
                        isUnlocked 
                          ? "bg-gradient-to-b from-amber-500/20 to-purple-950 border-amber-400 glow-gold-border" 
                          : "bg-black/40 border-purple-950 text-gray-500 opacity-60"
                      }`}
                    >
                      <span className="text-2xl mb-1.5">{isUnlocked ? "🏆" : "🔒"}</span>
                      <span className={`text-[10px] font-black uppercase tracking-wider block ${isUnlocked ? 'text-amber-200' : 'text-gray-400'}`}>
                        {ach.id}
                      </span>
                      <span className="text-[7.5px] leading-tight block text-purple-300 mt-1 font-bold">
                        {ach.desc}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ORIGINAL ACCOUNT SETTINGS */}
        {activeTab === "SETTINGS" && (
          <div className="flex flex-col gap-4 animate-fade-in pb-4">
            
            {/* ── CARD 1: ACCOUNT DETAILS ── */}
            <div className="bg-gradient-to-b from-[#2E0B4E]/90 to-[#1F0736]/90 border-2 border-purple-500/40 rounded-3xl p-5 shadow-2xl relative flex flex-col items-center gap-4">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"></div>

              <div className="w-full flex flex-col gap-3">
                {/* Display Name Row */}
                <div className="flex items-center justify-between bg-black/40 px-4 py-3 rounded-2xl border border-purple-500/20">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">Profile Name</span>
                    <span className="text-sm font-black text-white">{playerName}</span>
                  </div>
                  <button
                    onClick={() => {
                      setNewName(playerName);
                      setShowEditName(true);
                    }}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-[10px] rounded-xl hover:scale-105 active:scale-95 transition-transform uppercase"
                  >
                    Edit Name
                  </button>
                </div>

                {/* Country Selection Row */}
                <div className="flex items-center justify-between bg-black/40 px-4 py-3 rounded-2xl border border-purple-500/20">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">Select Country</span>
                    <span className="text-sm font-black text-amber-200 uppercase tracking-widest leading-none font-sans mt-0.5">
                      {stats.country} {stats.countryFlag}
                    </span>
                  </div>
                  <select
                    value={stats.country}
                    onChange={(e) => {
                      const value = e.target.value;
                      const flag = value === "INDIA" ? "🇮🇳" : value === "PAKISTAN" ? "🇵🇰" : value === "BANGLADESH" ? "🇧🇩" : "🇳🇵";
                      updateStats({ country: value, countryFlag: flag });
                      triggerToast(`Country updated to ${value}!`);
                    }}
                    className="px-3.5 py-2 bg-[#12061F] border border-purple-500/40 text-amber-300 font-black text-[10px] rounded-xl outline-none"
                  >
                    <option value="INDIA">INDIA</option>
                    <option value="PAKISTAN">PAKISTAN</option>
                    <option value="BANGLADESH">BANGLADESH</option>
                    <option value="NEPAL">NEPAL</option>
                  </select>
                </div>

                {/* UID Row */}
                <div className="flex items-center justify-between bg-black/40 px-4 py-3 rounded-2xl border border-purple-500/20">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">Player UID</span>
                    <span className="text-xs font-black text-amber-200 font-mono tracking-wider">{playerUID}</span>
                  </div>
                  <button
                    onClick={handleCopyUID}
                    className="px-3.5 py-1.5 bg-[#12061F] border border-purple-500/40 text-purple-300 font-black text-[10px] rounded-xl hover:scale-105 active:scale-95 transition-transform uppercase"
                  >
                    Copy
                  </button>
                </div>

                {/* Login Method */}
                <div className="flex items-center justify-between bg-black/40 px-4 py-3 rounded-2xl border border-purple-500/20">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">Sign-in method</span>
                    <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">{user?.loginProvider || "GUEST"}</span>
                  </div>
                  {user?.loginProvider === "guest" && (
                    <button
                      onClick={() => {
                        setUpgradeEmail("");
                        setUpgradePassword("");
                        setShowUpgradeModal(true);
                      }}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black text-[10px] rounded-xl hover:scale-105 active:scale-95 transition-transform uppercase shadow-md shadow-emerald-950/20 border border-emerald-400"
                    >
                      Link Email
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ── CARD 2: PASSWORD SETTINGS (Only for registered accounts) ── */}
            {user?.loginProvider && user.loginProvider !== "guest" && (
              <div className="bg-gradient-to-b from-[#2E0B4E]/90 to-[#1F0736]/90 border-2 border-purple-500/40 rounded-3xl p-5 shadow-2xl relative flex flex-col gap-3">
                <h3 className="text-xs font-black text-purple-200 uppercase tracking-wider">Security</h3>
                <p className="text-[10px] text-purple-300 leading-relaxed -mt-1">
                  Keep your password secure. Change it periodically to prevent unauthorized access.
                </p>
                <button
                  onClick={() => setShowChangePassword(true)}
                  className="w-full py-2.5 bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 text-white font-black text-[10px] uppercase rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-md border border-purple-500/45"
                >
                  Change Account Password
                </button>
              </div>
            )}

            {/* ── CARD 3: SOCIAL ACCOUNTS LINKING ── */}
            <div className="bg-gradient-to-b from-[#2E0B4E]/90 to-[#1F0736]/90 border-2 border-purple-500/40 rounded-3xl p-5 shadow-2xl relative flex flex-col gap-4">
              <h3 className="text-xs font-black text-purple-200 uppercase tracking-wider">Linked Accounts</h3>
              
              <div className="flex flex-col gap-3">
                {/* Facebook Row */}
                <div className="flex items-center justify-between bg-black/40 px-4 py-3 rounded-2xl border border-purple-500/20">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🔵</span>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-purple-300 font-bold uppercase leading-none">Facebook</span>
                      <span className={`text-[8.5px] font-black mt-1 uppercase ${isFBLinked ? 'text-blue-400' : 'text-gray-500'}`}>
                        {isFBLinked ? "Linked" : "Not Linked"}
                      </span>
                    </div>
                  </div>
                  {isFBLinked ? (
                    <button
                      onClick={() => handleUnlink("FB")}
                      className="px-3.5 py-1.5 bg-rose-600/20 border border-rose-500/40 text-rose-400 font-black text-[10px] rounded-xl hover:bg-rose-500/30 active:scale-95 uppercase transition-colors"
                    >
                      Unlink
                    </button>
                  ) : (
                    <button
                      onClick={handleLinkFB}
                      className="px-3.5 py-1.5 bg-[#1877F2] text-white font-black text-[10px] rounded-xl hover:scale-105 active:scale-95 uppercase shadow-md shadow-blue-950/20"
                    >
                      Link
                    </button>
                  )}
                </div>

                {/* Google Row */}
                <div className="flex items-center justify-between bg-black/40 px-4 py-3 rounded-2xl border border-purple-500/20">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🔴</span>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-purple-300 font-bold uppercase leading-none">Google</span>
                      <span className={`text-[8.5px] font-black mt-1 uppercase ${isGoogleLinked ? 'text-red-400' : 'text-gray-500'}`}>
                        {isGoogleLinked ? "Linked" : "Not Linked"}
                      </span>
                    </div>
                  </div>
                  {isGoogleLinked ? (
                    <button
                      onClick={() => handleUnlink("GOOGLE")}
                      className="px-3.5 py-1.5 bg-rose-600/20 border border-rose-500/40 text-rose-400 font-black text-[10px] rounded-xl hover:bg-rose-500/30 active:scale-95 uppercase transition-colors"
                    >
                      Unlink
                    </button>
                  ) : (
                    <button
                      onClick={handleLinkGoogle}
                      className="px-3.5 py-1.5 bg-white text-slate-900 font-black text-[10px] rounded-xl hover:scale-105 active:scale-95 uppercase shadow-md shadow-white/10"
                    >
                      Link
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ── CARD 4: DANGER ZONE LOGOUT ── */}
            <div className="bg-gradient-to-b from-[#2E0B4E]/90 to-[#1F0736]/90 border-2 border-red-500/25 rounded-3xl p-5 shadow-2xl relative flex flex-col gap-3">
              <h3 className="text-xs font-black text-rose-300 uppercase tracking-wider">Danger Zone</h3>
              <p className="text-[10px] text-purple-300 leading-relaxed -mt-1">
                Logging out will terminate your current active session. Ensure you have linked your guest profile to Google or Facebook to avoid losing progress!
              </p>
              <button
                onClick={handleLogoutClick}
                className="w-full py-3 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-red-600 text-white font-black text-xs tracking-widest uppercase rounded-2xl shadow-xl transition-all border border-red-400 cursor-pointer"
              >
                Log Out Account
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ── MODALS OVERLAYS ── */}

      {/* 1. EDIT DISPLAY NAME MODAL */}
      {showEditName && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="w-full max-w-[320px] bg-gradient-to-b from-[#2B1440] to-[#12061F] border-2 border-amber-500/70 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.9)] text-white relative">
            <h3 className="text-xs font-black uppercase text-amber-200 tracking-wider mb-2">Edit Display Name</h3>
            <div className="w-full bg-[#1A092D]/70 p-3 rounded-2xl border border-purple-500/20 mb-4 flex flex-col gap-2">
              <span className="text-[9px] text-purple-300 font-bold uppercase">Enter profile name</span>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Type profile name..."
                maxLength={20}
                className="w-full px-4 py-2.5 bg-black/60 border border-purple-500/40 rounded-xl text-white font-bold text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={() => setShowEditName(false)}
                className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-black text-xs uppercase rounded-xl transition-transform active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveName}
                className="flex-1 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black text-xs uppercase rounded-xl shadow-lg transition-transform active:scale-95 border border-yellow-300"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. CHANGE PASSWORD MODAL */}
      {showChangePassword && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="w-full max-w-[320px] bg-gradient-to-b from-[#2B1440] to-[#12061F] border-2 border-amber-500/70 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.9)] text-white relative">
            <h3 className="text-xs font-black uppercase text-amber-200 tracking-wider mb-2">Change Password</h3>
            <div className="w-full bg-[#1A092D]/70 p-3 rounded-2xl border border-purple-500/20 mb-4 flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-purple-300 font-bold uppercase">Current Password</span>
                <input
                  type="password"
                  value={currPassword}
                  onChange={(e) => setCurrPassword(e.target.value)}
                  placeholder="Enter current password..."
                  className="w-full px-4 py-2.5 bg-black/60 border border-purple-500/40 rounded-xl text-white font-bold text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-purple-300 font-bold uppercase">New Password</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password..."
                  className="w-full px-4 py-2.5 bg-black/60 border border-purple-500/40 rounded-xl text-white font-bold text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-purple-300 font-bold uppercase">Confirm New Password</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password..."
                  className="w-full px-4 py-2.5 bg-black/60 border border-purple-500/40 rounded-xl text-white font-bold text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={() => setShowChangePassword(false)}
                className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-black text-xs uppercase rounded-xl transition-transform active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                className="flex-1 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black text-xs uppercase rounded-xl shadow-lg transition-transform active:scale-95 border border-yellow-300"
              >
                Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. UPGRADE GUEST ACCOUNT */}
      {showUpgradeModal && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="w-full max-w-[320px] bg-gradient-to-b from-[#2B1440] to-[#12061F] border-2 border-amber-500/70 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.9)] text-white relative">
            <h3 className="text-xs font-black uppercase text-amber-200 tracking-wider mb-2">Link Guest Account</h3>
            <p className="text-[9.5px] text-purple-300 mb-3 leading-relaxed">
              Secure your stats permanently by binding this guest profile with a valid email.
            </p>
            <div className="w-full bg-[#1A092D]/70 p-3 rounded-2xl border border-purple-500/20 mb-4 flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-purple-300 font-bold uppercase">Email Address</span>
                <input
                  type="email"
                  value={upgradeEmail}
                  onChange={(e) => setUpgradeEmail(e.target.value)}
                  placeholder="Enter email address..."
                  className="w-full px-4 py-2.5 bg-black/60 border border-purple-500/40 rounded-xl text-white font-bold text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-purple-300 font-bold uppercase">Account Password</span>
                <input
                  type="password"
                  value={upgradePassword}
                  onChange={(e) => setUpgradePassword(e.target.value)}
                  placeholder="Enter password..."
                  className="w-full px-4 py-2.5 bg-black/60 border border-purple-500/40 rounded-xl text-white font-bold text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-black text-xs uppercase rounded-xl transition-transform active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleUpgradeAccount}
                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-emerald-500 text-white font-black text-xs uppercase rounded-xl shadow-lg transition-transform active:scale-95 border border-emerald-400"
              >
                Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. LINK FACEBOOK MODAL */}
      {showFBLinkModal && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="w-full max-w-[320px] bg-gradient-to-b from-[#2B1440] to-[#12061F] border-2 border-amber-500/70 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.9)] text-white relative">
            <h3 className="text-xs font-black uppercase text-amber-200 tracking-wider mb-2">Link Facebook</h3>
            
            <div className="w-full bg-[#1A092D]/70 p-3 rounded-2xl border border-purple-500/20 mb-4 flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-purple-300 font-bold uppercase">FB Email</span>
                <input
                  type="email"
                  value={fbLinkEmail}
                  onChange={(e) => setFbLinkEmail(e.target.value)}
                  placeholder="Enter FB email..."
                  className="w-full px-4 py-2.5 bg-black/60 border border-purple-500/40 rounded-xl text-white placeholder-purple-400/40 font-bold text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-purple-300 font-bold uppercase">FB Password</span>
                <input
                  type="password"
                  value={fbLinkPassword}
                  onChange={(e) => setFbLinkPassword(e.target.value)}
                  placeholder="Enter FB password..."
                  className="w-full px-4 py-2.5 bg-black/60 border border-purple-500/40 rounded-xl text-white placeholder-purple-400/40 font-bold text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="flex gap-2.5 mt-2">
              <button
                onClick={() => setShowFBLinkModal(false)}
                className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-black text-xs uppercase rounded-xl transition-transform active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFBLink}
                className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-blue-600 text-white font-black text-xs uppercase rounded-xl shadow-lg transition-transform active:scale-95 border border-blue-400"
              >
                Log In & Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. LINK GOOGLE MODAL */}
      {showGoogleLinkModal && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="w-full max-w-[320px] bg-gradient-to-b from-[#2B1440] to-[#12061F] border-2 border-amber-500/70 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.9)] text-white relative">
            <h3 className="text-xs font-black uppercase text-amber-200 tracking-wider mb-2">Link Google</h3>
            
            <div className="w-full bg-[#1A092D]/70 p-3 rounded-2xl border border-purple-500/20 mb-4 flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-purple-300 font-bold uppercase">Google Email</span>
                <input
                  type="email"
                  value={googleLinkEmail}
                  onChange={(e) => setGoogleLinkEmail(e.target.value)}
                  placeholder="Enter Google email..."
                  className="w-full px-4 py-2.5 bg-black/60 border border-purple-500/40 rounded-xl text-white placeholder-purple-400/40 font-bold text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-purple-300 font-bold uppercase">Google Password</span>
                <input
                  type="password"
                  value={googleLinkPassword}
                  onChange={(e) => setGoogleLinkPassword(e.target.value)}
                  placeholder="Enter Google password..."
                  className="w-full px-4 py-2.5 bg-black/60 border border-purple-500/40 rounded-xl text-white placeholder-purple-400/40 font-bold text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="flex gap-2.5 mt-2">
              <button
                onClick={() => setShowGoogleLinkModal(false)}
                className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-black text-xs uppercase rounded-xl transition-transform active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitGoogleLink}
                className="flex-1 py-2.5 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-red-600 text-white font-black text-xs uppercase rounded-xl shadow-lg transition-transform active:scale-95 border border-red-400"
              >
                Log In & Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── USER STATS CARD MODAL ── */}
      {showStatsCard && (() => {
        const myCoins = user?.coins ?? 0;
        const myLevel = user?.level ?? 25;
        
        const totalEarning = myLevel >= 90 ? "14.3 B" : myLevel >= 50 ? "8.2 B" : myLevel >= 20 ? "1.5 M" : `${(myCoins * 1.5).toLocaleString()}`;
        const gamesPlayed = myLevel * 92;
        const gamesWon = Math.floor(gamesPlayed * 0.43);
        const teamWins = Math.floor(gamesWon * 0.28);
        const winStreak = 3;
        const twoPlayerWins = Math.floor(gamesWon * 0.38);
        const fourPlayerWins = gamesWon - teamWins - twoPlayerWins;
        const killCount = gamesWon * 4;
        const currentLeague = myLevel > 90 ? "Diamond" : myLevel > 60 ? "Platinum" : myLevel > 30 ? "Gold" : "Bronze";

        const myStats = {
          id: user?.id ? `PVZV${user.id.replace(/[^\d]/g, '').slice(0, 4)}` : "PVHB4472",
          name: playerName,
          avatarUrl: user?.avatar,
          equippedFrame: user?.equippedFrame || 'frame_default',
          level: myLevel,
          country: stats.country || "INDIA",
          countryFlag: stats.countryFlag || "🇮🇳",
          totalEarning,
          currentGold: myCoins,
          currentLeague,
          gamesWon,
          gamesPlayed,
          teamWins,
          winStreak,
          twoPlayerWins,
          titanBadgeCount: Math.floor(myLevel / 4),
          fourPlayerWins,
          killCount,
        };

        return (
          <UserProfileModal
            userStats={myStats}
            onClose={() => setShowStatsCard(false)}
            isMe={true}
          />
        );
      })()}

      {/* ── CUSTOM FLOATING TOAST BAR ── */}
      {toastMessage && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-[100] px-4 py-2.5 bg-gradient-to-r from-purple-800 via-indigo-900 to-purple-800 border-2 border-amber-400/80 rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.8)] flex items-center justify-center animate-bounce">
          <span className="text-[10px] font-black text-amber-300 tracking-wider uppercase select-none">
            ✨ {toastMessage}
          </span>
        </div>
      )}
    </div>
  );
};
