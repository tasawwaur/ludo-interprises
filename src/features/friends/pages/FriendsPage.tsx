import React, { useState, useMemo, useEffect, useRef } from "react";
import { LudoPageBackground } from "../../../components/effects/LudoPageBackground";
import { useUserStore } from "../../../user/user.store";
import confetti from "canvas-confetti";

interface FriendsPageProps {
  onBack?: () => void;
  onInviteFriend?: (name: string) => void;
}

interface Friend {
  id: string;
  name: string;
  status: string;
  isOnline: boolean;
  isFB: boolean;
  avatarUrl?: string;
  coins: number;
  level: number;
}

interface DMMessage {
  sender: "me" | "friend";
  text: string;
  time: string;
}

export const FriendsPage: React.FC<FriendsPageProps> = ({ onBack, onInviteFriend }) => {
  const [activeTab, setActiveTab] = useState<"ONLINE" | "ALL">("ONLINE");
  const user = useUserStore((s) => s.user);
  const updateUser = useUserStore((s) => s.updateUser);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<Friend | null>(null);

  const [activeChatFriend, setActiveChatFriend] = useState<Friend | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chats, setChats] = useState<Record<string, DMMessage[]>>({
    'g_f1': [
      { sender: "friend", text: "Hey! Nice match yesterday.", time: "Yesterday" },
      { sender: "me", text: "Thanks! You played really well too.", time: "Yesterday" },
      { sender: "friend", text: "Are you free to play now?", time: "10:45 AM" }
    ],
    'g_f2': [
      { sender: "friend", text: "Let's team up for the 2v2 tournament!", time: "9:15 AM" }
    ]
  });

  const [selectedFriendProfile, setSelectedFriendProfile] = useState<Friend | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Load player profile parameters
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

  // Default friends with pre-configured Facebook indicator and custom stats
  const [friendsList, setFriendsList] = useState<Friend[]>([
    { id: 'g_f1', name: "Roxana", status: "Online", isOnline: true, isFB: true, coins: 25000, level: 12 },
    { id: 'g_f2', name: "Aman", status: "Online", isOnline: true, isFB: true, coins: 1250000, level: 15 },
    { id: 'g_f3', name: "Imran", status: "Online", isOnline: true, isFB: false, coins: 80000, level: 8 },
    { id: 'g_f4', name: "Tasavvur", status: "Offline", isOnline: false, isFB: false, coins: 500000, level: 25 },
    { id: 'g_f5', name: "Syed", status: "Online", isOnline: true, isFB: false, coins: 10000, level: 5 },
  ]);

  // Synchronized Facebook list from user store (if logged in with FB)
  const mergedFriends = useMemo(() => {
    if (user?.loginProvider === 'facebook' && user.syncedFBFriends) {
      const fbList: Friend[] = user.syncedFBFriends.map((f) => ({
        id: f.id,
        name: f.name,
        status: f.isOnline ? "Online" : "Offline",
        isOnline: f.isOnline,
        isFB: true,
        avatarUrl: f.avatarUrl,
        coins: 15000,
        level: 4
      }));
      const merged = [...fbList];
      friendsList.forEach((df) => {
        if (!merged.some((m) => m.name.toLowerCase() === df.name.toLowerCase())) {
          merged.push(df);
        }
      });
      return merged;
    }
    return friendsList;
  }, [user, friendsList]);

  const filtered = useMemo(() => {
    return activeTab === "ONLINE" ? mergedFriends.filter((f) => f.isOnline) : mergedFriends;
  }, [activeTab, mergedFriends]);

  // Search player handler (UID search starts with LUDO-, else searches by name)
  const handleSearchFriend = () => {
    const q = searchQuery.trim().toUpperCase();
    if (!q) return;

    // Simulate search logic
    if (q.startsWith("LUDO-")) {
      const randId = `f_${Math.floor(Math.random() * 9000) + 1000}`;
      setSearchResult({
        id: randId,
        name: `PRO_PLAYER_${q.replace("LUDO-", "")}`,
        status: "Online",
        isOnline: true,
        isFB: false,
        coins: 950000,
        level: 18
      });
    } else {
      // Name search
      const found = mergedFriends.find(f => f.name.toUpperCase() === q);
      if (found) {
        setSearchResult(found);
      } else {
        // Mock new player
        const randId = `f_${Math.floor(Math.random() * 9000) + 1000}`;
        setSearchResult({
          id: randId,
          name: q,
          status: "Offline",
          isOnline: false,
          isFB: false,
          coins: 45000,
          level: 6
        });
      }
    }
  };

  const handleSendDM = () => {
    if (!chatInput.trim() || !activeChatFriend) return;
    const friendId = activeChatFriend.id;
    const newMsg: DMMessage = {
      sender: "me",
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const currentHistory = chats[friendId] || [];
    const updatedHistory = [...currentHistory, newMsg];
    
    setChats({
      ...chats,
      [friendId]: updatedHistory
    });
    setChatInput("");

    // Simulate reply after 1.2 seconds
    setTimeout(() => {
      const replyMsg: DMMessage = {
        sender: "friend",
        text: `GG! Let's play a private table match together soon! 🎲`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChats(prev => ({
        ...prev,
        [friendId]: [...(prev[friendId] || []), replyMsg]
      }));
      confetti({ particleCount: 5, spread: 20 });
    }, 1200);
  };

  const handleSendGift = (giftType: "COINS" | "GEMS", amount: number) => {
    if (!selectedFriendProfile) return;
    const userCoins = user?.coins || 0;
    const userGems = user?.gems || 0;

    if (giftType === "COINS" && userCoins < amount) {
      triggerToast("❌ Insufficient Coins!");
      return;
    }
    if (giftType === "GEMS" && userGems < amount) {
      triggerToast("❌ Insufficient Gems!");
      return;
    }

    if (giftType === "COINS") {
      updateUser({ coins: userCoins - amount });
    } else {
      updateUser({ gems: userGems - amount });
    }

    confetti({ particleCount: 40, spread: 50, colors: ['#9333EA', '#FFD700'] });
    triggerToast(`🎁 Gifted ${amount.toLocaleString()} ${giftType} to ${selectedFriendProfile.name}!`);
    setSelectedFriendProfile(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#12061F] text-white flex flex-col items-center relative overflow-hidden select-none font-sans">
      <LudoPageBackground variant="friends" />

      <div className="w-full max-w-[430px] h-screen flex flex-col relative z-10 px-3 py-3 overflow-y-auto no-scrollbar pb-6">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
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

        {/* ── MY PROFILE LUXURY CARD ── */}
        <div className="bg-gradient-to-r from-purple-900/90 to-purple-950/90 border-2 border-amber-400/50 rounded-3xl p-3 flex items-center justify-between shadow-2xl mb-4 relative overflow-hidden glow-gold-border flex-shrink-0">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400"></div>
          
          <div className="flex items-center gap-3">
            {/* Avatar Frame */}
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
                src="/assets/images/icons/profile_frame_v2.png"
                alt="Gold Profile Frame"
                className="w-full h-full object-fill absolute inset-0 z-20 pointer-events-none drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)]"
                draggable={false}
              />
            </div>

            {/* Name Banner */}
            <div className="relative w-[110px] h-[30px] z-30 flex items-center justify-center flex-shrink-0">
              <img
                src="/assets/images/icons/name_banner_v2.png"
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
            ONLINE ({mergedFriends.filter((f) => f.isOnline).length})
          </button>
          <button
            onClick={() => setActiveTab("ALL")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all ${
              activeTab === "ALL"
                ? "bg-gradient-to-r from-purple-600 to-indigo-700 text-white shadow-lg border border-purple-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            ALL ({mergedFriends.length})
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
                {/* Gold Frame around Friend's Avatar (clickable to open profile modal) */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFriendProfile(friend);
                  }}
                  className="w-[52px] h-[52px] relative flex-shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                >
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
                    src="/assets/images/icons/profile_frame_v2.png"
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
                      src="/assets/images/icons/name_banner_v2.png"
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
                      <span className="absolute -right-3 top-1 text-[7.5px] px-1 py-0.5 rounded bg-[#1877F2] text-white font-black leading-none select-none z-30 scale-90">
                        FB
                      </span>
                    )}
                  </div>

                  {/* Status & Chat Button side-by-side */}
                  <div className="flex items-center gap-2 pl-1.5 mt-0.5 leading-none">
                    <span className={`text-[9.5px] leading-none font-black ${friend.isOnline ? "text-emerald-400" : "text-gray-400"}`}>
                      {friend.isOnline ? "Online" : "Offline"}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveChatFriend(friend);
                      }}
                      className="text-xs hover:scale-125 active:scale-95 transition-all cursor-pointer border-0 outline-none bg-transparent p-0 flex items-center justify-center"
                      title="Direct Chat"
                    >
                      💬
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onInviteFriend?.(friend.name);
                }}
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
        <button
          onClick={() => {
            setSearchQuery("");
            setSearchResult(null);
            setShowAddModal(true);
          }}
          className="w-full py-3.5 bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 rounded-2xl text-white font-black text-xs tracking-widest uppercase shadow-xl hover:scale-[1.02] active:scale-95 transition-all border border-purple-400 mb-2 flex items-center justify-center gap-2 flex-shrink-0"
        >
          <span>➕</span>
          <span>ADD FRIENDS</span>
        </button>
      </div>

      {/* ── MODAL 1: ADD FRIENDS (SEARCH BY UID / NAME) ── */}
      {showAddModal && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="w-full max-w-[320px] bg-gradient-to-b from-[#2B1440] to-[#12061F] border-2 border-amber-500/70 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.9)] text-white relative animate-in fade-in zoom-in-95 duration-200">
            {/* Top gold bar glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent blur-md"></div>
            
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-black tracking-widest uppercase text-amber-200">Add New Friend</span>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-purple-950/80 border border-amber-500/30 text-amber-200 hover:bg-purple-900 font-bold transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Input card */}
            <div className="bg-purple-950/50 border border-purple-800/60 rounded-2xl p-4 flex flex-col gap-3 mb-4 shadow-inner">
              <span className="text-[9px] font-black text-purple-300 uppercase tracking-wider text-center">Search by Player ID (UID) or Name</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. LUDO-1785 or Roxana"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-3 py-2 bg-[#0C0416] border border-amber-500/35 rounded-xl font-bold text-xs text-amber-200 focus:outline-none focus:border-amber-400 uppercase"
                />
                <button
                  onClick={handleSearchFriend}
                  className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-black text-xs uppercase rounded-xl border border-yellow-300 shadow active:scale-95"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Search results */}
            {searchResult && (
              <div className="bg-[#0C0416]/60 border border-purple-500/20 p-3 rounded-2xl flex justify-between items-center mb-4 animate-fade-in">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-800 flex items-center justify-center text-xs font-black uppercase text-purple-200">
                    {searchResult.name.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-white">{searchResult.name}</span>
                    <span className="text-[8px] text-purple-300">Level {searchResult.level} • {searchResult.status}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    confetti({ particleCount: 30, spread: 40 });
                    triggerToast(`Friend Request Sent to ${searchResult.name}!`);
                    setShowAddModal(false);
                  }}
                  className="px-3 py-1.5 bg-emerald-500 text-white font-black text-[9px] uppercase rounded-lg border border-emerald-300 active:scale-95"
                >
                  Add Friend
                </button>
              </div>
            )}

            {searchQuery && !searchResult && (
              <p className="text-[10px] text-purple-400 italic text-center py-2">Enter query & click search</p>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL 2: DIRECT MESSAGE CHAT WINDOW ── */}
      {activeChatFriend && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="w-full h-full max-h-[500px] max-w-[320px] bg-gradient-to-b from-[#2B1440] to-[#12061F] border-2 border-purple-500/60 rounded-3xl flex flex-col justify-between shadow-2xl relative overflow-hidden animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-black/40 border-b border-purple-500/10 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-purple-800 flex items-center justify-center text-xs font-black text-white">
                  {activeChatFriend.name.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-white leading-none">{activeChatFriend.name}</span>
                  <span className="text-[8px] text-emerald-400 font-bold mt-1">Active Chat</span>
                </div>
              </div>
              <button
                onClick={() => setActiveChatFriend(null)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-purple-950/80 border border-purple-500/20 text-purple-300 font-bold hover:bg-purple-900 transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">
              {(chats[activeChatFriend.id] || []).map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col max-w-[80%] ${msg.sender === "me" ? "ml-auto items-end" : "mr-auto items-start"}`}
                >
                  <div
                    className={`p-2.5 rounded-2xl text-xs leading-normal ${
                      msg.sender === "me"
                        ? "bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-tr-none shadow"
                        : "bg-purple-950/50 border border-purple-800/30 text-purple-200 rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[7px] text-slate-500 font-mono mt-0.5 px-1">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Message input footer */}
            <div className="bg-black/50 p-2 border-t border-purple-500/10 flex gap-2 flex-shrink-0">
              <input
                type="text"
                placeholder="Type a message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSendDM(); }}
                className="flex-1 px-3 py-2 bg-purple-950/60 border border-purple-500/20 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
              />
              <button
                onClick={handleSendDM}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black text-xs uppercase rounded-xl active:scale-95"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: FRIEND PROFILE CARD (COINS, LEVEL, REMOVE, GIFT) ── */}
      {selectedFriendProfile && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="w-full max-w-[290px] bg-gradient-to-b from-[#2B1440] to-[#12061F] border-2 border-amber-500/60 rounded-3xl p-5 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Ornate banner header */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent blur-md"></div>
            
            {/* Header close */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black uppercase text-amber-200 tracking-wider">Player Profile Info</span>
              <button
                onClick={() => setSelectedFriendProfile(null)}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-purple-950/80 border border-amber-500/30 text-amber-200 hover:bg-purple-900 transition-all font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Profile Frame Center Graphic */}
            <div className="flex flex-col items-center gap-3 mb-4 bg-purple-950/30 border border-purple-800/40 p-4 rounded-2xl">
              <div className="w-[84px] h-[84px] relative">
                <div
                  className="absolute rounded-full overflow-hidden bg-slate-900 border border-[#1e0736] z-10"
                  style={{ top: '16%', left: '20%', right: '20%', bottom: '28%' }}
                >
                  <div className="w-full h-full bg-gradient-to-br from-purple-800 to-indigo-900 flex items-center justify-center text-white text-2xl font-black">
                    {selectedFriendProfile.name.charAt(0)}
                  </div>
                </div>
                <img
                  src="/assets/images/icons/profile_frame_v2.png"
                  alt="Gold Profile Frame"
                  className="w-full h-full object-fill absolute inset-0 z-20 pointer-events-none"
                  draggable={false}
                />
              </div>

              {/* Name Banner */}
              <div className="relative w-[110px] h-[30px] z-30 flex items-center justify-center">
                <img
                  src="/assets/images/icons/name_banner_v2.png"
                  alt="Name Banner"
                  className="w-full h-full object-fill absolute inset-0 pointer-events-none"
                  draggable={false}
                />
                <span
                  className="z-10 text-[8.5px] font-black text-amber-200 tracking-wider uppercase translate-x-[-7px] truncate max-w-[75px]"
                  style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
                >
                  {selectedFriendProfile.name}
                </span>
              </div>
            </div>

            {/* Stats display */}
            <div className="bg-[#0C0416]/80 border border-purple-900/60 p-3 rounded-2xl flex flex-col gap-2 mb-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-purple-300 font-bold">Gold Coins balance:</span>
                <span className="text-amber-400 font-black font-mono">💰 {selectedFriendProfile.coins.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-purple-300 font-bold">VIP Level status:</span>
                <span className="text-purple-200 font-black">Level {selectedFriendProfile.level}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-purple-300 font-bold">Status:</span>
                <span className={`font-black ${selectedFriendProfile.isOnline ? "text-emerald-400" : "text-gray-400"}`}>
                  {selectedFriendProfile.isOnline ? "Online" : "Offline"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleSendGift("COINS", 5000)}
                  className="py-2.5 bg-amber-500/10 border border-amber-400 text-amber-300 font-black text-[10px] uppercase rounded-xl hover:bg-amber-500/20 active:scale-95"
                >
                  🎁 Send 5K Coins
                </button>
                <button
                  onClick={() => handleSendGift("GEMS", 50)}
                  className="py-2.5 bg-blue-500/10 border border-blue-400 text-blue-300 font-black text-[10px] uppercase rounded-xl hover:bg-blue-500/20 active:scale-95"
                >
                  🎁 Send 50 Gems
                </button>
              </div>
              <button
                onClick={() => {
                  setFriendsList(prev => prev.filter(f => f.id !== selectedFriendProfile.id));
                  triggerToast(`Removed ${selectedFriendProfile.name} from Friends!`);
                  setSelectedFriendProfile(null);
                }}
                className="w-full py-2 bg-rose-600/10 border border-rose-500/40 text-rose-400 font-black text-[10px] uppercase rounded-xl hover:bg-rose-500/20 active:scale-95"
              >
                Remove Friend
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Alert */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[250] px-4 py-2 bg-gradient-to-r from-purple-800 to-indigo-900 border-2 border-amber-400 text-amber-300 font-bold text-xs tracking-wider rounded-full shadow-2xl whitespace-nowrap animate-bounce">
          ✨ {toastMessage}
        </div>
      )}
    </div>
  );
};
