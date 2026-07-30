import { GameState, MoveableToken, Player, PlayerColor, TeamName, Token, TokenState } from './Engine.types';
import { RuleValidator } from '../rules/RuleValidator';
import { DiceEngine } from '../dice/DiceEngine';
import { TurnManager } from '../rules/TurnManager';
import { COLOR_START_INDEX } from '../board/BoardCoordinates';

export class GameEngine {
  /**
   * Initializes a fresh Duel (1v1), Team (2v2), or 4-Player Ludo Match state.
   */
  static createInitialState(mode: '2P' | '2v2' | '4P', hostName: string, roomMembers?: any[]): GameState {
    // Official Seating & Color Assignment
    // Duel (1v1): GREEN vs YELLOW (Top-Left vs Top-Right)
    // 2v2 & 4P: GREEN (TL), YELLOW (TR), BLUE (BR), RED (BL)
    const colors: PlayerColor[] = mode === '2P' ? ['GREEN', 'YELLOW'] : ['GREEN', 'YELLOW', 'BLUE', 'RED'];

    const players: Player[] = colors.map((color, index) => {
      const isHost = index === 0;

      // Find matching member by color from room members
      const member = roomMembers?.find((m) => m.color === color);

      let name = member?.name;
      if (!name) {
        name = isHost ? hostName : `Rahul Sharma`;
        if (mode === '2v2') {
          if (color === 'GREEN') name = isHost ? hostName : 'Priya Verma';
          if (color === 'BLUE') name = 'Vikram Singh';
          if (color === 'YELLOW') name = 'Rahul Sharma';
          if (color === 'RED') name = 'Ananya Roy';
        }
      }

      const avatar = member?.avatar;
      const profileFrame = member?.profileFrame;
      const nameBanner = member?.nameBanner;

      // Team Assignment: Team A = Green & Blue, Team B = Red & Yellow
      let team: TeamName | undefined = undefined;
      if (mode === '2v2') {
        team = color === 'GREEN' || color === 'BLUE' ? 'TEAM_A' : 'TEAM_B';
      }

      const tokens: Token[] = [0, 1, 2, 3].map((tokenIdx) => ({
        id: `${color}_${tokenIdx}`,
        color,
        index: tokenIdx,
        position: -1,
        stepCount: 0,
        state: 'YARD',
      }));

      return {
        id: `p_${color.toLowerCase()}`,
        name,
        color,
        team,
        avatar,
        profileFrame,
        nameBanner,
        isAi: false,
        isHost,
        isReady: true,
        tokens,
        level: isHost ? 24 : 22,
        coins: isHost ? 150000 : 120000,
        gems: isHost ? 450 : 380,
        winRate: isHost ? 68.4 : 62.1,
        matchesPlayed: isHost ? 342 : 280,
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
      return {
        ...state,
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

    if (legalMoves.length === 0) {
      // No legal moves -> auto advance turn after roll
      const nextIndex = TurnManager.getNextPlayerIndex(newState);
      return {
        ...newState,
        isDiceRolled: false,
        activePlayerIndex: nextIndex,
        currentTurnColor: TurnManager.getPlayerColorByIndex(newState, nextIndex),
        gameStatus: 'ROLL_WAIT',
        movableTokens: [],
        lastActionSummary: `${activePlayer.name} rolled ${roll.value}. No legal moves available!`,
      };
    }

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

    return {
      ...state,
      players: updatedPlayers,
      activePlayerIndex: nextIndex,
      currentTurnColor: TurnManager.getPlayerColorByIndex({ ...state, players: updatedPlayers }, nextIndex),
      diceValue: null,
      isDiceRolled: false,
      gameStatus: 'ROLL_WAIT',
      movableTokens: [],
      winnerRankings: updatedWinnerRankings,
      lastActionSummary: summaryText,
    };
  }
}
