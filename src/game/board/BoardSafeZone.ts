import { PlayerColor, Token } from '../engine/Engine.types';
import { COLOR_START_INDEX, SAFE_TRACK_INDICES } from './BoardCoordinates';

export interface SafeZoneMetadata {
  trackIndex: number;
  type: 'START_TILE' | 'STAR_TILE';
  colorOwner?: PlayerColor;
}

export class BoardSafeZone {
  private static readonly SAFE_METADATA_MAP: Map<number, SafeZoneMetadata> = new Map([
    [0, { trackIndex: 0, type: 'START_TILE', colorOwner: 'RED' }],
    [13, { trackIndex: 13, type: 'START_TILE', colorOwner: 'GREEN' }],
    [26, { trackIndex: 26, type: 'START_TILE', colorOwner: 'YELLOW' }],
    [39, { trackIndex: 39, type: 'START_TILE', colorOwner: 'BLUE' }],
    [8, { trackIndex: 8, type: 'STAR_TILE' }],
    [21, { trackIndex: 21, type: 'STAR_TILE' }],
    [34, { trackIndex: 34, type: 'STAR_TILE' }],
    [47, { trackIndex: 47, type: 'STAR_TILE' }],
  ]);

  /**
   * Checks if a given outer track index (0 to 51) is a safe zone.
   */
  public static isSafeIndex(trackIndex: number): boolean {
    return SAFE_TRACK_INDICES.has(trackIndex);
  }

  /**
   * Retrieves metadata for a safe track index if applicable.
   */
  public static getSafeZoneInfo(trackIndex: number): SafeZoneMetadata | null {
    return this.SAFE_METADATA_MAP.get(trackIndex) || null;
  }

  /**
   * Determines if a token is immune from capture at its current step location.
   * Yard (0), Home Corridor (52..56), Home Target (57), and Safe Tiles are immune.
   */
  public static isImmuneFromCapture(color: PlayerColor, stepCount: number): boolean {
    if (stepCount === 0 || stepCount >= 52) {
      return true;
    }
    const trackIndex = (COLOR_START_INDEX[color] + (stepCount - 1)) % 52;
    return this.isSafeIndex(trackIndex);
  }

  /**
   * Filters a list of opponent tokens that are vulnerable to capture by a landing move.
   */
  public static getVulnerableOpponents(
    landingColor: PlayerColor,
    landingStepCount: number,
    allTokens: Token[]
  ): Token[] {
    if (this.isImmuneFromCapture(landingColor, landingStepCount)) {
      return [];
    }

    const landingTrackIndex = (COLOR_START_INDEX[landingColor] + (landingStepCount - 1)) % 52;

    return allTokens.filter((token) => {
      if (token.color === landingColor) return false;
      if (token.stepCount < 1 || token.stepCount > 51) return false;

      const oppTrackIndex = (COLOR_START_INDEX[token.color] + (token.stepCount - 1)) % 52;
      return oppTrackIndex === landingTrackIndex;
    });
  }
}
