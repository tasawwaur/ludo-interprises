export const DEFAULT_AVATARS = [
  '/assets/custom_icons/avatar_male_king.jpg',
  '/assets/custom_icons/avatar_king.png',
  '/assets/custom_icons/avatar_lion.png',
  '/assets/custom_icons/avatar_mafia.png',
  '/assets/custom_icons/avatar_female_ninja.png',
  '/assets/custom_icons/avatar_warrior.png',
  '/assets/custom_icons/avatar_female_queen_v2.jpg',
  '/assets/custom_icons/avatar_female_queen.png',
  '/assets/custom_icons/avatar_female_mage.png',
  '/assets/custom_icons/avatar_sorcerer.png'
];

export const getDefaultAvatar = (seed?: string): string => {
  if (!seed) return DEFAULT_AVATARS[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % DEFAULT_AVATARS.length;
  return DEFAULT_AVATARS[index];
};
