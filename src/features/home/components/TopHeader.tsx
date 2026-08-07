import React, { useEffect, useState } from 'react';
import { useUserStore } from '../../../user/user.store';

interface TopHeaderProps {
  onOpenProfileSettings?: () => void;
  onOpenInbox?: () => void;
}

// Luxury Casino Web Audio Chime Sound Synthesizer
const playLuxuryRewardSound = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Sequence of 9 crisp crystal gold coin & gem chimes
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

export const TopHeader: React.FC<TopHeaderProps> = ({
  onOpenProfileSettings,
  onOpenInbox,
}) => {
  const user = useUserStore((s) => s.user);
  const justClaimedWelcome = useUserStore((s) => s.justClaimedWelcome);
  const setJustClaimedWelcome = useUserStore((s) => s.setJustClaimedWelcome);

  const displayName = user?.displayName || user?.username || 'Tasavvur';
  const level = user?.level || 25;
  const avatar = user?.avatar;

  const [animCoins, setAnimCoins] = useState<number | null>(null);
  const [animGems, setAnimGems] = useState<number | null>(null);
  const [animDiamonds, setAnimDiamonds] = useState<number | null>(null);
  const [isGlowBox, setIsGlowBox] = useState(false);

  useEffect(() => {
    if (justClaimedWelcome) {
      setIsGlowBox(true);
      playLuxuryRewardSound();

      const targetCoins = user?.coins || 10000;
      const targetGems = user?.gems || 100;
      const targetDiamonds = 100;
      
      // Start ALL currency counters at 000 as requested!
      const startCoins = 0;
      const startGems = 0;
      const startDiamonds = 0;

      setAnimCoins(startCoins);
      setAnimGems(startGems);
      setAnimDiamonds(startDiamonds);

      let currentC = startCoins;
      let currentG = startGems;
      let currentD = startDiamonds;
      const steps = 30;
      const stepC = Math.ceil(targetCoins / steps);
      const stepG = Math.ceil(targetGems / steps);
      const stepD = Math.ceil(targetDiamonds / steps);

      const interval = setInterval(() => {
        currentC = Math.min(targetCoins, currentC + stepC);
        currentG = Math.min(targetGems, currentG + stepG);
        currentD = Math.min(targetDiamonds, currentD + stepD);

        setAnimCoins(currentC);
        setAnimGems(currentG);
        setAnimDiamonds(currentD);

        if (currentC >= targetCoins && currentG >= targetGems && currentD >= targetDiamonds) {
          clearInterval(interval);
          setTimeout(() => {
            setAnimCoins(null);
            setAnimGems(null);
            setAnimDiamonds(null);
            setIsGlowBox(false);
            setJustClaimedWelcome(false);
          }, 1500);
        }
      }, 45);

      return () => clearInterval(interval);
    }
  }, [justClaimedWelcome, user, setJustClaimedWelcome]);

  const displayCoins = animCoins !== null ? animCoins : (user?.coins ?? 0);
  const displayGems = animGems !== null ? animGems : (user?.gems ?? 0);
  const displayDiamonds = animDiamonds !== null ? animDiamonds : (user?.gems ?? 0);

  return (
    <header className="w-full max-w-lg flex flex-col gap-2 px-3 pt-3 z-20 relative">
      
      {/* Keyframe Animations for Flying Rewards on Home Page */}
      <style>{`
        @keyframes flyToCoinBar {
          0% { transform: translate(-50%, 350px) scale(1.4) rotate(0deg); opacity: 1; }
          60% { transform: translate(-20px, 120px) scale(1.2) rotate(180deg); opacity: 1; }
          100% { transform: translate(120px, 10px) scale(0.3) rotate(360deg); opacity: 0; }
        }
        @keyframes flyToGemBar {
          0% { transform: translate(50%, 350px) scale(1.4) rotate(0deg); opacity: 1; }
          60% { transform: translate(20px, 120px) scale(1.2) rotate(-180deg); opacity: 1; }
          100% { transform: translate(180px, 10px) scale(0.3) rotate(-360deg); opacity: 0; }
        }
        @keyframes riseCoinText {
          0% { transform: translateY(300px) scale(0.8); opacity: 0; }
          30% { transform: translateY(180px) scale(1.3); opacity: 1; }
          100% { transform: translateY(10px) scale(0.9); opacity: 0; }
        }
      `}</style>

      {/* FLYING COINS & GEMS OVERLAY ON HOME PAGE */}
      {justClaimedWelcome && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {/* 10 Gold Coins Flying to Coin Box */}
          {[...Array(10)].map((_, i) => (
            <div
              key={`h-coin-${i}`}
              className="absolute left-1/2 top-0"
              style={{
                animation: `flyToCoinBar 1.2s cubic-bezier(0.2, 0.8, 0.4, 1) ${i * 0.08}s forwards`,
              }}
            >
              <img
                src="/assets/images/icons/luxury_coin.png"
                alt="Flying Coin"
                className="w-9 h-9 object-contain filter drop-shadow-[0_0_14px_rgba(255,215,0,0.9)]"
              />
            </div>
          ))}

          {/* 10 Blue Gems Flying to Gem Box */}
          {[...Array(10)].map((_, i) => (
            <div
              key={`h-gem-${i}`}
              className="absolute left-1/2 top-0"
              style={{
                animation: `flyToGemBar 1.2s cubic-bezier(0.2, 0.8, 0.4, 1) ${i * 0.08}s forwards`,
              }}
            >
              <img
                src="/assets/images/icons/luxury_gem.png"
                alt="Flying Gem"
                className="w-9 h-9 object-contain filter drop-shadow-[0_0_14px_rgba(168,85,247,0.9)]"
              />
            </div>
          ))}

          {/* Rising Floating Text Badges */}
          <div
            className="absolute left-[25%] text-yellow-300 font-black text-base tracking-wider drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] bg-black/80 px-3 py-1 rounded-full border border-amber-400"
            style={{ animation: `riseCoinText 1.2s ease-out forwards` }}
          >
            +10,000 COINS 🪙
          </div>

          <div
            className="absolute right-[25%] text-cyan-300 font-black text-base tracking-wider drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] bg-black/80 px-3 py-1 rounded-full border border-cyan-400"
            style={{ animation: `riseCoinText 1.2s ease-out 0.1s forwards` }}
          >
            +100 GEMS 💎
          </div>
        </div>
      )}

      {/* Row 1: Profile Avatar & Currencies styled inside a Custom High-End Luxury Gold Frame (Pure CSS/SVG) */}
      <div 
        className="flex items-center justify-between gap-2 bg-gradient-to-b from-[#1E0836] via-[#120324] to-[#0A0118]/95 border-2 border-amber-400 shadow-[0_4px_25px_rgba(0,0,0,0.85),0_0_15px_rgba(245,158,11,0.25)] rounded-2xl w-full relative overflow-hidden"
        style={{ padding: '20px 16px 12px 14px', minHeight: '92px' }}
      >
        {/* Inner Gold Inset Line Border */}
        <div className="absolute inset-[3px] rounded-[13px] border border-yellow-200/20 pointer-events-none z-10" />

        {/* Top Center Glowing Jewel (Purple Diamond + Gold wings base) */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
          <div className="w-6 h-6 rotate-45 bg-gradient-to-br from-fuchsia-400 via-purple-600 to-indigo-800 border-2 border-yellow-300 shadow-[0_0_12px_#d946ef] flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-white/40 rounded-full blur-[0.5px] -mt-1.5 -ml-1.5" />
          </div>
          <div className="w-12 h-1 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 border border-yellow-200/50 rounded-full -mt-1 shadow-md" />
        </div>

        {/* Decorative corner gold scroll lines */}
        <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-yellow-400/40 rounded-tl pointer-events-none z-10" />
        <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-yellow-400/40 rounded-tr pointer-events-none z-10" />
        <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-yellow-400/40 rounded-bl pointer-events-none z-10" />
        <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-yellow-400/40 rounded-br pointer-events-none z-10" />
        {/* Profile Avatar with Online Dot & Level XP */}
        <div
          onClick={onOpenProfileSettings}
          className="flex items-center gap-1.5 cursor-pointer group"
          title="Edit Profile"
        >
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-amber-400 overflow-hidden shadow-[0_0_12px_rgba(255,193,7,0.5)] bg-slate-900 flex items-center justify-center text-xl group-hover:scale-105 transition-transform relative p-0.5">
              <div className="absolute inset-0 rounded-full border border-yellow-200/40 pointer-events-none"></div>
              {avatar ? (
                <img src={avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-2xl">👤</span>
              )}
            </div>
            {/* Green Online Dot */}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border border-slate-950 shadow animate-pulse"></span>
          </div>

          <div className="flex flex-col">
            <span className="text-sm font-black text-white truncate max-w-[120px] drop-shadow leading-tight">
              {displayName}
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-[8px] px-1 py-0.2 rounded shadow-[0_1px_2px_rgba(0,0,0,0.5)] border border-yellow-200/40 scale-95 origin-left">
                {level}
              </span>
              <div className="w-16 h-2 bg-purple-950/80 rounded-full overflow-hidden border border-amber-400/50 shadow-inner relative flex p-[1px] scale-95 origin-left">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-500 via-amber-300 to-yellow-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.8)]" 
                  style={{ width: "75%" }}
                ></div>
              </div>
              <span className="text-[8px] text-amber-300 font-extrabold scale-95 origin-left">75%</span>
            </div>
          </div>
        </div>

        {/* Luxury Currency Panel (Coins, Gems, Diamonds) on the right side */}
        <div className="flex items-center gap-1 z-20">
          {/* Coins Counter */}
          <div className={`flex items-center bg-slate-950/90 border rounded-xl px-1.5 py-0.5 shadow-lg gap-1 transition-all duration-300 cursor-pointer ${
            isGlowBox
              ? 'border-amber-300 scale-110 shadow-[0_0_15px_rgba(255,215,0,0.9)] bg-amber-950/80'
              : 'border-amber-400/50 hover:scale-105'
          }`}>
            <img src="/assets/images/icons/luxury_coin.png" className="w-4 h-4 object-contain" alt="Coins" />
            <span className="text-[9px] font-black text-amber-400">{displayCoins.toLocaleString()}</span>
            <button className="w-3 h-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[8px] flex items-center justify-center shadow">+</button>
          </div>

          {/* Gems Counter */}
          <div className={`flex items-center bg-slate-950/90 border rounded-xl px-1.5 py-0.5 shadow-lg gap-1 transition-all duration-300 cursor-pointer ${
            isGlowBox
              ? 'border-purple-300 scale-110 shadow-[0_0_15px_rgba(168,85,247,0.9)] bg-purple-950/80'
              : 'border-purple-400/50 hover:scale-105'
          }`}>
            <img src="/assets/images/icons/luxury_gem.png" className="w-4 h-4 object-contain" alt="Gems" />
            <span className="text-[9px] font-black text-purple-300">{displayGems.toLocaleString()}</span>
            <button className="w-3 h-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[8px] flex items-center justify-center shadow">+</button>
          </div>

          {/* Diamonds Counter */}
          <div className={`flex items-center bg-slate-950/90 border rounded-xl px-1.5 py-0.5 shadow-lg gap-1 transition-all duration-300 cursor-pointer ${
            isGlowBox
              ? 'border-cyan-300 scale-110 shadow-[0_0_15px_rgba(6,182,212,0.9)] bg-cyan-950/80'
              : 'border-cyan-400/50 hover:scale-105'
          }`}>
            <span className="text-xs">💎</span>
            <span className="text-[9px] font-black text-cyan-300">{displayDiamonds.toLocaleString()}</span>
            <button className="w-3 h-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[8px] flex items-center justify-center shadow">+</button>
          </div>
        </div>
      </div>

      {/* Row 2: Right Action Badges (Inbox) */}
      <div className="flex justify-end items-center gap-2">
        {/* Inbox Button */}
        <button
          onClick={onOpenInbox}
          className="relative w-11 h-9 rounded-2xl bg-purple-950/90 border border-purple-400/50 flex items-center justify-center text-lg shadow-lg hover:scale-105 transition-transform"
        >
          📩
          <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white font-black text-[10px] w-5 h-5 rounded-full border border-slate-950 flex items-center justify-center shadow">
            5
          </span>
        </button>
      </div>
    </header>
  );
};
