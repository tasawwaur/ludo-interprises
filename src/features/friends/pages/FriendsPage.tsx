import React, { useState, useMemo } from "react";
import { LudoPageBackground } from "../../../components/effects/LudoPageBackground";
import { useUserStore } from "../../../user/user.store";

interface FriendsPageProps {
  onBack?: () => void;
  onInviteFriend?: (name: string) => void;
}

export const FriendsPage: React.FC<FriendsPageProps> = ({ onBack, onInviteFriend }) => {
  const [activeTab, setActiveTab] = useState<"ONLINE" | "ALL">("ONLINE");
  const user = useUserStore((s) => s.user);

  // Load player profile parameters to sync with home screen layout
  const [myName] = useState(() => {
    return localStorage.getItem("ludo_player_name") || user?.displayName || user?.username || "TASAVVUR";
  });
  const [myPhoto] = useState<string | null>(() => {
    return localStorage.getItem("ludo_player_photo");
  });
  const [myScale] = useState(() => {
    const val = localStorage.getItem("ludo_player_photo_scale");
    return val ? parseFloat(val) : 1;
  });
  const [myOffset] = useState(() => {
    const val = localStorage.getItem("ludo_player_photo_offset");
    return val ? parseFloat(val) : 0;
  });

  const defaultFriends = useMemo(() => [
    { id: 'g_f1', name: "Roxana", status: "Online", isOnline: true, isFB: false, avatarUrl: undefined },
    { id: 'g_f2', name: "Aman", status: "Online", isOnline: true, isFB: false, avatarUrl: undefined },
    { id: 'g_f3', name: "Imran", status: "Online", isOnline: true, isFB: false, avatarUrl: undefined },
    { id: 'g_f4', name: "Tasavvur", status: "Offline", isOnline: false, isFB: false, avatarUrl: undefined },
    { id: 'g_f5', name: "Syed", status: "Online", isOnline: true, isFB: false, avatarUrl: undefined },
  ], []);

  const friends = useMemo(() => {
    if (user?.loginProvider === 'facebook' && user.syncedFBFriends) {
      const fbList = user.syncedFBFriends.map((f) => ({
        id: f.id,
        name: f.name,
        status: f.isOnline ? "Online" : "Offline",
        isOnline: f.isOnline,
        isFB: true,
        avatarUrl: f.avatarUrl
      }));
      const merged = [...fbList];
      defaultFriends.forEach((df) => {
        if (!merged.some((m) => m.name.toLowerCase() === df.name.toLowerCase() || m.name.toLowerCase().startsWith(df.name.toLowerCase()))) {
          merged.push(df);
        }
      });
      return merged;
    }
    return defaultFriends;
  }, [user, defaultFriends]);

  const filtered = useMemo(() => {
    return activeTab === "ONLINE" ? friends.filter((f) => f.isOnline) : friends;
  }, [activeTab, friends]);

  return (
    <div className="min-h-screen w-full bg-[#12061F] text-white flex flex-col items-center relative overflow-hidden select-none font-sans">
      <LudoPageBackground variant="friends" />

      <div className="w-full max-w-[430px] h-screen flex flex-col relative z-10 px-3 py-3 overflow-y-auto no-scrollbar pb-6">
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-lg hover:bg-black/60 hover:scale-105 active:scale-95 transition-transform"
          >
            ❮
          </button>
          <h1 className="text-xl font-black tracking-widest bg-gradient-to-r from-teal-200 to-emerald-400 bg-clip-text text-transparent uppercase glow-cyan-text">
            FRIENDS
          </h1>
          <div className="w-9 h-9"></div>
        </div>

        {/* ── MY PROFILE LUXURY CARD (Matched exactly to Home Screen profile) ── */}
        <div className="bg-gradient-to-r from-purple-900/90 to-purple-950/90 border-2 border-amber-400/50 rounded-3xl p-3 flex items-center justify-between shadow-2xl mb-4 relative overflow-hidden glow-gold-border flex-shrink-0">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400"></div>
          
          <div className="flex items-center gap-3">
            {/* Avatar Frame (Exact copy from Home Page but scaled down slightly to w-[84px] h-[84px] for neat list fit) */}
            <div className="w-[84px] h-[84px] relative flex-shrink-0">
              <div
                className="absolute rounded-full overflow-hidden bg-slate-900 border border-[#1e0736] z-10"
                style={{ top: '16%', left: '20%', right: '20%', bottom: '28%' }}
              >
                {myPhoto ? (
                  <img
                    src={myPhoto}
                    alt="My Avatar"
                    className="w-full h-full object-cover"
                    style={{ transform: `scale(${myScale}) translateY(${myOffset}px)`, transformOrigin: 'center center' }}
                    draggable={false}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-800 to-indigo-900 flex items-center justify-center text-white text-2xl font-black">
                    {myName.charAt(0)}
                  </div>
                )}
              </div>
              <img
                src="/assets/images/profile_frame.png"
                alt="Gold Profile Frame"
                className="w-full h-full object-fill absolute inset-0 z-20 pointer-events-none drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)]"
                draggable={false}
              />
            </div>

            {/* Name Banner (Exact copy from Home Page but adjusted layout) */}
            <div className="relative w-[110px] h-[30px] z-30 flex items-center justify-center flex-shrink-0">
              <img
                src="/assets/images/name_banner.png"
                alt="Name Banner"
                className="w-full h-full object-fill absolute inset-0 pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]"
                draggable={false}
              />
              <span
                className="z-10 text-[8.5px] font-black text-amber-200 tracking-wider uppercase translate-x-[-7px] truncate max-w-[75px]"
                style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
              >
                {myName}
              </span>
            </div>
          </div>

          {/* Self status badge */}
          <div className="flex flex-col items-end pr-2">
            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest leading-none">Online</span>
            <span className="text-[8px] text-purple-300 font-black mt-1.5 uppercase font-mono">Level {user?.level || 5}</span>
          </div>
        </div>

        {/* Tabs: ONLINE / ALL */}
        <div className="flex bg-black/60 p-1.5 rounded-2xl border border-purple-500/30 mb-4 shadow-2xl flex-shrink-0">
          <button
            onClick={() => setActiveTab("ONLINE")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all ${
              activeTab === "ONLINE"
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg border border-emerald-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            ONLINE ({friends.filter((f) => f.isOnline).length})
          </button>
          <button
            onClick={() => setActiveTab("ALL")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all ${
              activeTab === "ALL"
                ? "bg-gradient-to-r from-purple-600 to-indigo-700 text-white shadow-lg border border-purple-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            ALL ({friends.length})
          </button>
        </div>

        {/* Friends Cards List */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2.5 pb-4">
          {filtered.map((friend) => (
            <div
              key={friend.id}
              className="bg-purple-950/80 border-2 border-purple-500/40 rounded-3xl p-3 flex items-center justify-between hover:scale-[1.01] hover:border-purple-400 transition-all shadow-lg cursor-pointer"
            >
              <div className="flex items-center gap-3">
                {/* Gold Frame around Friend's Avatar */}
                <div className="w-[52px] h-[52px] relative flex-shrink-0">
                  <div
                    className="absolute rounded-full overflow-hidden bg-slate-800 z-10"
                    style={{ top: '16%', left: '20%', right: '20%', bottom: '28%' }}
                  >
                    {friend.avatarUrl ? (
                      <img src={friend.avatarUrl} alt={friend.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-purple-900 flex items-center justify-center text-sm font-bold">
                        👤
                      </div>
                    )}
                  </div>
                  <img
                    src="/assets/images/profile_frame.png"
                    alt="Gold Profile Frame"
                    className="w-full h-full object-fill absolute inset-0 z-20 pointer-events-none"
                    draggable={false}
                  />
                  {friend.isOnline && (
                    <div className="absolute bottom-[4px] right-[8px] w-2.5 h-2.5 bg-emerald-500 rounded-full border border-black animate-pulse z-30 shadow-md"></div>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  {/* Gold Name Banner for Friend */}
                  <div className="relative w-[96px] h-[26px] flex items-center justify-center">
                    <img
                      src="/assets/images/name_banner.png"
                      alt="Name Banner"
                      className="w-full h-full object-fill absolute inset-0 pointer-events-none"
                      draggable={false}
                    />
                    <span
                      className="z-10 text-[7.5px] font-black text-amber-200 tracking-wider uppercase translate-x-[-6px] truncate max-w-[62px]"
                      style={{ textShadow: '0 1px 2px rgba(0,0,0,0.9)' }}
                    >
                      {friend.name}
                    </span>
                    {friend.isFB && (
                      <span className="absolute -right-3 top-1 text-[7.5px] px-1 py-0.5 rounded bg-[#1877F2] text-white font-black leading-none select-none z-30">
                        FB
                      </span>
                    )}
                  </div>
                  <span className={`text-[9px] pl-1.5 leading-none ${friend.isOnline ? "text-emerald-400 font-extrabold" : "text-gray-400"}`}>
                    {friend.status}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onInviteFriend?.(friend.name)}
                className={`font-black px-4 py-2 rounded-xl text-[10px] uppercase shadow border transition-all hover:scale-105 active:scale-95 ${
                  friend.isOnline
                    ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 border-yellow-300 shadow-yellow-500/20"
                    : "bg-gradient-to-r from-purple-800 to-indigo-900 text-white border-purple-500"
                }`}
              >
                INVITE
              </button>
            </div>
          ))}
        </div>

        {/* Bottom Add Friends Button */}
        <button className="w-full py-3.5 bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 rounded-2xl text-white font-black text-xs tracking-widest uppercase shadow-xl hover:scale-[1.02] active:scale-95 transition-all border border-purple-400 mb-2 flex items-center justify-center gap-2 flex-shrink-0">
          <span>➕</span>
          <span>ADD FRIENDS</span>
        </button>
      </div>
    </div>
  );
};
