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

  startMatch: (mode, hostName) => {
    // Force-clear any stale persisted game state FIRST
    set({ gameState: null });

    const members = useRoomStore.getState().members;
    const localColor = members[0]?.color || "BLUE";
    const initialState = GameEngine.createInitialState(mode, hostName, members);
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
      const nextState = GameEngine.rollDice(gameState);

      if (nextState.diceValue) {
        SoundEngine.play('DICE_STOP');
        replayRecorder.recordEvent('DICE_ROLL', gameState.currentTurnColor, {
          value: nextState.diceValue,
        });

        // Emit rolling action with the actual dice value generated
        if (gameSocket && roomCode) {
          gameSocket.emit("client_action", {
            roomCode,
            actionType: 'ROLL',
            diceValue: nextState.diceValue,
          });
        }
      }

      set({
        gameState: nextState,
        selectedTokenId: null,
        _isRolling: false,
        turnTimerSeconds: nextState.gameStatus === 'ROLL_WAIT' ? 15 : 10,
      } as any);

      // Automatically release token from yard on rolling a 6
      const releaseMove = nextState.movableTokens.find((m) => m.fromStep === 0 && m.toStep === 1);
      if (nextState.gameStatus === 'MOVE_WAIT' && releaseMove) {
        const autoTokenId = releaseMove.tokenId;
        set({ selectedTokenId: autoTokenId });
        setTimeout(() => {
          get().moveToken(autoTokenId);
        }, 300);
        return;
      }

      // Auto movement if there is exactly 1 legal move AND it's a 6
      const shouldAutoMove = nextState.movableTokens.length === 1 && nextState.diceValue === 6;
      if (nextState.gameStatus === 'MOVE_WAIT' && shouldAutoMove) {
        const autoTokenId = nextState.movableTokens[0].tokenId;
        set({ selectedTokenId: autoTokenId });
        setTimeout(() => {
          get().moveToken(autoTokenId);
        }, 300);
        return;
      }

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

      SoundEngine.play('TOKEN_STEP');

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
      moves.sort((a, b) => {
        if (a.isCapture !== b.isCapture) return a.isCapture ? -1 : 1;
        if (a.isHome !== b.isHome) return a.isHome ? -1 : 1;
        if (a.fromStep === 0 !== (b.fromStep === 0)) return a.fromStep === 0 ? -1 : 1;
        return b.toStep - a.toStep;
      });

      const selectedTokenId = moves[0].tokenId;
      get().moveToken(selectedTokenId);
    }
  },

  demoStack: () => {
    const { gameState } = get();
    if (!gameState) return;
    const updatedPlayers = gameState.players.map((player) => {
      const updatedTokens = player.tokens.map((token, index) => {
        if (index === 0 || index === 1) {
          // Put token 0 & 1 on a safe cell (step 9)
          return { ...token, stepCount: 9, state: 'TRACK' as const };
        } else {
          // Put token 2 & 3 in the central home triangle (step 57)
          return { ...token, stepCount: 57, state: 'HOME' as const };
        }
      });
      return { ...player, tokens: updatedTokens };
    });
    set({
      gameState: {
        ...gameState,
        players: updatedPlayers,
        gameStatus: 'ROLL_WAIT',
      }
    });
  },

  connectGameSocket: (roomCode) => {
    const socket = io("http://localhost:8080", {
      transports: ["websocket", "polling"],
      reconnection: true,
    });

    socket.emit("join_room_game", { roomCode });

    socket.on("timer_tick", (data: { seconds: number; activeColor: string }) => {
      const { turnTimerSeconds } = get();
      if (Math.abs(turnTimerSeconds - data.seconds) > 1 || data.seconds === 15 || data.seconds === 10) {
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

    socket.on("server_action", (data: { actionType: 'ROLL' | 'MOVE' | 'UNDO'; diceValue?: number; tokenId?: string; nextColor?: string; cost?: number }) => {
      const { gameState } = get();
      if (!gameState) return;

      console.log(`[Socket Sync] Action ${data.actionType} received`, data);

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

        set({
          gameState: {
            ...newState,
            movableTokens: legalMoves,
            lastActionSummary: `${activePlayer.name} rolled ${data.diceValue}!`,
          },
          _isRolling: false,
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
