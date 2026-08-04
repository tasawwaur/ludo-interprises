import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useUserStore } from "../../../user/user.store";
import { GLOBAL_PLAYER_DATABASE } from "../../../store/player-database.store";
import { useFriendsStore } from "../../../store/friends.store";
import { useCosmeticsStore } from "../../../store/cosmetics.store";
import { DiceFace } from "../../gameplay/components/DiceFace";
import { LudoPageBackground } from "../../../components/effects/LudoPageBackground";
import { CornerPlayerAvatar } from "../../gameplay/components/CornerPlayerAvatar";
import { UserProfileModal, UserStats } from "../../../components/modal/UserProfileModal";
import { SoundEngine } from "../../../game/sound/SoundEngine";
import confetti from "canvas-confetti";
import { ChatModal, ChatMessage } from "../../chat/ChatModal";
import { globalSocket } from "../../../multiplayer/socket/SocketClient";

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
const LADDER_STARTS = [2, 15, 9, 39, 48, 56, 71, 78];
const SNAKE_HEADS  = [17, 21, 28, 36, 66, 82, 69, 97, 94];

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

  const [showCalibrator, setShowCalibrator]   = useState(false);
  const [showNumbers, setShowNumbers]         = useState(false);
  const [activeClickedCell, setActiveClickedCell] = useState<number | null>(null);
  const [turnTimerSeconds, setTurnTimerSeconds]   = useState(15);

  // Ladder animation state
  const [ladderAnim, setLadderAnim] = useState<{ from: number; to: number; active: boolean } | null>(null);
  // Kill banner animation state
  const [killBanner, setKillBanner] = useState<string | null>(null);
  // Exit confirmation modal state
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  // Rematch states
  const [waitingForRematch, setWaitingForRematch] = useState(false);
  const [rematchNotification, setRematchNotification] = useState<string | null>(null);
  // Menu & Audio states
  const [showMenu, setShowMenu] = useState(false);
  const [isMuted, setIsMuted] = useState(() => SoundEngine.getMuteState());

  const handleSoundToggle = () => {
    SoundEngine.toggleMute();
    setIsMuted(SoundEngine.getMuteState());
  };
  // Chat states
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [activeSpeechBubbles, setActiveSpeechBubbles] = useState<Record<string, string | null>>({});

  const handleSendMessage = (msg: string) => {
    if (!msg.trim()) return;
    const newMsg: ChatMessage = {
      id: "msg_" + Date.now(),
      sender: user?.displayName || user?.username || "Player 1",
      text: msg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      color: myColor,
    };
    setChatHistory((prev) => [...prev, newMsg]);
    setActiveSpeechBubbles((prev) => ({ ...prev, [myColor]: msg }));
    setTimeout(() => {
      setActiveSpeechBubbles((prev) => ({ ...prev, [myColor]: null }));
    }, 3500);

    if (socketRef.current) {
      const savedOpponentRaw = localStorage.getItem("ludo_sl_opponent");
      if (savedOpponentRaw) {
        try {
          const roomCode = JSON.parse(savedOpponentRaw).roomCode;
          if (roomCode) {
            socketRef.current.emit("client_action", { roomCode, actionType: "SL_CHAT_MESSAGE", text: msg });
          }
        } catch (e) {}
      }
    }
  };

  // Ref flag — true while a token is animating step-by-step
  const isTokenAnimating = useRef(false);

  // Profile Modal State
  const [selectedProfile, setSelectedProfile] = useState<UserStats | null>(null);
  const [sentFriendRequests, setSentFriendRequests] = useState<string[]>(() => {
    const saved = localStorage.getItem("ludo_sent_friend_requests");
    return saved ? JSON.parse(saved) : [];
  });
  const [friendRequestNotification, setFriendRequestNotification] = useState<{ senderName: string; senderAvatar?: string } | null>(null);
  // Initialize or restore the authoritative rule engine
  const [engineState, setEngineState] = useState<GameState>(() => {
    const userAvatar = user?.avatar || "/assets/images/icons/icon_club_crown.png";
    let userFrame = "frame_default";
    try {
      const cosmetics = useCosmeticsStore.getState();
      userFrame = cosmetics.equippedFrameId || "frame_default";
    } catch (e) {}

    const savedOpponentRaw = localStorage.getItem("ludo_sl_opponent");
    let opponentData = savedOpponentRaw ? JSON.parse(savedOpponentRaw) : null;

    // myColor: server-assigned color. Engine keeps RED=players[0], GREEN=players[1].
    // If local player is GREEN, their name goes into GREEN slot; RED (opponent) goes first.
    const myColorInit = (opponentData?.myColor as PlayerColor) || "RED";
    const botProfile = GLOBAL_PLAYER_DATABASE.find((p) => p.username === botName);
    const p2Name = opponentData?.name || botName;
    const p2Avatar = opponentData?.avatar || (botProfile ? botProfile.avatarUrl : "/assets/images/icons/icon_club_crown.png");
    const p2Frame = opponentData?.profileFrame || (botProfile ? botProfile.equippedFrame || "frame_default" : "frame_default");
    const p2IsBot = opponentData ? (opponentData.isBot ?? false) : true;

    const playersConfig = myColorInit === "RED"
      ? [
          { id: "RED",   name: playerName, color: "RED"   as PlayerColor, isBot: false,   avatar: userAvatar, equippedFrameId: userFrame },
          { id: "GREEN", name: p2Name,     color: "GREEN" as PlayerColor, isBot: p2IsBot, avatar: p2Avatar,   equippedFrameId: p2Frame  },
        ]
      : [
          { id: "RED",   name: p2Name,     color: "RED"   as PlayerColor, isBot: p2IsBot, avatar: p2Avatar,   equippedFrameId: p2Frame  },
          { id: "GREEN", name: playerName, color: "GREEN" as PlayerColor, isBot: false,   avatar: userAvatar, equippedFrameId: userFrame },
        ];

    const engine = new SnakeLadderEngine(playersConfig, {
      tokensPerPlayer: 1,
      animationDelayMs: 300,
    });

    let savedData = localStorage.getItem("ludo_sl_engine_state");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
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

  // Derive local player's color from saved opponent data (stable, read once)
  const savedOppRawComp = localStorage.getItem("ludo_sl_opponent");
  const savedOppComp = savedOppRawComp ? (() => { try { return JSON.parse(savedOppRawComp); } catch { return null; } })() : null;
  const myColor: PlayerColor  = (savedOppComp?.myColor as PlayerColor) || "RED";
  const oppColor: PlayerColor = myColor === "RED" ? "GREEN" : "RED";
  const myPlayerIndex         = myColor === "RED" ? 0 : 1;
  const oppPlayerIndex        = myColor === "RED" ? 1 : 0;
  // Alias dice state to local / opponent perspective
  const myDiceValue    = myColor === "RED" ? redDiceValue   : greenDiceValue;
  const oppDiceValue   = myColor === "RED" ? greenDiceValue : redDiceValue;
  const myIsRolling    = myColor === "RED" ? redIsRolling   : greenIsRolling;
  const oppIsRolling   = myColor === "RED" ? greenIsRolling : redIsRolling;
  const setMyDiceValue  = myColor === "RED" ? setRedDiceValue  : setGreenDiceValue;
  const setOppDiceValue = myColor === "RED" ? setGreenDiceValue : setRedDiceValue;
  const setMyIsRolling  = myColor === "RED" ? setRedIsRolling  : setGreenIsRolling;
  const setOppIsRolling = myColor === "RED" ? setGreenIsRolling : setRedIsRolling;
  // Flag to prevent echoing state sync back to sender
  const isSyncingFromRemote = useRef(false);

  // Save active match session flag on mount so refresh auto-rejoins
  useEffect(() => {
    localStorage.setItem("ludo_active_match_session", "SNAKE_LADDER");
  }, []);

  // Socket ref for real-time live multiplayer synchronization
  const socketRef = useRef<any>(null);

  // Helper: explicitly send current engine state to opponent (used after local actions)
  const syncStateToOpponent = () => {
    if (!socketRef.current || !engineRef.current) return;
    const oppRaw = localStorage.getItem("ludo_sl_opponent");
    if (!oppRaw) return;
    try {
      const rc = JSON.parse(oppRaw).roomCode;
      if (rc) {
        socketRef.current.emit("client_action", {
          roomCode: rc,
          actionType: "SL_STATE_SYNC",
          engineState: engineRef.current.getGameState(),
        });
      }
    } catch (e) {}
  };

  useEffect(() => {
    const savedOpponentRaw = localStorage.getItem("ludo_sl_opponent");
    if (!savedOpponentRaw) return;

    try {
      const oppData = JSON.parse(savedOpponentRaw);
      const roomCode = oppData.roomCode;
      if (!roomCode) return;

      const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      const socketUrl = import.meta.env.DEV ? `http://${host}:8000` : window.location.origin;
      const socket = io(socketUrl, { transports: ["websocket", "polling"], reconnection: true });

      socket.emit("join_room_game", { roomCode });

      socket.on("server_action", (data: any) => {
        if (!engineRef.current) return;

        if (data.actionType === "SL_STATE_SYNC") {
          // Full authoritative state from opponent — apply directly, no echo
          isSyncingFromRemote.current = true;
          engineRef.current.setGameState(data.engineState);
          setEngineState({ ...data.engineState });
          if (data.engineState.diceValue !== null && data.engineState.diceValue !== undefined) {
            const activeColor = data.engineState.players[data.engineState.activePlayerIndex]?.color;
            if (activeColor === "RED") {
              setRedDiceValue(data.engineState.diceValue);
            } else if (activeColor === "GREEN") {
              setGreenDiceValue(data.engineState.diceValue);
            }
          }
          isSyncingFromRemote.current = false;
          return;
        }

        if (data.actionType === "SL_DICE_ROLLING") {
          SoundEngine.play('DICE_ROLL');
          const isRed = data.rollingColor === "RED";
          if (isRed) setRedIsRolling(true);
          else setGreenIsRolling(true);

          let flashCount = 0;
          const flashInterval = setInterval(() => {
            if (isRed) setRedDiceValue(Math.ceil(Math.random() * 6));
            else setGreenDiceValue(Math.ceil(Math.random() * 6));
            flashCount++;
            if (flashCount >= 10) {
              clearInterval(flashInterval);
              if (isRed) {
                setRedIsRolling(false);
                if (data.diceValue) setRedDiceValue(data.diceValue);
              } else {
                setGreenIsRolling(false);
                if (data.diceValue) setGreenDiceValue(data.diceValue);
              }
            }
          }, 80);
          return;
        }

        if (data.actionType === "SL_FRIEND_REQUEST") {
          // Add to local Friends Store
          useFriendsStore.getState().addFriendRequest({
            id: "req_" + Date.now(),
            senderName: data.senderName,
            senderAvatar: data.senderAvatar,
            senderLevel: data.senderLevel || 1,
            senderFrame: data.senderFrame || "frame_default",
            time: "Just now",
          });
          
          // Show top banner notification
          setFriendRequestNotification({
            senderName: data.senderName,
            senderAvatar: data.senderAvatar,
          });
          
          // Auto-hide after 4 seconds
          setTimeout(() => {
            setFriendRequestNotification(null);
          }, 4000);
          return;
        }

        if (data.actionType === "SL_CHAT_MESSAGE") {
          const newMsg: ChatMessage = {
            id: "msg_" + Date.now(),
            sender: oppData.name || "Opponent",
            text: data.text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            color: oppColor,
          };
          setChatHistory((prev) => [...prev, newMsg]);
          setActiveSpeechBubbles((prev) => ({ ...prev, [oppColor]: data.text }));
          setTimeout(() => {
            setActiveSpeechBubbles((prev) => ({ ...prev, [oppColor]: null }));
          }, 3500);
        }
      });

      // 🏆 Opponent disconnected — local player wins by forfeit with 9,500 coin reward
      socket.on("opponent_disconnected", () => {
        console.log("[Opponent Disconnected] Opponent left the match — declaring local player as WINNER!");
        if (!engineRef.current) return;

        const state = engineRef.current.getGameState();
        state.phase = "FINISHED";

        // Determine local vs opponent player index based on myColor
        const localIdx = myColor === "RED" ? 0 : 1;
        const remoteIdx = myColor === "RED" ? 1 : 0;

        state.players[localIdx].winnerRank = 1;  // Local player = WINNER
        state.players[remoteIdx].winnerRank = 2; // Opponent = LOSER (disconnected)
        state.logMessage = `🏆 ${state.players[remoteIdx].name} disconnected! You win by forfeit!`;

        engineRef.current.setGameState(state);
        setEngineState({ ...state });

        // Award 9,500 coins + XP to the winner
        const localPlayer = state.players[localIdx];
        const killsXP = (localPlayer.killCount || 0) * 50;
        const laddersXP = (localPlayer.ladderCount || 0) * 70;
        const winXP = 200;
        const totalXP = killsXP + laddersXP + winXP;

        const entryFee = parseInt(localStorage.getItem("ludo_current_entry_fee") || "5000");
        const winReward = Math.round(entryFee * 1.9); // 2 * entryFee - 5% commission
        const currentCoins = user?.coins || 0;
        const currentXP = user?.xp || 0;
        updateUser({
          coins: currentCoins + winReward,
          xp: currentXP + totalXP,
        });

        SoundEngine.play('WIN');
        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#FFD700', '#FFA500', '#10B981', '#3B82F6', '#EF4444'],
          });
        } catch (e) {}

        localStorage.removeItem("ludo_active_match_session");
        localStorage.removeItem("ludo_sl_engine_state");
      });

      // 🔄 Opponent wants rematch notification
      socket.on("opponent_wants_rematch", (data: { name: string }) => {
        console.log(`[Rematch] ${data.name} wants a rematch!`);
        setRematchNotification(`${data.name} wants a rematch!`);
        setTimeout(() => setRematchNotification(null), 5000);
      });

      // 🔄 Rematch found — both players agreed, start new game
      socket.on("rematch_found", (data: any) => {
        console.log("[Rematch] Rematch found!", data);
        setWaitingForRematch(false);
        setRematchNotification(null);

        // Update opponent data in localStorage for the new room
        const newOpponentData = {
          name: data.opponent.name,
          avatar: data.opponent.avatar,
          profileFrame: data.opponent.profileFrame,
          nameBanner: data.opponent.nameBanner,
          color: data.opponent.color,
          roomCode: data.roomCode,
          myColor: data.color,
          isBot: false,
        };
        localStorage.setItem("ludo_sl_opponent", JSON.stringify(newOpponentData));
        localStorage.removeItem("ludo_sl_engine_state");

        // Leave old room and join new room
        socket.emit("join_room_game", { roomCode: data.roomCode });

        // Reset engine with same opponent but fresh state
        const userAvatar = user?.avatar || "/assets/images/icons/icon_club_crown.png";
        let userFrame = "frame_default";
        try {
          const cosmetics = useCosmeticsStore.getState();
          userFrame = cosmetics.equippedFrameId || "frame_default";
        } catch (e) {}

        const newMyColor = data.color as PlayerColor;
        const playersConfig = newMyColor === "RED"
          ? [
              { id: "RED",   name: playerName,         color: "RED"   as PlayerColor, isBot: false, avatar: userAvatar,           equippedFrameId: userFrame },
              { id: "GREEN", name: data.opponent.name,  color: "GREEN" as PlayerColor, isBot: false, avatar: data.opponent.avatar, equippedFrameId: data.opponent.profileFrame || "frame_default" },
            ]
          : [
              { id: "RED",   name: data.opponent.name,  color: "RED"   as PlayerColor, isBot: false, avatar: data.opponent.avatar, equippedFrameId: data.opponent.profileFrame || "frame_default" },
              { id: "GREEN", name: playerName,          color: "GREEN" as PlayerColor, isBot: false, avatar: userAvatar,           equippedFrameId: userFrame },
            ];

        const engine = new SnakeLadderEngine(playersConfig, {
          tokensPerPlayer: 1,
          animationDelayMs: 300,
        });

        engineRef.current = engine;
        setRedDiceValue(null);
        setGreenDiceValue(null);
        setRedIsRolling(false);
        setGreenIsRolling(false);
        setEngineState(engine.getGameState());

        // Re-bind engine event listeners
        engine.addEventListener("STATE_UPDATE", (payload) => {
          isTokenAnimating.current = false;
          setEngineState({ ...payload.state });
          localStorage.setItem("ludo_sl_engine_state", JSON.stringify(payload.state));
          if (!isSyncingFromRemote.current) {
            syncStateToOpponent();
          }
        });
        engine.addEventListener("DICE_ROLL_START", (payload) => {
          SoundEngine.play('DICE_ROLL');
          if (payload.activePlayerColor === "RED") setRedIsRolling(true);
          else setGreenIsRolling(true);
        });
        engine.addEventListener("DICE_ROLL_COMPLETE", (payload) => {
          SoundEngine.play('DICE_STOP');
          if (payload.activePlayerColor === "RED") { setRedIsRolling(false); if (payload.diceValue !== undefined) setRedDiceValue(payload.diceValue); }
          else { setGreenIsRolling(false); if (payload.diceValue !== undefined) setGreenDiceValue(payload.diceValue); }
        });
        engine.addEventListener("TOKEN_MOVE_STEP", (payload) => {
          isTokenAnimating.current = true;
          SoundEngine.play('TOKEN_STEP');
          setEngineState({ ...payload.state });
          if (!isSyncingFromRemote.current) {
            syncStateToOpponent();
          }
        });
        engine.addEventListener("SNAKE_SLIDE", () => { isTokenAnimating.current = true; SoundEngine.play('CAPTURE'); });
        engine.addEventListener("TOKEN_KILL", (payload) => {
          isTokenAnimating.current = true;
          SoundEngine.play('CAPTURE');
          setKillBanner(payload.message || "⚔️ TOKEN KILLED!");
          setTimeout(() => setKillBanner(null), 2500);
        });
        engine.addEventListener("LADDER_CLIMB", (payload) => {
          isTokenAnimating.current = true;
          SoundEngine.play('HOME_ENTRY');
          const from = payload.ladderStart!;
          const to = payload.ladderEnd!;
          setLadderAnim({ from, to, active: true });
          const steps = to - from;
          setTimeout(() => setLadderAnim(null), steps * 300 + 1000);
        });
        engine.addEventListener("GAME_OVER", (payload) => {
          const localPlayerIdx = newMyColor === "RED" ? 0 : 1;
          const localPlayer = payload.state.players[localPlayerIdx];
          const isWin = localPlayer.winnerRank === 1;
          const kXP = (localPlayer.killCount || 0) * 50;
          const lXP = (localPlayer.ladderCount || 0) * 70;
          const wXP = isWin ? 200 : 20;
          const tXP = kXP + lXP + wXP;
          const entryFee = parseInt(localStorage.getItem("ludo_current_entry_fee") || "5000");
          const winReward = Math.round(entryFee * 1.9); // 2 * entryFee - 5% commission
          const currentUser = useUserStore.getState().user;
          const cCoins = currentUser?.coins || 0;
          const cXP = currentUser?.xp || 0;
          updateUser({ coins: isWin ? cCoins + winReward : cCoins, xp: cXP + tXP });
          if (isWin) {
            SoundEngine.play('WIN');
            try { confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#FFD700', '#FFA500', '#10B981', '#3B82F6', '#EF4444'] }); } catch (e) {}
          }
        });

        localStorage.setItem("ludo_active_match_session", "SNAKE_LADDER");
      });

      socketRef.current = socket;

      return () => {
        socket.disconnect();
      };
    } catch (e) {}
  }, []);

  // Turn timer countdown effect — resets to 15s on turn change
  useEffect(() => {
    setTurnTimerSeconds(15);
    if (engineState.phase !== "PLAYING") return;

    const interval = setInterval(() => {
      setTurnTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (engineState.currentTurnColor === myColor && !myIsRolling && !isTokenAnimating.current) {
            try { SoundEngine.play('TIMEOUT'); } catch (e) {}
            if (engineState.isWaitingForTokenChoice && engineState.movableTokenIds.length > 0) {
              handleSelectToken(engineState.movableTokenIds[0]);
            } else {
              handleRoll(true);
            }
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [engineState.currentTurnColor, engineState.phase, engineState.isWaitingForTokenChoice, myIsRolling]);

  // Setup Event Listeners on mount
  useEffect(() => {
    if (!engineRef.current) return;
    const engine = engineRef.current;

    // BUG 5 FIX: STATE_UPDATE is the ONLY place we persist to localStorage.
    // TOKEN_MOVE_STEP does NOT save — prevents O(N) localStorage writes per move.
    engine.addEventListener("STATE_UPDATE", (payload) => {
      isTokenAnimating.current = false;
      setEngineState({ ...payload.state });
      if (payload.state.diceValue !== null && payload.state.diceValue !== undefined) {
        const activeColor = payload.state.players[payload.state.activePlayerIndex]?.color;
        if (activeColor === "RED") {
          setRedDiceValue(payload.state.diceValue);
        } else if (activeColor === "GREEN") {
          setGreenDiceValue(payload.state.diceValue);
        }
      }
      localStorage.setItem("ludo_sl_engine_state", JSON.stringify(payload.state));
      if (!isSyncingFromRemote.current) {
        syncStateToOpponent();
      }
    });

    // Sync rolling state on roll start
    engine.addEventListener("DICE_ROLL_START", (payload) => {
      SoundEngine.play('DICE_ROLL');
      if (payload.activePlayerColor === "RED") {
        setRedIsRolling(true);
      } else {
        setGreenIsRolling(true);
      }
    });

    engine.addEventListener("DICE_ROLL_COMPLETE", (payload) => {
      SoundEngine.play('DICE_STOP');
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
      if (!isSyncingFromRemote.current) {
        syncStateToOpponent();
      }
    });

    // Snake Slide — play snake bite / capture sound effect
    engine.addEventListener("SNAKE_SLIDE", (payload) => {
      isTokenAnimating.current = true;
      SoundEngine.play('CAPTURE');
    });

    // Token Kill — play capture sound + show announcement banner
    engine.addEventListener("TOKEN_KILL", (payload) => {
      isTokenAnimating.current = true;
      SoundEngine.play('CAPTURE');
      setKillBanner(payload.message || "⚔️ TOKEN KILLED!");
      setTimeout(() => setKillBanner(null), 2500);
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

    // Win event — reward 9,500 coins + XP calculation (1 kill = 50 XP, 1 ladder = 70 XP, Win = 200 XP) + sound
    engine.addEventListener("GAME_OVER", (payload) => {
      // Use local player's perspective (myPlayerIndex) instead of hardcoded players[0]
      const localPlayerIdx = myColor === "RED" ? 0 : 1;
      const localPlayer = payload.state.players[localPlayerIdx];
      const isWinner = localPlayer.winnerRank === 1;
      const killsXP = (localPlayer.killCount || 0) * 50;
      const laddersXP = (localPlayer.ladderCount || 0) * 70;
      const winXP = isWinner ? 200 : 20;
      const totalXP = killsXP + laddersXP + winXP;

      const entryFee = parseInt(localStorage.getItem("ludo_current_entry_fee") || "5000");
      const winReward = Math.round(entryFee * 1.9); // 2 * entryFee - 5% commission
      const currentCoins = useUserStore.getState().user?.coins || 0;
      const currentXP = useUserStore.getState().user?.xp || 0;

      updateUser({
        coins: isWinner ? currentCoins + winReward : currentCoins,
        xp: currentXP + totalXP,
      });

      if (isWinner) {
        SoundEngine.play('WIN');
        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#FFD700', '#FFA500', '#10B981', '#3B82F6', '#EF4444'],
          });
        } catch (e) {}
      }
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



  const handleRoll = (isTimeout: boolean = false) => {
    if (
      !engineRef.current ||
      engineState.currentTurnColor !== myColor ||
      myIsRolling ||
      isTokenAnimating.current ||
      engineState.phase !== "PLAYING" ||
      engineState.isWaitingForTokenChoice
    ) return;

    SoundEngine.play('DICE_ROLL');
    setMyIsRolling(true);

    const rolled = engineRef.current!.roll();

    // Broadcast rolling animation + exact rolled value to opponent
    const oppRaw = localStorage.getItem("ludo_sl_opponent");
    if (socketRef.current && oppRaw) {
      try {
        const rc = JSON.parse(oppRaw).roomCode;
        if (rc) {
          socketRef.current.emit("client_action", {
            roomCode: rc,
            actionType: "SL_DICE_ROLLING",
            rollingColor: myColor,
            diceValue: rolled,
          });
        }
      } catch (e) {}
    }

    let flashCount = 0;
    const flashInterval = setInterval(() => {
      setMyDiceValue(Math.ceil(Math.random() * 6));
      flashCount++;
      if (flashCount >= 10) {
        clearInterval(flashInterval);
        setMyIsRolling(false);
        setMyDiceValue(rolled);
        
        if (isTimeout) {
          // If it was a timeout roll, check if the engine is waiting for token choice.
          // If so, immediately auto-select the first token to make the move.
          const latestState = engineRef.current!.getGameState();
          if (latestState.isWaitingForTokenChoice && latestState.movableTokenIds.length > 0) {
            setTimeout(() => {
              handleSelectToken(latestState.movableTokenIds[0]);
            }, 400);
            return;
          }
        }
        
        // Explicitly sync engine state to opponent after a short settle delay
        setTimeout(syncStateToOpponent, 150);
      }
    }, 80);
  };

  // Bot Auto-Play: opponent's turn — roll after delay if opponent is a bot
  useEffect(() => {
    if (
      engineState.currentTurnColor !== oppColor ||
      engineState.phase !== "PLAYING" ||
      oppIsRolling ||
      engineState.isWaitingForTokenChoice ||
      !engineState.players[oppPlayerIndex].isBot
    ) return;

    const botDelay = setTimeout(() => {
      if (!engineRef.current || isTokenAnimating.current) return;
      setOppIsRolling(true);
      let flashCount = 0;
      const flashInterval = setInterval(() => {
        setOppDiceValue(Math.ceil(Math.random() * 6));
        flashCount++;
        if (flashCount >= 8) {
          clearInterval(flashInterval);
          setOppIsRolling(false);
          if (!isTokenAnimating.current) {
            const rolled = engineRef.current!.roll();
            setOppDiceValue(rolled);
          }
        }
      }, 80);
    }, 1000 + Math.random() * 1200);

    return () => clearTimeout(botDelay);
  }, [engineState.currentTurnColor, engineState.phase, engineState.isWaitingForTokenChoice, oppIsRolling]);

  const handleSelectToken = (tokenId: number) => {
    if (!engineRef.current || engineState.currentTurnColor !== myColor || !engineState.isWaitingForTokenChoice) return;
    const rolled = engineState.diceValue || 0;
    engineRef.current.moveToken(tokenId, rolled);
    // Sync state to opponent after token move settles
    setTimeout(syncStateToOpponent, 150);
  };

  const handleExitClick = () => {
    if (engineState.phase === "PLAYING") {
      setShowExitConfirm(true);
    } else {
      onLeave();
    }
  };

  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    localStorage.removeItem("ludo_active_match_session");
    localStorage.removeItem("ludo_sl_engine_state");

    if (engineRef.current && engineState.phase === "PLAYING") {
      const state = engineRef.current.getGameState();
      state.phase = "FINISHED";
      state.players[myPlayerIndex].winnerRank = 2;  // Local player is Loser (quitting)
      state.players[oppPlayerIndex].winnerRank = 1;  // Opponent is Winner
      state.logMessage = `🚪 Match Forfeited! ${state.players[myPlayerIndex].name} quit the match.`;
      engineRef.current.setGameState(state);

      // Deduct entry fee penalty for quitting match
      const entryFee = parseInt(localStorage.getItem("ludo_current_entry_fee") || "5000");
      const currentCoins = user?.coins || 0;
      updateUser({
        coins: Math.max(0, currentCoins - entryFee),
      });
    } else {
      onLeave();
    }
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
      tokensPerPlayer: 1,
      animationDelayMs: 250,
    });

    engineRef.current = engine;
    setRedDiceValue(null);
    setGreenDiceValue(null);
    setRedIsRolling(false);
    setGreenIsRolling(false);

    // Bind state updater listener
    engine.addEventListener("STATE_UPDATE", (payload) => {
      setEngineState(payload.state);
      localStorage.setItem("ludo_sl_engine_state", JSON.stringify(payload.state));
    });
  };

  // 🔄 Play Again handler — sends rematch request for real opponents, local reset for bots
  const handlePlayAgain = () => {
    const savedOpponentRaw = localStorage.getItem("ludo_sl_opponent");
    const savedOpp = savedOpponentRaw ? (() => { try { return JSON.parse(savedOpponentRaw); } catch { return null; } })() : null;
    const isRealOpponent = savedOpp && savedOpp.isBot === false && savedOpp.roomCode;

    if (isRealOpponent && socketRef.current) {
      // Real multiplayer opponent — send rematch request
      setWaitingForRematch(true);
      socketRef.current.emit("request_rematch", {
        roomCode: savedOpp.roomCode,
        userId: user?.id || "usr_" + Math.floor(Math.random() * 100000),
        name: playerName,
        avatar: user?.avatar,
        profileFrame: "/assets/images/icons/profile_frame_v3.png",
        nameBanner: "/assets/images/icons/name_banner_v2.png",
        color: myColor,
      });
    } else {
      // Bot opponent — local reset
      resetGame();
    }
  };

  const handleProfileClick = (playerColor: PlayerColor) => {
    const p = engineState.players.find((x) => x.color === playerColor);
    if (!p) return;

    if (playerColor === myColor) {
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
      const savedOpponentRaw = localStorage.getItem("ludo_sl_opponent");
      const opponentData = savedOpponentRaw ? (() => { try { return JSON.parse(savedOpponentRaw); } catch { return null; } })() : null;
      const isRealOpponent = opponentData && opponentData.name === p.name;

      const profileId = isRealOpponent ? `real_${p.name}` : (GLOBAL_PLAYER_DATABASE.find((x) => x.username === p.name)?.playerId || "bot_456");
      const isRequested = sentFriendRequests.includes(profileId);

      const botProfile = !isRealOpponent ? GLOBAL_PLAYER_DATABASE.find((x) => x.username === p.name) : null;

      const stats: UserStats = {
        id: profileId,
        name: p.name,
        avatarUrl: p.avatar,
        equippedFrame: p.equippedFrameId || "frame_default",
        level: isRealOpponent ? 4 : (botProfile?.level || 12),
        country: isRealOpponent ? "INDIA" : (botProfile?.country || "INDIA"),
        countryFlag: isRealOpponent ? "🇮🇳" : (botProfile?.countryFlag || "🇮🇳"),
        totalEarning: isRealOpponent ? "35 K" : (botProfile?.totalEarning || "1.2 M"),
        currentGold: isRealOpponent ? 25000 : (botProfile?.currentCoins || 50000),
        currentLeague: isRealOpponent ? "Silver" : (botProfile?.currentLeague || "Bronze"),
        gamesWon: isRealOpponent ? 15 : (botProfile?.matchesWon || 15),
        gamesPlayed: isRealOpponent ? 32 : (botProfile?.matchesPlayed || 30),
        teamWins: isRealOpponent ? 4 : (botProfile?.teamWins || 4),
        winStreak: isRealOpponent ? 2 : (botProfile?.currentWinStreak || 1),
        twoPlayerWins: isRealOpponent ? 8 : (botProfile?.twoPlayerWins || 6),
        titanBadgeCount: isRealOpponent ? 0 : (botProfile?.titanBadgeCount || 0),
        fourPlayerWins: isRealOpponent ? 7 : (botProfile?.fourPlayerWins || 5),
        killCount: isRealOpponent ? 18 : (botProfile?.killCount || 22),
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

    // Update local modal button state instantly to "Requested"
    setSelectedProfile((prev) => prev ? { ...prev, isFriendRequested: true } as any : null);

    if (friendId.startsWith("real_")) {
      // Real matched opponent! Send friend request via socket
      const oppRaw = localStorage.getItem("ludo_sl_opponent");
      if (socketRef.current && oppRaw) {
        try {
          const rc = JSON.parse(oppRaw).roomCode;
          if (rc) {
            const senderAvatar = user?.avatar || "/assets/images/icons/icon_club_crown.png";
            const senderFrame = useCosmeticsStore.getState().equippedFrameId || "frame_default";

            socketRef.current.emit("client_action", {
              roomCode: rc,
              actionType: "SL_FRIEND_REQUEST",
              senderName: playerName,
              senderAvatar: senderAvatar,
              senderLevel: user?.level || 1,
              senderFrame: senderFrame,
            });
          }
        } catch (e) {}
      }
    } else {
      // Bot profile fallback
      const targetPlayer = GLOBAL_PLAYER_DATABASE.find(p => p.playerId === friendId);
      if (targetPlayer) {
        useFriendsStore.getState().addFriend({
          id: targetPlayer.playerId,
          name: targetPlayer.username,
          status: "Online",
          isOnline: true,
          isFB: false,
          avatarUrl: targetPlayer.avatarUrl,
          coins: targetPlayer.currentCoins,
          level: targetPlayer.level
        });
      }
    }
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
          onClick={() => {
            setActiveClickedCell(cell);
          }}
          style={{
            gridRow: row + 1,
            gridColumn: col + 1,
            transform: transformStr || undefined,
          }}
          className="relative flex flex-col items-center justify-center bg-transparent border-0 select-none cursor-pointer"
        >
          {/* Player tokens */}
          <div className={`${containerClass} max-w-full max-h-full p-[1px]`}>
            {redTokensHere.map((t) => {
              const isMovable = myColor === "RED" && engineState.currentTurnColor === "RED" && engineState.isWaitingForTokenChoice && engineState.movableTokenIds.includes(t.tokenId);
              return (
                <button
                  key={`red-${t.tokenId}-${t.currentPosition}`}
                  disabled={!isMovable}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectToken(t.tokenId);
                  }}
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

            {greenTokensHere.map((t) => {
              const isMovable = myColor === "GREEN" && engineState.currentTurnColor === "GREEN" && engineState.isWaitingForTokenChoice && engineState.movableTokenIds.includes(t.tokenId);
              return isMovable ? (
                <button
                  key={`green-${t.tokenId}-${t.currentPosition}`}
                  disabled={!isMovable}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectToken(t.tokenId);
                  }}
                  style={{ width: `${sizePx}px`, height: `${sizePx}px` }}
                  className={`p-0 bg-transparent border-0 outline-none relative ${
                    t.isMoving
                      ? "token-hop z-30"
                      : isMovable
                      ? `cursor-pointer scale-110 drop-shadow-[0_0_6px_rgba(251,191,36,0.95)] ${animationClass} z-30`
                      : "z-10 transition-transform"
                  }`}
                  title="Click to move this Green Token"
                >
                  <img
                    src={`/assets/images/icons/luxury_token_green.png?v=${ASSET_VERSION}`}
                    alt="GREEN"
                    className="w-full h-full object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
                    draggable={false}
                  />
                  {isMovable && (
                    <div className="absolute inset-0 border-[1px] border-yellow-400 rounded-full animate-ping" />
                  )}
                </button>
              ) : (
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
              );
            })}
          </div>

          {/* Ladder Start Highlight Ring */}
          {LADDER_STARTS.includes(cell) && (
            <div className="absolute inset-0.5 rounded-lg border border-emerald-400/60 bg-emerald-500/10 pointer-events-none z-0 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse" />
          )}

          {/* Snake Head Highlight Ring */}
          {SNAKE_HEADS.includes(cell) && (
            <div className="absolute inset-0.5 rounded-lg border border-rose-500/60 bg-rose-500/10 pointer-events-none z-0 shadow-[0_0_8px_rgba(244,63,94,0.4)] animate-pulse" />
          )}

          {/* Cell Number Badge (1 - 100) */}
          {showNumbers && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <div className="w-[15px] h-[15px] rounded-full bg-amber-500/85 border border-yellow-400/50 flex items-center justify-center text-[7.5px] font-black text-slate-950 shadow-[0_0_5px_rgba(245,158,11,0.6)]">
                {cell}
              </div>
            </div>
          )}

          {/* Red Target Calibration Dot Overlay */}
          {(showCalibrator || activeClickedCell === cell) && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
              <div className={`w-[18px] h-[18px] rounded-full bg-gradient-to-r from-red-600 to-rose-600 border-[1.5px] border-amber-300 flex items-center justify-center text-[7.5px] font-black text-white shadow-[0_0_10px_rgba(239,68,68,0.95)] ${
                activeClickedCell === cell ? 'animate-bounce scale-125 border-yellow-200' : ''
              }`}>
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

      {/* ⚔️ Token Kill Banner Announcement Overlay */}
      {killBanner && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none animate-bounce">
          <div className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 via-rose-700 to-amber-600 border-2 border-yellow-300 text-white font-black text-xs md:text-sm tracking-wider shadow-[0_0_25px_rgba(239,68,68,0.95)] flex items-center gap-2">
            <span className="text-base">⚔️</span>
            <span>{killBanner}</span>
          </div>
        </div>
      )}

      {/* 🔄 Rematch Notification Banner */}
      {rematchNotification && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce max-w-[90%] pointer-events-none">
          <div className="bg-slate-900/95 border-2 border-emerald-400/90 text-emerald-200 px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2">
            <span className="text-base animate-spin">🔄</span>
            <span className="text-[11px] font-black tracking-wider uppercase">{rematchNotification}</span>
          </div>
        </div>
      )}

      {/* Top Banner Notification for Friend Request */}
      {friendRequestNotification && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce max-w-[90%] pointer-events-none">
          <div className="bg-slate-900/95 border-2 border-amber-400/90 text-amber-200 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-amber-500/50 bg-slate-950 flex-shrink-0">
              {friendRequestNotification.senderAvatar ? (
                <img src={friendRequestNotification.senderAvatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="w-full h-full flex items-center justify-center text-sm font-black bg-slate-950 text-amber-200">
                  {friendRequestNotification.senderName.charAt(0)}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">Friend Request</span>
              <span className="text-[9px] text-gray-200 font-bold leading-none">
                {friendRequestNotification.senderName} sent you a friend request!
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2">
        {/* HAMBURGER MENU BUTTON: FIXED TOP-LEFT */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-10 h-10 rounded-2xl bg-slate-900/90 border border-amber-400/40 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer z-30"
          title="Open Menu"
        >
          <span className="text-lg text-amber-300 font-bold">☰</span>
        </button>
      </div>

      {/* Gameplay Settings Dropdown Menu */}
      {showMenu && (
        <div className="fixed inset-0 bg-transparent z-50 pointer-events-auto" onClick={() => setShowMenu(false)}>
          <div 
            className="absolute top-16 left-4 w-[165px] bg-[#12061F]/95 backdrop-blur-md border border-amber-400/30 p-3 rounded-2xl flex flex-col gap-2.5 shadow-2xl z-50 pointer-events-auto animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center pb-1.5 border-b border-purple-500/20">
              <h3 className="text-[10px] font-black text-amber-400 tracking-wider uppercase">GAME OPTIONS</h3>
              <button
                onClick={() => setShowMenu(false)}
                className="text-[10px] text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Sounds Toggle */}
            <div className="flex justify-between items-center bg-purple-950/40 px-2 py-1.5 rounded-xl border border-purple-500/10">
              <div className="flex items-center gap-1.5">
                <span className="text-xs">{isMuted ? "🔇" : "🔊"}</span>
                <span className="text-[9.5px] font-bold text-gray-200">Sounds</span>
              </div>
              <button
                onClick={handleSoundToggle}
                className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-200 focus:outline-none cursor-pointer ${
                  !isMuted ? "bg-amber-400" : "bg-slate-700"
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                    !isMuted ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Reset Board */}
            <button
              onClick={() => {
                setShowMenu(false);
                resetGame();
              }}
              className="w-full py-1.5 bg-amber-500/20 hover:bg-amber-500/30 active:scale-95 transition-all border border-amber-400/30 rounded-xl text-amber-300 font-black text-[9.5px] tracking-wider uppercase flex items-center justify-center gap-1 cursor-pointer"
            >
              🔄 RESET MATCH
            </button>

            {/* Exit Option */}
            <button
              onClick={() => {
                setShowMenu(false);
                handleExitClick();
              }}
              className="w-full py-1.5 bg-red-600/20 hover:bg-red-600/30 active:scale-95 transition-all border border-red-500/35 rounded-xl text-red-400 font-black text-[9.5px] tracking-wider uppercase flex items-center justify-center gap-1 cursor-pointer"
            >
              🚪 EXIT MATCH
            </button>
          </div>
        </div>
      )}

      {/* Top Right Corner Player Avatar (Player 2 / Bot) */}
      <div
        className="absolute top-10 right-4 z-20 cursor-pointer transition-transform hover:scale-105 active:scale-95"
        onClick={() => handleProfileClick(oppColor)}
      >
        <CornerPlayerAvatar
          player={engineState.players[oppPlayerIndex] as any}
          isActive={engineState.currentTurnColor === oppColor && engineState.phase === "PLAYING"}
          diceValue={oppDiceValue}
          isDiceRolled={false}
          canRoll={false}
          turnTimerSeconds={turnTimerSeconds}
          isAutoMode={false}
          chatBubbleMessage={activeSpeechBubbles[oppColor]}
          position="top-right"
          isLocalPlayer={false}
        />
      </div>

      {/* GREEN Start Yard (Tokens at position 0) */}
      <div className="absolute top-[64px] right-[105px] z-20 flex gap-1.5">
        {engineState.players[oppPlayerIndex].tokens.map((t) => {
          if (t.currentPosition > 0) return null;
          return (
            <div key={t.tokenId} className="w-6 h-6 opacity-75">
              <img
                src={`/assets/images/icons/luxury_token_${oppColor.toLowerCase()}.png?v=${ASSET_VERSION}`}
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
        onClick={() => handleProfileClick(myColor)}
      >
        <CornerPlayerAvatar
          player={engineState.players[myPlayerIndex] as any}
          isActive={engineState.currentTurnColor === myColor && engineState.phase === "PLAYING"}
          diceValue={myDiceValue}
          isDiceRolled={false}
          canRoll={engineState.currentTurnColor === myColor && !myIsRolling && engineState.phase === "PLAYING" && !engineState.isWaitingForTokenChoice}
          turnTimerSeconds={turnTimerSeconds}
          isAutoMode={false}
          chatBubbleMessage={activeSpeechBubbles[myColor]}
          onRollDice={() => handleRoll(false)}
          position="bottom-left"
          isLocalPlayer={true}
        />
      </div>

      {/* LUXURY CHAT BUTTON: FIXED BOTTOM RIGHT */}
      <div className="absolute bottom-24 right-3 z-30 flex items-center justify-center pointer-events-auto">
        <button
          onClick={() => setShowChatModal(true)}
          className="w-8 h-8 relative hover:scale-110 active:scale-90 transition-transform cursor-pointer filter drop-shadow-[0_4px_10px_rgba(234,179,8,0.7)]"
          title="Open Chat"
        >
          <img
            src="/assets/images/icons/luxury_chat_button.png"
            alt="Chat"
            className="w-full h-full object-contain pointer-events-none"
            draggable={false}
          />
        </button>
      </div>

      {/* RED Start Yard (Tokens at position 0) */}
      <div className="absolute bottom-[77px] left-[180px] z-20 flex gap-1.5 items-center">
        {engineState.players[myPlayerIndex].tokens.map((t) => {
          if (t.currentPosition > 0) return null;
          const isMovable = engineState.currentTurnColor === myColor && engineState.isWaitingForTokenChoice && engineState.movableTokenIds.includes(t.tokenId);
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
              title={isMovable ? "Click to move this token onto the board" : `My Token ${t.tokenId + 1} at Start`}
            >
              <img
                src={`/assets/images/icons/luxury_token_${myColor.toLowerCase()}.png?v=${ASSET_VERSION}`}
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
            onClick={() => handleRoll(false)}
            disabled={myIsRolling || engineState.currentTurnColor !== myColor || engineState.isWaitingForTokenChoice}
            className={`relative bg-transparent border-0 outline-none p-1 rounded-2xl transition-all active:scale-90 hover:scale-105 ${
              myIsRolling || engineState.currentTurnColor !== myColor || engineState.isWaitingForTokenChoice
                ? "pointer-events-none opacity-80"
                : "cursor-pointer"
            }`}
            title="Click to Roll"
          >
            <DiceFace
              value={myDiceValue}
              isRolling={myIsRolling}
              diceId={`dice_${myColor.toLowerCase()}`}
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
              engineState.currentTurnColor === oppColor ? "opacity-100" : "opacity-40"
            }`}
            title="Opponent Dice"
          >
            <DiceFace
              value={oppDiceValue}
              isRolling={oppIsRolling}
              diceId={`dice_${oppColor.toLowerCase()}`}
              size={58}
            />
            {engineState.currentTurnColor === oppColor && oppIsRolling && (
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
              onClick={handlePlayAgain}
              disabled={waitingForRematch}
              className={`px-6 py-2 rounded-xl text-white font-black text-[11px] uppercase tracking-widest shadow-lg hover:scale-102 active:scale-97 cursor-pointer border-0 outline-none transition-transform ${
                waitingForRematch
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-600 animate-pulse'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600'
              }`}
            >
              {waitingForRematch ? '⏳ Waiting for Opponent...' : '🔄 Play Again'}
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
          onSendGift={(type, amount) => {
            const currentCoins = user?.coins || 0;
            const currentGems = user?.gems || 0;
            if (type === "COINS" && currentCoins < amount) {
              alert("❌ Insufficient Coins!");
              return;
            }
            if (type === "GEMS" && currentGems < amount) {
              alert("❌ Insufficient Gems!");
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
                senderName: playerName,
                targetId: selectedProfile.id,
                targetName: selectedProfile.name,
                giftType: type,
                amount: amount,
              });
            }

            try {
              confetti({ particleCount: 40, spread: 50, colors: ['#9333EA', '#FFD700'] });
            } catch (e) {}
            setSelectedProfile(null);
          }}
        />
      )}

      {/* ⚠️ Game Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-rose-500/40 p-6 shadow-[0_0_50px_rgba(244,63,94,0.3)] text-center flex flex-col items-center gap-4">
            
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(244,63,94,0.6)] border border-rose-300">
              🚪
            </div>

            <div>
              <h2 className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-red-400 to-rose-300">
                LEAVE MATCH?
              </h2>
              <p className="text-xs text-slate-300 font-medium mt-2 leading-relaxed">
                अगर आप बीच में गेम छोड़कर बाहर जाते हैं, तो आपको <span className="text-rose-400 font-extrabold">Match Forfeit (हार)</span> घोषित कर दिया जाएगा और आपके दांव के कॉइन्स कट जाएंगे!
              </p>
            </div>

            <div className="flex w-full gap-3 mt-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-black text-xs uppercase tracking-wider hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
              >
                🎮 Stay & Play
              </button>
              <button
                onClick={handleConfirmExit}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 text-white font-black text-xs uppercase tracking-wider shadow-lg hover:scale-102 active:scale-95 transition-all cursor-pointer border-0 outline-none"
              >
                🚪 Quit Match
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 🏆 Match Result Victory / Defeat Modal Overlay */}
      {engineState.phase === "FINISHED" && (() => {
        // Use local player's perspective instead of hardcoded players[0]
        const localPlayer = engineState.players[myPlayerIndex];
        const oppPlayer = engineState.players[oppPlayerIndex];
        const isWinner = localPlayer.winnerRank === 1;
        const kills = localPlayer.killCount || 0;
        const ladders = localPlayer.ladderCount || 0;
        const killsXP = kills * 50;
        const laddersXP = ladders * 70;
        const winXP = isWinner ? 200 : 20;
        const totalXP = killsXP + laddersXP + winXP;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
            <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border-2 border-amber-400/40 p-6 shadow-[0_0_50px_rgba(245,158,11,0.3)] text-center flex flex-col items-center gap-4">
              
              {/* Header Badge */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(245,158,11,0.6)] border border-yellow-200">
                {isWinner ? "🏆" : "💔"}
              </div>

              <div>
                <h2 className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200">
                  {isWinner ? "VICTORY!" : "MATCH ENDED"}
                </h2>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  {isWinner
                    ? (engineState.logMessage?.includes("disconnected") ? `${oppPlayer.name} disconnected! You win!` : "Congratulations! You reached Cell 100 first!")
                    : `${oppPlayer.name} reached Cell 100!`
                  }
                </p>
              </div>

              {/* Rewards Summary Box */}
              <div className="w-full rounded-2xl bg-slate-800/80 border border-slate-700/60 p-4 flex flex-col gap-3">
                {/* Coins Row */}
                <div className={`flex items-center justify-between px-3 py-2 rounded-xl border ${
                  isWinner ? 'bg-amber-500/10 border-amber-500/20' : 'bg-rose-500/10 border-rose-500/20'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🪙</span>
                    <span className={`text-xs font-bold uppercase tracking-wider ${isWinner ? 'text-amber-200' : 'text-rose-200'}`}>
                      {isWinner ? "Bet Win Reward" : "Forfeit Penalty"}
                    </span>
                  </div>
                  <span className={`text-sm font-black ${isWinner ? 'text-amber-400' : 'text-rose-400'}`}>
                    {(() => {
                      const entryFee = parseInt(localStorage.getItem("ludo_current_entry_fee") || "5000");
                      const winReward = Math.round(entryFee * 1.9);
                      return isWinner ? `+${winReward.toLocaleString()} Coins` : `-${entryFee.toLocaleString()} Coins`;
                    })()}
                  </span>
                </div>

                {/* XP Breakdown Header */}
                <div className="text-[10px] font-black uppercase text-purple-300 tracking-wider text-left pl-1">
                  XP Rewards Breakdown
                </div>

                {/* Kill XP Row */}
                <div className="flex items-center justify-between text-xs text-slate-300 px-2">
                  <span className="flex items-center gap-1.5">
                    ⚔️ <span>{kills} Kills</span> <span className="text-[10px] text-slate-500">(×50 XP)</span>
                  </span>
                  <span className="font-extrabold text-emerald-400">+{killsXP} XP</span>
                </div>

                {/* Ladder XP Row */}
                <div className="flex items-center justify-between text-xs text-slate-300 px-2">
                  <span className="flex items-center gap-1.5">
                    🪜 <span>{ladders} Ladders</span> <span className="text-[10px] text-slate-500">(×70 XP)</span>
                  </span>
                  <span className="font-extrabold text-emerald-400">+{laddersXP} XP</span>
                </div>

                {/* Win Bonus XP Row */}
                <div className="flex items-center justify-between text-xs text-slate-300 px-2">
                  <span className="flex items-center gap-1.5">
                    🏆 <span>{isWinner ? "Victory Bonus" : "Match Bonus"}</span>
                  </span>
                  <span className="font-extrabold text-emerald-400">+{winXP} XP</span>
                </div>

                <div className="h-[1px] bg-slate-700/60 my-0.5" />

                {/* Total XP Row */}
                <div className="flex items-center justify-between px-2">
                  <span className="text-xs font-black uppercase text-purple-200 tracking-wider">Total XP Earned</span>
                  <span className="text-sm font-black text-purple-400">+{totalXP} XP</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex w-full gap-2">
                <button
                  onClick={handlePlayAgain}
                  disabled={waitingForRematch}
                  className={`flex-1 py-3 rounded-xl text-white font-black text-xs uppercase tracking-wider shadow-lg hover:scale-102 active:scale-95 transition-all border-0 outline-none cursor-pointer ${
                    waitingForRematch
                      ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 animate-pulse'
                      : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600'
                  }`}
                >
                  {waitingForRematch ? '⏳ Waiting...' : '🔄 Play Again'}
                </button>
                <button
                  onClick={onLeave}
                  className="px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
                >
                  🚪 Exit
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Chat Modal */}
      <ChatModal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        onSendMessage={handleSendMessage}
        messages={chatHistory}
      />
    </div>
  );
};

export default SnakeLadderPage;
