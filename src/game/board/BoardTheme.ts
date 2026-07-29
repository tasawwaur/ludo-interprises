import { PlayerColor } from '../engine/Engine.types';

export type ThemeMode = 'light' | 'dark' | 'amoled';

export interface TokenThemeStyle {
  fill: string;
  stroke: string;
  glow: string;
  shadow: string;
  highlight: string;
  selected: string;
  moving: string;
  captured: string;
}

export interface BoardThemeColors {
  background: string;
  surface: string;
  surfaceSecondary: string;
  border: string;
  gridLine: string;
  outerCellBackground: string;
  starColor: string;
  textPrimary: string;
  textSecondary: string;
  overlay: string;
  yardBackground: Record<PlayerColor, string>;
  corridorBackground: Record<PlayerColor, string>;
  tokenColors: Record<PlayerColor, TokenThemeStyle>;
  highlightMoveable: string;
  highlightHover: string;
}

export class BoardTheme {
  private static readonly THEMES: Readonly<Record<ThemeMode, Readonly<BoardThemeColors>>> = Object.freeze({
    amoled: Object.freeze({
      background: '#020617',
      surface: '#0f172a',
      surfaceSecondary: '#1e293b',
      border: '#334155',
      gridLine: '#1e293b',
      outerCellBackground: '#0f172a',
      starColor: '#f59e0b',
      textPrimary: '#f8fafc',
      textSecondary: '#94a3b8',
      overlay: 'rgba(2, 6, 23, 0.85)',
      yardBackground: {
        RED: '#ef4444',
        GREEN: '#22c55e',
        YELLOW: '#eab308',
        BLUE: '#3b82f6',
      },
      corridorBackground: {
        RED: '#ef4444',
        GREEN: '#22c55e',
        YELLOW: '#eab308',
        BLUE: '#3b82f6',
      },
      tokenColors: {
        RED: {
          fill: '#ef4444',
          stroke: '#ffffff',
          glow: '#fca5a5',
          shadow: 'rgba(239, 68, 68, 0.4)',
          highlight: '#f87171',
          selected: '#fee2e2',
          moving: '#b91c1c',
          captured: '#7f1d1d',
        },
        GREEN: {
          fill: '#22c55e',
          stroke: '#ffffff',
          glow: '#86efac',
          shadow: 'rgba(34, 197, 94, 0.4)',
          highlight: '#4ade80',
          selected: '#dcfce7',
          moving: '#15803d',
          captured: '#14532d',
        },
        YELLOW: {
          fill: '#eab308',
          stroke: '#ffffff',
          glow: '#fde047',
          shadow: 'rgba(234, 179, 8, 0.4)',
          highlight: '#facc15',
          selected: '#fef9c3',
          moving: '#a16207',
          captured: '#713f12',
        },
        BLUE: {
          fill: '#3b82f6',
          stroke: '#ffffff',
          glow: '#93c5fd',
          shadow: 'rgba(59, 130, 246, 0.4)',
          highlight: '#60a5fa',
          selected: '#dbeafe',
          moving: '#1d4ed8',
          captured: '#1e3a8a',
        },
      },
      highlightMoveable: '#60a5fa',
      highlightHover: '#fbbf24',
    }),
    dark: Object.freeze({
      background: '#0f172a',
      surface: '#1e293b',
      surfaceSecondary: '#334155',
      border: '#475569',
      gridLine: '#334155',
      outerCellBackground: '#1e293b',
      starColor: '#d97706',
      textPrimary: '#f8fafc',
      textSecondary: '#cbd5e1',
      overlay: 'rgba(15, 23, 42, 0.85)',
      yardBackground: {
        RED: '#dc2626',
        GREEN: '#16a34a',
        YELLOW: '#ca8a04',
        BLUE: '#2563eb',
      },
      corridorBackground: {
        RED: '#dc2626',
        GREEN: '#16a34a',
        YELLOW: '#ca8a04',
        BLUE: '#2563eb',
      },
      tokenColors: {
        RED: {
          fill: '#dc2626',
          stroke: '#f8fafc',
          glow: '#f87171',
          shadow: 'rgba(220, 38, 38, 0.4)',
          highlight: '#ef4444',
          selected: '#fee2e2',
          moving: '#991b1b',
          captured: '#450a0a',
        },
        GREEN: {
          fill: '#16a34a',
          stroke: '#f8fafc',
          glow: '#4ade80',
          shadow: 'rgba(22, 163, 74, 0.4)',
          highlight: '#22c55e',
          selected: '#dcfce7',
          moving: '#166534',
          captured: '#052e16',
        },
        YELLOW: {
          fill: '#ca8a04',
          stroke: '#f8fafc',
          glow: '#facc15',
          shadow: 'rgba(202, 138, 4, 0.4)',
          highlight: '#eab308',
          selected: '#fef9c3',
          moving: '#854d0e',
          captured: '#361e04',
        },
        BLUE: {
          fill: '#2563eb',
          stroke: '#f8fafc',
          glow: '#60a5fa',
          shadow: 'rgba(37, 99, 235, 0.4)',
          highlight: '#3b82f6',
          selected: '#dbeafe',
          moving: '#1e40af',
          captured: '#172554',
        },
      },
      highlightMoveable: '#38bdf8',
      highlightHover: '#f59e0b',
    }),
    light: Object.freeze({
      background: '#f8fafc',
      surface: '#ffffff',
      surfaceSecondary: '#f1f5f9',
      border: '#cbd5e1',
      gridLine: '#cbd5e1',
      outerCellBackground: '#ffffff',
      starColor: '#d97706',
      textPrimary: '#0f172a',
      textSecondary: '#475569',
      overlay: 'rgba(248, 250, 252, 0.85)',
      yardBackground: {
        RED: '#f87171',
        GREEN: '#4ade80',
        YELLOW: '#facc15',
        BLUE: '#60a5fa',
      },
      corridorBackground: {
        RED: '#f87171',
        GREEN: '#4ade80',
        YELLOW: '#facc15',
        BLUE: '#60a5fa',
      },
      tokenColors: {
        RED: {
          fill: '#ef4444',
          stroke: '#ffffff',
          glow: '#dc2626',
          shadow: 'rgba(239, 68, 68, 0.3)',
          highlight: '#f87171',
          selected: '#fee2e2',
          moving: '#b91c1c',
          captured: '#7f1d1d',
        },
        GREEN: {
          fill: '#22c55e',
          stroke: '#ffffff',
          glow: '#16a34a',
          shadow: 'rgba(34, 197, 94, 0.3)',
          highlight: '#4ade80',
          selected: '#dcfce7',
          moving: '#15803d',
          captured: '#14532d',
        },
        YELLOW: {
          fill: '#eab308',
          stroke: '#ffffff',
          glow: '#ca8a04',
          shadow: 'rgba(234, 179, 8, 0.3)',
          highlight: '#facc15',
          selected: '#fef9c3',
          moving: '#a16207',
          captured: '#713f12',
        },
        BLUE: {
          fill: '#3b82f6',
          stroke: '#ffffff',
          glow: '#2563eb',
          shadow: 'rgba(59, 130, 246, 0.3)',
          highlight: '#60a5fa',
          selected: '#dbeafe',
          moving: '#1d4ed8',
          captured: '#1e3a8a',
        },
      },
      highlightMoveable: '#2563eb',
      highlightHover: '#d97706',
    }),
  });

  /**
   * Retrieves theme color configuration for specified mode.
   */
  public static getTheme(mode: ThemeMode): Readonly<BoardThemeColors> {
    return this.THEMES[mode];
  }

  /**
   * Type guard helper to validate if a string is a valid ThemeMode.
   */
  public static isValidTheme(mode: string): mode is ThemeMode {
    return mode === 'light' || mode === 'dark' || mode === 'amoled';
  }
}
