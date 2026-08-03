import React, { useState, useEffect, useRef } from "react";
import { useUserStore } from "../../../user/user.store";
import { GLOBAL_PLAYER_DATABASE } from "../../../store/player-database.store";
import { useCosmeticsStore } from "../../../store/cosmetics.store";
import { DiceFace } from "../../gameplay/components/DiceFace";
import { LudoPageBackground } from "../../../components/effects/LudoPageBackground";
import { CornerPlayerAvatar } from "../../gameplay/components/CornerPlayerAvatar";
import { UserProfileModal, UserStats } from "../../../components/modal/UserProfileModal";
import { SoundEngine } from "../../../game/sound/SoundEngine";

// ─── Import Authoritative Rule Engine ────────────────────────────────────────
import { SnakeLadderEngine } from "../engine/SnakeLadderEngine";
import { GameState, PlayerColor } from "../engine/SnakeLadderEngine.types";

const ASSET_VERSION = Date.now();

// ─── Grid Calibration Configuration ─────────────────────────────────────────
// Adjust padding to shrink the 10x10 CSS Grid inside the board's golden border frame
const BOARD_GRID_PADDING = {
  top: "5.8%",
  bottom: "5.8%",
  left: "5.2%",
  right: "5.2%",
};

const ROW_VERTICAL_OFFSETS: Record<number, number> = {
  0:  0,  // Row 1  (cells 91-100) — confirmed OK
  1: -3,  // Row 2  (cells 81-90)  — confirmed OK
  2: -3,  // Row 3  (cells 71-80)  — interpolated (same as row 1)
  3: -3,  // Row 4  (cells 61-70)  — interpolated
  4: -4,  // Row 5  (cells 51-60)  — interpolated
  5: -5,  // Row 6  (cells 41-50)  — interpolated
  6: -6,  // Row 7  (cells 31-40)  — interpolated
  7: -7,  // Row 8  (cells 21-30)  — interpolated
  8: -9,  // Row 9  (cells 11-20)  — confirmed OK
  9: -8,  // Row 10 (cells 1-10)   — confirmed OK
};

const CUSTOM_CELL_OFFSETS: Record<number, { x?: number; y?: number }> = {};

// ─── Board Layout Helper ─────────────────────────────────────────────────────
function cellToRowCol(cell: number): { row: number; col: number } {
  const zeroIdx = cell - 1;
  const rowFromBottom = Math.floor(zeroIdx / 10);
  const rowFromTop = 9 - rowFromBottom;
  const colInRow = zeroIdx % 10;
  const col = rowFromBottom % 2 === 0 ? colInRow : 9 - colInRow;
  return { row: rowFromTop, col };
}

interface SnakeLadderPageProps {
  onLeave: () => void;
}

export const SnakeLadderPage: React.FC<SnakeLadderPageProps> = ({ onLeave }) => {
  const user = useUserStore((s) => s.user);
  const updateUser = useUserStore((s) => s.updateUser);
  const playerName = user?.displayName || user?.username || "Tasavvur";

  const [botName, setBotName] = useState(() => {
    const saved = localStorage.getItem("ludo_sl_botName");
    if (saved) return saved;
    const botProfile = GLOBAL_PLAYER_DATABASE[Math.floor(Math.random() * GLOBAL_PLAYER_DATABASE.length)];
    const name = botProfile ? botProfile.username : "Rahul Sharma";
    localStorage.setItem("ludo_sl_botName", name);
    return name;
  });

  const engineRef = useRef<SnakeLadderEngine | null>(null);

  // Per-player dice state — completely independent
  const [redDiceValue, setRedDiceValue]     = useState<number | null>(null);
  const [greenDiceValue, setGreenDiceValue] = useState<number | null>(null);
  const [redIsRolling, setRedIsRolling]     = useState(false);
  const [greenIsRolling, setGreenIsRolling] = useState(false);

  const [showCalibrator, setShowCalibrator] = useState(false);

  // Ladder animation state
  const [ladderAnim, setLadderAnim] = useState<{ from: number; to: number; active: boolean } | null>(null);

  // BUG 7 FIX: Ref flag — true while a token is animating step-by-step.
  // Using a ref (not state) so it doesn't cause re-renders or reset bot timers.
  const isTokenAnimating = useRef(false);

  // Profile Modal State
  const [selectedProfile, setSelectedProfile] = useState<UserStats | null>(null);
  const [sentFriendRequests, setSentFriendRequests] = useState<string[]>(() => {
    const saved = localStorage.getItem("ludo_sent_friend_requests");
    return saved ? JSON.parse(saved) : [];
  });

  // Initialize or restore the authoritative rule engine
  const [engineState, setEngineState] = useState<GameState>(() => {
    const userAvatar = user?.avatar || "/assets/images/icons/icon_club_crown.png";
    let userFrame = "frame_default";
    try {
      const cosmetics = useCosmeticsStore.getState();
      userFrame = cosmetics.equippedFrameId || "frame_default";
    } catch (e) {}

    const botProfile = GLOBAL_PLAYER_DATABASE.find((p) => p.username === botName);
    const bAvatar = botProfile ? botProfile.avatarUrl : "/assets/images/icons/icon_club_crown.png";
    const bFrame = botProfile ? botProfile.equippedFrame || "frame_default" : "frame_default";

    const playersConfig = [
      { id: "RED", name: playerName, color: "RED" as PlayerColor, isBot: false, avatar: userAvatar, equippedFrameId: userFrame },
      { id: "GREEN", name: botName, color: "GREEN" as PlayerColor, isBot: true, avatar: bAvatar, equippedFrameId: bFrame },
    ];

    const engine = new SnakeLadderEngine(playersConfig, {
      tokensPerPlayer: 2, // 2 tokens per player
      animationDelayMs: 300, // step animation speed - clearly visible per cell
    });

    let savedData = localStorage.getItem("ludo_sl_engine_state");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Reset if saved state has tokens at position 0 (old start yard rules) or missing isUnlocked property
        const hasOldState = parsed.players.some((p: any) =>
          p.tokens.some((t: any) => t.currentPosition === 0 || t.isUnlocked === undefined)
        );
        if (hasOldState) {
          localStorage.removeItem("ludo_sl_engine_state");
          savedData = null;
        } else {
          engine.setGameState(parsed);
        }
      } catch (e) {
        savedData = null;
      }
    }

    engineRef.current = engine;
    return engine.getGameState();
  });

  // Setup Event Listeners on mount
  useEffect(() => {
    if (!engineRef.current) return;
    const engine = engineRef.current;

    // BUG 5 FIX: STATE_UPDATE is the ONLY place we persist to localStorage.
    // TOKEN_MOVE_STEP does NOT save — prevents O(N) localStorage writes per move.
    engine.addEventListener("STATE_UPDATE", (payload) => {
      isTokenAnimating.current = false; // animation done when engine emits STATE_UPDATE
      setEngineState({ ...payload.state });
      localStorage.setItem("ludo_sl_engine_state", JSON.stringify(payload.state));
    });

    // GREEN bot dice flash animation on roll start
    engine.addEventListener("DICE_ROLL_START", (payload) => {
      if (payload.activePlayerColor === "GREEN") {
        let count = 0;
        const interval = setInterval(() => {
          setGreenDiceValue(Math.ceil(Math.random() * 6));
          count++;
          if (count >= 10) clearInterval(interval);
        }, 80);
      }
    });

    engine.addEventListener("DICE_ROLL_COMPLETE", (payload) => {
      if (payload.activePlayerColor === "RED") {
        setRedIsRolling(false);
        if (payload.diceValue !== undefined) setRedDiceValue(payload.diceValue);
      } else {
        setGreenIsRolling(false);
        if (payload.diceValue !== undefined) setGreenDiceValue(payload.diceValue);
      }
    });

    // BUG 7 FIX: Set isTokenAnimating=true on first step so bot won't re-trigger.
    engine.addEventListener("TOKEN_MOVE_STEP", (payload) => {
      isTokenAnimating.current = true;
      SoundEngine.play('TOKEN_STEP');
      // Live board update — no localStorage write here
      setEngineState({ ...payload.state });
    });

    // Ladder Climb — golden glow + sparkle + sound
    engine.addEventListener("LADDER_CLIMB", (payload) => {
      isTokenAnimating.current = true;
      SoundEngine.play('HOME_ENTRY');
      const from = payload.ladderStart!;
      const to   = payload.ladderEnd!;
      setLadderAnim({ from, to, active: true });
      const steps = to - from;
      setTimeout(() => setLadderAnim(null), steps * 300 + 1000);
    });

    // Win event — reward coins + sound
    engine.addEventListener("GAME_OVER", (payload) => {
      const winner = payload.state.players.find((p) => p.winnerRank === 1);
      if (winner && winner.id === "RED") {
        const coins = user?.coins || 0;
        updateUser({ coins: coins + 5000 });
      }
      SoundEngine.play('WIN');
    });

  }, [user, updateUser]);

  // Unmute SoundEngine on first user interaction
  useEffect(() => {
    const unlock = () => {
      if (SoundEngine.getMuteState()) {
        SoundEngine.toggleMute(); // unmute
      }
      window.removeEventListener('pointerdown', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    return () => window.removeEventListener('pointerdown', unlock);
  }, []);

  const handleRoll = () => {
    if (
      !engineRef.current ||
      engineState.currentTurnColor !== "RED" ||
      redIsRolling ||
      isTokenAnimating.current ||
      engineState.phase !== "PLAYING" ||
      engineState.isWaitingForTokenChoice
    ) return;

    setRedIsRolling(true);
    let flashCount = 0;
    const flashInterval = setInterval(() => {
      setRedDiceValue(Math.ceil(Math.random() * 6));
      flashCount++;
      if (flashCount >= 10) {
        clearInterval(flashInterval);
        setRedIsRolling(false);
        const rolled = engineRef.current!.roll();
        setRedDiceValue(rolled);
      }
    }, 80);
  };

  // Bot Auto-Play: GREEN's turn — roll after random 1-15 sec human-feel delay
  useEffect(() => {
    if (
      engineState.currentTurnColor !== "GREEN" ||
      engineState.phase !== "PLAYING" ||
      greenIsRolling ||
      engineState.isWaitingForTokenChoice
    ) return;

    const botDelay = setTimeout(() => {
      if (!engineRef.current || isTokenAnimating.current) return;
      setGreenIsRolling(true);
      let flashCount = 0;
      const flashInterval = setInterval(() => {
        setGreenDiceValue(Math.ceil(Math.random() * 6));
        flashCount++;
        if (flashCount >= 8) {
          clearInterval(flashInterval);
          setGreenIsRolling(false);
          if (!isTokenAnimating.current) {
            const rolled = engineRef.current!.roll();
            setGreenDiceValue(rolled);
          }
        }
      }, 80);
    }, 1000 + Math.random() * 14000);

    return () => clearTimeout(botDelay);
  }, [engineState.currentTurnColor, engineState.phase, engineState.isWaitingForTokenChoice, greenIsRolling]);

  const handleSelectToken = (tokenId: number) => {
    if (!engineRef.current || engineState.currentTurnColor !== "RED" || !engineState.isWaitingForTokenChoice) return;
    engineRef.current.moveToken(tokenId, engineState.diceValue || 0);
  };

  const resetGame = () => {
    localStorage.removeItem("ludo_sl_engine_state");
    const newBotProfile = GLOBAL_PLAYER_DATABASE[Math.floor(Math.random() * GLOBAL_PLAYER_DATABASE.length)];
    const nameToUse = newBotProfile ? newBotProfile.username : "Rahul Sharma";
    setBotName(nameToUse);
    localStorage.setItem("ludo_sl_botName", nameToUse);

    // Refresh state using new engine
    const userAvatar = user?.avatar || "/assets/images/icons/icon_club_crown.png";
    let userFrame = "frame_default";
    try {
      const cosmetics = useCosmeticsStore.getState();
      userFrame = cosmetics.equippedFrameId || "frame_default";
    } catch (e) {}

    const bAvatar = newBotProfile ? newBotProfile.avatarUrl : "/assets/images/icons/icon_club_crown.png";
    const bFrame = newBotProfile ? newBotProfile.equippedFrame || "frame_default" : "frame_default";

    const playersConfig = [
      { id: "RED", name: playerName, color: "RED" as PlayerColor, isBot: false, avatar: userAvatar, equippedFrameId: userFrame },
      { id: "GREEN", name: nameToUse, color: "GREEN" as PlayerColor, isBot: true, avatar: bAvatar, equippedFrameId: bFrame },
    ];

    const engine = new SnakeLadderEngine(playersConfig, {
      tokensPerPlayer: 2,
      animationDelayMs: 250,
    });

    engineRef.current = engine;
    setEngineState(engine.getGameState());
    setDiceValue(null);
    setIsRolling(false);

    // Bind state updater listener
    engine.addEventListener("STATE_UPDATE", (payload) => {
      setEngineState(payload.state);
      localStorage.setItem("ludo_sl_engine_state", JSON.stringify(payload.state));
    });
  };

  const handleProfileClick = (playerColor: PlayerColor) => {
    const p = engineState.players.find((x) => x.color === playerColor);
    if (!p) return;

    if (playerColor === "RED") {
      const stats: UserStats = {
        id: user?.id || "guest_123",
        name: p.name,
        avatarUrl: p.avatar,
        equippedFrame: p.equippedFrameId || "frame_default",
        level: user?.level || 1,
        country: user?.country || "INDIA",
        countryFlag: user?.country === "PAKISTAN" ? "🇵🇰" : "🇮🇳",
        totalEarning: "12 K",
        currentGold: user?.coins || 20000,
        currentLeague: "Bronze",
        gamesWon: 12,
        gamesPlayed: 20,
        teamWins: 2,
        winStreak: 2,
        twoPlayerWins: 6,
        titanBadgeCount: 0,
        fourPlayerWins: 4,
        killCount: 15,
      };
      setSelectedProfile(stats);
    } else {
      const botProfile = GLOBAL_PLAYER_DATABASE.find((x) => x.username === p.name);
      const isRequested = sentFriendRequests.includes(botProfile?.playerId || "bot_456");

      const stats: UserStats = {
        id: botProfile?.playerId || "bot_456",
        name: p.name,
        avatarUrl: p.avatar,
        equippedFrame: p.equippedFrameId || "frame_default",
        level: botProfile?.level || 12,
        country: botProfile?.country || "INDIA",
        countryFlag: botProfile?.countryFlag || "🇮🇳",
        totalEarning: botProfile?.totalEarning || "1.2 M",
        currentGold: botProfile?.currentCoins || 50000,
        currentLeague: botProfile?.currentLeague || "Bronze",
        gamesWon: botProfile?.matchesWon || 15,
        gamesPlayed: botProfile?.matchesPlayed || 30,
        teamWins: botProfile?.teamWins || 4,
        winStreak: botProfile?.currentWinStreak || 1,
        twoPlayerWins: botProfile?.twoPlayerWins || 6,
        titanBadgeCount: botProfile?.titanBadgeCount || 0,
        fourPlayerWins: botProfile?.fourPlayerWins || 5,
        killCount: botProfile?.killCount || 22,
      };

      (stats as any).isFriendRequested = isRequested;
      setSelectedProfile(stats);
    }
  };

  const handleAddFriend = (friendId: string) => {
    setSentFriendRequests((prev) => {
      if (prev.includes(friendId)) return prev;
      const updated = [...prev, friendId];
      localStorage.setItem("ludo_sent_friend_requests", JSON.stringify(updated));
      return updated;
    });
  };

  const renderBoard = () => {
    const cells: React.ReactNode[] = [];

    for (let cell = 100; cell >= 1; cell--) {
      const { row, col } = cellToRowCol(cell);

      const redTokensHere = engineState.players[0].tokens.filter((t) => t.currentPosition === cell && !t.isFinished);
      const greenTokensHere = engineState.players[1].tokens.filter((t) => t.currentPosition === cell && !t.isFinished);

      const verticalOffset = ROW_VERTICAL_OFFSETS[row] || 0;

      const totalHere = redTokensHere.length + greenTokensHere.length;

      // Determine visual size and grid container based on token count to prevent overflow
      let sizePx = 24; // Default single token size (24px)
      let containerClass = "flex justify-center items-center";
      let animationClass = "animate-bounce";

      if (totalHere === 2) {
        sizePx = 16; // Shrink to 16px
        containerClass = "grid grid-cols-2 gap-[2px] justify-center items-center";
        animationClass = "animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.95)]"; // Pulse prevents bounce overlaps
      } else if (totalHere > 2) {
        sizePx = 12; // Shrink to 12px for 3 or 4 tokens to fit perfectly inside the cell boundary
        containerClass = "grid grid-cols-2 gap-[1.5px] justify-center items-center";
        animationClass = "animate-pulse shadow-[0_0_6px_rgba(251,191,36,0.95)]";
      }

      // Column-based perspective correction to align columns vertically across all rows
      let translateX = 0;
      if (col === 0) translateX = 3;
      else if (col === 1) translateX = 2;
      else if (col === 2) translateX = 1;
      else if (col === 5) translateX = -1;
      else if (col === 6) translateX = -1;
      else if (col === 7) translateX = -2;
      else if (col === 8) translateX = -2;
      else if (col === 9) translateX = -3;

      const customOffset = CUSTOM_CELL_OFFSETS[cell];
      if (customOffset && customOffset.x !== undefined) {
        translateX = customOffset.x;
      }
      const translateY = verticalOffset + (customOffset?.y || 0);

      const transformStr = [
        translateX ? `translateX(${translateX}px)` : "",
        translateY ? `translateY(${translateY}px)` : "",
      ].filter(Boolean).join(" ");

      cells.push(
        <div
          key={cell}
          data-cell={cell}
          style={{
            gridRow: row + 1,
            gridColumn: col + 1,
            transform: transformStr || undefined,
          }}
          className="relative flex flex-col items-center justify-center bg-transparent border-0 select-none"
        >
          {/* Player tokens */}
          <div className={`${containerClass} max-w-full max-h-full p-[1px]`}>
            {redTokensHere.map((t) => {
              const isMovable = engineState.currentTurnColor === "RED" && engineState.isWaitingForTokenChoice && engineState.movableTokenIds.includes(t.tokenId);
              return (
                <button
                  key={`red-${t.tokenId}-${t.currentPosition}`}
                  disabled={!isMovable}
                  onClick={() => handleSelectToken(t.tokenId)}
                  style={{ width: `${sizePx}px`, height: `${sizePx}px` }}
                  className={`p-0 bg-transparent border-0 outline-none relative ${
                    t.isMoving
                      ? "token-hop z-30"
                      : isMovable
                      ? `cursor-pointer scale-110 drop-shadow-[0_0_6px_rgba(251,191,36,0.95)] ${animationClass} z-30`
                      : "z-10 transition-transform"
                  }`}
                  title={isMovable ? "Click to move this Red Token" : `Red Token ${t.tokenId + 1}`}
                >
                  <img
                    src={`/assets/images/icons/luxury_token_red.png?v=${ASSET_VERSION}`}
                    alt="RED"
                    className="w-full h-full object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
                    draggable={false}
                  />
                  {isMovable && (
                    <div className="absolute inset-0 border-[1px] border-yellow-400 rounded-full animate-ping" />
                  )}
                </button>
              );
            })}

            {greenTokensHere.map((t) => (
              <div
                key={`green-${t.tokenId}-${t.currentPosition}`}
                style={{ width: `${sizePx}px`, height: `${sizePx}px` }}
                className={`relative z-10 ${t.isMoving ? "token-hop" : ""}`}
                title={`Green Token ${t.tokenId + 1}`}
              >
                <img
                  src={`/assets/images/icons/luxury_token_green.png?v=${ASSET_VERSION}`}
                  alt="GREEN"
                  className="w-full h-full object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
                  draggable={false}
                />
              </div>
            ))}
          </div>

          {/* Grid Calibration Dots */}
          {showCalibrator && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <div className="w-[15px] h-[15px] rounded-full bg-amber-500/80 border border-yellow-400/40 flex items-center justify-center text-[7.5px] font-black text-slate-950 shadow-[0_0_5px_rgba(245,158,11,0.5)]">
                {cell}
              </div>
            </div>
          )}

          {/* Ladder Bottom — pulse glow when token is about to climb */}
          {ladderAnim?.active && cell === ladderAnim.from && (
            <div className="absolute inset-0 ladder-bottom-pulse rounded pointer-events-none" />
          )}

          {/* Ladder Destination — golden glow + sparkles */}
          {ladderAnim?.active && cell === ladderAnim.to && (
            <div className="absolute inset-0 ladder-dest-glow rounded pointer-events-none">
              {/* Sparkle particles scattered around */}
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="sparkle-particle"
                  style={{
                    top: `${10 + Math.sin(i * 60 * Math.PI / 180) * 35}%`,
                    left: `${10 + Math.cos(i * 60 * Math.PI / 180) * 35}%`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      );
    }
    return cells;
  };

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden">
      {/* Universal Luxury Background */}
      <LudoPageBackground variant="gameplay" />

      {/* Snake & Ladders Custom Screen Background */}
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none z-0"
        style={{ backgroundImage: "url('/assets/images/backgrounds/luxury_snake_bg.jpg')" }}
      />
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2">
        <button
          onClick={onLeave}
          className="w-10 h-10 rounded-full bg-slate-900/80 border border-amber-500/30 flex items-center justify-center text-amber-200 text-lg hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg"
        >
          ←
        </button>

        {/* Reset Game Button */}
        <button
          onClick={resetGame}
          className="px-3 py-1.5 rounded-xl border border-slate-700/50 bg-slate-900/80 text-slate-300 text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
        >
          🔄 Reset
        </button>
      </div>

      {/* Top Right Corner Player Avatar (Player 2 / Bot) */}
      <div
        className="absolute top-10 right-4 z-20 cursor-pointer transition-transform hover:scale-105 active:scale-95"
        onClick={() => handleProfileClick("GREEN")}
      >
        <CornerPlayerAvatar
          player={engineState.players[1] as any}
          isActive={engineState.currentTurnColor === "GREEN" && engineState.phase === "PLAYING"}
          diceValue={diceValue}
          isDiceRolled={false}
          canRoll={false}
          turnTimerSeconds={15}
          isAutoMode={false}
          position="top-right"
          isLocalPlayer={false}
        />
      </div>

      {/* GREEN Start Yard (Tokens at position 0) */}
      <div className="absolute top-[64px] right-[105px] z-20 flex gap-1.5">
        {engineState.players[1].tokens.map((t) => {
          if (t.currentPosition > 0) return null;
          return (
            <div key={t.tokenId} className="w-6 h-6 opacity-75">
              <img
                src={`/assets/images/icons/luxury_token_green.png?v=${ASSET_VERSION}`}
                alt={`T${t.tokenId}`}
                className="w-full h-full object-contain"
              />
            </div>
          );
        })}
      </div>

      {/* Bottom Left Corner Player Avatar (Player 1 / You) */}
      <div
        className="absolute bottom-10 left-4 z-20 cursor-pointer transition-transform hover:scale-105 active:scale-95"
        onClick={() => handleProfileClick("RED")}
      >
        <CornerPlayerAvatar
          player={engineState.players[0] as any}
          isActive={engineState.currentTurnColor === "RED" && engineState.phase === "PLAYING"}
          diceValue={redDiceValue}
          isDiceRolled={false}
          canRoll={engineState.currentTurnColor === "RED" && !redIsRolling && engineState.phase === "PLAYING" && !engineState.isWaitingForTokenChoice}
          turnTimerSeconds={15}
          isAutoMode={false}
          onRollDice={handleRoll}
          position="bottom-left"
          isLocalPlayer={true}
        />
      </div>

      {/* RED Start Yard (Tokens at position 0) */}
      <div className="absolute bottom-[77px] left-[180px] z-20 flex gap-1.5 items-center">
        {engineState.players[0].tokens.map((t) => {
          if (t.currentPosition > 0) return null;
          const isMovable = engineState.currentTurnColor === "RED" && engineState.isWaitingForTokenChoice && engineState.movableTokenIds.includes(t.tokenId);
          return (
            <button
              key={t.tokenId}
              disabled={!isMovable}
              onClick={() => handleSelectToken(t.tokenId)}
              className={`w-6 h-6 p-0 bg-transparent border-0 outline-none relative transition-all ${
                isMovable
                  ? "cursor-pointer scale-115 drop-shadow-[0_0_8px_rgba(251,191,36,0.95)] animate-pulse"
                  : "opacity-60 pointer-events-none"
              }`}
              title={isMovable ? "Click to move this token onto the board" : `Red Token ${t.tokenId + 1} at Start`}
            >
              <img
                src={`/assets/images/icons/luxury_token_red.png?v=${ASSET_VERSION}`}
                alt={`T${t.tokenId}`}
                className="w-full h-full object-contain"
              />
              {isMovable && (
                <div className="absolute inset-0 border border-yellow-400 rounded-full animate-ping" />
              )}
            </button>
          );
        })}
      </div>

      {/* RED Player Interactive Dice - bottom-left */}
      {engineState.phase !== "FINISHED" && (
        <div className="absolute bottom-[60px] left-[118px] z-20">
          <button
            onClick={handleRoll}
            disabled={redIsRolling || engineState.currentTurnColor !== "RED" || engineState.isWaitingForTokenChoice}
            className={`relative bg-transparent border-0 outline-none p-1 rounded-2xl transition-all active:scale-90 hover:scale-105 ${
              redIsRolling || engineState.currentTurnColor !== "RED" || engineState.isWaitingForTokenChoice
                ? "pointer-events-none opacity-80"
                : "cursor-pointer"
            }`}
            title="Click to Roll"
          >
            <DiceFace
              value={redDiceValue}
              isRolling={redIsRolling}
              diceId="dice_red"
              size={58}
            />
          </button>
        </div>
      )}

      {/* GREEN Player Dice Display - top-right */}
      {engineState.phase !== "FINISHED" && (
        <div className="absolute top-[60px] right-[118px] z-20">
          <div
            className={`relative p-1 rounded-2xl transition-all ${
              engineState.currentTurnColor === "GREEN" ? "opacity-100" : "opacity-40"
            }`}
            title="Green Player Dice"
          >
            <DiceFace
              value={greenDiceValue}
              isRolling={greenIsRolling}
              diceId="dice_green"
              size={58}
            />
            {engineState.currentTurnColor === "GREEN" && greenIsRolling && (
              <div className="absolute inset-0 rounded-2xl border border-emerald-400/50 animate-pulse pointer-events-none" />
            )}
          </div>
        </div>
      )}

      {/* Board Design in the Center */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-3">
        <div
          className="grid w-full border border-amber-500/30 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.9)] bg-cover bg-center"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(10, 1fr)",
            gridTemplateRows: "repeat(10, 1fr)",
            aspectRatio: "1 / 1",
            maxWidth: "350px",
            backgroundImage: "url('/assets/images/backgrounds/luxury_snake_board_design.jpg')",
            paddingTop: BOARD_GRID_PADDING.top,
            paddingBottom: BOARD_GRID_PADDING.bottom,
            paddingLeft: BOARD_GRID_PADDING.left,
            paddingRight: BOARD_GRID_PADDING.right,
          }}
        >
          {renderBoard()}
        </div>
      </div>

      {/* Bottom Panel - Fixed Height to prevent Board shifting */}
      <div className="relative z-10 flex flex-col items-center justify-center h-[80px] pb-3 select-none">
        {/* Play Again button */}
        <div className="h-[64px] flex items-center justify-center">
          {engineState.phase === "FINISHED" && (
            <button
              onClick={resetGame}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-[11px] uppercase tracking-widest shadow-lg hover:scale-102 active:scale-97 cursor-pointer border-0 outline-none transition-transform"
            >
              🔄 Play Again
            </button>
          )}
        </div>
      </div>

      {/* Profile Details Modal */}
      {selectedProfile && (
        <UserProfileModal
          userStats={selectedProfile}
          isMe={selectedProfile.id === (user?.id || "guest_123")}
          onClose={() => setSelectedProfile(null)}
          onAddFriend={() => handleAddFriend(selectedProfile.id)}
        />
      )}
    </div>
  );
};

export default SnakeLadderPage;
