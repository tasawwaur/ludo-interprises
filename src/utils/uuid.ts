export const generateUUID = () => Math.random().toString(36).substring(2, 15);

// Deterministic unique 8-digit numeric UID generator per player account
export const generateNumericUID = (seedStr: string): string => {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const num = Math.abs(hash % 89999999) + 10000000;
  return `${num}`;
};

export const formatPlayerUID = (user: { id?: string; googleId?: string; facebookId?: string; username?: string } | null): string => {
  if (!user) return 'LUDO-84920153';
  if (user.id && user.id.startsWith('LUDO-')) return user.id;
  const seed = user.googleId || user.facebookId || user.id || user.username || 'ludo_player';
  const num = generateNumericUID(seed);
  return `LUDO-${num}`;
};
