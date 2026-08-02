import { GameState, PlayerColor, Token } from '../types';
import { COLOR_START_INDEX, SAFE_TRACK_INDICES } from '../constants/GameConstants';
import { SafeZoneEngine } from './SafeZoneEngine';

export class KillEngine {
  /**
   * Identifies all opponent tokens that will be sent back to Yard (captured) by a movement.
   */
  public static getCapturedTokens(
    state: GameState,
    moverColor: PlayerColor,
    targetStep: number
  ): Token[] {
    // Cannot capture in home paths
    if (targetStep > 51) return [];

    const targetTrackIndex = (COLOR_START_INDEX[moverColor] + (targetStep - 1)) % 52;
    
    // Cannot capture on safe star tiles
    if (SafeZoneEngine.isSafeIndex(targetTrackIndex)) return [];

    const captured: Token[] = [];

    for (const player of state.players) {
      if (player.color === moverColor) continue;

      // Team mode check
      const isTeammate =
        state.mode === '2v2' &&
        ((moverColor === 'RED' && player.color === 'YELLOW') ||
          (moverColor === 'YELLOW' && player.color === 'RED') ||
          (moverColor === 'BLUE' && player.color === 'GREEN') ||
          (moverColor === 'GREEN' && player.color === 'BLUE'));

      if (isTeammate) continue;

      for (const oppToken of player.tokens) {
        if (oppToken.state === 'TRACK') {
          const oppTrackIndex = (COLOR_START_INDEX[oppToken.color] + (oppToken.stepCount - 1)) % 52;
          if (oppTrackIndex === targetTrackIndex) {
            captured.push(oppToken);
          }
        }
      }
    }

    return captured;
  }
}
