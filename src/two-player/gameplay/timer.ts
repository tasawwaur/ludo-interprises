import { MAX_TURN_TIME_SECONDS } from '../two-player.constants';

export interface TurnTimer {
  matchId: string;
  startedAt: number;
  limitSecs: number;
}

const timers: Record<string, ReturnType<typeof setTimeout>> = {};

export const startTurnTimer = (
  matchId: string,
  onTimeout: () => void,
  limitSecs: number = MAX_TURN_TIME_SECONDS
): void => {
  clearTurnTimer(matchId);
  timers[matchId] = setTimeout(onTimeout, limitSecs * 1000);
};

export const clearTurnTimer = (matchId: string): void => {
  if (timers[matchId]) {
    clearTimeout(timers[matchId]);
    delete timers[matchId];
  }
};

export const getRemainingSeconds = (startedAt: number, limitSecs: number): number => {
  const elapsed = Math.floor((Date.now() - startedAt) / 1000);
  return Math.max(0, limitSecs - elapsed);
};
