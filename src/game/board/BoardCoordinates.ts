import { PlayerColor } from '../engine/Engine.types';

export interface GridPos {
  col: number;
  row: number;
}

// 52 Outer track cells mapped to (col, row) on a 15x15 board
export const OUTER_TRACK_COORDS: GridPos[] = [
  /* 0 - 5 (Green arm top edge moving right) */
  { col: 1, row: 6 }, { col: 2, row: 6 }, { col: 3, row: 6 }, { col: 4, row: 6 }, { col: 5, row: 6 },
  /* 5 - 11 (Yellow arm left edge moving up) */
  { col: 6, row: 5 }, { col: 6, row: 4 }, { col: 6, row: 3 }, { col: 6, row: 2 }, { col: 6, row: 1 }, { col: 6, row: 0 },
  { col: 7, row: 0 }, // 11
  /* 12 - 17 (Yellow arm right edge moving down) */
  { col: 8, row: 0 }, { col: 8, row: 1 }, { col: 8, row: 2 }, { col: 8, row: 3 }, { col: 8, row: 4 }, { col: 8, row: 5 },
  /* 18 - 23 (Blue arm top edge moving right) */
  { col: 9, row: 6 }, { col: 10, row: 6 }, { col: 11, row: 6 }, { col: 12, row: 6 }, { col: 13, row: 6 }, { col: 14, row: 6 },
  { col: 14, row: 7 }, // 24
  /* 25 - 30 (Blue arm bottom edge moving left) */
  { col: 14, row: 8 }, { col: 13, row: 8 }, { col: 12, row: 8 }, { col: 11, row: 8 }, { col: 10, row: 8 }, { col: 9, row: 8 },
  /* 31 - 36 (Red arm right edge moving down) */
  { col: 8, row: 9 }, { col: 8, row: 10 }, { col: 8, row: 11 }, { col: 8, row: 12 }, { col: 8, row: 13 }, { col: 8, row: 14 },
  { col: 7, row: 14 }, // 37
  /* 38 - 43 (Red arm left edge moving up) */
  { col: 6, row: 14 }, { col: 6, row: 13 }, { col: 6, row: 12 }, { col: 6, row: 11 }, { col: 6, row: 10 }, { col: 6, row: 9 },
  /* 44 - 49 (Green arm bottom edge moving left) */
  { col: 5, row: 8 }, { col: 4, row: 8 }, { col: 3, row: 8 }, { col: 2, row: 8 }, { col: 1, row: 8 }, { col: 0, row: 8 },
  { col: 0, row: 7 }, // 50
  { col: 0, row: 6 }, // 51
];

// Start cell track index matching Reference Image 2 (Green top-left, Yellow top-right, Blue bottom-right, Red bottom-left)
export const COLOR_START_INDEX: Record<PlayerColor, number> = {
  GREEN: 0,
  YELLOW: 13,
  BLUE: 26,
  RED: 39,
};

// Outer track index where player enters their Home Corridor
export const COLOR_HOME_ENTRY_INDEX: Record<PlayerColor, number> = {
  GREEN: 50,
  YELLOW: 11,
  BLUE: 24,
  RED: 37,
};

// 5 Home Corridor tiles for each color
export const HOME_CORRIDORS: Record<PlayerColor, GridPos[]> = {
  GREEN: [
    { col: 1, row: 7 }, { col: 2, row: 7 }, { col: 3, row: 7 }, { col: 4, row: 7 }, { col: 5, row: 7 }
  ],
  YELLOW: [
    { col: 7, row: 1 }, { col: 7, row: 2 }, { col: 7, row: 3 }, { col: 7, row: 4 }, { col: 7, row: 5 }
  ],
  BLUE: [
    { col: 13, row: 7 }, { col: 12, row: 7 }, { col: 11, row: 7 }, { col: 10, row: 7 }, { col: 9, row: 7 }
  ],
  RED: [
    { col: 7, row: 13 }, { col: 7, row: 12 }, { col: 7, row: 11 }, { col: 7, row: 10 }, { col: 7, row: 9 }
  ],
};

// Yard positions matching Reference Image 2
export const YARD_POSITIONS: Record<PlayerColor, GridPos[]> = {
  GREEN: [
    { col: 1.5, row: 1.5 }, { col: 3.5, row: 1.5 }, { col: 1.5, row: 3.5 }, { col: 3.5, row: 3.5 }
  ],
  YELLOW: [
    { col: 10.5, row: 1.5 }, { col: 12.5, row: 1.5 }, { col: 10.5, row: 3.5 }, { col: 12.5, row: 3.5 }
  ],
  BLUE: [
    { col: 10.5, row: 10.5 }, { col: 12.5, row: 10.5 }, { col: 10.5, row: 12.5 }, { col: 12.5, row: 12.5 }
  ],
  RED: [
    { col: 1.5, row: 10.5 }, { col: 3.5, row: 10.5 }, { col: 1.5, row: 12.5 }, { col: 3.5, row: 12.5 }
  ],
};

// Center Target Cell
export const CENTER_HOME_POS: GridPos = { col: 7, row: 7 };

// Safe Track Indices (Start cells + 4 Star cells)
export const SAFE_TRACK_INDICES = new Set<number>([0, 8, 13, 21, 26, 34, 39, 47]);

/**
 * Calculates (x, y) canvas pixel coordinates given a stepCount (0 to 57) for a given player color.
 */
export function getPixelCoordinates(
  color: PlayerColor,
  stepCount: number,
  tokenIndex: number,
  cellSize: number
): { x: number; y: number } {
  // Case 0: Yard
  if (stepCount === 0) {
    const pos = YARD_POSITIONS[color][tokenIndex];
    return { x: pos.col * cellSize, y: pos.row * cellSize };
  }

  // Case 57: Center Home Target
  if (stepCount >= 57) {
    const offsets = [
      { dx: -0.2, dy: -0.2 },
      { dx: 0.2, dy: -0.2 },
      { dx: -0.2, dy: 0.2 },
      { dx: 0.2, dy: 0.2 },
    ];
    const off = offsets[tokenIndex % 4];
    return {
      x: (CENTER_HOME_POS.col + 0.5 + off.dx) * cellSize,
      y: (CENTER_HOME_POS.row + 0.5 + off.dy) * cellSize,
    };
  }

  // Case 52..56: Home Corridor
  if (stepCount >= 52 && stepCount <= 56) {
    const corridorIndex = stepCount - 52;
    const pos = HOME_CORRIDORS[color][corridorIndex];
    return { x: (pos.col + 0.5) * cellSize, y: (pos.row + 0.5) * cellSize };
  }

  // Case 1..51: Outer Track
  const startIndex = COLOR_START_INDEX[color];
  const outerTrackIndex = (startIndex + (stepCount - 1)) % 52;
  const pos = OUTER_TRACK_COORDS[outerTrackIndex];

  return { x: (pos.col + 0.5) * cellSize, y: (pos.row + 0.5) * cellSize };
}
