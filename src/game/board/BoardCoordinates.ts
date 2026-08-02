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

// Start cell track index matching Reference Image 2
export const COLOR_START_INDEX: Record<PlayerColor, number> = {
  RED: 0,
  GREEN: 13,
  YELLOW: 26,
  BLUE: 39,
};

// Outer track index where player enters their Home Corridor
export const COLOR_HOME_ENTRY_INDEX: Record<PlayerColor, number> = {
  RED: 50,
  GREEN: 11,
  YELLOW: 24,
  BLUE: 37,
};

// 5 Home Corridor tiles for each color
export const HOME_CORRIDORS: Record<PlayerColor, GridPos[]> = {
  RED: [
    { col: 1, row: 7 }, { col: 2, row: 7 }, { col: 3, row: 7 }, { col: 4, row: 7 }, { col: 5, row: 7 }
  ],
  GREEN: [
    { col: 7, row: 1 }, { col: 7, row: 2 }, { col: 7, row: 3 }, { col: 7, row: 4 }, { col: 7, row: 5 }
  ],
  YELLOW: [
    { col: 13, row: 7 }, { col: 12, row: 7 }, { col: 11, row: 7 }, { col: 10, row: 7 }, { col: 9, row: 7 }
  ],
  BLUE: [
    { col: 7, row: 13 }, { col: 7, row: 12 }, { col: 7, row: 11 }, { col: 7, row: 10 }, { col: 7, row: 9 }
  ],
};

export const YARD_POSITIONS: Record<PlayerColor, GridPos[]> = {
  RED: [
    { col: 2.45, row: 2.3 }, { col: 3.55, row: 2.3 }, { col: 2.45, row: 3.4 }, { col: 3.55, row: 3.4 }
  ],
  GREEN: [
    { col: 11.45, row: 2.3 }, { col: 12.55, row: 2.3 }, { col: 11.45, row: 3.4 }, { col: 12.55, row: 3.4 }
  ],
  YELLOW: [
    { col: 11.45, row: 11.3 }, { col: 12.55, row: 11.3 }, { col: 11.45, row: 12.4 }, { col: 12.55, row: 12.4 }
  ],
  BLUE: [
    { col: 2.45, row: 11.3 }, { col: 3.55, row: 11.3 }, { col: 2.45, row: 12.4 }, { col: 3.55, row: 12.4 }
  ],
};

// Center Target Cell
export const CENTER_HOME_POS: GridPos = { col: 7, row: 7 };

// Safe Track Indices (Start cells + 4 Star cells)
export const SAFE_TRACK_INDICES = new Set<number>([0, 8, 13, 21, 26, 34, 39, 47]);

export function getCoordinateColor(color: PlayerColor, localPlayerColor: PlayerColor | null): PlayerColor {
  if (!localPlayerColor) return color;

  // Define opponent color
  let opponentColor: PlayerColor = 'GREEN';
  if (localPlayerColor === 'BLUE') opponentColor = 'GREEN';
  else if (localPlayerColor === 'GREEN') opponentColor = 'BLUE';
  else if (localPlayerColor === 'RED') opponentColor = 'YELLOW';
  else if (localPlayerColor === 'YELLOW') opponentColor = 'RED';

  // Map active players to bottom-left (BLUE) and top-right (GREEN)
  if (color === localPlayerColor) return 'BLUE';
  if (color === opponentColor) return 'GREEN';

  // Map remaining two colors to top-left (RED) and bottom-right (YELLOW)
  const remainingColors = (['RED', 'GREEN', 'YELLOW', 'BLUE'] as PlayerColor[]).filter(
    (c) => c !== localPlayerColor && c !== opponentColor
  );

  if (color === remainingColors[0]) return 'RED';
  return 'YELLOW';
}

export function getQuadrantPlayerColor(quadrant: PlayerColor, localPlayerColor: PlayerColor | null): PlayerColor {
  if (!localPlayerColor) return quadrant;

  let opponentColor: PlayerColor = 'GREEN';
  if (localPlayerColor === 'BLUE') opponentColor = 'GREEN';
  else if (localPlayerColor === 'GREEN') opponentColor = 'BLUE';
  else if (localPlayerColor === 'RED') opponentColor = 'YELLOW';
  else if (localPlayerColor === 'YELLOW') opponentColor = 'RED';

  if (quadrant === 'BLUE') return localPlayerColor;
  if (quadrant === 'GREEN') return opponentColor;

  const remainingColors = (['RED', 'GREEN', 'YELLOW', 'BLUE'] as PlayerColor[]).filter(
    (c) => c !== localPlayerColor && c !== opponentColor
  );

  if (quadrant === 'RED') return remainingColors[0];
  return remainingColors[1];
}

/**
 * Calculates (x, y) canvas pixel coordinates given a stepCount (0 to 57) for a given player color.
 */
export function getPixelCoordinates(
  color: PlayerColor,
  stepCount: number,
  tokenIndex: number,
  cellSize: number,
  localPlayerColor?: PlayerColor | null
): { x: number; y: number } {
  // Resolve mapped coordinate color matching dynamic yard layout
  const mappedColor = getCoordinateColor(color, localPlayerColor || null);

  // Case 0: Yard
  if (stepCount === 0) {
    const pos = YARD_POSITIONS[mappedColor][tokenIndex];
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
    const pos = HOME_CORRIDORS[mappedColor][corridorIndex];
    const offsets = [
      { dx: -0.06, dy: -0.06 },
      { dx: 0.06, dy: -0.06 },
      { dx: -0.06, dy: 0.06 },
      { dx: 0.06, dy: 0.06 },
    ];
    const off = offsets[tokenIndex % 4];
    return {
      x: (pos.col + 0.5 + off.dx) * cellSize,
      y: (pos.row + 0.5 + off.dy) * cellSize,
    };
  }

  // Case 1..51: Outer Track
  const startIndex = COLOR_START_INDEX[mappedColor];
  const outerTrackIndex = (startIndex + (stepCount - 1)) % 52;
  const pos = OUTER_TRACK_COORDS[outerTrackIndex];

  const colorOffsets: Record<PlayerColor, { dx: number; dy: number }> = {
    RED: { dx: -0.10, dy: -0.10 },
    GREEN: { dx: 0.10, dy: -0.10 },
    YELLOW: { dx: 0.10, dy: 0.10 },
    BLUE: { dx: -0.10, dy: 0.10 },
  };

  const tokenOffsets = [
    { dx: -0.04, dy: -0.04 },
    { dx: 0.04, dy: -0.04 },
    { dx: -0.04, dy: 0.04 },
    { dx: 0.04, dy: 0.04 },
  ];

  const cOff = colorOffsets[mappedColor];
  const tOff = tokenOffsets[tokenIndex % 4];

  const finalDx = cOff.dx + tOff.dx;
  const finalDy = cOff.dy + tOff.dy;

  return {
    x: (pos.col + 0.5 + finalDx) * cellSize,
    y: (pos.row + 0.5 + finalDy) * cellSize,
  };
}

/**
 * Returns grid column and row coordinates for a token at a given stepCount.
 */
export function getGridPos(
  color: PlayerColor,
  stepCount: number,
  tokenIndex: number,
  localPlayerColor?: PlayerColor | null
): GridPos {
  const mappedColor = getCoordinateColor(color, localPlayerColor || null);

  if (stepCount === 0) {
    return YARD_POSITIONS[mappedColor][tokenIndex];
  }
  if (stepCount >= 57) {
    const offsets = [
      { col: -0.2, row: -0.2 },
      { col: 0.2, row: -0.2 },
      { col: -0.2, row: 0.2 },
      { col: 0.2, row: 0.2 },
    ];
    const off = offsets[tokenIndex % 4];
    return {
      col: CENTER_HOME_POS.col + off.col,
      row: CENTER_HOME_POS.row + off.row,
    };
  }
  if (stepCount >= 52 && stepCount <= 56) {
    const corridorIndex = stepCount - 52;
    return HOME_CORRIDORS[mappedColor][corridorIndex];
  }
  const startIndex = COLOR_START_INDEX[mappedColor];
  const outerTrackIndex = (startIndex + (stepCount - 1)) % 52;
  return OUTER_TRACK_COORDS[outerTrackIndex];
}
