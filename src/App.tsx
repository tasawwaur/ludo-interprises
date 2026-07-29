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

import { useUserStore } from "./user/user.store";
import { useQueueStore } from "./features/matchmaking/queue/QueueStore";
import { useRoomStore } from "./features/matchmaking/rooms/RoomStore";
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
  | "MATCH_HISTORY";

const MainApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>("SPLASH");
  const [showLuckySpin, setShowLuckySpin] = useState(false);

  const user = useUserStore((s) => s.user);
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const { startQueue, cancelQueue } = useQueueStore();
  const { createRoom } = useRoomStore();

  // ✅ Splash ke baad: agar pehle se login hai to HOME, warna AUTH
  const handleSplashFinish = () => {
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
            onMatchFound={() => {
              createRoom("2P Classic", 2, user?.displayName || user?.username || "Govind");
              setCurrentView("ROOM");
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

      case "MATCH_RESULT":
        return (
          <MatchResultScreen
            onPlayAgain={() => {
              startQueue("2P Classic");
              setCurrentView("QUEUE");
            }}
            onBackToHome={() => setCurrentView("HOME")}
          />
        );

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

          {/* Modals */}
          <ReadyCheck onMatchAccepted={handleMatchAccepted} />
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
