import { create } from 'zustand';
import { GameState, MoveableToken, PlayerColor } from '../game/engine/Engine.types';
import { GameEngine } from '../game/engine/GameEngine';
import { ReplayRecorder } from '../game/replay/ReplayRecorder';
import { SoundEngine } from '../game/sound/SoundEngine';
import { useRoomStore } from '../features/matchmaking/rooms/RoomStore';

interface GameStoreState {
  gameState: GameState | null;
  replayRecorder: ReplayRecorder;
  activeHoverTokenId: string | null;
  selectedTokenId: string | null;
  isMuted: boolean;
  turnTimerSeconds: number;
  isAutoMode: boolean;

  // Actions
  startMatch: (mode: '2P' | '2v2' | '4P', hostName: string) => void;
  rollDice: () => void;
  moveToken: (tokenId: string) => void;
  setSelectedToken: (tokenId: string | null) => void;
  setHoverToken: (tokenId: string | null) => void;
  toggleMute: () => void;
  resetMatch: () => void;
  tickTurnTimer: () => void;
  disableAutoMode: () => void;
  triggerAiMoveIfNeeded: () => void;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  gameState: null,
  replayRecorder: new ReplayRecorder(),
  activeHoverTokenId: null,
  selectedTokenId: null,
  isMuted: true,
  turnTimerSeconds: 15,
  isAutoMode: false,

  startMatch: (mode, hostName) => {
    const members = useRoomStore.getState().members;
    const initialState = GameEngine.createInitialState(mode, hostName, members);
    const recorder = new ReplayRecorder();
    recorder.recordEvent('TURN_CHANGE', 'RED', { mode, hostName });

    SoundEngine.play('GAME_START');

    set({
      gameState: initialState,
      replayRecorder: recorder,
      activeHoverTokenId: null,
      selectedTokenId: null,
      turnTimerSeconds: 15,
      isAutoMode: false,
    });
  },

  toggleMute: () => {
    const isMuted = SoundEngine.toggleMute();
    set({ isMuted });
  },

  disableAutoMode: () => {
    set({ isAutoMode: false, turnTimerSeconds: 15 });
  },

  setSelectedToken: (tokenId) => set({ selectedTokenId: tokenId }),

  tickTurnTimer: () => {
    const { gameState, turnTimerSeconds } = get();
    if (!gameState || gameState.gameStatus === 'GAME_OVER') return;

    if (turnTimerSeconds > 1) {
      set({ turnTimerSeconds: turnTimerSeconds - 1 });
    } else {
      set({ turnTimerSeconds: 15 });
    }
  },

  rollDice: () => {
    const { gameState, replayRecorder, isAutoMode } = get();
    if (!gameState || gameState.gameStatus !== 'ROLL_WAIT') return;

    SoundEngine.play('DICE_ROLL');

    setTimeout(() => {
      const nextState = GameEngine.rollDice(gameState);

      if (nextState.diceValue) {
        SoundEngine.play('DICE_STOP');
        replayRecorder.recordEvent('DICE_ROLL', gameState.currentTurnColor, {
          value: nextState.diceValue,
        });
      }

      set({
        gameState: nextState,
        selectedTokenId: null,
        turnTimerSeconds: isAutoMode ? 5 : 15,
      });

      // Auto movement ONLY if AI turn and 1 legal move
      const activePlayer = nextState.players[nextState.activePlayerIndex];
      const shouldAutoMove = activePlayer.isAi && nextState.movableTokens.length === 1;

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

  moveToken: (tokenId: string) => {
    const { gameState, replayRecorder, isAutoMode } = get();
    if (!gameState || gameState.gameStatus !== 'MOVE_WAIT') return;

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
}));
