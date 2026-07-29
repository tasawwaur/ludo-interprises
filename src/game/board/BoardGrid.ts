import { PlayerColor } from '../engine/Engine.types';
import { GridPos } from './BoardCoordinates';

export type BoardCellType =
  | 'YARD'
  | 'OUTER_TRACK'
  | 'SAFE_STAR'
  | 'COLOR_START'
  | 'HOME_CORRIDOR'
  | 'CENTER_HOME';

export interface BoardCellMetadata {
  id: string;
  col: number;
  row: number;
  type: BoardCellType;
  colorOwner?: PlayerColor;
  trackIndex?: number;
  corridorIndex?: number;
  isSafe: boolean;
}

export class BoardGrid {
  public static readonly GRID_SIZE = 15;
  private static cellMatrix: BoardCellMetadata[][] | null = null;

  /**
   * Generates or returns cached 15x15 Ludo Board metadata matrix.
   */
  public static getMatrix(): BoardCellMetadata[][] {
    if (this.cellMatrix) {
      return this.cellMatrix;
    }

    const matrix: BoardCellMetadata[][] = Array.from({ length: 15 }, (_, r) =>
      Array.from({ length: 15 }, (_, c) => this.calculateCellMetadata(c, r))
    );

    this.cellMatrix = matrix;
    return matrix;
  }

  /**
   * Retrieves cell metadata for specific (col, row).
   */
  public static getCell(col: number, row: number): BoardCellMetadata | null {
    if (col < 0 || col >= 15 || row < 0 || row >= 15) {
      return null;
    }
    return this.getMatrix()[row][col];
  }

  /**
   * Determines exact cell type and metadata for any (col, row) on 15x15 board.
   */
  private static calculateCellMetadata(col: number, row: number): BoardCellMetadata {
    const id = `cell_${col}_${row}`;

    // 1. Center Home Square (6,6 to 8,8)
    if (col >= 6 && col <= 8 && row >= 6 && row <= 8) {
      return {
        id,
        col,
        row,
        type: 'CENTER_HOME',
        isSafe: true,
      };
    }

    // 2. Corner Yards
    if (col < 6 && row < 6) {
      return { id, col, row, type: 'YARD', colorOwner: 'RED', isSafe: true };
    }
    if (col > 8 && row < 6) {
      return { id, col, row, type: 'YARD', colorOwner: 'GREEN', isSafe: true };
    }
    if (col > 8 && row > 8) {
      return { id, col, row, type: 'YARD', colorOwner: 'YELLOW', isSafe: true };
    }
    if (col < 6 && row > 8) {
      return { id, col, row, type: 'YARD', colorOwner: 'BLUE', isSafe: true };
    }

    // 3. Home Corridors
    if (row === 7 && col >= 1 && col <= 5) {
      return { id, col, row, type: 'HOME_CORRIDOR', colorOwner: 'RED', corridorIndex: col - 1, isSafe: true };
    }
    if (col === 7 && row >= 1 && row <= 5) {
      return { id, col, row, type: 'HOME_CORRIDOR', colorOwner: 'GREEN', corridorIndex: row - 1, isSafe: true };
    }
    if (row === 7 && col >= 9 && col <= 13) {
      return { id, col, row, type: 'HOME_CORRIDOR', colorOwner: 'YELLOW', corridorIndex: 13 - col, isSafe: true };
    }
    if (col === 7 && row >= 9 && row <= 13) {
      return { id, col, row, type: 'HOME_CORRIDOR', colorOwner: 'BLUE', corridorIndex: 13 - row, isSafe: true };
    }

    // 4. Special Color Start Cells
    if (col === 1 && row === 6) {
      return { id, col, row, type: 'COLOR_START', colorOwner: 'RED', trackIndex: 0, isSafe: true };
    }
    if (col === 8 && row === 1) {
      return { id, col, row, type: 'COLOR_START', colorOwner: 'GREEN', trackIndex: 13, isSafe: true };
    }
    if (col === 13 && row === 8) {
      return { id, col, row, type: 'COLOR_START', colorOwner: 'YELLOW', trackIndex: 26, isSafe: true };
    }
    if (col === 6 && row === 13) {
      return { id, col, row, type: 'COLOR_START', colorOwner: 'BLUE', trackIndex: 39, isSafe: true };
    }

    // 5. Star Safe Tiles
    if (
      (col === 2 && row === 8) ||
      (col === 6 && row === 2) ||
      (col === 12 && row === 6) ||
      (col === 8 && row === 12)
    ) {
      return { id, col, row, type: 'SAFE_STAR', isSafe: true };
    }

    // 6. Regular Outer Track Cell
    return {
      id,
      col,
      row,
      type: 'OUTER_TRACK',
      isSafe: false,
    };
  }

  /**
   * Computes Euclidean distance between two grid points.
   */
  public static getDistance(a: GridPos, b: GridPos): number {
    const dx = a.col - b.col;
    const dy = a.row - b.row;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
