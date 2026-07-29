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

interface HomePageProps {
  onSelectMode?: (mode: string) => void;
  onOpenView?: (view: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSelectMode, onOpenView }) => {
  const user = useUserStore((s) => s.user);
  const updateUser = useUserStore((s) => s.updateUser);
  const level = user?.level || 25;
  const [showLuckySpin, setShowLuckySpin] = useState(false);
  const [showXPDetails, setShowXPDetails] = useState(false);
  const [showNameEdit, setShowNameEdit] = useState(false);
  const [tempName, setTempName] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState("home");
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
  const [showPhotoAdjust, setShowPhotoAdjust] = useState(false);
  const [photoScale, setPhotoScale] = useState(() => {
    const val = localStorage.getItem("ludo_player_photo_scale");
    return val ? parseFloat(val) : 1;
  });
  const [photoOffsetY, setPhotoOffsetY] = useState(() => {
    const val = localStorage.getItem("ludo_player_photo_offset");
    return val ? parseFloat(val) : 0;
  });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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

    triggerToast("Joining 2 Player Mode...");
    onSelectMode?.("2P Classic");
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

      {/* Hidden file input for photo upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const base64Str = event.target?.result as string;
              setPlayerPhoto(base64Str);
              localStorage.setItem("ludo_player_photo", base64Str);
              updateUser({ avatar: base64Str });
              setPhotoScale(1);
              setPhotoOffsetY(0);
              localStorage.setItem("ludo_player_photo_scale", "1");
              localStorage.setItem("ludo_player_photo_offset", "0");
              setShowPhotoAdjust(true);
            };
            reader.readAsDataURL(file);
          }
        }}
      />

      {/* ── LUXURY PROFILE — Top Left Corner ── */}
      <div className="absolute top-[12px] left-[5%] z-40 flex flex-col items-center" style={{ width: '108px' }}>
        {/* Profile Picture with Luxury Frame - clickable to upload */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="relative w-[108px] h-[108px] cursor-pointer border-0 outline-none bg-transparent p-0 hover:scale-105 active:scale-95 transition-transform"
          style={{ WebkitTapHighlightColor: "transparent" }}
          aria-label="Change Profile Photo"
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
                style={{ transform: `scale(${photoScale}) translateY(${photoOffsetY}px)`, transformOrigin: 'center center' }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-b from-indigo-400 to-purple-700 flex items-center justify-center text-[28px]">
                👤
              </div>
            )}
          </div>
          {/* Luxury Frame overlay v3 */}
          <img
            src="/assets/images/icons/profile_frame_v3.png"
            alt="Profile Frame"
            className="absolute inset-0 w-full h-full object-contain z-20 pointer-events-none"
            draggable={false}
          />
        </button>

        {/* Name Banner — tight below frame, no gap, clickable to change name (text shifted 4px left) */}
        <button
          onClick={handleNameClick}
          className="relative w-[108px] -mt-[10px] cursor-pointer hover:scale-105 active:scale-95 transition-all border-0 outline-none p-0 bg-transparent flex flex-col items-center justify-center"
          style={{ WebkitTapHighlightColor: "transparent" }}
          aria-label="Change Player Name"
        >
          <img
            src="/assets/images/icons/name_banner_v2.png"
            alt="Name Banner"
            className="w-full h-auto object-contain pointer-events-none"
            draggable={false}
          />
          <span className="absolute inset-0 flex items-center justify-center font-black text-amber-200 uppercase tracking-widest drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)] pointer-events-none translate-x-[-8px]" style={{ fontSize: '8px' }}>
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
        className="absolute top-[42px] left-[130px] z-40 w-[140px] border-0 outline-none p-0 bg-transparent cursor-pointer hover:scale-105 active:scale-95 transition-all text-left"
        style={{ WebkitTapHighlightColor: "transparent" }}
        aria-label="View XP Details"
      >
        <XPBar progressPercent={0.75} level={level} />
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

      {/* Photo Adjustment Modal */}
      {showPhotoAdjust && (
        <div className="absolute inset-0 z-[100] bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center gap-4 px-6">
          <p className="text-amber-300 font-black text-sm tracking-widest uppercase">Adjust Photo</p>

          {/* Live circular preview with frame */}
          <div className="w-[108px] h-[108px] relative">
            <div
              className="absolute rounded-full overflow-hidden z-10"
              style={{ top: '16%', left: '20%', right: '20%', bottom: '28%' }}
            >
              <img
                src={playerPhoto!}
                alt="preview"
                className="w-full h-full object-cover"
                style={{ transform: `scale(${photoScale}) translateY(${photoOffsetY}px)`, transformOrigin: 'center center' }}
              />
            </div>
            <img src="/assets/images/icons/profile_frame_v3.png" alt="" className="absolute inset-0 w-full h-full object-contain z-20 pointer-events-none" />
          </div>

          {/* Zoom slider */}
          <div className="w-full flex flex-col gap-1">
            <span className="text-[10px] text-amber-200 uppercase tracking-wider">🔍 Zoom</span>
            <input type="range" min="1" max="3" step="0.05" value={photoScale}
              onChange={e => setPhotoScale(parseFloat(e.target.value))}
              className="w-full accent-amber-400" />
          </div>

          {/* Vertical position slider */}
          <div className="w-full flex flex-col gap-1">
            <span className="text-[10px] text-amber-200 uppercase tracking-wider">↕ Position</span>
            <input type="range" min="-40" max="40" step="1" value={photoOffsetY}
              onChange={e => setPhotoOffsetY(parseFloat(e.target.value))}
              className="w-full accent-amber-400" />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-1">
            <button onClick={() => {
              localStorage.setItem("ludo_player_photo_scale", photoScale.toString());
              localStorage.setItem("ludo_player_photo_offset", photoOffsetY.toString());
              setShowPhotoAdjust(false);
            }}
              className="px-5 py-2 rounded-xl bg-amber-500 text-black font-black text-xs tracking-wider hover:bg-amber-400 active:scale-95 transition-all">
              ✓ Done
            </button>
            <button onClick={() => {
              setPlayerPhoto(null);
              localStorage.removeItem("ludo_player_photo");
              localStorage.removeItem("ludo_player_photo_scale");
              localStorage.removeItem("ludo_player_photo_offset");
              setShowPhotoAdjust(false);
            }}
              className="px-4 py-2 rounded-xl bg-slate-700 text-white font-black text-xs tracking-wider hover:bg-slate-600 active:scale-95 transition-all">
              Remove
            </button>
          </div>
        </div>
      )}

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
                <img src="/assets/images/icons/icon_diamond.png" alt="diamond" className="currency-icon drop-shadow-[0_0_6px_rgba(100,149,237,0.8)]" style={{ animation: 'sparkle 2s ease-in-out infinite' }} draggable={false} />
                <span className="currency-value currency-crowns">{formatCurrency(85)}</span>
              </div>
              {/* Coins (middle section) */}
              <div className="currency-item">
                <img src="/assets/images/icons/icon_coin.png" alt="coin" className="currency-icon drop-shadow-[0_0_6px_rgba(255,179,0,0.8)]" style={{ animation: 'sparkle 2.2s ease-in-out infinite' }} draggable={false} />
                <span className="currency-value currency-coins">{formatCurrency(25000)}</span>
              </div>
              {/* Gems (right section) */}
              <div className="currency-item translate-x-[10px]">
                <img src="/assets/images/icons/icon_gem.png" alt="gem" className="currency-icon drop-shadow-[0_0_6px_rgba(168,85,247,0.8)]" style={{ animation: 'sparkle 2.5s ease-in-out infinite' }} draggable={false} />
                <span className="currency-value currency-gems">{formatCurrency(1250)}</span>
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
          onClick={() => triggerToast("Inbox: No new messages")}
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
          {/* 2 Player Mode Custom Graphic Overlay (Overlaying the BG slot) */}
          <button
            onClick={handleTwoPlayerClick}
            className="absolute top-[-96px] left-0 right-0 h-[88px] z-30 cursor-pointer border-0 outline-none p-0 bg-transparent flex items-center justify-center hover:scale-[1.02] active:scale-[0.96] transition-transform"
            style={{ WebkitTapHighlightColor: "transparent" }}
            aria-label="2 Player Mode"
          >
            <img
              src="/assets/images/home/cards/two_player_banner_custom.png"
              alt="2 Player Mode Accent"
              className="w-[94%] h-auto max-h-full object-contain pointer-events-none"
              draggable={false}
            />
          </button>
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
    </div>
  );
};
