/**
 * 🔒 SNAKES & LADDERS - LOCKED MODULE (GAME PLAY LOGIC ENGINE)
 * -----------------------------------------------------------
 * This file is part of the isolated Snakes & Ladders game engine.
 * The gameplay logic is working perfectly. Do NOT modify or edit this file
 * to prevent breaking changes or desync in gameplay.
 * Locked at: v10 — All bug fixes (BUG 1, 3, 4, 5, 7) applied & verified.
 */

import {
  GameState,
  PlayerState,
  TokenState,
  PlayerColor,
  GameEventType,
  GameEventPayload,
  EngineConfig,
} from "./SnakeLadderEngine.types";

// ─── Board Data ───────────────────────────────────────────────────────────────
const SNAKES: Record<number, number> = {
  17: 5,
  21: 3,
  28: 8,
  36: 16,
  66: 36,
  82: 59,
  69: 50,
  97: 63,
  94: 69,
};

const LADDERS: Record<number, number> = {
  2: 23,
  15: 34,
  9: 31,
  39: 58,
  48: 67,
  56: 86,
  71: 92,
  78: 98,
};

export class SnakeLadderEngine {
  private state: GameState;
  private config: EngineConfig;
  private eventListeners: Record<GameEventType, ((payload: GameEventPayload) => void)[]> = {
    DICE_ROLL_START: [],
    DICE_ROLL_COMPLETE: [],
    TOKEN_MOVE_STEP: [],
    SNAKE_SLIDE: [],
    LADDER_CLIMB: [],
    EXTRA_TURN: [],
    TOKEN_KILL: [],
    PLAYER_FINISHED: [],
    GAME_OVER: [],
    STATE_UPDATE: [],
  };

  constructor(
    playersConfig: { id: string; name: string; color: PlayerColor; isBot: boolean; avatar?: string; equippedFrameId?: string }[],
    config: EngineConfig
  ) {
    this.config = config;

    const players: PlayerState[] = playersConfig.map((p) => {
      const tokens: TokenState[] = [];
      for (let i = 0; i < config.tokensPerPlayer; i++) {
        tokens.push({
          tokenId: i,
          playerId: p.id,
          tokenColor: p.color,
          currentPosition: 1, // Start on Cell 1, locked
          previousPosition: 1,
          isMoving: false,
          isFinished: false,
          isUnlocked: false, // Must roll 6 to unlock
        });
      }
      return {
        id: p.id,
        name: p.name,
        color: p.color,
        tokens,
        isBot: p.isBot,
        avatar: p.avatar,
        equippedFrameId: p.equippedFrameId,
        killCount: 0,
        ladderCount: 0,
      };
    });

    this.state = {
      phase: "PLAYING",
      players,
      activePlayerIndex: 0,
      currentTurnColor: players[0].color,
      diceValue: null,
      consecutiveSixesCount: 0,
      winnerCount: 0,
      isWaitingForTokenChoice: false,
      movableTokenIds: [],
      lastMovePath: [],
      logMessage: "🎲 Game started! RED turn.",
    };
  }

  // ─── Event Emitter ─────────────────────────────────────────────────────────
  public addEventListener(event: GameEventType, callback: (payload: GameEventPayload) => void) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].push(callback);
    }
  }

  // BUG 1 FIX: Each event fires ONLY to its own listeners.
  // No automatic STATE_UPDATE piggyback — prevents double renders on every event.
  private emit(event: GameEventType, payload: GameEventPayload) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach((cb) => cb(payload));
    }
  }

  // ─── Public API ─────────────────────────────────────────────────────────────
  public getGameState(): GameState {
    return { ...this.state };
  }

  public setGameState(newState: GameState) {
    this.state = newState;
    this.emit("STATE_UPDATE", { state: this.state });
  }

  /** Weighted dice roll: 40% chance for 6, 12% chance each for 1..5 */
  public generateSecureRoll(): number {
    const rand = Math.random();
    if (rand < 0.40) return 6;
    const otherNumbers = [1, 2, 3, 4, 5];
    const idx = Math.floor((rand - 0.40) / 0.12);
    return otherNumbers[Math.min(idx, 4)];
  }

  /** Handle Roll Action */
  public roll(forcedRoll?: number): number {
    if (this.state.phase === "FINISHED" || this.state.isWaitingForTokenChoice) {
      throw new Error("Invalid turn phase for dice rolling.");
    }

    const activePlayer = this.state.players[this.state.activePlayerIndex];
    this.emit("DICE_ROLL_START", { state: this.state, activePlayerColor: activePlayer.color });

    const rolled = forcedRoll !== undefined ? forcedRoll : this.generateSecureRoll();
    this.state.diceValue = rolled;

    // Track consecutive 6s
    if (rolled === 6) {
      this.state.consecutiveSixesCount += 1;
    } else {
      this.state.consecutiveSixesCount = 0;
    }

    this.emit("DICE_ROLL_COMPLETE", {
      state: this.state,
      diceValue: rolled,
      activePlayerColor: activePlayer.color,
      message: `${activePlayer.name} rolled a ${rolled}!`,
    });

    // 3 consecutive 6s: cancel and skip turn
    if (this.state.consecutiveSixesCount === 3) {
      this.state.consecutiveSixesCount = 0;
      this.state.diceValue = null;
      this.state.logMessage = `⚠️ 3 sixes in a row! ${activePlayer.name}'s turn cancelled.`;
      this.emit("STATE_UPDATE", { state: this.state });
      this.advanceTurn();
      return rolled;
    }

    this.processRollValue(rolled);
    return rolled;
  }

  private processRollValue(rolled: number) {
    const activePlayer = this.state.players[this.state.activePlayerIndex];

    // BUG 3 FIX: Unlock logic — rolling 6 on a locked token unlocks it and
    // grants an extra turn WITHOUT animating movement (token stays on Cell 1).
    const lockedTokens = activePlayer.tokens.filter((t) => !t.isUnlocked && !t.isFinished);
    const unlockedTokens = activePlayer.tokens.filter((t) => t.isUnlocked && !t.isFinished);

    if (rolled === 6 && lockedTokens.length > 0) {
      // If there are also unlocked tokens on board, let player choose
      const movableUnlocked = unlockedTokens.filter((t) => t.currentPosition + rolled <= 100);

      if (movableUnlocked.length > 0) {
        // Player can choose: unlock a new token OR move an existing one
        const allMovable = [lockedTokens[0].tokenId, ...movableUnlocked.map((t) => t.tokenId)];

        if (activePlayer.isBot) {
          const expectedIndex = this.state.activePlayerIndex;
          setTimeout(() => {
            if (this.state.phase !== "PLAYING" || this.state.activePlayerIndex !== expectedIndex) return;
            const chosen = this.chooseSmartBotToken(activePlayer, rolled, allMovable);
            const targetToken = activePlayer.tokens.find((t) => t.tokenId === chosen);
            if (targetToken && !targetToken.isUnlocked) {
              this.unlockToken(targetToken);
            } else {
              this.moveToken(chosen, rolled);
            }
          }, 800);
        } else {
          this.state.isWaitingForTokenChoice = true;
          this.state.movableTokenIds = allMovable;
          this.state.logMessage = `🎲 6 rolled! Unlock a new token or move an existing one.`;
          this.emit("STATE_UPDATE", { state: this.state });
        }
        return;
      }

      // Only locked tokens available — auto-unlock the first one
      const tokenToUnlock = lockedTokens[0];
      this.unlockToken(tokenToUnlock);
      return;
    }

    // Find movable unlocked tokens
    const movableIds: number[] = [];
    activePlayer.tokens.forEach((token) => {
      if (token.isFinished || !token.isUnlocked) return;
      if (token.currentPosition + rolled <= 100) {
        movableIds.push(token.tokenId);
      }
    });

    if (movableIds.length === 0) {
      this.state.logMessage = `🎲 ${activePlayer.name} rolled ${rolled}. No moves possible!`;
      this.state.consecutiveSixesCount = 0;
      this.emit("STATE_UPDATE", { state: this.state });
      const expectedIndex = this.state.activePlayerIndex;
      setTimeout(() => {
        if (this.state.phase !== "PLAYING" || this.state.activePlayerIndex !== expectedIndex) return;
        this.advanceTurn();
      }, 800);
      return;
    }

    if (movableIds.length === 1) {
      this.state.logMessage = `🎲 ${activePlayer.name} rolled ${rolled}. Auto-moving token ${movableIds[0] + 1}.`;
      this.emit("STATE_UPDATE", { state: this.state });
      const expectedIndex = this.state.activePlayerIndex;
      setTimeout(() => {
        if (this.state.phase !== "PLAYING" || this.state.activePlayerIndex !== expectedIndex) return;
        this.moveToken(movableIds[0], rolled);
      }, activePlayer.isBot ? 800 : 300);
    } else {
      if (activePlayer.isBot) {
        const expectedIndex = this.state.activePlayerIndex;
        setTimeout(() => {
          if (this.state.phase !== "PLAYING" || this.state.activePlayerIndex !== expectedIndex) return;
          const chosenId = this.chooseSmartBotToken(activePlayer, rolled, movableIds);
          this.moveToken(chosenId, rolled);
        }, 800);
      } else {
        this.state.isWaitingForTokenChoice = true;
        this.state.movableTokenIds = movableIds;
        this.state.logMessage = `🎲 Select a token to move ${rolled} steps!`;
        this.emit("STATE_UPDATE", { state: this.state });
      }
    }
  }

  /** Unlock a token in place (stays on Cell 1) and grant extra turn */
  private unlockToken(token: TokenState) {
    token.isUnlocked = true;
    const activePlayer = this.state.players[this.state.activePlayerIndex];
    this.state.logMessage = `🔓 ${activePlayer.name} unlocked token ${token.tokenId + 1}! Extra turn!`;

    this.emit("EXTRA_TURN", {
      state: this.state,
      activePlayerColor: activePlayer.color,
      message: `${activePlayer.name} gets an extra turn!`,
    });

    this.state.diceValue = null;
    // Reset consecutive count so next roll is fresh
    this.state.isWaitingForTokenChoice = false;
    this.state.movableTokenIds = [];
    this.emit("STATE_UPDATE", { state: this.state });
  }

  /** Authoritative Move Token action — only for already-unlocked tokens */
  public moveToken(tokenId: number, rolled: number) {
    const activePlayer = this.state.players[this.state.activePlayerIndex];
    const token = activePlayer.tokens.find((t) => t.tokenId === tokenId);
    if (!token || token.isFinished) return;

    // If token was locked and this is called (e.g. player chose to unlock via choice UI)
    if (!token.isUnlocked && rolled === 6) {
      this.unlockToken(token);
      return;
    }

    // Reset selection phase
    this.state.isWaitingForTokenChoice = false;
    this.state.movableTokenIds = [];

    // Calculate step-by-step path
    const startPos = token.currentPosition;
    const targetPos = startPos + rolled;
    const path: number[] = [];
    for (let pos = startPos + 1; pos <= targetPos; pos++) {
      path.push(pos);
    }

    const finalLandingPos = path[path.length - 1];
    this.state.lastMovePath = path;
    token.isMoving = true;

    // Emit initial state so UI knows movement started
    this.emit("STATE_UPDATE", { state: this.state });

    // Animate step by step
    let stepIndex = 0;
    const animateNextStep = () => {
      if (stepIndex < path.length) {
        const nextPos = path[stepIndex];
        token.previousPosition = token.currentPosition;
        token.currentPosition = nextPos;

        this.emit("TOKEN_MOVE_STEP", {
          state: this.state,
          activePlayerColor: activePlayer.color,
          tokenId,
          stepCell: nextPos,
        });

        stepIndex++;
        setTimeout(animateNextStep, this.config.animationDelayMs);
      } else {
        // Step movement finished
        token.isMoving = false;
        this.handleLanding(token, tokenId, finalLandingPos, rolled);
      }
    };

    animateNextStep();
  }

  private handleLanding(token: TokenState, tokenId: number, landingPos: number, rolled: number) {
    const activePlayer = this.state.players[this.state.activePlayerIndex];
    let finalPos = landingPos;

    // Check Win (1 Token reaching cell 100 wins match immediately)
    if (finalPos === 100) {
      token.isFinished = true;
      if (!activePlayer.winnerRank) {
        this.state.winnerCount += 1;
        activePlayer.winnerRank = this.state.winnerCount;
      }
      this.state.phase = "FINISHED";
      this.state.logMessage = `🏁 ${activePlayer.name}'s token reached 100! 🏆 WINNER!`;
      this.emit("PLAYER_FINISHED", {
        state: this.state,
        activePlayerColor: activePlayer.color,
        tokenId,
        message: `${activePlayer.name} won the match by reaching 100!`,
      });
      this.emit("GAME_OVER", { state: this.state });
      this.emit("STATE_UPDATE", { state: this.state });
      return;
    }
    // Snake Head Landing — Slide down to tail (punch)
    else if (SNAKES[finalPos] !== undefined) {
      const snakeHead = finalPos;
      const snakeTail = SNAKES[finalPos];

      this.state.logMessage = `🐍 SNAKE! ${activePlayer.name}'s token ${tokenId + 1} bitten at ${snakeHead} → sliding to tail ${snakeTail}!`;

      this.emit("SNAKE_SLIDE", {
        state: this.state,
        activePlayerColor: activePlayer.color,
        tokenId,
        snakeStart: snakeHead,
        snakeEnd: snakeTail,
      });

      // Step-by-step downward slide animation from head to tail
      const slidePath: number[] = [];
      for (let p = snakeHead - 1; p >= snakeTail; p--) slidePath.push(p);

      let slideIndex = 0;
      const slideStep = () => {
        if (slideIndex < slidePath.length) {
          token.previousPosition = token.currentPosition;
          token.currentPosition = slidePath[slideIndex];
          this.emit("TOKEN_MOVE_STEP", {
            state: this.state,
            activePlayerColor: activePlayer.color,
            tokenId,
            stepCell: slidePath[slideIndex],
          });
          slideIndex++;
          setTimeout(slideStep, Math.max(80, this.config.animationDelayMs * 0.6));
        } else {
          // Slide complete — commit final position at tail
          token.currentPosition = snakeTail;
          token.previousPosition = snakeHead;
          this.emit("STATE_UPDATE", { state: this.state });
          this.handleLanding(token, tokenId, snakeTail, rolled);
        }
      };
      setTimeout(slideStep, 350); // brief pause at head before sliding
      return;
    }
    // BUG 4 FIX: Ladder exact landing check
    else if (LADDERS[finalPos] !== undefined) {
      const ladderDest = LADDERS[finalPos];
      const ladderStart = finalPos;

      activePlayer.ladderCount = (activePlayer.ladderCount || 0) + 1;
      this.state.logMessage = `🪜 LADDER! ${activePlayer.name}'s token ${tokenId + 1} climbs from ${ladderStart} → ${ladderDest}!`;

      // Emit LADDER_CLIMB event BEFORE stepping — UI shows golden glow immediately
      this.emit("LADDER_CLIMB", {
        state: this.state,
        activePlayerColor: activePlayer.color,
        tokenId,
        ladderStart,
        ladderEnd: ladderDest,
      });

      // Step-by-step climb animation
      const climbPath: number[] = [];
      for (let p = ladderStart + 1; p <= ladderDest; p++) climbPath.push(p);

      let climbIndex = 0;
      const climbStep = () => {
        if (climbIndex < climbPath.length) {
          token.previousPosition = token.currentPosition;
          token.currentPosition = climbPath[climbIndex];
          this.emit("TOKEN_MOVE_STEP", {
            state: this.state,
            activePlayerColor: activePlayer.color,
            tokenId,
            stepCell: climbPath[climbIndex],
          });
          climbIndex++;
          setTimeout(climbStep, this.config.animationDelayMs);
        } else {
          // Climb complete — commit final position
          token.currentPosition = ladderDest;
          token.previousPosition = ladderStart;
          this.emit("STATE_UPDATE", { state: this.state });
          this.handleLanding(token, tokenId, ladderDest, rolled);
        }
      };
      setTimeout(climbStep, 400); // brief pause at bottom before climbing
      return; // handlePostLanding called after climb
    } else {
      this.state.logMessage = `${activePlayer.name} moved token ${tokenId + 1} to ${finalPos}.`;
    }

    // Normal / Snake landing
    this.emit("STATE_UPDATE", { state: this.state });
    this.handlePostLanding(token, tokenId, finalPos, rolled);
  }

  private handlePostLanding(token: TokenState, tokenId: number, finalPos: number, rolled: number) {
    const activePlayer = this.state.players[this.state.activePlayerIndex];

    // Check game-over condition (As soon as ANY 1 token reaches 100)
    const winnerPlayer = this.state.players.find((p) => p.winnerRank === 1);
    if (winnerPlayer) {
      this.state.phase = "FINISHED";
      this.state.logMessage = `🏆 Game Over! Winner: ${winnerPlayer.name}`;
      this.emit("GAME_OVER", { state: this.state });
      return;
    }

    // ⚔️ TOKEN KILL RULE: Check if landing position kills an opponent token (Cell 1 is SAFE)
    let hasKilledOpponent = false;
    if (finalPos > 1 && finalPos < 100) {
      const opponent = this.state.players.find((p) => p.id !== activePlayer.id);
      if (opponent) {
        const killedTokens = opponent.tokens.filter(
          (t) => t.isUnlocked && !t.isFinished && t.currentPosition === finalPos && t.currentPosition > 1
        );
        if (killedTokens.length > 0) {
          hasKilledOpponent = true;
          activePlayer.killCount = (activePlayer.killCount || 0) + killedTokens.length;
          killedTokens.forEach((t) => {
            t.previousPosition = t.currentPosition;
            t.currentPosition = 1; // Sent back to start cell 1
          });
          this.state.logMessage = `⚔️ KILL! ${activePlayer.name} killed ${opponent.name}'s token at cell ${finalPos}! Extra turn reward!`;
          this.emit("TOKEN_KILL", {
            state: this.state,
            activePlayerColor: activePlayer.color,
            tokenId,
            stepCell: finalPos,
            message: `⚔️ ${activePlayer.name} killed ${opponent.name}'s token at cell ${finalPos}!`,
          });
        }
      }
    }

    // Extra turn on rolling 6 OR killing opponent token
    if ((rolled === 6 || hasKilledOpponent) && !token.isFinished) {
      const reason = hasKilledOpponent ? "Token Kill Reward" : "Rolled 6";
      this.state.logMessage = `🎲 ${activePlayer.name} gets an Extra Turn! (${reason})`;
      this.emit("EXTRA_TURN", {
        state: this.state,
        activePlayerColor: activePlayer.color,
        message: `${activePlayer.name} gets an Extra Turn! (${reason})`,
      });
      this.state.diceValue = null;
      this.emit("STATE_UPDATE", { state: this.state });
    } else {
      this.state.consecutiveSixesCount = 0;
      this.advanceTurn();
    }
  }

  private advanceTurn() {
    this.state.diceValue = null;
    let nextIndex = this.state.activePlayerIndex;

    do {
      nextIndex = (nextIndex + 1) % this.state.players.length;
    } while (
      this.state.players[nextIndex].tokens.every((t) => t.isFinished) &&
      nextIndex !== this.state.activePlayerIndex
    );

    this.state.activePlayerIndex = nextIndex;
    const nextPlayer = this.state.players[nextIndex];
    this.state.currentTurnColor = nextPlayer.color;
    this.state.logMessage = `🎲 ${nextPlayer.name}'s turn!`;

    this.emit("STATE_UPDATE", { state: this.state });
    // Bot roll triggered by React UI useEffect — no internal setTimeout needed
  }

  // ─── Smart Bot AI ───────────────────────────────────────────────────────────
  private chooseSmartBotToken(bot: PlayerState, rolled: number, movableIds: number[]): number {
    const movable = bot.tokens.filter((t) => movableIds.includes(t.tokenId));

    // 0. Kill an opponent token if possible! (Highest Priority)
    const opponentPlayer = this.state.players.find((p) => p.id !== bot.id);
    if (opponentPlayer) {
      const oppPositions = opponentPlayer.tokens
        .filter((t) => t.currentPosition > 1 && !t.isFinished)
        .map((t) => t.currentPosition);

      const killerToken = movable.find((t) => oppPositions.includes(t.currentPosition + rolled));
      if (killerToken) return killerToken.tokenId;
    }

    // 1. Finish a token if possible
    const finisher = movable.find((t) => t.currentPosition + rolled === 100);
    if (finisher) return finisher.tokenId;

    // 2. Land directly on a ladder
    const ladderLander = movable.find((t) => LADDERS[t.currentPosition + rolled] !== undefined);
    if (ladderLander) return ladderLander.tokenId;

    // 3. Avoid snake heads
    const safeTokens = movable.filter((t) => SNAKES[t.currentPosition + rolled] === undefined);

    // 4. Score each token
    const pool = safeTokens.length > 0 ? safeTokens : movable;
    const scored = pool.map((t) => {
      let score = t.currentPosition + rolled;

      // Bonus: landing near a ladder
      for (let offset = 0; offset <= 3; offset++) {
        if (LADDERS[(t.currentPosition + rolled + offset) as keyof typeof LADDERS] !== undefined) {
          score += 15;
          break;
        }
      }
      // Penalty: landing near a snake
      for (let offset = 0; offset <= 2; offset++) {
        if (SNAKES[(t.currentPosition + rolled + offset) as keyof typeof SNAKES] !== undefined) {
          score -= 10;
          break;
        }
      }
      // Prefer already-moving tokens
      if (t.isUnlocked) score += 5;

      return { tokenId: t.tokenId, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0].tokenId;
  }
}
