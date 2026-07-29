import React, { useState } from "react";
import { useUserStore } from "../../../user/user.store";
import { LudoPageBackground } from "../../../components/effects/LudoPageBackground";

interface ProfilePageProps {
  onBack?: () => void;
  onOpenHistory?: () => void;
  onLogout?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onBack, onOpenHistory, onLogout }) => {
  const user = useUserStore((s) => s.user);
  const logout = useUserStore((s) => s.logout);

  const displayName = user?.displayName || user?.username || "Govind";

  // Embedded Settings states
  const [showSettings, setShowSettings] = useState(false);
  const [sound, setSound] = useState(true);
  const [music, setMusic] = useState(true);
  const [voiceChat, setVoiceChat] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const handleLogoutClick = () => {
    logout();
    onLogout?.();
  };

  return (
    <div className="min-h-screen w-full bg-[#12061F] text-white flex flex-col items-center relative overflow-hidden select-none font-sans">
      {/* 1. Ludo Themed Background */}
      <LudoPageBackground variant="profile" />

      <div className="w-full max-w-[430px] h-screen flex flex-col relative z-10 px-3 py-3 overflow-y-auto no-scrollbar">
        {/* Top Navigation Row */}
        <div className="flex items-center justify-between w-full mb-6">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-lg hover:bg-black/60 hover:scale-105 active:scale-95 transition-transform"
          >
            ❮
          </button>
          <h1 className="text-xl font-black tracking-widest bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent uppercase glow-amber-text">
            PROFILE
          </h1>
          <button
            onClick={() => setShowSettings(true)}
            className="w-9 h-9 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-sm hover:bg-black/60 hover:scale-105 active:scale-95 transition-transform"
          >
            ⚙️
          </button>
        </div>

        {/* Profile Header Block */}
        <div className="bg-gradient-to-b from-purple-900/80 to-purple-950/90 border-2 border-amber-400/50 rounded-3xl p-4 flex flex-col items-center shadow-2xl mb-4 relative overflow-hidden glow-gold-border">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400"></div>

          {/* Avatar Ring */}
          <div className="relative mb-2">
            <div className="w-20 h-20 rounded-full border-[3px] border-double border-amber-400 p-0.5 shadow-[0_0_20px_rgba(255,193,7,0.7)] bg-slate-900 flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border border-yellow-200/40 pointer-events-none"></div>
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-4xl">👤</span>
              )}
            </div>
            <button className="absolute bottom-0 right-0 bg-amber-500 text-slate-950 rounded-full w-6 h-6 flex items-center justify-center text-xs font-black shadow border border-amber-200 hover:scale-110 active:scale-95 transition-transform">
              ✏️
            </button>
          </div>

          <h2 className="text-xl font-black text-white mb-0.5">{displayName}</h2>
          <span className="text-[10px] text-purple-300 font-mono mb-2">ID: 1129385</span>

          {/* Level & XP Bar */}
          <div className="w-full max-w-[240px] flex flex-col gap-1 mb-3">
            <div className="flex justify-between items-center text-[10px] font-black">
              <span className="text-amber-400">LEVEL 25</span>
              <span className="text-purple-300">75%</span>
            </div>
            <div className="w-full h-3 bg-purple-950/80 rounded-full overflow-hidden border border-amber-400/60 shadow-inner relative flex p-[1px]">
              <div 
                className="h-full bg-gradient-to-r from-yellow-500 via-amber-300 to-yellow-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.8)]" 
                style={{ width: "75%" }}
              ></div>
            </div>
          </div>

          {/* Badge Rank */}
          <div className="bg-black/50 px-4 py-1.5 rounded-full border border-amber-400/40 flex items-center gap-2">
            <span className="text-sm">🛡️</span>
            <div>
              <span className="text-[10px] font-black text-amber-300 block uppercase leading-none">Bronze League</span>
              <span className="text-[8px] text-gray-400 leading-none">Current Rank</span>
            </div>
          </div>
        </div>

        {/* 3 Quick Stats Row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-purple-950/80 border-2 border-purple-500/30 rounded-2xl p-2.5 text-center shadow-lg hover:scale-105 transition-transform">
            <span className="text-[10px] text-purple-300 block font-bold">Matches</span>
            <span className="text-base font-black text-white">245</span>
          </div>
          <div className="bg-purple-950/80 border-2 border-purple-500/30 rounded-2xl p-2.5 text-center shadow-lg hover:scale-105 transition-transform">
            <span className="text-[10px] text-purple-300 block font-bold">Win Rate</span>
            <span className="text-base font-black text-green-400">68%</span>
          </div>
          <div className="bg-purple-950/80 border-2 border-purple-500/30 rounded-2xl p-2.5 text-center shadow-lg hover:scale-105 transition-transform">
            <span className="text-[10px] text-purple-300 block font-bold">Win Streak</span>
            <span className="text-base font-black text-amber-400">12</span>
          </div>
        </div>

        {/* Currencies Pill Row */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-black/50 border-2 border-amber-400/30 rounded-2xl p-3 flex items-center justify-between shadow-lg glow-gold-border hover:scale-105 transition-transform cursor-pointer">
            <div className="flex items-center gap-2">
              <img src="/assets/images/icons/luxury_coin.png" className="w-6 h-6 object-contain" alt="Coins" />
              <span className="text-xs font-black text-amber-400">259.8K</span>
            </div>
            <span className="text-xs text-gray-400">❯</span>
          </div>
          <div className="bg-black/50 border-2 border-blue-400/30 rounded-2xl p-3 flex items-center justify-between shadow-lg glow-purple-border hover:scale-105 transition-transform cursor-pointer">
            <div className="flex items-center gap-2">
              <img src="/assets/images/icons/luxury_gem.png" className="w-6 h-6 object-contain" alt="Gems" />
              <span className="text-xs font-black text-blue-400">1,250</span>
            </div>
            <span className="text-xs text-gray-400">❯</span>
          </div>
        </div>

        {/* Menu Items List */}
        <div className="space-y-2 mb-6">
          <button className="w-full bg-purple-950/80 border-2 border-purple-500/35 rounded-2xl p-3.5 flex items-center justify-between hover:scale-[1.02] hover:border-purple-400 active:scale-95 transition-all shadow-md">
            <div className="flex items-center gap-3">
              <span className="text-xl">🏆</span>
              <span className="text-xs font-black text-white">Achievements</span>
            </div>
            <span className="text-xs text-gray-400">❯</span>
          </button>

          <button className="w-full bg-purple-950/80 border-2 border-purple-500/35 rounded-2xl p-3.5 flex items-center justify-between hover:scale-[1.02] hover:border-purple-400 active:scale-95 transition-all shadow-md">
            <div className="flex items-center gap-3">
              <span className="text-xl">🎒</span>
              <span className="text-xs font-black text-white">Inventory</span>
            </div>
            <span className="text-xs text-gray-400">❯</span>
          </button>

          <button
            onClick={onOpenHistory}
            className="w-full bg-purple-950/80 border-2 border-purple-500/35 rounded-2xl p-3.5 flex items-center justify-between hover:scale-[1.02] hover:border-purple-400 active:scale-95 transition-all shadow-md"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">📜</span>
              <span className="text-xs font-black text-white">History</span>
            </div>
            <span className="text-xs text-gray-400">❯</span>
          </button>

          <button className="w-full bg-purple-950/80 border-2 border-purple-500/35 rounded-2xl p-3.5 flex items-center justify-between hover:scale-[1.02] hover:border-purple-400 active:scale-95 transition-all shadow-md">
            <div className="flex items-center gap-3">
              <span className="text-xl">📊</span>
              <span className="text-xs font-black text-white">Statistics</span>
            </div>
            <span className="text-xs text-gray-400">❯</span>
          </button>
        </div>
      </div>

      {/* Embedded Settings Modal Sheet (Full-Height Top Aligned) */}
      {showSettings && (
        <div className="absolute inset-0 bg-[#12061F] z-50 flex flex-col transition-all animate-in fade-in duration-200">
          {/* Settings background */}
          <LudoPageBackground variant="settings" />

          <div className="w-full h-full flex flex-col relative z-10 px-6 py-6 overflow-y-auto no-scrollbar justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-purple-500/20">
                <h2 className="text-lg font-black tracking-widest text-white uppercase glow-amber-text">
                  ⚙️ GAME SETTINGS
                </h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-8 h-8 rounded-full bg-black/40 border border-white/10 flex items-center justify-center font-black text-xs hover:bg-black/60 active:scale-90 transition-transform"
                >
                  ✕
                </button>
              </div>

              {/* Toggle Controls List */}
              <div className="space-y-3 mb-6">
                <ToggleItem icon="🔊" title="Sound" value={sound} onChange={setSound} />
                <ToggleItem icon="🎵" title="Music" value={music} onChange={setMusic} />
                <ToggleItem icon="🎙️" title="Voice Chat" value={voiceChat} onChange={setVoiceChat} />
                <ToggleItem icon="🔔" title="Notifications" value={notifications} onChange={setNotifications} />
              </div>

              {/* Selectors */}
              <div className="space-y-3 mb-6">
                <div className="bg-purple-900/50 border border-purple-500/20 rounded-2xl p-3.5 flex items-center justify-between shadow-md">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🌐</span>
                    <span className="text-xs font-black text-white">Language</span>
                  </div>
                  <span className="text-xs font-black text-amber-400">English ❯</span>
                </div>
                <div className="bg-purple-900/50 border border-purple-500/20 rounded-2xl p-3.5 flex items-center justify-between shadow-md">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">❓</span>
                    <span className="text-xs font-black text-white">Help & Support</span>
                  </div>
                  <span className="text-xs text-purple-300">❯</span>
                </div>
              </div>
            </div>

            {/* Big Red Logout Button */}
            <button
              onClick={handleLogoutClick}
              className="w-full py-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-2xl text-white font-black text-sm tracking-widest uppercase shadow-xl hover:scale-[1.01] active:scale-95 transition-all border border-red-400 mt-auto mb-4"
            >
              LOGOUT FROM LUDO
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ToggleItem = ({
  icon,
  title,
  value,
  onChange,
}: {
  icon: string;
  title: string;
  value: boolean;
  onChange: (val: boolean) => void;
}) => (
  <div className="bg-purple-900/50 border border-purple-500/20 rounded-2xl p-3 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <span className="text-lg">{icon}</span>
      <span className="text-xs font-bold text-white">{title}</span>
    </div>
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`w-11 h-6 rounded-full p-1 transition-colors relative flex items-center shadow-inner ${
        value ? "bg-emerald-500" : "bg-gray-700"
      }`}
    >
      <div
        className={`w-4 h-4 rounded-full bg-white shadow transform transition-transform ${
          value ? "translate-x-5" : "translate-x-0"
        }`}
      ></div>
    </button>
  </div>
);
