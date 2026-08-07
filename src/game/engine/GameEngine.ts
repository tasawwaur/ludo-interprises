import { GameState, MoveableToken, Player, PlayerColor, TeamName, Token, TokenState } from './Engine.types';
import { RuleValidator } from '../rules/RuleValidator';
import { DiceEngine } from '../dice/DiceEngine';
import { TurnManager } from '../rules/TurnManager';
import { COLOR_START_INDEX } from '../board/BoardCoordinates';
import { GLOBAL_PLAYER_DATABASE } from '../../store/player-database.store';

export class GameEngine {
  /**
   * Initializes a fresh Duel (1v1), Team (2v2), or 4-Player Ludo Match state.
   */
  static createInitialState(mode: '2P' | '2v2' | '4P', hostName: string, roomMembers?: any[], roomMode?: string): GameState {
    // Valid 2P Duel pairs (opposite seating): BLUE↔GREEN, RED↔YELLOW
    const VALID_2P_PAIRS: Record<PlayerColor, PlayerColor> = {
      BLUE: 'GREEN', GREEN: 'BLUE', RED: 'YELLOW', YELLOW: 'RED',
    };

    let colors: PlayerColor[];
    if (mode === '2P') {
      if (roomMembers && roomMembers.length >= 2 && roomMembers[0].color && roomMembers[1].color) {
        const hostColor = roomMembers[0].color as PlayerColor;
        const guestColor = roomMembers[1].color as PlayerColor;
        // Validate pair — if invalid, auto-correct guest to valid opposite
        if (VALID_2P_PAIRS[hostColor] === guestColor) {
          colors = [hostColor, guestColor];
        } else {
          colors = [hostColor, VALID_2P_PAIRS[hostColor]];
        }
      } else {
        // Random valid pair fallback
        colors = Math.random() < 0.5 ? ['BLUE', 'GREEN'] : ['RED', 'YELLOW'];
      }
    } else {
      colors = ['GREEN', 'YELLOW', 'BLUE', 'RED'];
    }

    // Generate unique random bot indexes for the match
    const usedBotIndices = new Set<number>();
    const getRandomBot = () => {
      let tries = 0;
      let idx = Math.floor(Math.random() * GLOBAL_PLAYER_DATABASE.length);
      while (usedBotIndices.has(idx) && tries < 50) {
        idx = Math.floor(Math.random() * GLOBAL_PLAYER_DATABASE.length);
        tries++;
      }
      usedBotIndices.add(idx);
      return GLOBAL_PLAYER_DATABASE[idx];
    };

    const players: Player[] = colors.map((color, index) => {
      const isHost = index === 0;
      const member = roomMembers?.[index];

      let name = member?.name;
      let avatar = member?.avatar;
      let profileFrame = member?.profileFrame;
      let nameBanner = member?.nameBanner;
      let isAi = member ? member.isBot : !isHost;

      // Stats fallback defaults
      let level = isHost ? 24 : 22;
      let coins = isHost ? 150000 : 120000;
      let gems = isHost ? 450 : 380;
      let winRate = isHost ? 68.4 : 62.1;
      let matchesPlayed = isHost ? 342 : 280;

      if (member) {
        // Enriched by room member
        name = member.name;
        avatar = member.avatar;
        profileFrame = member.profileFrame || "/assets/images/icons/profile_frame_v3.png";
        nameBanner = member.nameBanner || "/assets/images/icons/name_banner_v2.png";
        isAi = member.isBot;
        
        // If it's a bot member, we can lookup details from database by name
        const dbEntry = GLOBAL_PLAYER_DATABASE.find(p => p.username === member.name);
        if (dbEntry) {
          level = dbEntry.level;
          coins = dbEntry.currentCoins;
          gems = dbEntry.currentDiamonds;
          winRate = Math.round((dbEntry.matchesWon / (dbEntry.matchesPlayed || 1)) * 1000) / 10;
          matchesPlayed = dbEntry.matchesPlayed;
          avatar = dbEntry.avatarUrl;
        }
      } else if (!isHost) {
        // No room member, auto-spawn AI
        const bot = getRandomBot();
        if (bot) {
          name = bot.username;
          avatar = bot.avatarUrl;
          profileFrame = "/assets/images/icons/profile_frame_v3.png";
          nameBanner = "/assets/images/icons/name_banner_v2.png";
          isAi = true;
          level = bot.level;
          coins = bot.currentCoins;
          gems = bot.currentDiamonds;
          winRate = Math.round((bot.matchesWon / (bot.matchesPlayed || 1)) * 1000) / 10;
          matchesPlayed = bot.matchesPlayed;
        }
      }

      // Team Assignment: Red vs Yellow & Blue vs Green
      let team: TeamName | undefined = undefined;
      if (mode === '2v2') {
        team = color === 'RED' || color === 'YELLOW' ? 'TEAM_A' : 'TEAM_B';
      }

      const tokenIndices = roomMode === 'Quick Classic' 
        ? [0] 
        : (roomMode === 'Unique Classic' ? [0, 1] : [0, 1, 2, 3]);
      const tokens: Token[] = tokenIndices.map((tokenIdx) => ({
        id: `${color}_${tokenIdx}`,
        color,
        index: tokenIdx,
        position: -1,
        stepCount: 0,
        state: 'YARD',
      }));

      // Resolve bot frame, dice, and token from player database if matching bot username
      let equippedFrameId: string | undefined = undefined;
      let equippedDiceId: string | undefined = undefined;
      let equippedTokenId: string | undefined = undefined;

      const dbEntry = GLOBAL_PLAYER_DATABASE.find(p => p.username === name);
      if (dbEntry) {
        equippedFrameId = dbEntry.equippedFrame;
        equippedDiceId = "dice_classic"; // Fallback bot default
        equippedTokenId = "token_default";
      }

      return {
        id: `p_${color.toLowerCase()}`,
        name,
        color,
        team,
        avatar,
        profileFrame,
        nameBanner,
        isAi,
        isHost,
        isReady: true,
        tokens,
        level,
        coins,
        gems,
        winRate,
        matchesPlayed,
        totalUndosUsed: 0,
        undosUsedThisTurn: 0,
        protectTurnsCount: 0,
        equippedFrameId,
        equippedDiceId,
        equippedTokenId,
      };
    });

    return {
      matchId: `match_${Date.now()}`,
      mode,
      players,
      activePlayerIndex: 0,
      currentTurnColor: colors[0], // Starts with Green
      diceValue: null,
      lastDiceValue: null,
      isDiceRolled: false,
      consecutiveSixes: 0,
      gameStatus: 'ROLL_WAIT',
      movableTokens: [],
      winnerRankings: [],
      turnTimeRemaining: 15,
      lastActionSummary: `Match Started! ${colors[0]} turn to roll.`,
    };
  }

  /**
   * Handles active player rolling dice.
   */
  static rollDice(state: GameState): GameState {
    if (state.gameStatus !== 'ROLL_WAIT' || state.isDiceRolled) return state;

    const roll = DiceEngine.roll(state.consecutiveSixes);
    const activePlayer = state.players[state.activePlayerIndex];

    if (roll.isInvalidated) {
      // 3 consecutive sixes -> forfeit turn
      const nextIndex = TurnManager.getNextPlayerIndex(state);
      const resetUndosPlayers = state.players.map((p) => ({
        ...p,
        undosUsedThisTurn: 0,
      }));
      return {
        ...state,
        players: resetUndosPlayers,
        diceValue: 6,
        isDiceRolled: false,
        consecutiveSixes: 0,
        activePlayerIndex: nextIndex,
        currentTurnColor: TurnManager.getPlayerColorByIndex(state, nextIndex),
        gameStatus: 'ROLL_WAIT',
        movableTokens: [],
        lastActionSummary: `3 Consecutive 6s! ${activePlayer.name} forfeited turn.`,
      };
    }

    const newState: GameState = {
      ...state,
      diceValue: roll.value,
      lastDiceValue: roll.value,
      isDiceRolled: true,
      consecutiveSixes: roll.consecutiveSixesCount,
      gameStatus: 'MOVE_WAIT',
    };

    // Calculate legal moves
    const legalMoves = RuleValidator.getLegalMoves(newState, roll.value);

    // Return newState with legalMoves. If empty, the user has 5s to either undo or timeout/auto-skip.
    return {
      ...newState,
      movableTokens: legalMoves,
      lastActionSummary: `${activePlayer.name} rolled ${roll.value}.${legalMoves.length === 0 ? ' No legal moves available!' : ''}`,
    };

    return {
      ...newState,
      movableTokens: legalMoves,
      lastActionSummary: `${activePlayer.name} rolled ${roll.value}! Select a token to move.`,
    };
  }

  /**
   * Executes movement for selected token.
   */
  static moveToken(state: GameState, tokenId: string): GameState {
    if (state.gameStatus !== 'MOVE_WAIT') return state;

    const targetMove = state.movableTokens.find((m) => m.tokenId === tokenId);
    if (!targetMove) return state;

    const activePlayer = state.players[state.activePlayerIndex];
    let capturedPlayerName = '';

    // Update tokens array
    const updatedPlayers = state.players.map((player) => {
      // If active player, update target token position
      if (player.color === activePlayer.color) {
        return {
          ...player,
          tokens: player.tokens.map((t) => {
            if (t.id === tokenId) {
              const newState: TokenState = targetMove.toStep === 57 ? 'HOME' : targetMove.toStep >= 52 ? 'HOME_PATH' : 'TRACK';
              return {
                ...t,
                stepCount: targetMove.toStep,
                position: targetMove.toStep,
                state: newState,
              };
            }
            return t;
          }),
        };
      }

      // If capture occurred (do not capture teammates in 2v2 Mode!)
      const isTeammate = state.mode === '2v2' && player.team === activePlayer.team;
      if (targetMove.isCapture && !isTeammate) {
        const targetTrackIndex = (COLOR_START_INDEX[activePlayer.color] + (targetMove.toStep - 1)) % 52;
        let tokenWasCaptured = false;

        const updatedTokens = player.tokens.map((t) => {
          if (t.stepCount >= 1 && t.stepCount <= 51) {
            const oppTrackIndex = (COLOR_START_INDEX[player.color] + (t.stepCount - 1)) % 52;
            if (oppTrackIndex === targetTrackIndex && !tokenWasCaptured) {
              tokenWasCaptured = true;
              capturedPlayerName = player.name;
              return {
                ...t,
                stepCount: 0,
                position: -1,
                state: 'YARD' as const,
              };
            }
          }
          return t;
        });

        if (tokenWasCaptured) {
          return { ...player, tokens: updatedTokens };
        }
      }

      return player;
    });

    // Check if active player won (all 4 tokens in home)
    const updatedActivePlayer = updatedPlayers[state.activePlayerIndex];
    const isPlayerFinished = updatedActivePlayer.tokens.every((t) => t.stepCount === 57);

    const updatedWinnerRankings = [...state.winnerRankings];
    if (isPlayerFinished && !updatedWinnerRankings.includes(activePlayer.color)) {
      updatedWinnerRankings.push(activePlayer.color);
    }

    // Check Game Over (Shared Victory in 2v2 mode!)
    let isGameOver = false;
    let victoryMessage = '';

    if (state.mode === '2v2') {
      if (isPlayerFinished) {
        isGameOver = true;
        const winningTeam = activePlayer.team === 'TEAM_A' ? 'TEAM A (Green & Blue)' : 'TEAM B (Red & Yellow)';
        victoryMessage = `🏆 TEAM VICTORY! ${winningTeam} wins the match!`;
      }
    } else {
      isGameOver = updatedWinnerRankings.length >= (state.mode === '2P' ? 1 : 3);
      if (isGameOver) {
        victoryMessage = `🏆 GAME OVER! ${updatedActivePlayer.name} wins the match!`;
      }
    }

    if (isGameOver) {
      return {
        ...state,
        players: updatedPlayers,
        winnerRankings: updatedWinnerRankings,
        gameStatus: 'GAME_OVER',
        lastActionSummary: victoryMessage,
      };
    }

    // Check Extra Turn rules
    const extraTurnGranted = RuleValidator.shouldGrantExtraTurn(
      state.diceValue || 0,
      state.consecutiveSixes,
      targetMove.isCapture,
      targetMove.isHome
    );

    let nextIndex = state.activePlayerIndex;
    let summaryText = `${activePlayer.name} moved token.`;

    if (extraTurnGranted) {
      summaryText += ` Extra turn granted! ⭐`;
    } else {
      nextIndex = TurnManager.getNextPlayerIndex({ ...state, players: updatedPlayers });
      summaryText += ` Turn passed to ${updatedPlayers[nextIndex].name}.`;
    }

    // Reset undosUsedThisTurn for all players on turn transition (including extra turn rolls)
    const finalPlayers = updatedPlayers.map((p) => ({
      ...p,
      undosUsedThisTurn: 0,
    }));

    return {
      ...state,
      players: finalPlayers,
      activePlayerIndex: nextIndex,
      currentTurnColor: TurnManager.getPlayerColorByIndex({ ...state, players: finalPlayers }, nextIndex),
      diceValue: null,
      isDiceRolled: false,
      gameStatus: 'ROLL_WAIT',
      movableTokens: [],
      winnerRankings: updatedWinnerRankings,
      lastActionSummary: summaryText,
    };
  }

  /**
   * Skips active player turn due to timeout.
   */
  static skipTurn(state: GameState): GameState {
    const nextIndex = TurnManager.getNextPlayerIndex(state);
    const nextColor = TurnManager.getPlayerColorByIndex(state, nextIndex);
    const nextPlayer = state.players[nextIndex];
    const resetUndosPlayers = state.players.map((p) => ({
      ...p,
      undosUsedThisTurn: 0,
    }));
    return {
      ...state,
      players: resetUndosPlayers,
      diceValue: null,
      isDiceRolled: false,
      consecutiveSixes: 0,
      activePlayerIndex: nextIndex,
      currentTurnColor: nextColor,
      gameStatus: 'ROLL_WAIT',
      movableTokens: [],
      lastActionSummary: `Time Out! Turn passed to ${nextPlayer.name}.`,
    };
  }
}
