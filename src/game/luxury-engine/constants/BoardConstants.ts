import { PlayerColor } from '../types';

export const BOARD_RULES = {
  SPAWN_REQUIREMENT_ROLL: 6,
  SAFE_TRACK_STEPS: [1, 9, 14, 22, 27, 35, 40, 48],
  TRACK_MAX_STEPS: 51,
  HOME_PATH_STEPS: 5,
  FINISHED_STEP: 57,
};

export const COLOR_START_INDEX: Record<PlayerColor, number> = {
  RED: 0,
  GREEN: 13,
  YELLOW: 26,
  BLUE: 39,
};

export const COLOR_HOME_ENTRY_INDEX: Record<PlayerColor, number> = {
  RED: 50,
  GREEN: 11,
  YELLOW: 24,
  BLUE: 37,
};

export const SAFE_TRACK_INDICES = new Set<number>([0, 8, 13, 21, 26, 34, 39, 47]);
