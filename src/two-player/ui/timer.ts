export interface TimerDisplay {
  totalSecs: number;
  remaining: number;
  percent: number; // 0-100 for ring progress
  isUrgent: boolean; // < 10 seconds
}

export const buildTimerDisplay = (
  startedAt: number,
  limitSecs: number
): TimerDisplay => {
  const elapsed = Math.floor((Date.now() - startedAt) / 1000);
  const remaining = Math.max(0, limitSecs - elapsed);
  const percent = Math.round((remaining / limitSecs) * 100);
  return {
    totalSecs: limitSecs,
    remaining,
    percent,
    isUrgent: remaining < 10,
  };
};
