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

  // Actions
  startMatch: (mode: '2P' | '2v2' | '4P', hostName: string) => void;
  rollDice: () => void;
  undoRoll: () => void;
  moveToken: (tokenId: string, isRemote?: boolean) => void;
  setSelectedToken: (tokenId: string | null) => void;
  setHoverToken: (tokenId: string | null) => void;
  toggleMute: () => void;
  resetMatch: () => void;
  tickTurnTimer: () => void;
  disableAutoMode: () => void;
  triggerAiMoveIfNeeded: () => void;
  demoStack: () => void;
  connectGameSocket: (roomCode: string) => void;
  disconnectGameSocket: () => void;
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

      startMatch: (mode, hostName) => {
        set({ gameState: null });

        const members = useRoomStore.getState().members;
        const localColor = members[0]?.color || "BLUE";
        const roomMode = useRoomStore.getState().mode || "2P Classic";
        const initialState = GameEngine.createInitialState(mode, hostName, members, roomMode);
        
        const cosmetics = useCosmeticsStore.getState();
        const dice = useDiceStore.getState();

        const isNormalClassic = roomMode === "Normal Classic";

        // Enrich host player with their equipped frame, token, and dice
        initialState.players = initialState.players.map((p) => {
          return {
            ...p,
            equippedFrameId: isNormalClassic ? 'frame_default' : (p.isHost ? (cosmetics.equippedFrameId || 'frame_default') : (p.equippedFrameId || 'frame_default')),
            equippedTokenId: isNormalClassic ? 'token_default' : (p.isHost ? (cosmetics.equippedTokenId || 'token_default') : (p.equippedTokenId || 'token_default')),
            equippedDiceId: isNormalClassic ? 'dice_classic' : (p.isHost ? (dice.equippedDiceId || 'dice_classic') : (p.equippedDiceId || 'dice_classic')),
            profileFrame: isNormalClassic ? "/assets/images/icons/profile_frame_v3.png" : (p.isHost ? (cosmetics.frames.find((f) => f.id === cosmetics.equippedFrameId)?.imgUrl || p.profileFrame) : p.profileFrame),
          };
        });

        initialState.equippedBoardId = isNormalClassic ? 'board_default' : (cosmetics.equippedBoardId || 'board_default');

        const recorder = new ReplayRecorder();
        recorder.recordEvent('TURN_CHANGE', initialState.currentTurnColor, { mode, hostName });

        SoundEngine.play('GAME_START');

        set({
          gameState: initialState,
          localPlayerColor: localColor as PlayerColor,
          replayRecorder: recorder,
          activeHoverTokenId: null,
          selectedTokenId: null,
          turnTimerSeconds: 15,
          isAutoMode: false,
        });

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
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(60);
        }
      }
    } else {
      // Timer hit 0!
      set({ turnTimerSeconds: 0 });
      SoundEngine.play('TIMEOUT');
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(150);
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('game_timeout'));
      }

      if (gameState.gameStatus === 'ROLL_WAIT') {
        // Skip turn and reset timer to 15s
        const nextState = GameEngine.skipTurn(gameState);
        set({
          gameState: nextState,
          turnTimerSeconds: 15,
          isAutoMode: false,
        });

        // Trigger AI roll if next player is AI
        setTimeout(() => {
          get().triggerAiMoveIfNeeded();
        }, 800);
      } else if (gameState.gameStatus === 'MOVE_WAIT') {
        if (gameState.movableTokens.length === 1) {
          // Auto move the only valid token
          get().moveToken(gameState.movableTokens[0].tokenId);
        } else {
          // Multiple or zero moves -> skip turn and reset timer to 15s
          const nextState = GameEngine.skipTurn(gameState);
          set({
            gameState: nextState,
            turnTimerSeconds: 15,
            isAutoMode: false,
          });

          // Trigger AI roll if next player is AI
          setTimeout(() => {
            get().triggerAiMoveIfNeeded();
          }, 800);
        }
      }
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

    setTimeout(() => {
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
        SoundEngine.play('DICE_STOP');
        replayRecorder.recordEvent('DICE_ROLL', gameState.currentTurnColor, {
          value: nextState.diceValue,
        });

        // Emit rolling action with the actual dice value generated
        const hasLegalMoves = nextState.movableTokens.length > 0;
        if (gameSocket && roomCode) {
          gameSocket.emit("client_action", {
            roomCode,
            actionType: 'ROLL',
            diceValue: nextState.diceValue,
            hasLegalMoves,
          });
        }
      }

      const hasLegalMoves = nextState.movableTokens.length > 0;
      set({
        gameState: nextState,
        selectedTokenId: null,
        _isRolling: false,
        turnTimerSeconds: nextState.gameStatus === 'ROLL_WAIT' ? 15 : (hasLegalMoves ? 10 : 5),
      } as any);



      setTimeout(() => {
        get().triggerAiMoveIfNeeded();
      }, 500);
    }, 350);
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
            },
          },
        };
      });

      if (stepCounter < totalSteps) {
        setTimeout(animateStep, 180);
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
            roomCode,
            actionType: 'MOVE',
            tokenId,
            nextColor: nextState.currentTurnColor,
            isGameOver: nextState.gameStatus === 'GAME_OVER',
          });
        }

        set({
          gameState: { ...nextState, animatingToken: null },
          activeHoverTokenId: null,
          selectedTokenId: null,
          turnTimerSeconds: isAutoMode ? 5 : 15,
        });

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

    SoundEngine.play('GAME_START');

    // Emit UNDO action to server
    const roomCode = useRoomStore.getState().roomCode;
    if (gameSocket && roomCode) {
      gameSocket.emit("client_action", {
        roomCode,
        actionType: 'UNDO',
        cost,
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
    });
  },

  triggerAiMoveIfNeeded: () => {
    const { gameState, isAutoMode } = get();
    if (!gameState || gameState.gameStatus === 'GAME_OVER') return;

    const activePlayer = gameState.players[gameState.activePlayerIndex];
    if (!activePlayer) return;

    // CRITICAL: Auto-play ONLY for AI players (disabled for humans as requested)
    if (!activePlayer.isAi) {
      return;
    }

    if (gameState.gameStatus === 'ROLL_WAIT' && !gameState.isDiceRolled) {
      get().rollDice();
      return;
    }

    if (gameState.gameStatus === 'MOVE_WAIT' && gameState.movableTokens.length > 0) {
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
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const socketUrl = import.meta.env.DEV ? `http://${host}:8000` : window.location.origin;
    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
    });

    socket.emit("join_room_game", { roomCode });

    socket.on("timer_tick", (data: { seconds: number; activeColor: string }) => {
      const { turnTimerSeconds } = get();
      if (Math.abs(turnTimerSeconds - data.seconds) > 1 || data.seconds === 15 || data.seconds === 10 || data.seconds === 5) {
        set({ turnTimerSeconds: data.seconds });
      }
    });

    socket.on("timer_timeout", (data: { timedOutColor: string; nextColor: string }) => {
      SoundEngine.play('TIMEOUT');
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(150);
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('game_timeout'));
      }

      const { gameState } = get();
      if (gameState) {
        // If timed-out player is in MOVE_WAIT state and has legal moves: auto-move best token!
        if (gameState.gameStatus === 'MOVE_WAIT' && gameState.movableTokens.length > 0) {
          const moves = [...gameState.movableTokens];
          moves.sort((a, b) => {
            if (a.isCapture !== b.isCapture) return a.isCapture ? -1 : 1;
            if (a.isHome !== b.isHome) return a.isHome ? -1 : 1;
            if (a.fromStep === 0 !== (b.fromStep === 0)) return a.fromStep === 0 ? -1 : 1;
            return b.toStep - a.toStep;
          });
          const bestTokenId = moves[0].tokenId;
          // Execute AI-driven best move locally (with isRemote = true to prevent infinite socket loops)
          get().moveToken(bestTokenId, true);
        } else if (gameState.gameStatus === 'ROLL_WAIT' && !gameState.isDiceRolled) {
          // Auto roll on timeout if it's the local player's turn to roll!
          const activePlayer = gameState.players[gameState.activePlayerIndex];
          const localPlayer = gameState.players.find((p) => p.color === get().localPlayerColor) || gameState.players[0];

          if (activePlayer.color === localPlayer.color && !activePlayer.isAi) {
            get().rollDice();
          } else {
            // Otherwise forfeit/skip turn as normal
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
        } else {
          // Otherwise forfeit/skip turn as normal
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
    });

    socket.on("server_action", (data: { actionType: 'ROLL' | 'MOVE' | 'UNDO' | 'CHAT'; diceValue?: number; tokenId?: string; nextColor?: string; cost?: number; text?: string; senderName?: string; color?: string }) => {
      const { gameState } = get();
      if (!gameState) return;

      console.log(`[Socket Sync] Action ${data.actionType} received`, data);

      if (data.actionType === 'CHAT') {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('game_chat_message', { detail: data }));
        }
        return;
      }

      if (data.actionType === 'ROLL' && data.diceValue !== undefined) {
        // Opponent rolled the dice, sync their rolled value
        const activePlayer = gameState.players[gameState.activePlayerIndex];
        const newState = {
          ...gameState,
          diceValue: data.diceValue,
          lastDiceValue: data.diceValue,
          isDiceRolled: true,
          gameStatus: 'MOVE_WAIT' as const,
        };

        const legalMoves = RuleValidator.getLegalMoves(newState, data.diceValue);
        const hasLegalMoves = legalMoves.length > 0;

        set({
          gameState: {
            ...newState,
            movableTokens: legalMoves,
            lastActionSummary: `${activePlayer.name} rolled ${data.diceValue}!`,
          },
          _isRolling: false,
          turnTimerSeconds: hasLegalMoves ? 10 : 5,
        });

        SoundEngine.play('DICE_STOP');
      } else if (data.actionType === 'MOVE' && data.tokenId) {
        // Opponent moved a token, sync token movement
        get().moveToken(data.tokenId, true);
      } else if (data.actionType === 'UNDO') {
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

        set({
          gameState: {
            ...gameState,
            players: updatedPlayers,
            isDiceRolled: false,
            diceValue: null,
            gameStatus: 'ROLL_WAIT' as const,
            movableTokens: [],
            lastActionSummary: `${activePlayer.name} used Protect (Undo) for ${cost} Diamonds!`,
          },
          turnTimerSeconds: 15,
          _isRolling: false,
        });

        SoundEngine.play('GAME_START');
      }
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
