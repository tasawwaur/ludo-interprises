import React, { useState } from "react";
import { LudoPageBackground } from "../../../components/effects/LudoPageBackground";
import { TopHeader } from "../components/TopHeader";
import { EventCarousel } from "../components/EventCarousel";
import { HeroCard } from "../components/HeroCard";
import { GameModeGrid } from "../components/GameModeGrid";
import { BottomNavigation } from "../components/BottomNavigation";
import { LuckySpinModal } from "../../events/LuckySpinModal";

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
  const [showLuckySpin, setShowLuckySpin] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState("home");
  const [playerName, setPlayerName] = useState("Tasavvur");
  const [playerPhoto, setPlayerPhoto] = useState<string | null>(null);
  const [showPhotoAdjust, setShowPhotoAdjust] = useState(false);
  const [photoScale, setPhotoScale] = useState(1);
  const [photoOffsetY, setPhotoOffsetY] = useState(0);
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
            const url = URL.createObjectURL(file);
            setPlayerPhoto(url);
            setPhotoScale(1);
            setPhotoOffsetY(0);
            setShowPhotoAdjust(true);
          }
        }}
      />

      {/* ── LUXURY PROFILE — Top Left Corner ── */}
      <div className="absolute top-[2px] left-[2px] z-40 flex flex-col items-center" style={{ width: '108px' }}>
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

        {/* Name Banner — tight below frame, no gap */}
        <div className="relative w-[108px] -mt-[10px]">
          <img
            src="/assets/images/icons/name_banner_v2.png"
            alt="Name Banner"
            className="w-full h-auto object-contain pointer-events-none"
            draggable={false}
          />
          <span className="absolute inset-0 flex items-center justify-center font-black text-amber-200 uppercase tracking-widest drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)] pointer-events-none" style={{ fontSize: '8px' }}>
            {playerName}
          </span>
        </div>
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
            <button onClick={() => setShowPhotoAdjust(false)}
              className="px-5 py-2 rounded-xl bg-amber-500 text-black font-black text-xs tracking-wider hover:bg-amber-400 active:scale-95 transition-all">
              ✓ Done
            </button>
            <button onClick={() => { setPlayerPhoto(null); setShowPhotoAdjust(false); }}
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
          {/* Currency Values Overlay */}
          <div className="absolute inset-0 flex items-center justify-center translate-y-0" style={{ padding: '0 12%' }}>
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
          </div>
        </div>
      </div>

      {/* ── LUXURY SIDE ICON BAR ── */}
      <div className="absolute top-[48px] right-[10px] z-40 flex flex-col gap-[10px] items-center">
        {/* Settings */}
        <button
          onClick={() => onOpenView?.("PROFILE")}
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
            onClick={() => {
              triggerToast("Joining 2 Player Mode...");
              onSelectMode?.("2P Classic");
            }}
            className="absolute top-[-96px] left-0 right-0 h-[88px] z-30 cursor-pointer border-0 outline-none p-0 bg-transparent flex items-center justify-center hover:scale-[1.02] active:scale-95 transition-transform"
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
    </div>
  );
};
