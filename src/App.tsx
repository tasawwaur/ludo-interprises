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
  | "SNAKE_LADDER";

const MainApp: React.FC = () => {
  // Load persisted view if game in progress
  const [currentView, setCurrentView] = useState<AppView>(() => {
    if (typeof window !== "undefined") {
      const savedMatch = localStorage.getItem("ludo_active_match_session");
      if (savedMatch === "GAME_ARENA") return "GAME_ARENA";
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
    } else {
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
    const newCoins = isWinner ? (user.coins || 0) + 10000 : (user.coins || 0); // Net +5,000 on win, net -5,000 on loss (since 5k was already deducted at start)
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
      setCurrentView("GAME_ARENA");
      return;
    }
    if (activeMatch === "SNAKE_LADDER") {
      setCurrentView("SNAKE_LADDER");
      return;
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
      setCurrentView("SHOP");
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
              opponent?: { name: string; avatar?: string; profileFrame?: string; nameBanner?: string; color?: string; isBot?: boolean },
              myColor?: string,
              isHost?: boolean
            ) => {
              // Deduct 5,000 coins entry fee for 2P Match
              const currentCoins = user?.coins || 20000;
              updateUser({ coins: Math.max(0, currentCoins - 5000) });
              
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

              // Determine the room members in a consistent order on both screens (real host first, guest second)
              const actualHostName = isHost ? hostName : (opponent?.name || "Player 1");
              const actualHostAvatar = isHost ? hostAvatar : (opponent?.avatar || "/assets/images/icons/icon_club_crown.png");
              const actualHostColor = isHost ? (myColor as "RED" | "GREEN" | "YELLOW" | "BLUE") : (opponent?.color as "RED" | "GREEN" | "YELLOW" | "BLUE" || "RED");

              const actualGuestName = isHost ? (opponent?.name || "Player 2") : hostName;
              const actualGuestAvatar = isHost ? (opponent?.avatar || "/assets/images/icons/icon_club_crown.png") : hostAvatar;
              const actualGuestColor = isHost ? (opponent?.color as "RED" | "GREEN" | "YELLOW" | "BLUE" || "GREEN") : (myColor as "RED" | "GREEN" | "YELLOW" | "BLUE");

              const code = createRoom(
                activeQueueMode,
                2,
                actualHostName,
                actualHostAvatar,
                "/assets/images/icons/profile_frame_v3.png",
                "/assets/images/icons/name_banner_v2.png",
                actualHostColor
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

              // Clear any stale persisted game state so fresh colors from matchmaking are used
              useGameStore.getState().resetMatch();
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

      case "GAME_ARENA":
        return <GameArenaPage onLeaveGame={() => setCurrentView("MATCH_RESULT")} />;

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
        const betCoins = 5000;

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
              winnerPassedTokens = wPlayer.tokens.filter((t) => t.stepCount === 57).length;
              winnerKills = 3; // Standard kills for victory
            }
            if (lPlayer) {
              loserName = lPlayer.name;
              loserScore = lPlayer.tokens.reduce((sum, t) => sum + t.stepCount, 0);
              loserAvatar = lPlayer.avatar || "";
              loserFrame = lPlayer.profileFrame || "/assets/images/icons/profile_frame_v3.png";
              loserPassedTokens = lPlayer.tokens.filter((t) => t.stepCount === 57).length;
              loserKills = 1;
            }
          } else {
            // Local player is the loser (Defeat)
            if (wPlayer) {
              winnerName = wPlayer.name;
              winnerScore = wPlayer.tokens.reduce((sum, t) => sum + t.stepCount, 0);
              winnerAvatar = wPlayer.avatar || "";
              winnerFrame = wPlayer.profileFrame || "/assets/images/icons/profile_frame_v3.png";
              winnerPassedTokens = wPlayer.tokens.filter((t) => t.stepCount === 57).length;
              winnerKills = 3;
            }
            if (lPlayer) {
              loserName = lPlayer.name;
              loserScore = lPlayer.tokens.reduce((sum, t) => sum + t.stepCount, 0);
              loserAvatar = localAvatar || lPlayer.avatar || "";
              loserFrame = localFrame;
              loserPassedTokens = lPlayer.tokens.filter((t) => t.stepCount === 57).length;
              loserKills = 1;
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
