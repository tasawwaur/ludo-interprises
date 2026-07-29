const STORAGE_PAUSE_KEY = 'ludo_2p_pause_v1';

export const pauseMatch = (matchId: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_PAUSE_KEY, JSON.stringify({ matchId, pausedAt: new Date().toISOString() }));
  }
};

export const resumeMatch = (matchId: string): boolean => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_PAUSE_KEY);
    if (!saved) return false;
    const data = JSON.parse(saved);
    if (data.matchId === matchId) {
      localStorage.removeItem(STORAGE_PAUSE_KEY);
      return true;
    }
  }
  return false;
};

export const isMatchPaused = (matchId: string): boolean => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_PAUSE_KEY);
    if (!saved) return false;
    return JSON.parse(saved).matchId === matchId;
  }
  return false;
};
