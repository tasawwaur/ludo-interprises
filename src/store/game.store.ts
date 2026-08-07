import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { io } from 'socket.io-client';
import { GameState, MoveableToken, PlayerColor } from '../game/engine/Engine.types';
import { GameEngine } from '../game/engine/GameEngine';
import { RuleValidator } from '../game/rules/RuleValidator';
import { ReplayRecorder } from '../game/replay/ReplayRecorder';
import { SoundEngine } from '../game/sound/SoundEngine';
import { useRoomStore } from '../features/matchmaking/rooms/RoomStore';
import { useUserStore } from '../user/user.store';
import { useCosmeticsStore } from './cosmetics.store';
import { useDiceStore } from '../features/dice/store/dice.store';
import { getSocketUrl } from '../utils/socketUrl';
import confetti from 'canvas-confetti';

interface GameStoreState {
  gameState: GameState | null;
  localPlayerColor: PlayerColor | null;
  replayRecorder: ReplayRecorder;
  activeHoverTokenId: string | null;
  selectedTokenId: string | null;
  isMuted: boolean;
  turnTimerSeconds: number;
  isAutoMode: boolean;
  gameSocket: any | null;
  _isRolling: boolean;
  cheatNextRollValue: number | null;
  isSpectatorMode: boolean; // ✅ Spectator mode active
  opponentReconnectingSeconds: number | null;

  // Actions
  startMatch: (mode: '2P' | '2v2' | '4P', hostName: string) => void;
  startSpectatorMatch: (p1: any, p2: any) => void; // ✅ Spectate VIP bots match
  rollDice: () => void;
  undoRoll: () => void;
  moveToken: (tokenId: string, isRemote?: boolean) => void;
  setSelectedToken: (tokenId: string | null) => void;
  setHoverToken: (tokenId: string | null) => void;
  toggleMute: () => void;
  resetMatch: () => void;
  tickTurnTimer: () => void;
  disableAutoMode: () => void;
  triggerAiMoveIfNeeded: (forceAuto?: boolean) => void;
  demoStack: () => void;
  connectGameSocket: (roomCode: string) => void;
  disconnectGameSocket: () => void;
  joinAsSpectator: (roomCode: string) => void;
}

export const useGameStore = create<GameStoreState>()(
  persist(
    (set, get) => ({
      gameState: null,
      localPlayerColor: null,
      replayRecorder: new ReplayRecorder(),
      activeHoverTokenId: null,
      selectedTokenId: null,
      isMuted: true,
      turnTimerSeconds: 15,
      isAutoMode: false,
      gameSocket: null,
      _isRolling: false,
      cheatNextRollValue: null,
      isSpectatorMode: false, // ✅ Initialize as false
      opponentReconnectingSeconds: null,

      startMatch: (mode, hostName) => {
        // ✅ Restore state from localStorage on refresh
        const savedStateRaw = localStorage.getItem("ludo_classic_engine_state");
        if (savedStateRaw) {
          try {
            const parsed = JSON.parse(savedStateRaw);
            const localUser = useUserStore.getState().user;
            const localPlayer = parsed.players.find((p: any) => p.name === localUser?.username || p.name === localUser?.displayName) || parsed.players[0];
            
            const recorder = new ReplayRecorder();
            set({
              gameState: parsed,
              localPlayerColor: localPlayer.color as PlayerColor,
              replayRecorder: recorder,
              activeHoverTokenId: null,
              selectedTokenId: null,
              turnTimerSeconds: 15,
              isAutoMode: false,
            });
            return;
          } catch (e) {
            localStorage.removeItem("ludo_classic_engine_state");
          }
        }

        set({ gameState: null });

        const members = useRoomStore.getState().members;
        const localUser = useUserStore.getState().user;
        const localMember = members.find(m => m.name === localUser?.username || m.name === localUser?.displayName);
        const localColor = localMember?.color || members[0]?.color || "BLUE";
        const roomMode = useRoomStore.getState().mode || "2P Classic";
        const initialState = GameEngine.createInitialState(mode, hostName, members, roomMode);
        
        const cosmetics = useCosmeticsStore.getState();
        const dice = useDiceStore.getState();

        // ✅ Always use user's real profile data (avatar, dice, frame) — same as Snake & Ladders board
        const localUserAvatar = localUser?.avatar || "/assets/images/icons/icon_club_crown.png";

        // Enrich players with local cosmetics without overwriting opponent avatar
        initialState.players = initialState.players.map((p) => {
          const isMe = p.name === localUser?.username || p.name === localUser?.displayName;
          return {
            ...p,
            avatar: isMe ? localUserAvatar : (p.avatar || "/assets/images/icons/icon_club_crown.png"),
            equippedFrameId: isMe ? (cosmetics.equippedFrameId || 'frame_default') : (p.equippedFrameId || 'frame_default'),
            equippedTokenId: isMe ? (cosmetics.equippedTokenId || 'token_default') : (p.equippedTokenId || 'token_default'),
            equippedDiceId: isMe ? (dice.equippedDiceId || 'dice_classic') : (p.equippedDiceId || 'dice_classic'),
            profileFrame: isMe ? (cosmetics.frames.find((f) => f.id === cosmetics.equippedFrameId)?.imgUrl || p.profileFrame) : p.profileFrame,
          };
        });

        initialState.equippedBoardId = cosmetics.equippedBoardId || 'board_default';

        const recorder = new ReplayRecorder();
        recorder.recordEvent('TURN_CHANGE', initialState.currentTurnColor, { mode, hostName });

        SoundEngine.play('GAME_START');

        const savedMyColor = localStorage.getItem("ludo_classic_my_color");
        const hostPlayer = savedMyColor
          ? (initialState.players.find(p => p.color === savedMyColor) || initialState.players[0])
          : (initialState.players.find(p => p.name === localUser?.username || p.name === localUser?.displayName || p.isHost) || initialState.players[0]);

        set({
          gameState: initialState,
          localPlayerColor: hostPlayer.color as PlayerColor,
          replayRecorder: recorder,
          activeHoverTokenId: null,
          selectedTokenId: null,
          turnTimerSeconds: 15,
          isAutoMode: false,
        });

        localStorage.setItem("ludo_classic_engine_state", JSON.stringify(initialState));

        setTimeout(() => {
          get().triggerAiMoveIfNeeded();
        }, 800);
      },

      startSpectatorMatch: (p1, p2) => {
        set({ gameState: null });

        // Build 2 AI players
        const members = [
          { id: "m_1", name: p1.username, isHost: true, isBot: true, color: "BLUE", avatar: p1.avatarUrl, profileFrame: "frame_vip" },
          { id: "m_2", name: p2.username, isHost: false, isBot: true, color: "GREEN", avatar: p2.avatarUrl, profileFrame: "frame_vip" }
        ];

        const initialState = GameEngine.createInitialState('2P', p1.username, members, 'Normal Classic');

        // Force both to be AI
        initialState.players = initialState.players.map((p) => {
          return {
            ...p,
            isAi: true,
            equippedFrameId: 'frame_vip',
            equippedTokenId: 'token_default',
            equippedDiceId: 'dice_classic',
          };
        });

        initialState.equippedBoardId = 'board_default';

        const recorder = new ReplayRecorder();

        set({
          gameState: initialState,
          localPlayerColor: "BLUE" as PlayerColor,
          replayRecorder: recorder,
          activeHoverTokenId: null,
          selectedTokenId: null,
          turnTimerSeconds: 15,
          isAutoMode: false,
          isSpectatorMode: true, // ✅ Set flag
        });

        SoundEngine.play('GAME_START');

        setTimeout(() => {
          get().triggerAiMoveIfNeeded();
        }, 800);
      },

  toggleMute: () => {
    const isMuted = SoundEngine.toggleMute();
    set({ isMuted });
  },

  disableAutoMode: () => {
    const { gameState } = get();
    const seconds = gameState?.gameStatus === 'MOVE_WAIT' ? 10 : 15;
    set({ isAutoMode: false, turnTimerSeconds: seconds });
  },

  setSelectedToken: (tokenId) => set({ selectedTokenId: tokenId }),

  tickTurnTimer: () => {
    const { gameState, turnTimerSeconds } = get();
    if (!gameState || gameState.gameStatus === 'GAME_OVER' || gameState.gameStatus === 'TOKEN_MOVING') return;

    if (turnTimerSeconds > 1) {
      const newSeconds = turnTimerSeconds - 1;
      set({ turnTimerSeconds: newSeconds });

      // Tick sound and vibration feedback in last 3 seconds
      if (newSeconds <= 3) {
        SoundEngine.play('TICK');
        SoundEngine.vibrate(60);
      }
    } else {
      // Timer hit 0! Reset timer immediately to 15 to prevent sound loop or page freeze
      set({ turnTimerSeconds: 15 });
      SoundEngine.play('TIMEOUT');
      SoundEngine.vibrate(150);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('game_timeout'));
      }

      // Auto-play the turn for the active player (rolls dice + moves best token)
      get().triggerAiMoveIfNeeded(true);
    }
  },

  rollDice: () => {
    const { gameState, replayRecorder, _isRolling } = get();
    // 🔒 Hard lock — prevent any double-fire from multiple click sources
    if (_isRolling) return;
    if (!gameState || gameState.gameStatus !== 'ROLL_WAIT' || gameState.isDiceRolled) return;

    // Lock immediately
    set({ _isRolling: true } as any);

    const roomCode = useRoomStore.getState().roomCode;
    const gameSocket = get().gameSocket;

    SoundEngine.play('DICE_ROLL');

    let nextState = GameEngine.rollDice(gameState);

    // Apply cheat roll value if requested by Demo Stack
    const cheatVal = get().cheatNextRollValue;
    if (cheatVal !== null && nextState.diceValue) {
      nextState.diceValue = cheatVal;
      nextState.lastDiceValue = cheatVal;
      // Re-compute legal moves with the forced value
      const legalMoves = RuleValidator.getLegalMoves(nextState, cheatVal);
      nextState.movableTokens = legalMoves;
      // Clear flag
      set({ cheatNextRollValue: null } as any);
    }

    if (nextState.diceValue) {
      replayRecorder.recordEvent('DICE_ROLL', gameState.currentTurnColor, {
        value: nextState.diceValue,
      });

      // Emit rolling action with the actual dice value generated
      const hasLegalMoves = nextState.movableTokens.length > 0;
      if (gameSocket && roomCode) {
        gameSocket.emit("client_action", {
          actionId: `${Date.now()}_${Math.random()}`,
          roomCode,
          actionType: 'ROLL',
          diceValue: nextState.diceValue,
          hasLegalMoves,
          gameState: nextState, // ✅ Attach full state
        });
      }
    }

    const hasLegalMoves = nextState.movableTokens.length > 0;
    set({
      gameState: nextState,
      selectedTokenId: null,
      turnTimerSeconds: nextState.gameStatus === 'ROLL_WAIT' ? 15 : (hasLegalMoves ? 10 : 5),
    } as any);

    // ✅ Persist state
    localStorage.setItem("ludo_classic_engine_state", JSON.stringify(nextState));

    // Release roll lock after smooth 600ms animation finishes
    setTimeout(() => {
      SoundEngine.play('DICE_STOP');
      set({ _isRolling: false } as any);

      setTimeout(() => {
        get().triggerAiMoveIfNeeded();
      }, 300);
    }, 600);
  },

  moveToken: (tokenId: string, isRemote = false) => {
    const { gameState, replayRecorder, isAutoMode, turnTimerSeconds } = get();
    if (!gameState || gameState.gameStatus !== 'MOVE_WAIT' || turnTimerSeconds <= 0) return;

    const targetMove = gameState.movableTokens.find((m) => m.tokenId === tokenId);
    if (!targetMove) return;

    const activePlayer = gameState.players[gameState.activePlayerIndex];
    const totalSteps = Math.abs(targetMove.toStep - targetMove.fromStep);
    let stepCounter = 0;

    const animateStep = () => {
      stepCounter++;
      const currentStep = targetMove.fromStep + stepCounter;
      const prevStep = currentStep - 1;

      const isOpenToken = targetMove.fromStep === -1 && targetMove.toStep === 0;
      if (isOpenToken) {
        SoundEngine.play('TOKEN_OPEN');
      } else {
        SoundEngine.play('TOKEN_STEP');
      }

      set((state) => {
        if (!state.gameState) return state;
        return {
          gameState: {
            ...state.gameState,
            gameStatus: 'TOKEN_MOVING',
            animatingToken: {
              tokenId,
              color: activePlayer.color,
              fromStep: targetMove.fromStep,
              toStep: targetMove.toStep,
              currentStep,
              prevStep,
              stepStartTime: performance.now(),
            },
          },
        };
      });

      if (stepCounter < totalSteps) {
        setTimeout(animateStep, 260);
      } else {
        const nextState = GameEngine.moveToken(gameState, tokenId);

        if (targetMove.isCapture) {
          SoundEngine.play('CAPTURE');
        } else if (targetMove.isHome) {
          SoundEngine.play('HOME_ENTRY');
        } else if (nextState.gameStatus === 'GAME_OVER') {
          SoundEngine.play('WIN');
        } else if (nextState.currentTurnColor !== gameState.currentTurnColor) {
          SoundEngine.play('TURN_CHANGE');
        }

        replayRecorder.recordEvent('TOKEN_MOVE', gameState.currentTurnColor, {
          tokenId,
          fromStep: targetMove.fromStep,
          toStep: targetMove.toStep,
          isCapture: targetMove.isCapture,
        });

        const { gameSocket } = get();
        const roomCode = useRoomStore.getState().roomCode;
        if (gameSocket && roomCode && !isRemote) {
          gameSocket.emit("client_action", {
            actionId: `${Date.now()}_${Math.random()}`,
            roomCode,
            actionType: 'MOVE',
            tokenId,
            nextColor: nextState.currentTurnColor,
            isGameOver: nextState.gameStatus === 'GAME_OVER',
            gameState: nextState, // ✅ Attach full state
          });
        }

        const finalState = { ...nextState, animatingToken: null };
        set({
          gameState: finalState,
          activeHoverTokenId: null,
          selectedTokenId: null,
          turnTimerSeconds: isAutoMode ? 5 : 15,
        });

        // ✅ Persist state
        localStorage.setItem("ludo_classic_engine_state", JSON.stringify(finalState));

        setTimeout(() => {
          get().triggerAiMoveIfNeeded();
        }, 500);
      }
    };

    animateStep();
  },

  undoRoll: () => {
    const { gameState, gameSocket } = get();
    if (!gameState || !gameState.isDiceRolled || gameState.gameStatus !== 'MOVE_WAIT') return;

    const activePlayer = gameState.players[gameState.activePlayerIndex];

    const totalUndosUsed = activePlayer.totalUndosUsed || 0;
    const undosUsedThisTurn = activePlayer.undosUsedThisTurn || 0;
    const protectTurnsCount = activePlayer.protectTurnsCount || 0;

    if (totalUndosUsed >= 8) return; // Match limit reached
    if (undosUsedThisTurn >= 2) return; // Turn limit reached

    const nextProtectTurnsCount = undosUsedThisTurn === 0 ? protectTurnsCount + 1 : protectTurnsCount;

    const getCost = (pCount: number, thisTurnCount: number) => {
      const isSecondUndo = thisTurnCount === 1;
      if (pCount === 1) return isSecondUndo ? 3 : 1;
      if (pCount === 2) return isSecondUndo ? 10 : 5;
      if (pCount === 3) return isSecondUndo ? 40 : 20;
      return 50; // 4th turn onwards
    };

    const cost = getCost(nextProtectTurnsCount, undosUsedThisTurn);

    // Verify diamond wallet in user store
    const { user, updateUser } = useUserStore.getState();
    const userGems = user?.gems ?? 0;
    if (userGems < cost) {
      return;
    }

    // Deduct diamonds
    updateUser({ gems: Math.max(0, userGems - cost) });

    // Update local game state player metrics
    const updatedPlayers = gameState.players.map((p, idx) => {
      if (idx === gameState.activePlayerIndex) {
        return {
          ...p,
          gems: Math.max(0, p.gems - cost),
          totalUndosUsed: totalUndosUsed + 1,
          undosUsedThisTurn: undosUsedThisTurn + 1,
          protectTurnsCount: nextProtectTurnsCount,
        };
      }
      return p;
    });

    const nextState = {
      ...gameState,
      players: updatedPlayers,
      isDiceRolled: false,
      diceValue: null,
      gameStatus: 'ROLL_WAIT' as const,
      movableTokens: [],
      lastActionSummary: `${activePlayer.name} used Protect (Undo) for ${cost} Diamonds!`,
    };

    set({
      gameState: nextState,
      turnTimerSeconds: 15,
      selectedTokenId: null,
      _isRolling: false,
    });

    // ✅ Persist state
    localStorage.setItem("ludo_classic_engine_state", JSON.stringify(nextState));

    SoundEngine.play('GAME_START');

    // Emit UNDO action to server
    const roomCode = useRoomStore.getState().roomCode;
    if (gameSocket && roomCode) {
      gameSocket.emit("client_action", {
        roomCode,
        actionType: 'UNDO',
        cost,
        gameState: nextState, // ✅ Attach full state
      });
    }
  },

  setHoverToken: (tokenId) => set({ activeHoverTokenId: tokenId }),

  resetMatch: () => {
    SoundEngine.stopAll();
    set({
      gameState: null,
      activeHoverTokenId: null,
      selectedTokenId: null,
      turnTimerSeconds: 15,
      isAutoMode: false,
      isSpectatorMode: false, // ✅ Reset spectator mode
    });
  },

  triggerAiMoveIfNeeded: (forceAuto: boolean = false) => {
    const { gameState, isAutoMode } = get();
    if (!gameState || gameState.gameStatus === 'GAME_OVER') return;

    const activePlayer = gameState.players[gameState.activePlayerIndex];
    if (!activePlayer) return;

    // Check if active turn belongs to local human player
    const isLocalTurn = !activePlayer.isAi && (get().localPlayerColor === activePlayer.color);

    // Rule: Auto-play ONLY if:
    // 1. Player is an AI bot (activePlayer.isAi === true)
    // 2. Player is local human player AND (isAutoMode OR forceAuto)
    // NEVER trigger auto-play for remote human opponent on local client!
    if (!activePlayer.isAi && !(isLocalTurn && (isAutoMode || forceAuto))) {
      return;
    }

    if (gameState.gameStatus === 'ROLL_WAIT' && !gameState.isDiceRolled) {
      get().rollDice();
      return;
    }

    if (gameState.gameStatus === 'MOVE_WAIT') {
      if (gameState.movableTokens.length > 0) {
        const moves = [...gameState.movableTokens];
        const startIndices: Record<string, number> = { RED: 0, GREEN: 13, YELLOW: 26, BLUE: 39 };
        const safeIndices = [0, 8, 13, 21, 26, 34, 39, 47];

        const scoredMoves = moves.map((m) => {
          const token = activePlayer.tokens.find((t) => t.id === m.tokenId);
          if (!token) return { move: m, score: -9999 };

          let score = 0;

          // 1. Capture
          if (m.isCapture) score += 1200;

          // 2. Reaching Home
          if (m.isHome) score += 800;

          // 3. Releasing from Yard (start cell stepCount = 0 or fromStep === -1)
          if (m.fromStep === -1) score += 200;

          // 4. Safe track index computations
          const activeStartIdx = startIndices[activePlayer.color] ?? 0;
          
          // Compute safety/threat logic
          const opponents = gameState.players.filter((p) => p.color !== activePlayer.color);

          if (token.stepCount >= 1 && token.stepCount <= 51) {
            const currentTrackIndex = (activeStartIdx + (token.stepCount - 1)) % 52;
            const isCurrentlySafe = safeIndices.includes(currentTrackIndex);

            if (!isCurrentlySafe) {
              // Check if we are currently in danger
              let inDanger = false;
              let threateningOppTrack = -1;

              for (const opp of opponents) {
                const oppStartIdx = startIndices[opp.color] ?? 0;
                for (const oppToken of opp.tokens) {
                  if (oppToken.stepCount >= 1 && oppToken.stepCount <= 51) {
                    const oppTrackIndex = (oppStartIdx + (oppToken.stepCount - 1)) % 52;
                    const distBehind = (currentTrackIndex - oppTrackIndex + 52) % 52;
                    if (distBehind > 0 && distBehind <= 6) {
                      inDanger = true;
                      threateningOppTrack = oppTrackIndex;
                      break;
                    }
                  }
                }
                if (inDanger) break;
              }

              if (inDanger) {
                // Does moving take us to safety?
                const newTrackIndex = (activeStartIdx + (m.toStep - 1)) % 52;
                const isNewSpotSafe = m.toStep >= 52 || safeIndices.includes(newTrackIndex);
                if (isNewSpotSafe) {
                  score += 400; // Escape to safety!
                } else {
                  const newDistBehind = (newTrackIndex - threateningOppTrack + 52) % 52;
                  if (newDistBehind > 6) {
                    score += 250; // Run out of range!
                  }
                }
              }
            }
          }

          // 5. Avoid landing in danger
          if (m.toStep <= 51) {
            const newTrackIndex = (activeStartIdx + (m.toStep - 1)) % 52;
            const isNewSpotSafe = safeIndices.includes(newTrackIndex);
            if (!isNewSpotSafe) {
              let landingDanger = false;
              for (const opp of opponents) {
                const oppStartIdx = startIndices[opp.color] ?? 0;
                for (const oppToken of opp.tokens) {
                  if (oppToken.stepCount >= 1 && oppToken.stepCount <= 51) {
                    const oppTrackIndex = (oppStartIdx + (oppToken.stepCount - 1)) % 52;
                    const distBehind = (newTrackIndex - oppTrackIndex + 52) % 52;
                    if (distBehind > 0 && distBehind <= 6) {
                      landingDanger = true;
                      break;
                    }
                  }
                }
                if (landingDanger) break;
              }
              if (landingDanger) {
                score -= 300; // Penalty for moving to vulnerable cell
              }
            }

            // 6. Threatening / Chasing Opponent
            for (const opp of opponents) {
              const oppStartIdx = startIndices[opp.color] ?? 0;
              for (const oppToken of opp.tokens) {
                if (oppToken.stepCount >= 1 && oppToken.stepCount <= 51) {
                  const oppTrackIndex = (oppStartIdx + (oppToken.stepCount - 1)) % 52;
                  const oppSafe = safeIndices.includes(oppTrackIndex);
                  if (!oppSafe) {
                    const distBehindOpp = (oppTrackIndex - newTrackIndex + 52) % 52;
                    if (distBehindOpp > 0 && distBehindOpp <= 6) {
                      score += 80; // Nice setup to chase them!
                    }
                  }
                }
              }
            }
          }

          // 7. Creating a block/pair with our own tokens
          const hasOwnTokenAtTarget = activePlayer.tokens.some(
            (t) => t.id !== m.tokenId && t.stepCount === m.toStep && t.stepCount >= 1 && t.stepCount <= 51
          );
          if (hasOwnTokenAtTarget) {
            score += 120;
          }

          // 8. Progress bonus
          score += token.stepCount * 0.4;

          return { move: m, score };
        });

        // Sort by score descending
        scoredMoves.sort((a, b) => b.score - a.score);
        const selectedTokenId = scoredMoves[0].move.tokenId;
        get().moveToken(selectedTokenId);
      } else {
        // No legal moves available -> skip turn cleanly to next player
        const nextState = GameEngine.skipTurn(gameState);
        set({
          gameState: nextState,
          turnTimerSeconds: 15,
          isAutoMode: false,
        });

        setTimeout(() => {
          get().triggerAiMoveIfNeeded();
        }, 800);
      }
    }
  },

  demoStack: () => {
    const { gameState, localPlayerColor } = get();
    if (!gameState) return;
    
    const targetColor = localPlayerColor || gameState.players[0].color;
    
    const updatedPlayers = gameState.players.map((player) => {
      if (player.color === targetColor) {
        const updatedTokens = player.tokens.map((token, index) => {
          if (index === 0) {
            // Put 1 token exactly 1 step away from home (step 56)
            return { ...token, stepCount: 56, state: 'HOME_PATH' as const };
          } else {
            // Put other 3 tokens inside the HOME target (step 57)
            return { ...token, stepCount: 57, state: 'HOME' as const };
          }
        });
        return { ...player, tokens: updatedTokens };
      }
      return player;
    });

    set({
      gameState: {
        ...gameState,
        players: updatedPlayers,
        gameStatus: 'ROLL_WAIT',
        isDiceRolled: false,
        diceValue: null,
      },
      cheatNextRollValue: 1, // Force next dice value to be 1!
    });
  },

  connectGameSocket: (roomCode) => {
    set({ opponentReconnectingSeconds: null });
    const socketUrl = getSocketUrl();
    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
    });
 
    const currentUser = useUserStore.getState().user;
    socket.emit("join_room_game", { roomCode, userId: currentUser?.id || currentUser?.uid });
 
    socket.off("timer_tick");
    socket.off("timer_timeout");
    socket.off("server_action");
    socket.off("opponent_disconnected");
    socket.off("opponent_disconnected_grace");
    socket.off("opponent_rejoined");
    socket.off("request_state_sync");

    socket.on("timer_tick", (data: { seconds: number; activeColor: string }) => {
      const { turnTimerSeconds } = get();
      if (Math.abs(turnTimerSeconds - data.seconds) > 1 || data.seconds === 15 || data.seconds === 10 || data.seconds === 5) {
        set({ turnTimerSeconds: data.seconds });
      }
    });

    socket.on("timer_timeout", (data: { timedOutColor: string; nextColor: string }) => {
      SoundEngine.play('TIMEOUT');
      SoundEngine.vibrate(150);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('game_timeout'));
      }

      const { gameState } = get();
      if (gameState) {
        // ✅ Authoritative turn transition to nextColor from server
        const nextPlayerIndex = gameState.players.findIndex(p => p.color === data.nextColor);
        if (nextPlayerIndex !== -1) {
          const resetUndosPlayers = gameState.players.map((p) => ({
            ...p,
            undosUsedThisTurn: 0,
          }));

          const nextState = {
            ...gameState,
            players: resetUndosPlayers,
            activePlayerIndex: nextPlayerIndex,
            currentTurnColor: data.nextColor as PlayerColor,
            gameStatus: 'ROLL_WAIT' as const,
            isDiceRolled: false,
            diceValue: null,
            movableTokens: [],
            lastActionSummary: `Timeout! Turn passed to ${data.nextColor}.`,
          };

          set({
            gameState: nextState,
            turnTimerSeconds: 15,
            isAutoMode: false,
            _isRolling: false,
          });

          localStorage.setItem("ludo_classic_engine_state", JSON.stringify(nextState));

          setTimeout(() => {
            get().triggerAiMoveIfNeeded();
          }, 800);
        }
      }
    });

    socket.on("opponent_disconnected", () => {
      console.log("[Opponent Disconnected] Opponent left match — declaring local player as WINNER!");
      const { gameState, localPlayerColor } = get();
      if (!gameState) return;

      const myColor = localPlayerColor || gameState.players[0].color;
      const oppColor = gameState.players.find(p => p.color !== myColor)?.color || 'GREEN';

      const nextState = {
        ...gameState,
        gameStatus: 'GAME_OVER' as const,
        winnerRankings: [myColor, oppColor],
        lastActionSummary: `🏆 Opponent disconnected! You win by forfeit!`,
      };

      set({
        gameState: nextState,
        _isRolling: false,
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
      localStorage.removeItem("ludo_classic_engine_state");
    });

    socket.on("server_action", (data: { actionId?: string; actionType: 'ROLL' | 'MOVE' | 'UNDO' | 'CHAT' | 'STATE_SYNC' | 'FORFEIT'; diceValue?: number; tokenId?: string; nextColor?: string; cost?: number; text?: string; senderName?: string; color?: string; gameState?: any; hasLegalMoves?: boolean; turnTimerSeconds?: number }) => {
      const { gameState } = get();
      if (!gameState) return;

      if (data.actionType === 'CHAT') {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('game_chat_message', { detail: data }));
        }
        return;
      }

      // Deduplicate actions by unique actionId
      if (data.actionId && (get() as any)._lastProcessedActionId === data.actionId) {
        return;
      }
      if (data.actionId) {
        (set as any)({ _lastProcessedActionId: data.actionId });
      }

      console.log(`[Socket Sync] Action ${data.actionType} received`, data);

      if (data.actionType === 'ROLL' && data.diceValue !== undefined) {
        // Trigger smooth 3D dice rolling animation & sound on remote player screen!
        SoundEngine.play('DICE_ROLL');
        set({ _isRolling: true });

        const activePlayer = gameState.players[gameState.activePlayerIndex];
        const nextState = data.gameState ? {
          ...data.gameState,
          players: data.gameState.players.map((p: any, idx: number) => ({
            ...p,
            name: gameState.players[idx]?.name || p.name,
            avatar: gameState.players[idx]?.avatar || p.avatar,
            equippedFrameId: gameState.players[idx]?.equippedFrameId || p.equippedFrameId,
          })),
        } : {
          ...gameState,
          diceValue: data.diceValue,
          lastDiceValue: data.diceValue,
          isDiceRolled: true,
          gameStatus: 'MOVE_WAIT' as const,
          movableTokens: RuleValidator.getLegalMoves({ ...gameState, diceValue: data.diceValue, isDiceRolled: true, gameStatus: 'MOVE_WAIT' as const }, data.diceValue),
          lastActionSummary: `${activePlayer.name} rolled ${data.diceValue}!`,
        };

        set({
          gameState: nextState,
          turnTimerSeconds: data.hasLegalMoves !== false ? 10 : 5,
        });

        localStorage.setItem("ludo_classic_engine_state", JSON.stringify(nextState));

        setTimeout(() => {
          SoundEngine.play('DICE_STOP');
          set({ _isRolling: false });
        }, 600);
      } else if (data.actionType === 'MOVE' && data.tokenId) {
        // Trigger smooth step-by-step 60 FPS gliding animation on remote player screen!
        get().moveToken(data.tokenId, true);

        if (data.gameState) {
          const targetState = data.gameState;
          const currentPlayers = gameState.players;
          if (targetState && targetState.players) {
            targetState.players = targetState.players.map((p: any, idx: number) => ({
              ...p,
              name: currentPlayers[idx]?.name || p.name,
              avatar: currentPlayers[idx]?.avatar || p.avatar,
              equippedFrameId: currentPlayers[idx]?.equippedFrameId || p.equippedFrameId,
            }));
          }

          const numSteps = targetState.diceValue || 4;
          const animDurationMs = numSteps * 260 + 150;
          // Schedule exact state sync after animation finishes
          setTimeout(() => {
            set({
              gameState: { ...targetState, animatingToken: null },
              _isRolling: false,
              turnTimerSeconds: 15,
            });
            localStorage.setItem("ludo_classic_engine_state", JSON.stringify(targetState));
          }, animDurationMs);
        }
      } else if (data.actionType === 'UNDO') {
        if (data.gameState) {
          set({
            gameState: data.gameState,
            turnTimerSeconds: 15,
            _isRolling: false,
          });
          localStorage.setItem("ludo_classic_engine_state", JSON.stringify(data.gameState));
        } else {
          // Sync opponent's protect undo
          const activePlayer = gameState.players[gameState.activePlayerIndex];
          const totalUndosUsed = activePlayer.totalUndosUsed || 0;
          const undosUsedThisTurn = activePlayer.undosUsedThisTurn || 0;
          const protectTurnsCount = activePlayer.protectTurnsCount || 0;
          const cost = data.cost || 0;

          const nextProtectTurnsCount = undosUsedThisTurn === 0 ? protectTurnsCount + 1 : protectTurnsCount;

          const updatedPlayers = gameState.players.map((p, idx) => {
            if (idx === gameState.activePlayerIndex) {
              return {
                ...p,
                gems: Math.max(0, p.gems - cost),
                totalUndosUsed: totalUndosUsed + 1,
                undosUsedThisTurn: undosUsedThisTurn + 1,
                protectTurnsCount: nextProtectTurnsCount,
              };
            }
            return p;
          });

          const finalState = {
            ...gameState,
            players: updatedPlayers,
            isDiceRolled: false,
            diceValue: null,
            gameStatus: 'ROLL_WAIT' as const,
            movableTokens: [],
            lastActionSummary: `${activePlayer.name} used Protect (Undo) for ${cost} Diamonds!`,
          };

          set({
            gameState: finalState,
            turnTimerSeconds: 15,
            _isRolling: false,
          });

          localStorage.setItem("ludo_classic_engine_state", JSON.stringify(finalState));
        }

        SoundEngine.play('GAME_START');
      } else if (data.actionType === 'FORFEIT') {
        const { gameState, localPlayerColor } = get();
        if (!gameState || gameState.gameStatus === 'GAME_OVER') return;

        const quittingColor = (data as any).quittingColor;
        const winningPlayer = gameState.players.find(p => quittingColor ? p.color !== quittingColor : p.color === localPlayerColor) || gameState.players[0];
        const winnerColor = (data as any).winnerColor || winningPlayer.color;

        const gameOverState = {
          ...gameState,
          gameStatus: 'GAME_OVER' as const,
          winnerRankings: [winnerColor],
          lastActionSummary: `${quittingColor ? 'Opponent' : 'Player'} quit the match. Victory by forfeit!`,
        };

        // Credit win reward coins (+9,500 coins)
        const entryFee = parseInt(localStorage.getItem("ludo_current_entry_fee") || "5000");
        const winReward = Math.round(entryFee * 1.9);
        const currentUser = useUserStore.getState().user;
        if (currentUser) {
          useUserStore.getState().updateUser({
            coins: (currentUser.coins || 0) + winReward,
            gems: (currentUser.gems || 0) + 5,
          });
        }

        set({ gameState: gameOverState });
        localStorage.setItem("ludo_classic_engine_state", JSON.stringify(gameOverState));

        SoundEngine.play('WIN');
        try {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        } catch (e) {}
      } else if (data.actionType === 'STATE_SYNC') {
        if (data.gameState) {
          set({
            gameState: data.gameState,
            _isRolling: false,
            turnTimerSeconds: data.turnTimerSeconds ?? 15,
            opponentReconnectingSeconds: null,
          });
          localStorage.setItem("ludo_classic_engine_state", JSON.stringify(data.gameState));
          console.log("[Rejoin Sync] Game state successfully synchronized from remaining player!");
        }
      }
    });
 
    socket.on("opponent_disconnected_grace", (data: { roomCode: string; secondsRemaining: number }) => {
      set({ opponentReconnectingSeconds: data.secondsRemaining });
    });
 
    socket.on("opponent_rejoined", () => {
      set({ opponentReconnectingSeconds: null });
    });
 
    socket.on("request_state_sync", () => {
      const { gameSocket, gameState, turnTimerSeconds } = get();
      if (gameSocket && gameState) {
        console.log("[Rejoin Sync] Sending current game state to rejoining player.");
        gameSocket.emit("client_action", {
          roomCode,
          actionType: "STATE_SYNC",
          gameState,
          turnTimerSeconds,
        });
      }
    });

    socket.on("opponent_disconnected", () => {
      console.log("[Opponent Disconnected] Opponent left match — declaring local player WINNER!");
      set({ opponentReconnectingSeconds: null });
      const { gameState, localPlayerColor } = get();
      if (!gameState || gameState.gameStatus === 'GAME_OVER') return;

      const localPlayerIndex = gameState.players.findIndex(p => p.color === localPlayerColor);
      const winnerIndex = localPlayerIndex !== -1 ? localPlayerIndex : 0;
      const winnerColor = gameState.players[winnerIndex].color;

      const gameOverState = {
        ...gameState,
        gameStatus: 'GAME_OVER' as const,
        winnerRankings: [winnerColor],
        lastActionSummary: 'Opponent disconnected. Victory by forfeit!',
      };

      // Credit win reward coins (+9,500 coins)
      const entryFee = parseInt(localStorage.getItem("ludo_current_entry_fee") || "5000");
      const winReward = Math.round(entryFee * 1.9);
      const currentUser = useUserStore.getState().user;
      if (currentUser) {
        useUserStore.getState().updateUser({
          coins: (currentUser.coins || 0) + winReward,
          gems: (currentUser.gems || 0) + 5,
        });
      }

      set({ gameState: gameOverState });
      localStorage.setItem("ludo_classic_engine_state", JSON.stringify(gameOverState));

      SoundEngine.play('WIN');
      try {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}
    });

    set({ gameSocket: socket });
  },

  disconnectGameSocket: () => {
    const { gameSocket } = get();
    if (gameSocket) {
      gameSocket.disconnect();
      set({ gameSocket: null });
    }
  },

  joinAsSpectator: (roomCode) => {
    get().disconnectGameSocket();
    const socketUrl = getSocketUrl();
    const socket = io(socketUrl, { transports: ["websocket", "polling"], reconnection: true });
    const user = useUserStore.getState().user;
    const spectatorName = user?.displayName || user?.username || "Spectator";

    socket.on("connect", () => {
      socket.emit("spectate_room", { roomCode, spectatorName });
    });

    socket.on("spectate_joined", (data: { roomCode: string; activeColor: string; gameStatus: string; secondsRemaining: number }) => {
      set({ isSpectatorMode: true, turnTimerSeconds: data.secondsRemaining, gameSocket: socket });
      console.log(`[Spectator] Joined room ${data.roomCode}`);
    });

    socket.on("spectate_error", (data: { message: string }) => {
      console.warn("[Spectator] Error:", data.message);
      socket.disconnect();
    });

    socket.on("server_action", (data: any) => {
      if (data?.gameState) {
        set({ gameState: data.gameState, turnTimerSeconds: 10 });
      }
    });

    socket.on("timer_tick", (data: { seconds: number }) => {
      set({ turnTimerSeconds: data.seconds });
    });

    socket.on("opponent_disconnected", () => {
      set({ isSpectatorMode: false });
      socket.disconnect();
    });

    set({ gameSocket: socket });
  },
    }),
    {
      name: 'ludo-game-store-storage',
      partialize: (state) => ({ 
        gameState: state.gameState,
        localPlayerColor: state.localPlayerColor
      }),
    }
  )
);
