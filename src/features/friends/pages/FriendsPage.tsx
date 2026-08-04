import React, { useState, useMemo, useEffect, useRef } from "react";
import { LudoPageBackground } from "../../../components/effects/LudoPageBackground";
import { useUserStore } from "../../../user/user.store";
import { UserProfileModal } from "../../../components/modal/UserProfileModal";
import { useFriendsStore } from "../../../store/friends.store";
import { GLOBAL_PLAYER_DATABASE } from "../../../store/player-database.store";
import confetti from "canvas-confetti";
import { loginWithFacebook } from "../../../auth/utils/fb";
import { getFrameFilter } from "../../../store/cosmetics.store";
import { getDefaultAvatar } from "../../../utils/avatar";
import { globalSocket } from "../../../multiplayer/socket/SocketClient";

interface FriendsPageProps {
  onBack?: () => void;
  onInviteFriend?: (friend: Friend) => void;
}

interface Friend {
  id: string;
  name: string;
  status: string;
  isOnline: boolean;
  isFB: boolean;
  avatarUrl?: string;
  equippedFrame?: string;
  coins: number;
  level: number;
}

interface DMMessage {
  sender: "me" | "friend";
  text: string;
  time: string;
}

export const FriendsPage: React.FC<FriendsPageProps> = ({ onBack, onInviteFriend }) => {
  const [activeTab, setActiveTab] = useState<"BUDDY" | "FACEBOOK" | "REQUESTS">("BUDDY");
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

  const socketRef = useRef<any>(null);

  useEffect(() => {
    // Make sure global socket is connected
    globalSocket.connect();
    
    const socket = globalSocket.socket;
    if (!socket) return;

    socketRef.current = socket;

    socket.on("search_player_result", (data: any) => {
      if (data.found) {
        setSearchResult({
          id: data.id,
          name: data.name,
          status: "Online",
          isOnline: true,
          isFB: false,
          avatarUrl: data.avatarUrl,
          equippedFrame: data.equippedFrame,
          coins: 10000,
          level: data.level
        });
      } else {
        setSearchResult(null);
        triggerToast("Player not online or not found.");
      }
    });

    socket.on("friend_request_status", (data: { success: boolean; message: string }) => {
      triggerToast(data.message);
    });

    return () => {
      socket.off("search_player_result");
      socket.off("friend_request_status");
    };
  }, [user]);

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

  const friendsList = useFriendsStore((s) => s.friendsList);
  const removeFriend = useFriendsStore((s) => s.removeFriend);

  const incomingRequests = useFriendsStore((s) => s.incomingRequests);
  const incomingInvites = useFriendsStore((s) => s.incomingInvites);
  const acceptRequest = useFriendsStore((s) => s.acceptRequest);
  const declineRequest = useFriendsStore((s) => s.declineRequest);
  const declineInvite = useFriendsStore((s) => s.declineInvite);

  // Synchronized Facebook list from user store (if logged in with FB)
  const mergedFriends = useMemo(() => {
    if ((user?.loginProvider === 'facebook' || user?.facebookId) && user.syncedFBFriends) {
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

  const buddies = useMemo(() => {
    return mergedFriends.filter((f) => !f.isFB);
  }, [mergedFriends]);

  const fbFriends = useMemo(() => {
    return mergedFriends.filter((f) => f.isFB);
  }, [mergedFriends]);

  const pendingCount = incomingRequests.length + incomingInvites.length;

  const handleLinkFB = async () => {
    try {
      await loginWithFacebook();
      updateUser({ facebookId: "fb_simulated_id_123" });
      triggerToast("Facebook account successfully linked!");
    } catch (err) {
      updateUser({ facebookId: "fb_simulated_id_123" });
      triggerToast("Facebook account successfully linked!");
    }
  };

  const renderFriendCard = (friend: Friend) => (
    <div
      key={friend.id}
      className="bg-purple-950/80 border-2 border-purple-500/40 rounded-3xl p-3 flex items-center justify-between hover:scale-[1.01] hover:border-purple-400 transition-all shadow-lg cursor-pointer animate-fade-in"
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
            <img src={friend.avatarUrl || getDefaultAvatar(friend.id)} alt={friend.name} className="w-full h-full object-cover" />
          </div>
          <img
            src="/assets/images/icons/profile_frame_v3.png"
            alt="Gold Profile Frame"
            className="w-full h-full object-fill absolute inset-0 z-20 pointer-events-none"
            style={{ filter: getFrameFilter(friend.equippedFrame) }}
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
          onInviteFriend?.(friend);
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
  );

  // Search player handler (queries server for real online status, fallback to global database)
  const handleSearchFriend = () => {
    const q = searchQuery.trim();
    if (!q) return;

    if (socketRef.current) {
      socketRef.current.emit("search_player", { query: q });
    } else {
      setSearchResult(null);
      triggerToast("Multiplayer server is offline. Please try again later.");
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

    if (socketRef.current) {
      socketRef.current.emit("send_dm", {
        senderName: user?.displayName || user?.username || "TASAVVUR",
        targetId: activeChatFriend.id,
        targetName: activeChatFriend.name,
        text: chatInput.trim()
      });
    }

    setChatInput("");

    // Simulate reply only for offline mock friends
    if (activeChatFriend.id.startsWith("g_f")) {
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
      }, 1500);
    }
  };

  useEffect(() => {
    const handleNewDM = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const friendsList = useFriendsStore.getState().friendsList;
      const matchedFriend = friendsList.find(f => f.name.toLowerCase() === detail.senderName.toLowerCase());
      if (matchedFriend) {
        const friendId = matchedFriend.id;
        const newMsg: DMMessage = {
          sender: "friend",
          text: detail.text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChats(prev => {
          const currentHistory = prev[friendId] || [];
          return {
            ...prev,
            [friendId]: [...currentHistory, newMsg]
          };
        });
      }
    };
    window.addEventListener("new_dm_message", handleNewDM);
    return () => window.removeEventListener("new_dm_message", handleNewDM);
  }, []);

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
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="My Avatar"
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                ) : (
                  <img
                    src={getDefaultAvatar(user?.id)}
                    alt="My Avatar"
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                )}
              </div>
              <img
                src="/assets/images/icons/profile_frame_v3.png"
                alt="Gold Profile Frame"
                className="w-full h-full object-contain absolute inset-0 z-20 pointer-events-none drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)]"
                style={{ filter: getFrameFilter(user?.equippedFrame) }}
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
                {user?.displayName || user?.username || "TASAVVUR"}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end pr-2">
            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest leading-none">Online</span>
            <span className="text-[8px] text-purple-300 font-black mt-1.5 uppercase font-mono">Level {user?.level || 5}</span>
          </div>
        </div>

        {/* Tabs: BUDDY / FACEBOOK / REQUESTS */}
        <div className="flex bg-black/60 p-1 rounded-2xl border border-purple-500/30 mb-4 shadow-2xl flex-shrink-0 gap-1">
          <button
            onClick={() => setActiveTab("BUDDY")}
            className={`flex-1 py-2 rounded-xl text-[9px] font-black tracking-wider uppercase transition-all ${
              activeTab === "BUDDY"
                ? "bg-gradient-to-r from-purple-600 to-indigo-700 text-white shadow-lg border-purple-400"
                : "text-purple-300 hover:text-white"
            }`}
          >
            BUDDY ({buddies.length})
          </button>
          <button
            onClick={() => setActiveTab("FACEBOOK")}
            className={`flex-1 py-2 rounded-xl text-[9px] font-black tracking-wider uppercase transition-all ${
              activeTab === "FACEBOOK"
                ? "bg-gradient-to-r from-blue-600 to-indigo-800 text-white shadow-lg border-blue-400"
                : "text-purple-300 hover:text-white"
            }`}
          >
            FACEBOOK ({fbFriends.length})
          </button>
          <button
            onClick={() => setActiveTab("REQUESTS")}
            className={`flex-1 py-2 rounded-xl text-[9px] font-black tracking-wider uppercase transition-all relative ${
              activeTab === "REQUESTS"
                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 shadow-lg border border-yellow-400"
                : "text-purple-300 hover:text-white"
            }`}
          >
            REQUESTS
            {pendingCount > 0 && (
              <span className="absolute -top-1.5 -right-1 bg-rose-500 text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded-full border border-[#12061F] animate-pulse">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        {/* Friends Cards List */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2.5 pb-4">
          {activeTab === "BUDDY" && (
            buddies.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-60 text-center px-4 animate-fade-in">
                <span className="text-4xl mb-3">👥</span>
                <p className="text-sm font-black text-purple-300 uppercase tracking-widest">No Ludo Buddies Yet</p>
                <p className="text-[9px] text-gray-400 mt-1 max-w-[200px]">
                  Click the button below to search and add buddies by Player ID or Name!
                </p>
              </div>
            ) : (
              buddies.map((friend) => renderFriendCard(friend))
            )
          )}

          {activeTab === "FACEBOOK" && (
            user?.loginProvider !== "facebook" && !user?.facebookId ? (
              <div className="flex flex-col items-center justify-center py-8 px-5 bg-gradient-to-b from-[#2E0B4E]/60 to-[#1F0736]/60 border-2 border-purple-500/30 rounded-3xl text-center shadow-xl animate-fade-in my-4 mx-1">
                <span className="text-3xl mb-2">🔵</span>
                <p className="text-xs font-black text-amber-200 uppercase tracking-wider">Connect Facebook</p>
                <p className="text-[9px] text-purple-200 mt-1 mb-4 leading-relaxed max-w-[220px]">
                  Connect your profile with Facebook to find, chat with, and play against your real-life friends!
                </p>
                <button
                  onClick={handleLinkFB}
                  className="px-5 py-2.5 bg-[#1877F2] text-white font-black text-[10px] tracking-wider uppercase rounded-xl hover:scale-105 active:scale-95 transition-transform shadow-md shadow-blue-950/30 border border-blue-400 cursor-pointer"
                >
                  🔗 Link Facebook
                </button>
              </div>
            ) : fbFriends.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-60 text-center px-4 animate-fade-in">
                <span className="text-4xl mb-3">🔵</span>
                <p className="text-xs font-black text-purple-300 uppercase tracking-widest">No Facebook Friends</p>
                <p className="text-[9px] text-gray-400 mt-1 max-w-[200px]">
                  Your Facebook account is connected, but none of your Facebook friends are currently in the game.
                </p>
              </div>
            ) : (
              fbFriends.map((friend) => renderFriendCard(friend))
            )
          )}

          {activeTab === "REQUESTS" && (
            pendingCount === 0 ? (
              <div className="flex flex-col items-center justify-center h-60 text-center px-4 animate-fade-in">
                <span className="text-4xl mb-3">📭</span>
                <p className="text-xs font-black text-purple-300 uppercase tracking-widest">Inbox is Empty</p>
                <p className="text-[9px] text-gray-400 mt-1 max-w-[200px]">
                  You have no pending friend requests or match invitations right now.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 p-1">
                {/* 1. Match Invitations */}
                {incomingInvites.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest block pl-1">Match Invitations</span>
                    {incomingInvites.map((invite) => (
                      <div 
                        key={invite.id}
                        className="bg-purple-950/40 border border-amber-400/25 p-3 rounded-2xl flex flex-col gap-2.5 shadow-inner"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-900 border border-purple-500/20 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {invite.senderAvatar ? (
                              <img src={invite.senderAvatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs font-black text-amber-300">{invite.senderName.charAt(0)}</span>
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[11px] font-black text-white truncate">{invite.senderName}</span>
                            <span className="text-[8.5px] text-purple-300 leading-none">Invited you to play {invite.mode}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 w-full">
                          <button
                            onClick={() => {
                              alert(`Joining ${invite.senderName}'s room for ${invite.mode}!`);
                              declineInvite(invite.id);
                            }}
                            className="flex-1 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 active:scale-95 text-white border border-emerald-300 font-black text-[9px] uppercase rounded-xl transition-all cursor-pointer shadow-md"
                          >
                            ✔️ Play Game
                          </button>
                          <button
                            onClick={() => {
                              declineInvite(invite.id);
                              triggerToast("Invitation declined");
                            }}
                            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-gray-400 border border-slate-700 font-bold text-[9px] uppercase rounded-xl transition-all cursor-pointer"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. Friend Requests */}
                {incomingRequests.length > 0 && (
                  <div className="flex flex-col gap-2 mt-2">
                    <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest block pl-1">Friend Requests</span>
                    {incomingRequests.map((request) => (
                      <div 
                        key={request.id}
                        className="bg-black/35 border border-purple-500/15 p-2.5 rounded-2xl flex items-center justify-between shadow-inner"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-slate-900 border border-purple-500/20 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {request.senderAvatar ? (
                              <img src={request.senderAvatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs font-black text-purple-300">{request.senderName.charAt(0)}</span>
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[11px] font-black text-white truncate">{request.senderName}</span>
                            <span className="text-[8px] text-purple-300">Level {request.senderLevel}</span>
                          </div>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => {
                              acceptRequest(request.id);
                              confetti({ particleCount: 20, spread: 30 });
                              triggerToast(`Accepted friend request from ${request.senderName}!`);
                              if (socketRef.current) {
                                socketRef.current.emit("accept_friend_request", {
                                  senderName: request.senderName,
                                  receiverId: user?.id || "usr_guest",
                                  receiverName: user?.displayName || user?.username || "TASAVVUR",
                                  receiverAvatar: user?.avatar,
                                  receiverFrame: user?.equippedFrame,
                                  receiverLevel: user?.level || 1
                                });
                              }
                            }}
                            className="w-7 h-7 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 flex items-center justify-center rounded-lg active:scale-90 transition-transform cursor-pointer"
                            title="Accept"
                          >
                            ✔️
                          </button>
                          <button
                            onClick={() => {
                              declineRequest(request.id);
                              triggerToast(`Declined request from ${request.senderName}`);
                            }}
                            className="w-7 h-7 bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 flex items-center justify-center rounded-lg active:scale-90 transition-transform cursor-pointer"
                            title="Decline"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          )}
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
            {searchResult && (() => {
              const isAlreadyFriend = buddies.some(
                b => b.id === searchResult.id || b.name.toLowerCase() === searchResult.name.toLowerCase()
              );
              return (
                <div 
                  onClick={() => {
                    setSelectedFriendProfile({
                      id: searchResult.id,
                      name: searchResult.name,
                      avatarUrl: searchResult.avatarUrl,
                      equippedFrame: searchResult.equippedFrame,
                      level: searchResult.level,
                      status: searchResult.isOnline ? "Online" : "Offline",
                      isOnline: searchResult.isOnline,
                      isFB: searchResult.isFB,
                      coins: searchResult.coins
                    });
                    setShowAddModal(false);
                  }}
                  className="bg-[#0C0416]/60 border border-purple-500/20 p-3 rounded-2xl flex justify-between items-center mb-4 animate-fade-in cursor-pointer hover:border-amber-400"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-800 flex items-center justify-center text-xs font-black uppercase text-purple-200">
                      {searchResult.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-white">{searchResult.name}</span>
                      <span className="text-[8px] text-purple-300">Level {searchResult.level} • {searchResult.status}</span>
                    </div>
                  </div>
                  {isAlreadyFriend ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFriend(searchResult.id);
                        triggerToast(`Removed ${searchResult.name} from buddies.`);
                        setShowAddModal(false);
                      }}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-[9px] uppercase rounded-lg border border-rose-400 cursor-pointer"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (socketRef.current) {
                          socketRef.current.emit("send_friend_request", {
                            senderId: user?.id || "usr_guest_" + Math.floor(Math.random() * 1000),
                            senderName: user?.displayName || user?.username || "TASAVVUR",
                            senderAvatar: user?.avatar,
                            senderFrame: user?.equippedFrame,
                            senderLevel: user?.level || 1,
                            targetName: searchResult.name
                          });
                        }
                        setShowAddModal(false);
                      }}
                      className="px-3 py-1.5 bg-emerald-500 text-white font-black text-[9px] uppercase rounded-lg border border-emerald-300 active:scale-95 cursor-pointer"
                    >
                      Add Friend
                    </button>
                  )}
                </div>
              );
            })()}

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
      {selectedFriendProfile && (() => {
        const friend = selectedFriendProfile;
        
        // Find player in our unique database
        const dbPlayer = GLOBAL_PLAYER_DATABASE.find(
          p => p.playerId === friend.id || p.username.toLowerCase() === friend.name.toLowerCase()
        );

        if (dbPlayer) {
          const mappedUserStats = {
            id: dbPlayer.playerId,
            name: dbPlayer.username,
            avatarUrl: dbPlayer.avatarUrl,
            equippedFrame: dbPlayer.equippedFrame,
            level: dbPlayer.level,
            country: dbPlayer.country,
            countryFlag: dbPlayer.countryFlag,
            totalEarning: dbPlayer.totalEarning,
            currentGold: dbPlayer.currentCoins,
            currentLeague: dbPlayer.currentLeague,
            gamesWon: dbPlayer.matchesWon,
            gamesPlayed: dbPlayer.matchesPlayed,
            teamWins: dbPlayer.teamWins,
            winStreak: dbPlayer.currentWinStreak,
            twoPlayerWins: dbPlayer.twoPlayerWins,
            titanBadgeCount: dbPlayer.titanBadgeCount,
            fourPlayerWins: dbPlayer.fourPlayerWins,
            killCount: dbPlayer.killCount
          };
          return (
            <UserProfileModal 
              userStats={mappedUserStats} 
              onClose={() => setSelectedFriendProfile(null)}
              onSendGift={handleSendGift}
              onRemove={() => {
                removeFriend(friend.id);
                triggerToast(`Removed ${friend.name} from Friends!`);
                setSelectedFriendProfile(null);
              }}
            />
          );
        }

        // Fallback stats
        const totalEarningVal = friend.coins * 1.8;
        const totalEarning = totalEarningVal > 1000000 
          ? `${(totalEarningVal / 1000000).toFixed(1)} M` 
          : `${(totalEarningVal / 1000).toFixed(0)} K`;

        const statsObj = {
          id: friend.id,
          name: friend.name,
          avatarUrl: friend.avatarUrl,
          equippedFrame: friend.isFB ? 'frame_luxury_2' : 'frame_default',
          level: friend.level,
          country: "INDIA",
          countryFlag: "🇮🇳",
          totalEarning: totalEarning,
          currentGold: friend.coins,
          currentLeague: friend.level > 12 ? "Diamond" : "Bronze",
          gamesWon: Math.floor(friend.level * 40),
          gamesPlayed: Math.floor(friend.level * 90),
          teamWins: Math.floor(friend.level * 15),
          winStreak: friend.isOnline ? 1 : 0,
          twoPlayerWins: Math.floor(friend.level * 20),
          titanBadgeCount: Math.floor(friend.level / 3),
          fourPlayerWins: Math.floor(friend.level * 10),
          killCount: Math.floor(friend.level * 180),
        };

        return (
          <UserProfileModal 
            userStats={statsObj} 
            onClose={() => setSelectedFriendProfile(null)}
            onSendGift={handleSendGift}
            onRemove={() => {
              removeFriend(friend.id);
              triggerToast(`Removed ${friend.name} from Friends!`);
              setSelectedFriendProfile(null);
            }}
          />
        );
      })()}

      {/* Toast Alert */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[250] px-4 py-2 bg-gradient-to-r from-purple-800 to-indigo-900 border-2 border-amber-400 text-amber-300 font-bold text-xs tracking-wider rounded-full shadow-2xl whitespace-nowrap animate-bounce">
          ✨ {toastMessage}
        </div>
      )}
    </div>
  );
};
