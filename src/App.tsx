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

import { useUserStore } from "./user/user.store";
import { useQueueStore } from "./features/matchmaking/queue/QueueStore";
import { useRoomStore } from "./features/matchmaking/rooms/RoomStore";
import { useGameStore } from "./store/game.store";
import { PlayerColor } from "./game/engine/Engine.types";
import { GlobalCurrencyBar } from "./components/ui/GlobalCurrencyBar";
import confetti from "canvas-confetti";

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
  | "ADS_SETTINGS";

const MainApp: React.FC = () => {
  // Load persisted view if game in progress
  const [currentView, setCurrentView] = useState<AppView>(() => {
    if (typeof window !== "undefined") {
      const savedMatch = localStorage.getItem("ludo_active_match_session");
      if (savedMatch === "GAME_ARENA") return "GAME_ARENA";
    }
    return "SPLASH";
  });
  const [showLuckySpin, setShowLuckySpin] = useState(false);
  const [lastRewardedMatchId, setLastRewardedMatchId] = useState<string | null>(null);

  const user = useUserStore((s) => s.user);
  const updateUser = useUserStore((s) => s.updateUser);
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
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

  // ✅ Splash ke baad: agar pehle se login hai to HOME, warna AUTH
  const handleSplashFinish = () => {
    const activeMatch = localStorage.getItem("ludo_active_match_session");
    if (activeMatch === "GAME_ARENA") {
      setCurrentView("GAME_ARENA");
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
            onMatchFound={(opponent, myColor) => {
              // Deduct 5,000 coins entry fee for 2P Match
              const currentCoins = user?.coins || 20000;
              updateUser({ coins: Math.max(0, currentCoins - 5000) });
              
              const hostName = user?.displayName || user?.username || "Govind";
              const hostAvatar = user?.avatar || "/assets/images/icons/icon_club_crown.png";
              
              const code = createRoom(
                "2P Classic",
                2,
                hostName,
                hostAvatar,
                "/assets/images/icons/profile_frame_v3.png",
                "/assets/images/icons/name_banner_v2.png",
                myColor as "RED" | "GREEN" | "YELLOW" | "BLUE"
              );
              
              if (opponent) {
                useRoomStore.getState().joinRoom(
                  code,
                  opponent.name,
                  opponent.avatar,
                  opponent.profileFrame,
                  opponent.nameBanner,
                  opponent.color as "RED" | "GREEN" | "YELLOW" | "BLUE"
                );
              }
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
            onInviteFriend={(name) => alert(`Invite link sent to ${name}!`)}
          />
        );

      case "REWARDS":
        return <RewardsPage onBack={() => setCurrentView("HOME")} />;

      case "SHOP":
        return <ShopPage onBack={() => setCurrentView("HOME")} />;

      case "CLUB":
        return <ClubPage onBack={() => setCurrentView("HOME")} />;

      case "INVENTORY":
        return <InventoryPage onBack={() => setCurrentView("HOME")} />;

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
