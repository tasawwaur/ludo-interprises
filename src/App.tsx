import React, { useState, useEffect } from "react";
import { ThemeProvider } from "./app/ThemeContext";
import { SplashScreen } from "./features/splash/SplashScreen";
import { LoginPage } from "./auth/pages/LoginPage";
import { HomePage } from "./features/home/pages/HomePage";
import { MatchmakingPage } from "./features/matchmaking/pages/MatchmakingPage";
import { RoomPage } from "./features/matchmaking/pages/RoomPage";
import { ReadyCheck } from "./features/matchmaking/party/ReadyCheck";
import { GameArenaPage } from "./features/gameplay/pages/GameArenaPage";
import { MatchResultScreen } from "./features/gameplay/pages/MatchResultScreen";
import { SnakeLadderPage } from "./features/snake-ladder/pages/SnakeLadderPage";
import { VIPLoungePage } from "./features/vip-room/pages/VIPHomePage";
import { StreakStarsPage } from "./features/streak-stars/pages/StreakStarsPage";
import { SocialRoomHubPage } from "./features/chat-rooms/pages/SocialRoomHubPage";
import { GLOBAL_PLAYER_DATABASE } from "./store/player-database.store";
import { TournamentPage } from "./features/tournament/pages/TournamentPage";
import { LeaderboardPage } from "./features/leaderboard/pages/LeaderboardPage";
import { ProfilePage } from "./features/profile/pages/ProfilePage";
import { SettingsPage } from "./features/settings/pages/SettingsPage";
import { FriendsPage } from "./features/friends/pages/FriendsPage";
import { RewardsPage } from "./features/rewards/pages/RewardsPage";
import { ShopPage } from "./features/shop/pages/ShopPage";
import { ClubPage } from "./features/club/pages/ClubPage";
import { InventoryPage } from "./features/inventory/pages/InventoryPage";
import { MatchHistoryPage } from "./features/history/pages/MatchHistoryPage";
import { LuckySpinModal } from "./features/events/LuckySpinModal";
import { XPPage } from "./features/xp-level";
import { DicePage } from "./features/dice";
import { RewardCenterPage, AdsSettingsPage } from "./features/ads";
import { useGlobalModalStore, getPlayerProfile } from "./store/global-modal.store";
import { UserProfileModal } from "./components/modal/UserProfileModal";
import { useFriendsStore } from "./store/friends.store";

import { useUserStore } from "./user/user.store";
import { globalSocket } from "./multiplayer/socket/SocketClient";
import { ValidationEngine } from "./game/validation/ValidationEngine";
import { useQueueStore } from "./features/matchmaking/queue/QueueStore";
import { useRoomStore } from "./features/matchmaking/rooms/RoomStore";
import { useGameStore } from "./store/game.store";
import { PlayerColor } from "./game/engine/Engine.types";
import { GlobalCurrencyBar } from "./components/ui/GlobalCurrencyBar";
import confetti from "canvas-confetti";
import { getFrameFilter } from "./store/cosmetics.store";
import { getDefaultAvatar } from "./utils/avatar";

export type AppView =
  | "SPLASH"
  | "AUTH"
  | "HOME"
  | "QUEUE"
  | "ROOM"
  | "GAME_ARENA"
  | "MATCH_RESULT"
  | "TOURNAMENT"
  | "LEADERBOARD"
  | "PROFILE"
  | "SETTINGS"
  | "FRIENDS"
  | "REWARDS"
  | "SHOP"
  | "CLUB"
  | "INVENTORY"
  | "MATCH_HISTORY"
  | "XP_MAIN"
  | "DICE_MAIN"
  | "REWARD_CENTER"
  | "ADS_SETTINGS"
  | "SNAKE_LADDER"
  | "VIP_LOUNGE"
  | "STREAK_STARS"
  | "SOCIAL_ROOMS";

const MainApp: React.FC = () => {
  // Load persisted view if game in progress
  const [currentView, setCurrentView] = useState<AppView>(() => {
    if (typeof window !== "undefined") {
      const savedMatch = localStorage.getItem("ludo_active_match_session");
      if (savedMatch === "GAME_ARENA") return "GAME_ARENA";
      if (savedMatch === "SNAKE_LADDER") return "SNAKE_LADDER";
    }
    return "SPLASH";
  });
  const user = useUserStore((s) => s.user);
  const updateUser = useUserStore((s) => s.updateUser);
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);

  const [isBanned, setIsBanned] = useState(false);
  const [banReasons, setBanReasons] = useState<string[]>([]);

  useEffect(() => {
    const audit = ValidationEngine.performFullSecurityCheck(user?.id || "guest");
    if (audit.bansRequired || ValidationEngine.isBanned()) {
      setIsBanned(true);
      setBanReasons(audit.alerts.length > 0 ? audit.alerts : ["UNSAFE_CLIENT_EXECUTION_ENVIRONMENT"]);
    }
  }, [user]);

  const [showLuckySpin, setShowLuckySpin] = useState(false);
  const [lastRewardedMatchId, setLastRewardedMatchId] = useState<string | null>(null);

  const [activeRequestPopup, setActiveRequestPopup] = useState<{
    id: string;
    senderName: string;
    senderAvatar?: string;
    senderFrame?: string;
    senderLevel: number;
  } | null>(null);

  const [activeLiveQueueInvite, setActiveLiveQueueInvite] = useState<{
    userId: string;
    name: string;
    avatar?: string;
    mode: string;
    entryFee: number;
  } | null>(null);

  const [globalToast, setGlobalToast] = useState<string | null>(null);
  const triggerGlobalToast = (msg: string) => {
    setGlobalToast(msg);
    setTimeout(() => setGlobalToast(null), 3000);
  };

  useEffect(() => {
    if (!user) return;
    
    // Connect globally
    globalSocket.connect();
    
    const socket = globalSocket.socket;
    if (!socket) return;

    const playerName = user.displayName || user.username || "TASAVVUR";
    
    // Register user
    socket.emit("register_user", {
      userId: user.id || "usr_guest_" + Math.floor(Math.random() * 1000),
      username: playerName,
      uid: user.uid,
      avatar: user.avatar,
      equippedFrame: user.equippedFrame,
      level: user.level || 1
    });

    // Listen for live queue alert broadcast
    socket.on("live_queue_alert", (data: any) => {
      if (data && data.userId !== user.id) {
        setActiveLiveQueueInvite({
          userId: data.userId,
          name: data.name,
          avatar: data.avatar,
          mode: data.mode || "Snake & Ladders",
          entryFee: data.entryFee || 5000,
        });
      }
    });

    socket.on("live_queue_cleared", () => {
      setActiveLiveQueueInvite(null);
    });

    // Listen for incoming friend request
    socket.on("incoming_friend_request", (data: any) => {
      useFriendsStore.getState().addFriendRequest({
        id: data.id,
        senderName: data.senderName,
        senderAvatar: data.senderAvatar,
        senderLevel: data.senderLevel,
        senderFrame: data.senderFrame,
        time: data.time || "Just now"
      });
      // Show dynamic popup modal directly on display
      setActiveRequestPopup({
        id: data.id,
        senderName: data.senderName,
        senderAvatar: data.senderAvatar,
        senderFrame: data.senderFrame,
        senderLevel: data.senderLevel || 1
      });
    });

    // Listen for incoming game invite
    socket.on("incoming_game_invite", (data: any) => {
      useFriendsStore.getState().addGameInvite({
        id: data.id,
        senderName: data.senderName,
        senderAvatar: data.senderAvatar,
        mode: data.mode,
        time: data.time || "Just now"
      });
      triggerGlobalToast(`🎮 Match invitation from ${data.senderName}!`);
    });

    // Listen for accepted request
    socket.on("friend_request_accepted", (data: any) => {
      useFriendsStore.getState().addFriend({
        id: data.receiverId,
        name: data.receiverName,
        status: "Online",
        isOnline: true,
        isFB: false,
        avatarUrl: data.receiverAvatar,
        coins: 10000,
        level: data.receiverLevel
      });
      triggerGlobalToast(`🎉 ${data.receiverName} accepted your friend request!`);
    });

    // Listen for incoming direct message
    socket.on("incoming_dm", (data: any) => {
      const friendsList = useFriendsStore.getState().friendsList;
      const matchedFriend = friendsList.find(f => f.name.toLowerCase() === data.senderName.toLowerCase());
      if (matchedFriend) {
        const event = new CustomEvent("new_dm_message", { detail: data });
        window.dispatchEvent(event);
      }
      triggerGlobalToast(`💬 ${data.senderName}: ${data.text}`);
    });

    // Listen for incoming gifts
    socket.on("incoming_gift", (data: { senderName: string; giftType: "COINS" | "GEMS"; amount: number }) => {
      const currentUser = useUserStore.getState().user;
      if (currentUser) {
        if (data.giftType === "COINS") {
          useUserStore.getState().updateUser({ coins: (currentUser.coins || 0) + data.amount });
        } else {
          useUserStore.getState().updateUser({ gems: (currentUser.gems || 0) + data.amount });
        }
        triggerGlobalToast(`🎁 Received ${data.amount.toLocaleString()} ${data.giftType} from ${data.senderName}!`);
        try {
          confetti({ particleCount: 50, spread: 60, colors: ['#FFD700', '#10B981'] });
        } catch (e) {}
      }
    });

    return () => {
      socket.off("incoming_friend_request");
      socket.off("incoming_game_invite");
      socket.off("friend_request_accepted");
      socket.off("incoming_dm");
      socket.off("incoming_gift");
    };
  }, [user]);

  const activeProfilePlayerId = useGlobalModalStore((s) => s.activeProfilePlayerId);
  const closeProfile = useGlobalModalStore((s) => s.closeProfile);
  const { startQueue, cancelQueue } = useQueueStore();
  const { createRoom } = useRoomStore();

  // Save active view state to preserve match across page refresh
  useEffect(() => {
    if (currentView === "GAME_ARENA") {
      localStorage.setItem("ludo_active_match_session", "GAME_ARENA");
    } else if (currentView === "SNAKE_LADDER") {
      localStorage.setItem("ludo_active_match_session", "SNAKE_LADDER");
    } else if ((currentView as string) !== "MATCHMAKING") {
      localStorage.removeItem("ludo_active_match_session");
    }
  }, [currentView]);

  // Dynamic rewards updating hook (Coins, Gems, and XP)
  useEffect(() => {
    if (currentView !== "MATCH_RESULT") return;
    const gState = useGameStore.getState().gameState;
    if (!gState || !user) return;
    if (gState.matchId === lastRewardedMatchId) return;

    setLastRewardedMatchId(gState.matchId);

    const wColor = gState.winnerRankings[0] || "GREEN";
    const localPlayer = gState.players.find((p) => p.isHost || !p.isAi);
    if (!localPlayer) return;

    const isWinner = localPlayer.color === wColor;
    const kills = isWinner ? 3 : 1;
    const passedTokens = localPlayer.tokens.filter(t => t.stepCount === 57).length;
    const xpReward = (passedTokens * 50) + (kills * 10);
    const newXp = (user.xp || 0) + xpReward;

    const entryFee = parseInt(localStorage.getItem("ludo_current_entry_fee") || "5000");
    const winReward = Math.round(entryFee * 1.9); // 2 * entryFee - 5% commission
    const newCoins = isWinner ? (user.coins || 0) + winReward : (user.coins || 0);
    const newGems = isWinner ? (user.gems || 0) + 5 : (user.gems || 0); // Winner gets +5 diamonds, Loser gets +0

    // Check for level up (every 1000 XP)
    let newLevel = user.level || 1;
    let nextXpLimit = user.nextLevelXp || 1000;
    if (newXp >= nextXpLimit) {
      newLevel += 1;
    }

    updateUser({
      xp: newXp,
      coins: newCoins,
      gems: newGems,
      level: newLevel
    });
  }, [currentView, user, lastRewardedMatchId, updateUser]);

  // ✅ Splash ke baad: agar pehle se active match hai to auto-rejoin, warna HOME/AUTH
  const handleSplashFinish = () => {
    const activeMatch = localStorage.getItem("ludo_active_match_session");
    if (activeMatch === "GAME_ARENA") {
      const savedCode = localStorage.getItem("ludo_classic_room_code");
      const savedMembers = localStorage.getItem("ludo_classic_members");
      const savedMode = localStorage.getItem("ludo_classic_mode");
      if (savedCode && savedMembers) {
        useRoomStore.setState({
          roomCode: savedCode,
          members: JSON.parse(savedMembers),
          mode: savedMode || "2P Classic",
          maxPlayers: 2
        });
      }
      setCurrentView("GAME_ARENA");
      return;
    }
    if (activeMatch === "SNAKE_LADDER") {
      setCurrentView("SNAKE_LADDER");
      return;
    }

    // ─── Spectator Join via URL: ?spectate=ROOM_XXXXXX ───────────────────────
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const spectateRoomCode = urlParams.get("spectate");
      if (spectateRoomCode) {
        // Auto-register as guest if not logged in
        let currentUser = useUserStore.getState().user;
        if (!currentUser) {
          const guestNum = Math.floor(1000 + Math.random() * 9000);
          const finalName = `SPECTATOR_${guestNum}`;
          currentUser = {
            id: "usr_spec_" + Math.floor(Math.random() * 1000000),
            username: finalName,
            displayName: finalName,
            email: `${finalName.toLowerCase()}@ludo.enterprise`,
            avatar: "/assets/images/icons/icon_club_crown.png",
            country: "🇮🇳",
            rank: 1,
            coins: 0,
            gems: 0,
            level: 1,
            xp: 0,
            nextLevelXp: 1000,
            loginProvider: 'guest',
          };
          useUserStore.getState().setUser(currentUser);
        }

        // Clean URL
        try {
          const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
          window.history.replaceState({ path: cleanUrl }, "", cleanUrl);
        } catch (e) {}

        // Join as spectator after brief delay for socket to connect
        setTimeout(() => {
          useGameStore.getState().joinAsSpectator(spectateRoomCode);
          setCurrentView("GAME_ARENA");
        }, 1200);
        return;
      }
    }


    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const isAutoMatch = urlParams.get("join") === "true" || urlParams.get("play") === "true" || urlParams.get("autoMatch") === "true";
      if (isAutoMatch) {
        const mode = urlParams.get("mode") || "Snake & Ladders";
        const entryFee = parseInt(urlParams.get("entryFee") || "5000");
        localStorage.setItem("ludo_current_entry_fee", entryFee.toString());

        let currentUser = useUserStore.getState().user;
        const authStatus = useUserStore.getState().isAuthenticated;

        if (!currentUser || !authStatus) {
          // Register as Guest automatically
          const guestNum = Math.floor(1000 + Math.random() * 9000);
          const finalName = `PLAYER_${guestNum}`;
          currentUser = {
            id: "usr_guest_" + Math.floor(Math.random() * 1000000),
            username: finalName,
            displayName: finalName,
            email: `${finalName.toLowerCase()}@ludo.enterprise`,
            avatar: "/assets/images/icons/icon_club_crown.png",
            country: "🇮🇳",
            rank: 1,
            coins: Math.max(20000, entryFee),
            gems: 100,
            level: 5,
            xp: 850,
            nextLevelXp: 1000,
            loginProvider: 'guest',
          };
          useUserStore.getState().setUser(currentUser);
        } else if (currentUser.coins < entryFee) {
          // User cannot afford this entry fee — redirect to HOME instead of giving free coins
          setCurrentView("HOME");
          return;
        }

        // Wait brief moment for globalSocket connect state to complete
        setTimeout(() => {
          startQueue(mode);
          setCurrentView("QUEUE");
        }, 1200);

        // Clear query parameters to avoid infinite queue loops on manual page reloads
        try {
          const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
          window.history.replaceState({ path: cleanUrl }, "", cleanUrl);
        } catch (e) {}
        return;
      }
    }

    if (isAuthenticated) {
      setCurrentView("HOME");
    } else {
      setCurrentView("AUTH");
    }
  };


  // Global Touch/Click Sparkle Effect
  useEffect(() => {
    const handleGlobalTouch = (e: PointerEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;

      confetti({
        particleCount: 7,
        spread: 20,
        origin: { x, y },
        colors: ['#FFD700', '#FFA500', '#FFD54F', '#FFF8DC'], // Luxury Gold palette
        scalar: 0.6,
        ticks: 35,
      });
    };

    window.addEventListener('pointerdown', handleGlobalTouch);
    return () => {
      window.removeEventListener('pointerdown', handleGlobalTouch);
    };
  }, []);

  const handleSelectMode = (selectedMode: string) => {
    if (selectedMode === "Tournament") {
      setCurrentView("TOURNAMENT");
      return;
    }
    if (selectedMode === "VIP Lounge" || selectedMode === "VIP Room") {
      setCurrentView("VIP_LOUNGE");
      return;
    }
    if (selectedMode === "Streak Stars") {
      setCurrentView("STREAK_STARS");
      return;
    }
    if (selectedMode === "Private Table" || selectedMode === "Social Rooms") {
      setCurrentView("SOCIAL_ROOMS");
      return;
    }
    // Check entry fee (5,000 Coins)
    const userCoins = user?.coins ?? 0;
    if (userCoins < 5000) {
      alert("Insufficient Coins");
      setCurrentView("SHOP");
      return;
    }

    startQueue(selectedMode);
    setCurrentView("QUEUE");
  };

  const handleMatchAccepted = () => {
    createRoom("2P Classic", 2, user?.displayName || user?.username || "Govind");
    setCurrentView("ROOM");
  };

  const renderCurrentView = () => {
    if (isBanned) {
      return (
        <div className="absolute inset-0 bg-[#090214] text-white flex flex-col items-center justify-center p-6 z-[1000] border-[4px] border-yellow-500 rounded-[24px]">
          {/* Radial Glowing Background */}
          <div className="absolute w-64 h-64 rounded-full bg-red-600/10 blur-3xl pointer-events-none"></div>

          {/* Golden shield with broken padlock */}
          <div className="text-6xl mb-6 filter drop-shadow-[0_0_15px_rgba(239,68,68,0.7)] animate-pulse">
            🛡️💔
          </div>

          <h2 className="text-xl font-black bg-gradient-to-r from-red-400 via-rose-500 to-red-500 bg-clip-text text-transparent tracking-widest uppercase text-center mb-2 glow-red-text">
            SECURITY VIOLATION
          </h2>
          <span className="text-[9.5px] font-black tracking-wider text-amber-400 uppercase bg-black/40 px-3 py-1 rounded-full border border-red-500/30 mb-6">
            Account Restricted
          </span>

          <div className="w-full bg-black/55 border border-red-500/20 p-4 rounded-2xl flex flex-col gap-3.5 mb-6 text-xs max-h-[160px] overflow-y-auto no-scrollbar shadow-inner">
            <p className="text-[10px] text-purple-200/90 leading-relaxed text-center">
              Your device environment has been flagged for active security violations. Cheating tools, hooking frameworks, or memory patchers are strictly prohibited.
            </p>
            <div className="border-t border-purple-500/15 pt-2 flex flex-col gap-1.5 font-mono text-[9px] text-left text-gray-400">
              <div><span className="text-red-400 font-bold">DEVICE ID:</span> PVA483729</div>
              <div><span className="text-red-400 font-bold">TIMESTAMP:</span> {new Date().toISOString()}</div>
              <div>
                <span className="text-red-400 font-bold">SIGNALS:</span>
                <ul className="list-disc pl-4 mt-1 text-gray-300 flex flex-col gap-0.5">
                  {banReasons.map((r, i) => (
                    <li key={i} className="truncate">{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={() => alert("Your ban appeal has been submitted to the Security Council for review.")}
            className="w-full py-3.5 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-black text-xs tracking-widest uppercase rounded-2xl shadow-lg border border-red-400 active:scale-95 transition-transform cursor-pointer"
          >
            Appeal Restriction
          </button>
        </div>
      );
    }

    switch (currentView) {
      case "SPLASH":
        return <SplashScreen onFinish={handleSplashFinish} />;

      case "AUTH":
        return <LoginPage onSuccessLogin={() => setCurrentView("HOME")} />;

      case "HOME":
        return (
          <HomePage
            onSelectMode={handleSelectMode}
            onOpenView={(v) => setCurrentView(v as AppView)}
          />
        );

      case "QUEUE":
        return (
          <MatchmakingPage
            onCancel={() => {
              cancelQueue();
              setCurrentView("HOME");
            }}
            onMatchFound={(
              opponent?: { name: string; avatar?: string; profileFrame?: string; nameBanner?: string; color?: string; isBot?: boolean; roomCode?: string },
              myColor?: string,
              isHost?: boolean
            ) => {
              // Deduct selected entry fee for Match
              const entryFee = parseInt(localStorage.getItem("ludo_current_entry_fee") || "5000");
              const currentCoins = user?.coins || 20000;
              updateUser({ coins: Math.max(0, currentCoins - entryFee) });
              
              const hostName = user?.displayName || user?.username || "Govind";
              const hostAvatar = user?.avatar || "/assets/images/icons/icon_club_crown.png";
              
              const activeQueueMode = useQueueStore.getState().mode || "2P Classic";

              if (activeQueueMode === "Snake & Ladders") {
                if (opponent) {
                  localStorage.setItem("ludo_sl_opponent", JSON.stringify({ ...opponent, myColor }));
                  localStorage.setItem("ludo_sl_botName", opponent.name);
                } else {
                  localStorage.removeItem("ludo_sl_opponent");
                }
                localStorage.removeItem("ludo_sl_engine_state");
                setCurrentView("SNAKE_LADDER");
                return;
              }

              if (opponent && (opponent as any).is4PlayerBotMatch) {
                // 4-Player Bot Match Fallback — Spawn 3 unique VIP bots from GLOBAL_PLAYER_DATABASE
                const botPool = [...GLOBAL_PLAYER_DATABASE];
                const selectedBots: any[] = [];
                for (let i = 0; i < 3; i++) {
                  const idx = Math.floor(Math.random() * botPool.length);
                  selectedBots.push(botPool[idx]);
                  botPool.splice(idx, 1);
                }

                // Create a 4-Player room with Host as RED, Bots as GREEN, YELLOW, BLUE
                const code = createRoom(
                  activeQueueMode,
                  4, // Max players is 4
                  hostName,
                  hostAvatar,
                  "/assets/images/icons/profile_frame_v3.png",
                  "/assets/images/icons/name_banner_v2.png",
                  "RED"
                );

                // Join Bot 1 (GREEN)
                useRoomStore.getState().joinRoom(
                  code,
                  selectedBots[0].username,
                  selectedBots[0].avatarUrl,
                  "/assets/images/icons/profile_frame_v3.png",
                  "/assets/images/icons/name_banner_v2.png",
                  "GREEN",
                  true
                );

                // Join Bot 2 (YELLOW)
                useRoomStore.getState().joinRoom(
                  code,
                  selectedBots[1].username,
                  selectedBots[1].avatarUrl,
                  "/assets/images/icons/profile_frame_v3.png",
                  "/assets/images/icons/name_banner_v2.png",
                  "YELLOW",
                  true
                );

                // Join Bot 3 (BLUE)
                useRoomStore.getState().joinRoom(
                  code,
                  selectedBots[2].username,
                  selectedBots[2].avatarUrl,
                  "/assets/images/icons/profile_frame_v3.png",
                  "/assets/images/icons/name_banner_v2.png",
                  "BLUE",
                  true
                );

                // ✅ Persist Room details
                localStorage.setItem("ludo_classic_room_code", code);
                localStorage.setItem("ludo_classic_members", JSON.stringify(useRoomStore.getState().members));
                localStorage.setItem("ludo_classic_mode", activeQueueMode);
                localStorage.setItem("ludo_classic_my_color", "RED");

                useGameStore.getState().resetMatch();
                localStorage.removeItem("ludo_classic_engine_state");
                setCurrentView("GAME_ARENA");
                return;
              }

              // Helper to resolve avatars so host and guest never share identical generic fallback images across PCs
              const defaultHostAvatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80";
              const defaultGuestAvatar = "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80";

              const getAvatar = (url?: string, isHostUser: boolean = true) => {
                if (!url || url.startsWith("blob:") || url === "/assets/images/icons/icon_club_crown.png") {
                  return isHostUser ? defaultHostAvatar : defaultGuestAvatar;
                }
                return url;
              };

              const rawHostAvatar = isHost ? hostAvatar : opponent?.avatar;
              const rawGuestAvatar = isHost ? opponent?.avatar : hostAvatar;

              const actualHostName = isHost ? hostName : (opponent?.name || "Player 1");
              const actualHostAvatar = getAvatar(rawHostAvatar, true);
              const actualHostColor = isHost ? (myColor as "RED" | "GREEN" | "YELLOW" | "BLUE") : (opponent?.color as "RED" | "GREEN" | "YELLOW" | "BLUE" || "RED");

              const actualGuestName = isHost ? (opponent?.name || "Player 2") : hostName;
              const actualGuestAvatar = getAvatar(rawGuestAvatar, false);
              const actualGuestColor = isHost ? (opponent?.color as "RED" | "GREEN" | "YELLOW" | "BLUE" || "GREEN") : (myColor as "RED" | "GREEN" | "YELLOW" | "BLUE");

              // ✅ Pass the matchmaking-assigned server roomCode to ensure both clients join the same room!
              const code = createRoom(
                activeQueueMode,
                2,
                actualHostName,
                actualHostAvatar,
                "/assets/images/icons/profile_frame_v3.png",
                "/assets/images/icons/name_banner_v2.png",
                actualHostColor,
                opponent?.roomCode
              );
              
              useRoomStore.getState().joinRoom(
                code,
                actualGuestName,
                actualGuestAvatar,
                "/assets/images/icons/profile_frame_v3.png",
                "/assets/images/icons/name_banner_v2.png",
                actualGuestColor,
                opponent ? opponent.isBot : false
              );

              // ✅ Persist Classic Room details for seamless page refresh recovery
              localStorage.setItem("ludo_classic_room_code", code);
              localStorage.setItem("ludo_classic_members", JSON.stringify(useRoomStore.getState().members));
              localStorage.setItem("ludo_classic_mode", activeQueueMode);
              localStorage.setItem("ludo_classic_my_color", myColor || "RED");

              // Clear any stale persisted game state so fresh colors from matchmaking are used
              useGameStore.getState().resetMatch();
              localStorage.removeItem("ludo_classic_engine_state");
              setCurrentView("GAME_ARENA");
            }}
          />
        );

      case "ROOM":
        return (
          <RoomPage
            onStartGame={() => setCurrentView("GAME_ARENA")}
            onLeave={() => setCurrentView("HOME")}
          />
        );

      case "SNAKE_LADDER":
        return (
          <SnakeLadderPage
            onLeave={() => {
              localStorage.removeItem("ludo_active_match_session");
              localStorage.removeItem("ludo_sl_engine_state");
              setCurrentView("HOME");
            }}
          />
        );

      case "VIP_LOUNGE":
        return (
          <VIPLoungePage
            onBack={() => setCurrentView("HOME")}
            onStartVIPMatch={() => {
              localStorage.setItem("ludo_current_entry_fee", "50000");

              startQueue("VIP Lounge");
              setCurrentView("QUEUE");
            }}
            onSpectateMatch={() => {
              setCurrentView("GAME_ARENA");
            }}
          />
        );

      case "STREAK_STARS":
        return (
          <StreakStarsPage
            onBack={() => setCurrentView("HOME")}
          />
        );

      case "SOCIAL_ROOMS":
        return (
          <SocialRoomHubPage
            onBack={() => setCurrentView("HOME")}
          />
        );

      case "GAME_ARENA":
        return (
          <GameArenaPage
            onLeaveGame={() => {
              localStorage.removeItem("ludo_active_match_session");
              localStorage.removeItem("ludo_classic_room_code");
              localStorage.removeItem("ludo_classic_members");
              localStorage.removeItem("ludo_classic_mode");
              localStorage.removeItem("ludo_classic_my_color");
              
              if (useGameStore.getState().isSpectatorMode) {
                useGameStore.getState().resetMatch();
                setCurrentView("VIP_LOUNGE");
              } else {
                setCurrentView("HOME");
              }
            }}
          />
        );

      case "MATCH_RESULT": {
        const gState = useGameStore.getState().gameState;
        const localUser = useUserStore.getState().user;
        const localAvatar = localUser?.avatar || "";
        const localFrame = "/assets/images/icons/profile_frame_v3.png";

        let winnerName = "Govind";
        let winnerScore = 312;
        let winnerAvatar = "";
        let winnerFrame = "";
        let winnerColor: PlayerColor = "GREEN";
        let winnerKills = 3;
        let winnerPassedTokens = 4;

        let loserName = "Roxana";
        let loserScore = 280;
        let loserAvatar = "";
        let loserFrame = "";
        let loserKills = 1;
        let loserPassedTokens = 2;

        let isLocalPlayerWinner = true;
        const betCoins = parseInt(localStorage.getItem("ludo_current_entry_fee") || "5000");
        const matchStats = useGameStore.getState().matchStats;

        if (gState) {
          const wColor = gState.winnerRankings[0] || "GREEN";
          winnerColor = wColor;
          const wPlayer = gState.players.find((p) => p.color === wColor);
          const lPlayer = gState.players.find((p) => p.color !== wColor);
          const localPlayer = gState.players.find((p) => p.isHost || !p.isAi);

          if (localPlayer) {
            isLocalPlayerWinner = localPlayer.color === wColor;
          }

          if (isLocalPlayerWinner) {
            // Local player is the winner!
            if (wPlayer) {
              winnerName = wPlayer.name;
              winnerScore = wPlayer.tokens.reduce((sum, t) => sum + t.stepCount, 0);
              winnerAvatar = localAvatar || wPlayer.avatar || "";
              winnerFrame = localFrame;
              winnerPassedTokens = matchStats.tokensCompleted;
              winnerKills = matchStats.kills;
            }
            if (lPlayer) {
              loserName = lPlayer.name;
              loserScore = lPlayer.tokens.reduce((sum, t) => sum + t.stepCount, 0);
              loserAvatar = lPlayer.avatar || "";
              loserFrame = lPlayer.profileFrame || "/assets/images/icons/profile_frame_v3.png";
              loserPassedTokens = matchStats.opponentCompleted;
              loserKills = matchStats.opponentKills;
            }
          } else {
            // Local player is the loser (Defeat)
            if (wPlayer) {
              winnerName = wPlayer.name;
              winnerScore = wPlayer.tokens.reduce((sum, t) => sum + t.stepCount, 0);
              winnerAvatar = wPlayer.avatar || "";
              winnerFrame = wPlayer.profileFrame || "/assets/images/icons/profile_frame_v3.png";
              winnerPassedTokens = matchStats.opponentCompleted;
              winnerKills = matchStats.opponentKills;
            }
            if (lPlayer) {
              loserName = lPlayer.name;
              loserScore = lPlayer.tokens.reduce((sum, t) => sum + t.stepCount, 0);
              loserAvatar = localAvatar || lPlayer.avatar || "";
              loserFrame = localFrame;
              loserPassedTokens = matchStats.tokensCompleted;
              loserKills = matchStats.kills;
            }
          }
        }

        return (
          <MatchResultScreen
            winnerName={winnerName}
            winnerScore={winnerScore}
            winnerAvatar={winnerAvatar}
            winnerFrame={winnerFrame}
            winnerColor={winnerColor}
            winnerKills={winnerKills}
            winnerPassedTokens={winnerPassedTokens}
            loserName={loserName}
            loserScore={loserScore}
            loserAvatar={loserAvatar}
            loserFrame={loserFrame}
            loserKills={loserKills}
            loserPassedTokens={loserPassedTokens}
            isLocalPlayerWinner={isLocalPlayerWinner}
            betCoins={betCoins}
            tokensLost={matchStats.tokensLost}
            diceRolls={matchStats.diceRolls}
            sixesCount={matchStats.sixesCount}
            maxConsecutiveSixes={matchStats.maxConsecutiveSixes}
            safeZoneVisits={matchStats.safeZoneVisits}
            consecutiveKills={matchStats.consecutiveKills}
            onPlayAgain={() => {
              useGameStore.getState().resetMatch();
              startQueue("2P Classic");
              setCurrentView("QUEUE");
            }}
            onBackToHome={() => {
              useGameStore.getState().resetMatch();
              setCurrentView("HOME");
            }}
          />
        );
      }

      case "TOURNAMENT":
        return (
          <TournamentPage
            onBack={() => setCurrentView("HOME")}
            onJoinMatch={(mode) => {
              startQueue(mode);
              setCurrentView("QUEUE");
            }}
          />
        );

      case "LEADERBOARD":
        return <LeaderboardPage onBack={() => setCurrentView("HOME")} />;

      case "PROFILE":
        return (
          <ProfilePage
            onBack={() => setCurrentView("HOME")}
            onOpenHistory={() => setCurrentView("MATCH_HISTORY")}
            onLogout={() => setCurrentView("AUTH")}
          />
        );

      case "SETTINGS":
        return (
          <SettingsPage
            onBack={() => setCurrentView("HOME")}
            onLogout={() => setCurrentView("AUTH")}
            onOpenView={(v) => setCurrentView(v as AppView)}
          />
        );

      case "FRIENDS":
        return (
          <FriendsPage
            onBack={() => setCurrentView("HOME")}
            onInviteFriend={(friend) => {
              const socket = globalSocket.socket;
              if (socket && socket.connected) {
                socket.emit("send_game_invite", {
                  senderName: user?.displayName || user?.username || "TASAVVUR",
                  senderAvatar: user?.avatar,
                  mode: "LUDO CLASSIC 2P",
                  targetId: friend.id,
                  targetName: friend.name
                });
                triggerGlobalToast(`Sent match invitation to ${friend.name}!`);
              } else {
                alert(`Invite link sent to ${friend.name}!`);
              }
            }}
          />
        );

      case "REWARDS":
        return <RewardsPage onBack={() => setCurrentView("HOME")} />;

      case "SHOP":
        return <ShopPage onBack={() => setCurrentView("HOME")} />;

      case "CLUB":
        return <ClubPage onBack={() => setCurrentView("HOME")} />;

      case "INVENTORY":
        return (
          <InventoryPage
            onBack={() => setCurrentView("HOME")}
            onOpenDiceWorkshop={() => setCurrentView("DICE_MAIN")}
          />
        );

      case "MATCH_HISTORY":
        return <MatchHistoryPage onBack={() => setCurrentView("PROFILE")} />;

      case "XP_MAIN":
        return <XPPage onBack={() => setCurrentView("HOME")} />;

      case "DICE_MAIN":
        return <DicePage onBack={() => setCurrentView("HOME")} />;

      case "REWARD_CENTER":
        return <RewardCenterPage onBack={() => setCurrentView("HOME")} />;

      case "ADS_SETTINGS":
        return <AdsSettingsPage onBack={() => setCurrentView("HOME")} />;

      default:
        return <HomePage onSelectMode={handleSelectMode} onOpenView={(v) => setCurrentView(v as AppView)} />;
    }
  };

  return (
    <div className="bg-[#090214] min-h-screen w-full text-white select-none flex justify-center items-center font-sans overflow-x-hidden">
      {/* Outer wrapper that holds the phone mockup on desktop, full screen on mobile */}
      <div className="relative w-full h-screen sm:w-[370px] sm:h-[650px] flex items-center justify-center">
        {/* Golden Phone Frame Image on Desktop */}
        <img
          src="/assets/images/luxury_phone_frame.png"
          alt="Phone Frame"
          className="hidden sm:block absolute inset-0 w-full h-full object-fill z-50 pointer-events-none"
        />
        
        {/* The inner screen content area (exactly 9:16 aspect ratio on desktop) */}
        <div className="w-full h-full sm:w-[92%] sm:h-[93%] relative overflow-hidden flex flex-col justify-between bg-[#12061F] sm:rounded-[24px]">
          {renderCurrentView()}

          {/* ✅ Global Currency Bar — har page pe same values dikhein */}
          {currentView !== 'AUTH' && currentView !== 'SPLASH' && currentView !== 'HOME' && (
            <GlobalCurrencyBar onOpenShop={() => setCurrentView('SHOP')} />
          )}

          {/* Modals */}
          {/* <ReadyCheck onMatchAccepted={handleMatchAccepted} /> */}
          <LuckySpinModal
            isOpen={showLuckySpin}
            onClose={() => setShowLuckySpin(false)}
            onSpinWin={(reward) => alert(`Congratulations! You won ${reward}`)}
          />

          {/* Global User Profile Modal Overlay */}
          {activeProfilePlayerId && (() => {
            const profile = getPlayerProfile(activeProfilePlayerId);
            if (!profile) return null;
            return (
              <UserProfileModal
                userStats={profile}
                onClose={closeProfile}
                isMe={profile.id === user?.id || profile.id === user?.uid}
                isFriend={useFriendsStore.getState().friendsList.some(
                  f => f.id === profile.id || f.name.toLowerCase() === profile.name.toLowerCase()
                )}
                onRemoveFriend={() => {
                  useFriendsStore.getState().removeFriend(profile.id);
                  closeProfile();
                  triggerGlobalToast(`Removed ${profile.name} from buddies.`);
                }}
                onAddFriend={() => {
                  const socket = globalSocket.socket;
                  if (socket && socket.connected) {
                    socket.emit("send_friend_request", {
                      senderId: user?.id || "usr_guest_" + Math.floor(Math.random() * 1000),
                      senderName: user?.displayName || user?.username || "TASAVVUR",
                      senderAvatar: user?.avatar,
                      senderFrame: user?.equippedFrame,
                      senderLevel: user?.level || 1,
                      targetName: profile.name
                    });
                    triggerGlobalToast(`Friend request sent to ${profile.name}!`);
                  } else {
                    useFriendsStore.getState().addFriend({
                      id: profile.id,
                      name: profile.name,
                      status: 'Online',
                      isOnline: true,
                      isFB: false,
                      avatarUrl: profile.avatarUrl,
                      coins: profile.currentGold,
                      level: profile.level
                    });
                    triggerGlobalToast(`Added ${profile.name} to buddies.`);
                  }
                }}
                onSendGift={(type, amount) => {
                  if (!user) return;
                  const currentCoins = user.coins || 0;
                  const currentGems = user.gems || 0;

                  if (type === "COINS" && currentCoins < amount) {
                    triggerGlobalToast("❌ Insufficient Coins!");
                    return;
                  }
                  if (type === "GEMS" && currentGems < amount) {
                    triggerGlobalToast("❌ Insufficient Gems!");
                    return;
                  }

                  if (type === "COINS") {
                    updateUser({ coins: currentCoins - amount });
                  } else {
                    updateUser({ gems: currentGems - amount });
                  }

                  const socket = globalSocket.socket;
                  if (socket && socket.connected) {
                    socket.emit("send_gift", {
                      senderName: user.displayName || user.username || "TASAVVUR",
                      targetId: profile.id,
                      targetName: profile.name,
                      giftType: type,
                      amount: amount
                    });
                  }

                  try {
                    confetti({ particleCount: 40, spread: 50, colors: ['#9333EA', '#FFD700'] });
                  } catch (e) {}
                  triggerGlobalToast(`🎁 Gifted ${amount.toLocaleString()} ${type} to ${profile.name}!`);
                  closeProfile();
                }}
              />
            );
          })()}
          {/* Incoming Friend Request Popup */}
          {activeRequestPopup && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
              <div className="w-[280px] bg-gradient-to-b from-[#2E0B4E] to-[#12061F] border-[2.5px] border-amber-400 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.95)] text-center relative animate-in zoom-in-95 duration-200">
                <span className="text-3xl mb-1.5 block">👤➕</span>
                <h3 className="text-xs font-black text-amber-200 uppercase tracking-widest mb-1">Friend Request</h3>
                <p className="text-[9px] text-purple-300 mb-4 uppercase">Incoming request from</p>
                
                <div className="flex items-center gap-3 bg-black/45 p-3 rounded-2xl border border-purple-500/20 mb-5 text-left">
                  <div className="w-12 h-12 relative flex-shrink-0">
                    <div
                      className="absolute rounded-full overflow-hidden bg-slate-900 z-10"
                      style={{ top: '16%', left: '20%', right: '20%', bottom: '28%' }}
                    >
                      <img src={activeRequestPopup.senderAvatar || getDefaultAvatar(activeRequestPopup.id)} alt="" className="w-full h-full object-cover" />
                    </div>
                    <img
                      src="/assets/images/icons/profile_frame_v3.png"
                      alt=""
                      className="w-full h-full object-fill absolute inset-0 z-20 pointer-events-none"
                      style={{ filter: getFrameFilter(activeRequestPopup.senderFrame) }}
                      draggable={false}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-white">{activeRequestPopup.senderName}</span>
                    <span className="text-[8px] text-purple-200 font-bold">Level {activeRequestPopup.senderLevel}</span>
                  </div>
                </div>

                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => {
                      useFriendsStore.getState().acceptRequest(activeRequestPopup.id);
                      
                      const socket = globalSocket.socket;
                      if (socket && socket.connected) {
                        socket.emit("accept_friend_request", {
                          senderName: activeRequestPopup.senderName,
                          receiverId: user?.id || "usr_guest",
                          receiverName: user?.displayName || user?.username || "TASAVVUR",
                          receiverAvatar: user?.avatar,
                          receiverFrame: user?.equippedFrame,
                          receiverLevel: user?.level || 1
                        });
                      }
                      
                      confetti({ particleCount: 30, spread: 40 });
                      setActiveRequestPopup(null);
                      triggerGlobalToast(`Accepted ${activeRequestPopup.senderName}!`);
                    }}
                    className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white border border-emerald-300 font-black text-[10px] uppercase rounded-xl transition-all cursor-pointer shadow-md"
                  >
                    ✔️ Accept
                  </button>
                  <button
                    onClick={() => {
                      useFriendsStore.getState().declineRequest(activeRequestPopup.id);
                      setActiveRequestPopup(null);
                      triggerGlobalToast(`Declined request`);
                    }}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-gray-400 border border-slate-700 font-bold text-[10px] uppercase rounded-xl transition-all cursor-pointer"
                  >
                    ✕ Decline
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Live Queue Floating Request Banner */}
          {activeLiveQueueInvite && currentView !== "QUEUE" && currentView !== "SNAKE_LADDER" && currentView !== "GAME_ARENA" && (
            <div className="absolute top-[12px] left-1/2 -translate-x-1/2 z-[9999] w-[94%] max-w-[390px] bg-gradient-to-r from-amber-950 via-purple-950 to-amber-950 border-2 border-amber-400 rounded-2xl p-3 shadow-[0_0_30px_rgba(245,158,11,0.9)] flex items-center justify-between animate-bounce">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-3 h-3 bg-emerald-400 rounded-full animate-ping flex-shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-black text-amber-200 uppercase tracking-wider truncate">
                    ⚡ {activeLiveQueueInvite.name} IS WAITING!
                  </span>
                  <span className="text-[9px] font-bold text-emerald-300 uppercase">
                    {activeLiveQueueInvite.mode} • {activeLiveQueueInvite.entryFee >= 1000 ? activeLiveQueueInvite.entryFee / 1000 + "K" : activeLiveQueueInvite.entryFee} Coins
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  localStorage.setItem("ludo_current_entry_fee", activeLiveQueueInvite.entryFee.toString());
                  const modeToJoin = activeLiveQueueInvite.mode;
                  setActiveLiveQueueInvite(null);
                  startQueue(modeToJoin);
                  setCurrentView("QUEUE");
                }}
                className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-[10px] uppercase px-3 py-2 rounded-xl shadow-lg border border-yellow-200 hover:scale-105 active:scale-95 transition-transform flex-shrink-0 cursor-pointer"
              >
                PLAY NOW ➜
              </button>
            </div>
          )}

          {/* Global Toast */}
          {globalToast && (
            <div className="absolute top-[85px] left-1/2 -translate-x-1/2 bg-purple-950/95 border-2 border-purple-500/80 px-5 py-3 rounded-2xl text-[10px] text-amber-200 font-black shadow-[0_4px_20px_rgba(0,0,0,0.85)] z-[9999] animate-bounce uppercase tracking-widest text-center min-w-[200px]">
              {globalToast}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}
