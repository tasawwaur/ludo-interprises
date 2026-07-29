export interface SurrenderRecord {
  matchId: string;
  surrenderedBy: string;
  surrenderedAt: string;
}

const STORAGE_SURRENDER_KEY = 'ludo_2p_surrenders_v1';

export const surrenderMatch = (matchId: string, playerId: string): SurrenderRecord => {
  const record: SurrenderRecord = {
    matchId,
    surrenderedBy: playerId,
    surrenderedAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    const existing = getSurrenders();
    existing.push(record);
    localStorage.setItem(STORAGE_SURRENDER_KEY, JSON.stringify(existing));
  }

  return record;
};

export const getSurrenders = (): SurrenderRecord[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_SURRENDER_KEY);
    return saved ? JSON.parse(saved) : [];
  }
  return [];
};

export const hasSurrendered = (matchId: string, playerId: string): boolean => {
  return getSurrenders().some(
    (s) => s.matchId === matchId && s.surrenderedBy === playerId
  );
};
