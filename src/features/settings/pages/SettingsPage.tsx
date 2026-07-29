import React, { useState } from "react";
import { useUserStore } from "../../../user/user.store";
import { LudoPageBackground } from "../../../components/effects/LudoPageBackground";

interface SettingsPageProps {
  onBack?: () => void;
  onLogout?: () => void;
  onOpenView?: (view: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onBack, onLogout, onOpenView }) => {
  const logout = useUserStore((s) => s.logout);

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
      <LudoPageBackground variant="settings" />

      <div className="w-full max-w-[430px] h-screen flex flex-col relative z-10 px-3 py-3 overflow-y-auto no-scrollbar">
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-lg hover:bg-black/60 hover:scale-105 active:scale-95 transition-transform"
          >
            ❮
          </button>
          <h1 className="text-xl font-black tracking-widest bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent uppercase glow-amber-text">
            SETTINGS
          </h1>
          <div className="w-9 h-9 flex items-center justify-center text-xl">⚙️</div>
        </div>

        {/* Toggle Controls List (Matching Image #15) */}
        <div className="space-y-3 mb-6">
          <ToggleItem icon="🔊" title="Sound" value={sound} onChange={setSound} />
          <ToggleItem icon="🎵" title="Music" value={music} onChange={setMusic} />
          <ToggleItem icon="🎙️" title="Voice Chat" value={voiceChat} onChange={setVoiceChat} />
          <ToggleItem icon="🔔" title="Notifications" value={notifications} onChange={setNotifications} />
        </div>

        {/* Selectors & Info Links */}
        <div className="space-y-2 mb-8">
          <div className="bg-purple-950/80 border-2 border-purple-500/30 rounded-2xl p-3.5 flex items-center justify-between hover:scale-[1.01] hover:border-purple-400 active:scale-95 transition-all shadow-md">
            <div className="flex items-center gap-3">
              <span className="text-xl">🌐</span>
              <span className="text-xs font-black text-white">Language</span>
            </div>
            <span className="text-xs font-black text-amber-400">English ❯</span>
          </div>

          <div
            onClick={() => onOpenView?.("ADS_SETTINGS")}
            className="bg-purple-950/80 border-2 border-purple-500/30 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer hover:scale-[1.01] hover:border-purple-400 active:scale-95 transition-all shadow-md"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🎬</span>
              <span className="text-xs font-black text-white">Ads Settings</span>
            </div>
            <span className="text-xs text-gray-400">❯</span>
          </div>

          <div className="bg-purple-950/80 border-2 border-purple-500/30 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer hover:scale-[1.01] hover:border-purple-400 active:scale-95 transition-all shadow-md">
            <div className="flex items-center gap-3">
              <span className="text-xl">📜</span>
              <span className="text-xs font-black text-white">Game History</span>
            </div>
            <span className="text-xs text-gray-400">❯</span>
          </div>

          <div className="bg-purple-950/80 border-2 border-purple-500/30 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer hover:scale-[1.01] hover:border-purple-400 active:scale-95 transition-all shadow-md">
            <div className="flex items-center gap-3">
              <span className="text-xl">❓</span>
              <span className="text-xs font-black text-white">Help & Support</span>
            </div>
            <span className="text-xs text-gray-400">❯</span>
          </div>

          <div className="bg-purple-950/80 border-2 border-purple-500/30 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer hover:scale-[1.01] hover:border-purple-400 active:scale-95 transition-all shadow-md">
            <div className="flex items-center gap-3">
              <span className="text-xl">ℹ️</span>
              <span className="text-xs font-black text-white">About</span>
            </div>
            <span className="text-xs text-gray-400">❯</span>
          </div>
        </div>

        {/* Big Red Logout Button (Matching Image #15) */}
        <button
          onClick={handleLogoutClick}
          className="w-full py-3.5 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-2xl text-white font-black text-sm tracking-widest uppercase shadow-xl hover:scale-[1.02] active:scale-95 transition-all border border-red-400 mt-auto mb-4"
        >
          LOGOUT
        </button>
      </div>
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
  <div className="bg-purple-950/80 border-2 border-purple-500/30 rounded-2xl p-3.5 flex items-center justify-between shadow-md">
    <div className="flex items-center gap-3">
      <span className="text-xl">{icon}</span>
      <span className="text-xs font-black text-white">{title}</span>
    </div>
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`w-12 h-6 rounded-full p-1 transition-colors relative flex items-center shadow-inner ${
        value ? "bg-emerald-500" : "bg-gray-700"
      }`}
    >
      <div
        className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
          value ? "translate-x-6" : "translate-x-0"
        }`}
      ></div>
    </button>
  </div>
);
